import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  StudyGroupJoinMode,
  StudyGroupMemberRole,
  StudyGroupMemberStatus,
  StudyGroupStatus,
} from '@prisma/client';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateStudyGroupDto,
  CreateSessionDto,
  SendMessageDto,
  UploadFileDto,
} from './dto/study-groups.dto';

@Injectable()
export class StudyGroupsService {
  private readonly logger = new Logger(StudyGroupsService.name);
  private readonly fileDir = path.resolve(process.cwd(), 'uploads', 'study-groups');

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, input: CreateStudyGroupDto) {
    const group = await this.prisma.studyGroup.create({
      data: {
        ownerId: userId,
        title: input.title,
        description: input.description ?? null,
        type: input.type,
        joinMode: input.joinMode ?? 'OPEN',
        courseId: input.courseId ?? null,
        members: {
          create: {
            userId,
            role: StudyGroupMemberRole.OWNER,
            status: StudyGroupMemberStatus.ACTIVE,
            joinedAt: new Date(),
          },
        },
      },
      include: this.groupInclude(),
    });

    return this.mapGroup(group);
  }

  async findAll(query: { page?: number; limit?: number; type?: string; search?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.StudyGroupWhereInput = { status: StudyGroupStatus.ACTIVE };

    if (query.type) {
      where.type = query.type as 'STUDENT' | 'INSTRUCTOR_LED';
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [groups, total] = await Promise.all([
      this.prisma.studyGroup.findMany({
        where,
        include: this.groupInclude(),
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.studyGroup.count({ where }),
    ]);

    return {
      data: groups.map((g) => this.mapGroup(g)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(groupId: string, userId: string) {
    const membership = await this.ensureMembership(groupId, userId);
    const group = await this.prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: {
        ...this.groupInclude(),
        course: { select: { id: true, title: true } },
      },
    });

    if (!group) throw new NotFoundException('Study group not found');

    return this.mapGroupDetail(group, membership);
  }

  async update(groupId: string, userId: string, input: Record<string, unknown>) {
    await this.ensureOwnerOrModerator(groupId, userId);

    const data: any = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description ?? null;
    if (input.type !== undefined) data.type = input.type;
    if (input.joinMode !== undefined) data.joinMode = input.joinMode;
    if (input.courseId !== undefined) data.courseId = input.courseId ?? null;

    const group = await this.prisma.studyGroup.update({
      where: { id: groupId },
      data,
      include: this.groupInclude(),
    });

    return this.mapGroup(group);
  }

  async join(groupId: string, userId: string) {
    const group = await this.prisma.studyGroup.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Study group not found');
    if (group.status !== StudyGroupStatus.ACTIVE) throw new BadRequestException('Group is not active');

    const existing = await this.prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (existing && existing.status === StudyGroupMemberStatus.ACTIVE) {
      return { membershipId: existing.id, status: existing.status, alreadyMember: true };
    }

    if (existing && existing.status === StudyGroupMemberStatus.PENDING) {
      return { membershipId: existing.id, status: existing.status, alreadyRequested: true };
    }

    if (group.joinMode === StudyGroupJoinMode.INVITE_ONLY) {
      throw new ForbiddenException('This group is invite-only');
    }

    const isDirectJoin = group.joinMode === StudyGroupJoinMode.OPEN;
    const membership = await this.prisma.studyGroupMember.create({
      data: {
        groupId,
        userId,
        role: StudyGroupMemberRole.MEMBER,
        status: isDirectJoin ? StudyGroupMemberStatus.ACTIVE : StudyGroupMemberStatus.PENDING,
        joinedAt: isDirectJoin ? new Date() : null,
      },
    });

    return { membershipId: membership.id, status: membership.status };
  }

  async approveMember(groupId: string, memberId: string, approverId: string) {
    await this.ensureOwnerOrModerator(groupId, approverId);

    const membership = await this.prisma.studyGroupMember.findUnique({ where: { id: memberId } });
    if (!membership || membership.groupId !== groupId) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.status !== StudyGroupMemberStatus.PENDING) {
      throw new BadRequestException('Membership is not pending');
    }

    const updated = await this.prisma.studyGroupMember.update({
      where: { id: memberId },
      data: {
        status: StudyGroupMemberStatus.ACTIVE,
        approvedById: approverId,
        joinedAt: new Date(),
      },
    });

    return { membershipId: updated.id, status: updated.status };
  }

  async removeMember(groupId: string, memberId: string, userId: string) {
    await this.ensureOwnerOrModerator(groupId, userId);

    const membership = await this.prisma.studyGroupMember.findUnique({ where: { id: memberId } });
    if (!membership || membership.groupId !== groupId) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.role === StudyGroupMemberRole.OWNER) {
      throw new BadRequestException('Cannot remove the group owner');
    }

    const updated = await this.prisma.studyGroupMember.update({
      where: { id: memberId },
      data: { status: StudyGroupMemberStatus.REMOVED },
    });

    return { membershipId: updated.id, status: updated.status };
  }

  async getMessages(
    groupId: string,
    userId: string,
    query: { page?: number; limit?: number },
  ) {
    await this.ensureMembership(groupId, userId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: Prisma.StudyGroupMessageWhereInput = {
      groupId,
      status: 'VISIBLE' as any,
    };

    const [messages, total] = await Promise.all([
      this.prisma.studyGroupMessage.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.studyGroupMessage.count({ where }),
    ]);

    return {
      data: messages.map((m) => ({
        id: m.id,
        groupId: m.groupId,
        authorId: m.authorId,
        author: m.author,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async sendMessage(groupId: string, userId: string, input: SendMessageDto) {
    await this.ensureMembership(groupId, userId);

    const message = await this.prisma.studyGroupMessage.create({
      data: {
        groupId,
        authorId: userId,
        body: input.body,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return {
      id: message.id,
      groupId: message.groupId,
      authorId: message.authorId,
      author: message.author,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    };
  }

  async getFiles(groupId: string, userId: string) {
    await this.ensureMembership(groupId, userId);

    const files = await this.prisma.studyGroupFile.findMany({
      where: { groupId, status: 'ACTIVE' as any },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return files.map((f) => ({
      id: f.id,
      groupId: f.groupId,
      uploadedById: f.uploadedById,
      uploadedBy: f.uploadedBy,
      fileName: f.fileName,
      mimeType: f.mimeType,
      sizeBytes: f.sizeBytes,
      storageProvider: f.storageProvider,
      createdAt: f.createdAt.toISOString(),
      downloadUrl: `/api/v1/study-group-files/${f.id}/download`,
    }));
  }

  async uploadFile(groupId: string, userId: string, input: UploadFileDto) {
    await this.ensureMembership(groupId, userId);

    const file = await this.prisma.studyGroupFile.create({
      data: {
        groupId,
        uploadedById: userId,
        fileName: input.fileName,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        storageProvider: 'local',
        storageKey: input.storageKey,
      },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    return {
      id: file.id,
      groupId: file.groupId,
      uploadedById: file.uploadedById,
      uploadedBy: file.uploadedBy,
      fileName: file.fileName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      createdAt: file.createdAt.toISOString(),
      downloadUrl: `/api/v1/study-group-files/${file.id}/download`,
    };
  }

  async downloadFile(fileId: string, userId: string, response: Response) {
    const file = await this.prisma.studyGroupFile.findUnique({ where: { id: fileId } });
    if (!file || file.status === ('REMOVED' as any)) {
      throw new NotFoundException('File not found');
    }

    await this.ensureMembership(file.groupId, userId);

    const filePath = file.storageKey;
    try {
      await stat(filePath);
    } catch {
      throw new NotFoundException('File content not found on storage');
    }

    response.setHeader('Content-Type', file.mimeType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.fileName}"`,
    );
    createReadStream(filePath).pipe(response);
  }

  async getSessions(groupId: string, userId: string) {
    await this.ensureMembership(groupId, userId);

    const sessions = await this.prisma.studyGroupSession.findMany({
      where: { groupId },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { startsAt: 'asc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      groupId: s.groupId,
      createdById: s.createdById,
      createdBy: s.createdBy,
      title: s.title,
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt?.toISOString() ?? null,
      location: s.location,
      onlineUrlNote: s.onlineUrlNote,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
    }));
  }

  async createSession(groupId: string, userId: string, input: CreateSessionDto) {
    await this.ensureMembership(groupId, userId);

    const session = await this.prisma.studyGroupSession.create({
      data: {
        groupId,
        createdById: userId,
        title: input.title,
        startsAt: new Date(input.startsAt),
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        location: input.location ?? null,
        onlineUrlNote: input.onlineUrlNote ?? null,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return {
      id: session.id,
      groupId: session.groupId,
      createdById: session.createdById,
      createdBy: session.createdBy,
      title: session.title,
      startsAt: session.startsAt.toISOString(),
      endsAt: session.endsAt?.toISOString() ?? null,
      location: session.location,
      onlineUrlNote: session.onlineUrlNote,
      status: session.status,
      createdAt: session.createdAt.toISOString(),
    };
  }

  async ensureMembership(groupId: string, userId: string) {
    const membership = await this.prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!membership || membership.status !== StudyGroupMemberStatus.ACTIVE) {
      throw new ForbiddenException('You are not an active member of this group');
    }

    return membership;
  }

  private async ensureOwnerOrModerator(groupId: string, userId: string) {
    const membership = await this.prisma.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (
      !membership ||
      membership.status !== StudyGroupMemberStatus.ACTIVE ||
      (membership.role !== StudyGroupMemberRole.OWNER && membership.role !== StudyGroupMemberRole.MODERATOR)
    ) {
      throw new ForbiddenException('Only owners and moderators can perform this action');
    }

    return membership;
  }

  private groupInclude() {
    return {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      _count: {
        select: {
          members: { where: { status: StudyGroupMemberStatus.ACTIVE } },
          messages: true,
          files: true,
          sessions: true,
        },
      },
    } satisfies Prisma.StudyGroupInclude;
  }

  private mapGroup(group: any) {
    return {
      id: group.id,
      ownerId: group.ownerId,
      owner: group.owner,
      courseId: group.courseId,
      type: group.type,
      joinMode: group.joinMode,
      title: group.title,
      description: group.description,
      status: group.status,
      memberCount: group._count?.members ?? 0,
      messageCount: group._count?.messages ?? 0,
      fileCount: group._count?.files ?? 0,
      sessionCount: group._count?.sessions ?? 0,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    };
  }

  private mapGroupDetail(group: any, membership: any) {
    return {
      ...this.mapGroup(group),
      course: group.course ?? null,
      membership: {
        id: membership.id,
        role: membership.role,
        status: membership.status,
        joinedAt: membership.joinedAt?.toISOString() ?? null,
      },
    };
  }
}
