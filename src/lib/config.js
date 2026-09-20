// Plan limits. Keep in step with workerLimit()/recordLimit() in firestore.rules.
export const PLAN_LIMITS = {
  free: { workers: 3, recordsPerMonth: 50 },
  premium: { workers: Infinity, recordsPerMonth: Infinity },
};

export const limitsFor = (plan = 'free') => PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

/** When a premium grant ends (a Date), or null if it has no end. */
export const premiumEndsAt = (business) => business?.planExpiresAt?.toDate?.() ?? null;

/**
 * The plan that actually applies right now. Premium set by an admin lasts until
 * `planExpiresAt`; after that the business is treated as free again (the rules do the same).
 */
export function planOf(business) {
  if (business?.plan !== 'premium') return 'free';
  const ends = premiumEndsAt(business);
  return !ends || ends > new Date() ? 'premium' : 'free';
}

export const isPremium = (business) => planOf(business) === 'premium';

export const CURRENCIES = [
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira (NGN)' },
  { code: 'GHS', symbol: '₵', label: 'Ghanaian Cedi (GHS)' },
  { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
];

// Support contact (WhatsApp chat only, not calls).
export const SUPPORT_WHATSAPP = {
  display: '+234 808 384 2079',
  link: 'https://wa.me/2348083842079',
};

// Where Ledgio is hosted. Shown on the landing page's install steps.
export const SITE_URL = 'https://ledgio-nine.vercel.app';
export const SITE_HOST = 'ledgio-nine.vercel.app';