/**
 * plans.ts — Nexlyra Plan Config
 * Single source of truth for all plan definitions used by Edge Functions.
 * Keep in sync with src/lib/plans.ts on the frontend.
 */

export const PLAN_CONFIG = {
  free: {
    maxProducts: 10,
    maxStores: 0,
    hasCheckout: false,
    hasAI: false,
    hasAutomation: false,
    label: 'FREE',
  },
  pro: {
    maxProducts: Infinity,
    maxStores: 1,
    hasCheckout: false,
    hasAI: false,
    hasAutomation: false,
    label: 'PRO',
  },
  loja: {
    maxProducts: Infinity,
    maxStores: 1,
    hasCheckout: true,
    hasAI: false,
    hasAutomation: false,
    label: 'LOJA',
  },
  ultra: {
    maxProducts: Infinity,
    maxStores: 5,
    hasCheckout: true,
    hasAI: true,
    hasAutomation: true,
    label: 'ULTRA',
  },
} as const;

export type PlanKey = keyof typeof PLAN_CONFIG;

export const VALID_PLAN_KEYS: PlanKey[] = ['free', 'pro', 'loja', 'ultra'];

/** Returns plan config, defaulting to FREE if plan is unknown/missing */
export function getPlanConfig(plan: string | null | undefined) {
  const key = (plan ?? '').toLowerCase() as PlanKey;
  return PLAN_CONFIG[key] ?? PLAN_CONFIG.free;
}

/** Normalize a plan string to a valid PlanKey, defaulting to 'free' */
export function normalizePlan(plan: string | null | undefined): PlanKey {
  const key = (plan ?? '').toLowerCase() as PlanKey;
  return VALID_PLAN_KEYS.includes(key) ? key : 'free';
}

/**
 * Maps a Kiwify product name to the corresponding Nexlyra plan key.
 * Checks for ULTRA first (most specific), then LOJA, then PRO.
 * Any paid product not matched defaults to 'pro'.
 */
export function mapKiwifyProductToPlan(productName: string | null | undefined): PlanKey {
  const name = (productName ?? '').toLowerCase();
  if (name.includes('ultra')) return 'ultra';
  if (name.includes('loja')) return 'loja';
  if (name.includes('pro')) return 'pro';
  // Legacy product names
  if (name.includes('premium') || name.includes('profissional')) return 'loja';
  if (name.includes('básico') || name.includes('basico')) return 'pro';
  // Any paid product receives at least PRO
  return 'pro';
}

/** Number of days of grace period for late payments */
export const LATE_PAYMENT_GRACE_DAYS = 7;
