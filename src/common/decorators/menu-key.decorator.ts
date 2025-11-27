import { SetMetadata } from '@nestjs/common';

export const MENU_KEY = 'menu_key';

/**
 * Decorator to mark a route with its associated menu key.
 * The MenuAccessGuard will check if the user has access to this menu.
 * If the user doesn't have access, a 404 Not Found will be returned.
 * 
 * @param key - The menu key from the menu table (e.g., 'dashboard', 'organizations-profile')
 * 
 * @example
 * ```typescript
 * @MenuKey('dashboard')
 * @Get()
 * getDashboard() {
 *   return this.service.getDashboard();
 * }
 * ```
 */
export const MenuKey = (key: string) => SetMetadata(MENU_KEY, key);
