/**
 * Search Service for Shopro Operator Portal
 * Provides context-aware search across orders, stores, users, and navigation.
 */

export type SearchCategory = 'ORDER' | 'STORE' | 'USER' | 'NAV' | 'SETTING';

export interface SearchResult {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle?: string;
  route: string;
  icon?: string;
  metadata?: Record<string, any>;
}

const MOCK_DATA: SearchResult[] = [
  // Navigation / Quick Actions
  { id: 'nav-dashboard', category: 'NAV', title: 'Dashboard', subtitle: 'Main overview', route: '/operator/dashboard' },
  { id: 'nav-roles', category: 'NAV', title: 'User Roles', subtitle: 'Permissions & access control', route: '/operator/roles' },
  { id: 'nav-audit', category: 'NAV', title: 'Audit Trail', subtitle: 'Security & system logs', route: '/operator/audit-trail' },
  { id: 'nav-payouts', category: 'NAV', title: 'Payout Vault', subtitle: 'Merchant settlements', route: '/operator/payouts' },
  { id: 'nav-tax', category: 'NAV', title: 'Tax Dashboard', subtitle: 'Compliance & rules', route: '/operator/tax' },
  
  // Orders
  { id: 'order-8821', category: 'ORDER', title: 'Order #8821', subtitle: 'The Oven • ₹850.00 • Preparing', route: '/operator/orders', metadata: { store: 'The Oven' } },
  { id: 'order-8822', category: 'ORDER', title: 'Order #8822', subtitle: 'Sushi Zen • ₹1,200.00 • Disputed', route: '/operator/orders', metadata: { store: 'Sushi Zen' } },
  { id: 'order-8823', category: 'ORDER', title: 'Order #8823', subtitle: 'Burger Lab • ₹450.00 • Delivered', route: '/operator/orders', metadata: { store: 'Burger Lab' } },
  
  // Stores
  { id: 'store-1', category: 'STORE', title: 'The Oven', subtitle: 'Pizzeria • Active • Bandra West', route: '/operator/restaurants' },
  { id: 'store-2', category: 'STORE', title: 'Sushi Zen', subtitle: 'Japanese • Under Review • Colaba', route: '/operator/restaurants' },
  { id: 'store-3', category: 'STORE', title: 'Burger Lab', subtitle: 'Fast Food • Suspended • Andheri', route: '/operator/restaurants' },
  
  // Users
  { id: 'user-arun', category: 'USER', title: 'Arun Soman', subtitle: 'Platform Admin', route: '/operator/roles' },
  { id: 'user-support', category: 'USER', title: 'Support Alpha', subtitle: 'Merchant Support', route: '/operator/roles' },
];

/**
 * Maps a URL path to a priority SearchCategory.
 */
export function getSearchContext(path: string): SearchCategory | null {
  if (path.includes('/operator/orders')) return 'ORDER';
  if (path.includes('/operator/restaurants')) return 'STORE';
  if (path.includes('/operator/roles')) return 'USER';
  if (path.includes('/operator/tax')) return 'SETTING';
  return null;
}

/**
 * Performs a context-aware search.
 * Items matching the current context are grouped first.
 */
export async function performSearch(query: string, contextPath: string): Promise<{
  contextual: SearchResult[];
  global: SearchResult[];
}> {
  if (!query || query.length < 2) return { contextual: [], global: [] };

  const lowQuery = query.toLowerCase();
  const context = getSearchContext(contextPath);

  const allMatches = MOCK_DATA.filter(item => 
    item.title.toLowerCase().includes(lowQuery) || 
    item.subtitle?.toLowerCase().includes(lowQuery) ||
    item.id.toLowerCase().includes(lowQuery)
  );

  const contextual = allMatches.filter(item => item.category === context);
  const global = allMatches.filter(item => item.category !== context);

  return { contextual, global };
}
