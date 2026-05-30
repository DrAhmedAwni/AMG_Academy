import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import Redis from 'ioredis';
import { Observable, defer, from, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

const CACHE_CONFIG_KEY = 'cache-config';

type CacheConfig = {
  keyPrefix: string;
  ttlSeconds?: number;
  varyByUser?: boolean;
};

type CacheEntry = {
  value: string;
  expiresAt: number;
};

export const CacheConfig = (config: CacheConfig) => SetMetadata(CACHE_CONFIG_KEY, config);

@Injectable()
export class CacheStoreService {
  private readonly logger = new Logger(CacheStoreService.name);
  private readonly memoryCache = new Map<string, CacheEntry>();
  private readonly redis: Redis | null;
  private redisAvailable = true;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL') ?? process.env.REDIS_URL;
    if (!redisUrl) {
      this.redis = null;
      this.redisAvailable = false;
      this.logger.warn(
        'Redis URL not configured. Using in-memory cache fallback. NOTE: In-memory cache invalidation will not work across multiple server instances.',
      );
      return;
    }

    this.redis = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

    this.redis.on('error', (error) => {
      this.redisAvailable = false;
      this.logger.warn(`Redis cache unavailable, falling back to memory cache: ${error.message}`);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const memoryHit = this.memoryCache.get(key);
    if (memoryHit && memoryHit.expiresAt > Date.now()) {
      return JSON.parse(memoryHit.value) as T;
    }
    if (memoryHit) {
      this.memoryCache.delete(key);
    }

    const client = await this.getRedisClient();
    if (!client) {
      return null;
    }

    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds: number) {
    const serialized = JSON.stringify(value);
    this.memoryCache.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    const client = await this.getRedisClient();
    if (client) {
      await client.set(key, serialized, 'EX', ttlSeconds);
    }
  }

  async invalidatePrefix(prefix: string) {
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }

    const client = await this.getRedisClient();
    if (!client) {
      return;
    }

    let cursor = '0';
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } while (cursor !== '0');
  }

  private async getRedisClient() {
    if (!this.redis || !this.redisAvailable) {
      return null;
    }

    if (this.redis.status === 'wait') {
      try {
        await this.redis.connect();
      } catch (error) {
        this.redisAvailable = false;
        this.logger.warn(`Redis connection failed, using memory cache only: ${(error as Error).message}`);
        return null;
      }
    }

    return this.redis.status === 'ready' ? this.redis : null;
  }
}

@Injectable()
export class ApiCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cacheStore: CacheStoreService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { user?: { sub?: string } }>();
    if (request.method !== 'GET') {
      return next.handle();
    }

    const config = this.reflector.get<CacheConfig>(CACHE_CONFIG_KEY, context.getHandler());
    if (!config) {
      return next.handle();
    }

    const cacheKey = this.buildCacheKey(request, config);
    const ttlSeconds = config.ttlSeconds ?? 60;

    return defer(() => from(this.cacheStore.get<unknown>(cacheKey))).pipe(
      mergeMap((cachedValue) => {
        if (cachedValue !== null) {
          return of(cachedValue);
        }

        return next.handle().pipe(
          mergeMap((response) =>
            from(this.cacheStore.set(cacheKey, response, ttlSeconds)).pipe(
              mergeMap(() => of(response)),
            ),
          ),
        );
      }),
    );
  }

  private buildCacheKey(
    request: Request & { user?: { sub?: string } },
    config: CacheConfig,
  ) {
    const url = request.originalUrl || request.url;
    const userSegment = config.varyByUser ? `:${request.user?.sub ?? 'anonymous'}` : '';
    return `${config.keyPrefix}${userSegment}:${url}`;
  }
}
