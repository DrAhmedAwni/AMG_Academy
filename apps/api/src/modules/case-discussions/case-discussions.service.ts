import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CaseCommentStatus as PrismaCaseCommentStatus,
  CasePostStatus as PrismaCasePostStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CasePostFiltersDto,
  CreateCaseCategoryDto,
  CreateCaseCommentDto,
  CreateCasePostDto,
  CaseModerationDto,
} from './dto/case-discussions.dto';

const postInclude = {
  author: { select: { id: true, name: true, avatarUrl: true } },
  category: { select: { id: true, name: true, slug: true } },
  images: { select: { id: true, storageKey: true, caption: true, orderIndex: true }, orderBy: { orderIndex: 'asc' as const } },
  _count: { select: { comments: true } },
} satisfies Prisma.CasePostInclude;

const commentInclude = {
  author: { select: { id: true, name: true, avatarUrl: true } },
  _count: { select: { replies: true } },
} satisfies Prisma.CaseCommentInclude;

type PostWithRelations = Prisma.CasePostGetPayload<{ include: typeof postInclude }>;

@Injectable()
export class CaseDiscussionsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ── Public ──────────────────────────────────────────────── */

  async findAllPublic(query: CasePostFiltersDto, currentUserId?: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.CasePostWhereInput = { status: PrismaCasePostStatus.APPROVED };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { has: query.search } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.casePost.findMany({
        where,
        include: postInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.casePost.count({ where }),
    ]);

    return {
      data: posts.map((post) => this.mapPost(post, currentUserId)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, currentUserId?: string) {
    const post = await this.prisma.casePost.findUnique({
      where: { id },
      include: {
        ...postInclude,
        comments: {
          where: { status: PrismaCaseCommentStatus.VISIBLE },
          include: commentInclude,
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Case post not found');
    }

    const isAuthor = currentUserId === post.authorId;
    const isAdmin = currentUserId && this.hasAdminAccess(currentUserId);

    if (post.status !== PrismaCasePostStatus.APPROVED && !isAuthor && !isAdmin) {
      throw new NotFoundException('Case post not found');
    }

    return this.mapPostDetail(post, currentUserId);
  }

  async findComments(casePostId: string) {
    const post = await this.prisma.casePost.findUnique({
      where: { id: casePostId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Case post not found');
    }

    const comments = await this.prisma.caseComment.findMany({
      where: {
        casePostId,
        status: PrismaCaseCommentStatus.VISIBLE,
        parentCommentId: null,
      },
      include: commentInclude,
      orderBy: { createdAt: 'asc' },
    });

    return { data: comments.map((comment) => this.mapComment(comment)) };
  }

  async findCategories() {
    const categories = await this.prisma.caseCategory.findMany({
      where: { status: 'active' },
      orderBy: { name: 'asc' },
    });
    return { data: categories };
  }

  /* ── Authenticated ───────────────────────────────────────── */

  async create(input: CreateCasePostDto, userId: string) {
    const post = await this.prisma.casePost.create({
      data: {
        authorId: userId,
        categoryId: input.categoryId,
        title: input.title,
        description: input.description,
        tags: input.tags ?? [],
        images: {
          create: (input.images ?? []).map((img) => ({
            storageKey: img.storageKey,
            caption: img.caption ?? null,
            orderIndex: img.orderIndex ?? 0,
          })),
        },
      },
      include: postInclude,
    });

    return this.mapPost(post, userId);
  }

  async createCategory(input: CreateCaseCategoryDto, _userId: string) {
    const name = input.name.trim();
    const slugBase = this.slugify(name);
    const slug = await this.nextCategorySlug(name, slugBase);

    const category = await this.prisma.caseCategory.upsert({
      where: { slug },
      update: { status: 'active' },
      create: {
        name,
        slug,
        status: 'active',
      },
    });

    return category;
  }

  async toggleUpvote(id: string, userId: string) {
    const post = await this.prisma.casePost.findUnique({
      where: { id },
      select: { id: true, upvotedBy: true },
    });

    if (!post) {
      throw new NotFoundException('Case post not found');
    }

    const hasUpvoted = post.upvotedBy.includes(userId);
    const updated = await this.prisma.casePost.update({
      where: { id },
      data: {
        upvotedBy: hasUpvoted
          ? { set: post.upvotedBy.filter((uid) => uid !== userId) }
          : { push: userId },
      },
      select: { id: true, upvotedBy: true },
    });

    return { id: updated.id, isUpvoted: !hasUpvoted, upvoteCount: updated.upvotedBy.length };
  }

  async toggleBookmark(id: string, userId: string) {
    const post = await this.prisma.casePost.findUnique({
      where: { id },
      select: { id: true, bookmarkedBy: true },
    });

    if (!post) {
      throw new NotFoundException('Case post not found');
    }

    const hasBookmarked = post.bookmarkedBy.includes(userId);
    const updated = await this.prisma.casePost.update({
      where: { id },
      data: {
        bookmarkedBy: hasBookmarked
          ? { set: post.bookmarkedBy.filter((uid) => uid !== userId) }
          : { push: userId },
      },
      select: { id: true, bookmarkedBy: true },
    });

    return { id: updated.id, isBookmarked: !hasBookmarked, bookmarkCount: updated.bookmarkedBy.length };
  }

  async addComment(casePostId: string, input: CreateCaseCommentDto, userId: string) {
    const post = await this.prisma.casePost.findUnique({
      where: { id: casePostId },
      select: { id: true, status: true },
    });

    if (!post) {
      throw new NotFoundException('Case post not found');
    }

    if (input.parentCommentId) {
      const parent = await this.prisma.caseComment.findUnique({
        where: { id: input.parentCommentId },
        select: { id: true, casePostId: true },
      });

      if (!parent || parent.casePostId !== casePostId) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await this.prisma.caseComment.create({
      data: {
        casePostId,
        authorId: userId,
        body: input.body,
        parentCommentId: input.parentCommentId ?? null,
      },
      include: commentInclude,
    });

    return this.mapComment(comment);
  }

  async reportComment(id: string, userId: string) {
    const comment = await this.prisma.caseComment.findUnique({
      where: { id },
      select: { id: true, reportedBy: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.reportedBy.includes(userId)) {
      return { id: comment.id, reported: true };
    }

    const updated = await this.prisma.caseComment.update({
      where: { id },
      data: { reportedBy: { push: userId } },
      select: { id: true },
    });

    return { id: updated.id, reported: true };
  }

  /* ── Admin ────────────────────────────────────────────────── */

  async findAdminQueue(query: CasePostFiltersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.CasePostWhereInput = {};

    if (query.status) {
      const status = this.toPrismaCasePostStatus(query.status);
      if (status) where.status = status;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { author: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.casePost.findMany({
        where,
        include: {
          ...postInclude,
          reviewedBy: { select: { id: true, name: true } },
        },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.casePost.count({ where }),
    ]);

    return {
      data: posts.map((post) => this.mapAdminPost(post)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async approve(id: string, adminId: string) {
    const post = await this.prisma.casePost.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!post) {
      throw new NotFoundException('Case post not found');
    }

    const updated = await this.prisma.casePost.update({
      where: { id },
      data: {
        status: PrismaCasePostStatus.APPROVED,
        reviewedById: adminId,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
      include: postInclude,
    });

    return this.mapPost(updated);
  }

  async reject(id: string, adminId: string, input: CaseModerationDto) {
    const post = await this.prisma.casePost.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!post) {
      throw new NotFoundException('Case post not found');
    }

    const updated = await this.prisma.casePost.update({
      where: { id },
      data: {
        status: PrismaCasePostStatus.REJECTED,
        reviewedById: adminId,
        reviewedAt: new Date(),
        rejectionReason: input.rejectionReason ?? null,
      },
      include: postInclude,
    });

    return this.mapPost(updated);
  }

  async hideComment(id: string, adminId: string) {
    const comment = await this.prisma.caseComment.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const updated = await this.prisma.caseComment.update({
      where: { id },
      data: {
        status: PrismaCaseCommentStatus.HIDDEN,
        hiddenById: adminId,
      },
      include: commentInclude,
    });

    return this.mapComment(updated);
  }

  /* ── Mappers ─────────────────────────────────────────────── */

  private mapPost(post: PostWithRelations, currentUserId?: string) {
    return {
      id: post.id,
      authorId: post.authorId,
      authorName: post.author.name,
      authorAvatarUrl: post.author.avatarUrl,
      categoryId: post.categoryId,
      categoryName: post.category.name,
      title: post.title,
      description: post.description,
      tags: post.tags,
      status: post.status.toLowerCase(),
      imageCount: post.images.length,
      commentCount: post._count.comments,
      upvoteCount: post.upvotedBy.length,
      isUpvoted: currentUserId ? post.upvotedBy.includes(currentUserId) : false,
      isBookmarked: currentUserId ? post.bookmarkedBy.includes(currentUserId) : false,
      createdAt: post.createdAt.toISOString(),
    };
  }

  private mapPostDetail(
    post: PostWithRelations & { comments: Prisma.CaseCommentGetPayload<{ include: typeof commentInclude }>[] },
    currentUserId?: string,
  ) {
    return {
      ...this.mapPost(post, currentUserId),
      images: post.images.map((img) => ({
        id: img.id,
        storageKey: img.storageKey,
        caption: img.caption,
        orderIndex: img.orderIndex,
      })),
      comments: post.comments.map((comment) => this.mapComment(comment)),
    };
  }

  private mapAdminPost(
    post: PostWithRelations & { reviewedBy: { id: string; name: string } | null },
  ) {
    return {
      ...this.mapPost(post),
      reviewedBy: post.reviewedBy,
      reviewedAt: post.reviewedAt?.toISOString() ?? null,
      rejectionReason: post.rejectionReason,
    };
  }

  private mapComment(
    comment: Prisma.CaseCommentGetPayload<{ include: typeof commentInclude }>,
  ) {
    return {
      id: comment.id,
      casePostId: comment.casePostId,
      authorId: comment.authorId,
      authorName: comment.author.name,
      authorAvatarUrl: comment.author.avatarUrl,
      parentCommentId: comment.parentCommentId,
      body: comment.body,
      status: comment.status.toLowerCase(),
      replyCount: comment._count.replies,
      createdAt: comment.createdAt.toISOString(),
    };
  }

  /* ── Helpers ─────────────────────────────────────────────── */

  private async hasAdminAccess(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: { select: { permissions: { include: { permission: { select: { module: true, action: true } } } } } },
      },
    });

    if (!user) return false;

    return user.role.permissions.some(
      (rp) =>
        (rp.permission.module === '*' && rp.permission.action === '*') ||
        (rp.permission.module === 'cases' && rp.permission.action === 'moderate'),
    );
  }

  private toPrismaCasePostStatus(value: string): PrismaCasePostStatus | undefined {
    const normalized = value.toUpperCase();
    if (normalized === 'PENDING_REVIEW') return PrismaCasePostStatus.PENDING_REVIEW;
    if (normalized === 'APPROVED') return PrismaCasePostStatus.APPROVED;
    if (normalized === 'REJECTED') return PrismaCasePostStatus.REJECTED;
    if (normalized === 'ARCHIVED') return PrismaCasePostStatus.ARCHIVED;
    return undefined;
  }

  private slugify(value: string) {
    const slug = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug || 'case-category';
  }

  private async nextCategorySlug(name: string, base: string) {
    const existing = await this.prisma.caseCategory.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true, name: true },
    });

    const exactByName = existing.find((category) => category.name.toLowerCase() === name.toLowerCase());
    if (exactByName) {
      return exactByName.slug;
    }

    const used = new Set(existing.map((category) => category.slug));
    if (!used.has(base)) {
      return base;
    }

    let index = 2;
    while (used.has(`${base}-${index}`)) {
      index += 1;
    }

    return `${base}-${index}`;
  }
}
