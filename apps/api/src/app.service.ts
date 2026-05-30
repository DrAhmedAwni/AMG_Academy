import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      success: true,
      data: {
        service: 'amg-academy-api',
        status: 'ok',
      },
    };
  }
}
