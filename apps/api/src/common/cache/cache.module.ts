import { Global, Module } from '@nestjs/common';
import { ApiCacheInterceptor, CacheStoreService } from '../interceptors/cache.interceptor';

@Global()
@Module({
  providers: [CacheStoreService, ApiCacheInterceptor],
  exports: [CacheStoreService, ApiCacheInterceptor],
})
export class CacheModule {}
