import { SetMetadata } from '@nestjs/common';
import { PermissionCode } from '../permissions';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for a route
 * @param perms - Permission codes (e.g., 'ORGANIZATION:I', 'ORGANIZATION:E')
 * @example
 * @Permissions('ORGANIZATION:X', 'ORGANIZATION:I')
 * @Get()
 * findAll() { }
 */
export const Permissions = (...perms: PermissionCode[]) =>
  SetMetadata(PERMISSIONS_KEY, perms);
