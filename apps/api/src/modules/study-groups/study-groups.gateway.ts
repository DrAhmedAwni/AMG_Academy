import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { sendMessageSchema } from './dto/study-groups.dto';
import { StudyGroupsService } from './study-groups.service';

interface AuthenticatedSocket extends Socket {
  userId: string;
}

interface JoinPayload {
  groupId: string;
}

interface SendMessagePayload {
  groupId: string;
  body: string;
}

@WebSocketGateway({
  namespace: '/api/v1/study-group',
  cors: { origin: '*' },
})
export class StudyGroupsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(StudyGroupsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly studyGroupsService: StudyGroupsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token as string | undefined;

      if (!token) {
        this.logger.warn('WebSocket connection rejected: no token provided');
        client.disconnect(true);
        return;
      }

      const secret = this.configService.get<string>('auth.jwtSecret')!;
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
        secret,
      });

      client.userId = payload.sub;
      this.logger.log(`WebSocket connected: user=${client.userId}`);
    } catch {
      this.logger.warn('WebSocket connection rejected: invalid or expired token');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`WebSocket disconnected: user=${client.userId}`);
  }

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinPayload,
  ) {
    if (!client.userId) {
      return { event: 'error', message: 'Not authenticated' };
    }

    try {
      await this.studyGroupsService.ensureMembership(data.groupId, client.userId);
      await client.join(`group:${data.groupId}`);
      this.logger.log(`User ${client.userId} joined room group:${data.groupId}`);
      return { event: 'joined', groupId: data.groupId };
    } catch (err: any) {
      return { event: 'error', message: err.message ?? 'Cannot join group' };
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendMessagePayload,
  ) {
    if (!client.userId) {
      return { event: 'error', message: 'Not authenticated' };
    }

    const parsed = sendMessageSchema.safeParse(data);
    if (!parsed.success) {
      return {
        event: 'error',
        message: parsed.error.issues.map((i) => i.message).join('; '),
      };
    }

    try {
      const message = await this.studyGroupsService.sendMessage(
        data.groupId,
        client.userId,
        { body: data.body },
      );
      this.server.to(`group:${data.groupId}`).emit('newMessage', message);
      return { event: 'sent', message };
    } catch (err: any) {
      return { event: 'error', message: err.message ?? 'Failed to send message' };
    }
  }
}
