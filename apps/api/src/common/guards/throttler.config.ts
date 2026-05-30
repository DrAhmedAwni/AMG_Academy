import { minutes } from '@nestjs/throttler';

export const throttlerDefinitions = [
  {
    name: 'default',
    ttl: minutes(1),
    limit: 100,
  },
];

export const authThrottle = {
  default: {
    ttl: minutes(1),
    limit: 60,
  },
};

export const forgotPasswordThrottle = {
  default: {
    ttl: minutes(60),
    limit: 3,
  },
};

export const qrThrottle = {
  default: {
    ttl: minutes(1),
    limit: 30,
  },
};

export const adminThrottle = {
  default: {
    ttl: minutes(1),
    limit: 200,
  },
};
