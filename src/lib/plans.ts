/**
 * plans.ts — Nexlyra Plan Config (Frontend)
 * Mirrors the backend _shared/plans.ts.
 * Use getPlanConfig() everywhere instead of scattered plan checks.
 */

export const PLAN_CONFIG = {
  free: {
    maxProducts: 10,
    maxStores: 0,
    hasCheckout: false,
    hasAI: false,
    hasAutomation: false,
    label: 'FREE',
    color: '#6b7280',
    badgeClass: 'bg-gray-100 text-gray-500',
  },
  pro: {
    maxProducts: Infinity,
    maxStores: 1,
    hasCheckout: false,
    hasAI: false,
    hasAutomation: false,
    label: 'PRO',
    color: '#5551FF',
    badgeClass: 'bg-indigo-50 text-indigo-600',
  },
  loja: {
    maxProducts: Infinity,
    maxStores: 1,
    hasCheckout: true,
    hasAI: false,
    hasAutomation: false,
    label: 'LOJA',
    color: '#8b5cf6',
    badgeClass: 'bg-purple-50 text-purple-600',
  },
  ultra: {
    maxProducts: Infinity,
    maxStores: 5,
    hasCheckout: true,
    hasAI: true,
    hasAutomation: true,
    label: 'ULTRA',
    color: '#f59e0b',
    badgeClass: 'bg-amber-50 text-amber-600',
  },
} as const;

export type PlanKey = keyof typeof PLAN_CONFIG;

const VALID_PLAN_KEYS: PlanKey[] = ['free', 'pro', 'loja', 'ultra'];

/**
 * Returns plan config for a given plan string.
 * Defaults to FREE if plan is unknown, null, or undefined.
 */
export function getPlanConfig(plan?: string | null) {
  const key = (plan ?? '').toLowerCase() as PlanKey;
  return PLAN_CONFIG[key] ?? PLAN_CONFIG.free;
}

/**
 * Normalize a plan string to a valid PlanKey.
 * Defaults to 'free'.
 */
export function normalizePlan(plan?: string | null): PlanKey {
  const key = (plan ?? '').toLowerCase() as PlanKey;
  return VALID_PLAN_KEYS.includes(key) ? key : 'free';
}

/** Check if a user can add more products */
export function canAddProduct(plan: string | null | undefined, currentCount: number): boolean {
  const config = getPlanConfig(plan);
  return currentCount < config.maxProducts;
}

/** Check if a user can create more stores */
export function canCreateStore(plan: string | null | undefined, currentCount: number): boolean {
  const config = getPlanConfig(plan);
  return currentCount < config.maxStores;
}
