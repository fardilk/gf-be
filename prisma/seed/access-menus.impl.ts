import { PrismaClient } from '@prisma/client';
import ACCESS_MENU_MAPPINGS from './access-menus.seed';

export async function seedAccessMenus(prisma: PrismaClient) {
  // Clear existing access_menu entries
  await prisma.accessMenu.deleteMany({});

  const mappings = ACCESS_MENU_MAPPINGS as Record<string, string[]>;

  // Resolve menu keys to IDs
  const allMenus = await prisma.menu.findMany({ select: { id: true, key: true } });
  const keyToId = new Map<string, string>();
  for (const m of allMenus) keyToId.set(m.key, m.id);

  const payload: Array<{ accessId: string; menuId: string }> = [];

  // For ac03 (administrator) map every menu
  if (mappings.ac03 && mappings.ac03.length === 0) {
    for (const [, id] of keyToId.entries()) {
      payload.push({ accessId: 'ac03', menuId: id });
    }
  }

  // For others, map specified keys (skip missing keys but log them)
  for (const [accessId, keys] of Object.entries(mappings)) {
    if (accessId === 'ac03') continue;
    for (const key of keys) {
      const id = keyToId.get(key);
      if (!id) {
        console.warn(`seedAccessMenus: menu key not found: ${key}`);
        continue;
      }
      payload.push({ accessId, menuId: id });
    }
  }

  if (payload.length === 0) {
    console.log('seedAccessMenus: no access_menu entries to create');
    return;
  }

  // Upsert one-by-one to ensure idempotency (composite PK exists)
  for (const entry of payload) {
    try {
      await prisma.accessMenu.create({ data: entry });
    } catch (e: any) {
      // ignore unique constraint errors (already exists)
      if (e?.code === 'P2002' || /Unique constraint failed/.test(String(e))) continue;
      throw e;
    }
  }

  console.log('✅ Seeded access_menus via access-menus.impl.ts');
}
