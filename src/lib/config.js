// Plan limits. Keep in step with workerLimit()/recordLimit() in firestore.rules.
export const PLAN_LIMITS = {
  free: { workers: 3, recordsPerMonth: 50 },
};

export const limitsFor = (plan = 'free') => PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

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