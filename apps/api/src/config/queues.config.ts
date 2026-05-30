import { registerAs } from '@nestjs/config';
import { QueueOptions } from 'bullmq';

export default registerAs(
  'queues',
  (): {
    connection: QueueOptions['connection'];
    defaultJobOptions: QueueOptions['defaultJobOptions'];
  } => {
    const redisUrl = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379');

    return {
      connection: {
        host: redisUrl.hostname,
        port: Number(redisUrl.port || 6379),
        username: redisUrl.username || undefined,
        password: redisUrl.password || undefined,
      },
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    };
  },
);
