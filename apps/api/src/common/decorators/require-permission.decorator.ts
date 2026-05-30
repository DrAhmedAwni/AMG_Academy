import { SetMetadata } from '@nestjs/common';
import { PERMISSION_KEY } from '../constants/auth.constants';

export const RequirePermission = (permission: string) => SetMetadata(PERMISSION_KEY, permission);
