export const ACCESS_MENU_MAPPINGS: Record<string, string[]> = {
  // Organization access: exactly the keys you requested
  ac01: [
    'dashboard',
    'gift', // parent only
    'picks',
    'organizations',
    'organizations-overview',
    'organizations-profile',
    'organizations-members',
    'organizations-clusters',
    'organizations-occasions',
    'organizations-benefits',
    'organizations-events',
    'organizations-wallet',
    'reports',
    'ai-recommendation',
    'groups',
    'affiliate-setting',
    'occasion',
  ],

  // Individual access (ac02) - keep limited set (you can adjust)
  ac02: ['dashboard', 'relation', 'picks'],

  // Administrator access (ac03) - full access (we'll map all menus found)
  ac03: [],
};

export default ACCESS_MENU_MAPPINGS;
