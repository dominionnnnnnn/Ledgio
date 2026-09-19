/**
 * The fixed record-field library (no custom fields in the MVP).
 *
 * Money rules:
 *   Revenue  — income (what was paid)
 *   Expense  — one expense amount per record
 *   Profit   = Revenue − Expense
 *   Amount, Balance — stored for reference; they don't affect profit.
 */
export const FIELD_LIBRARY = [
  { group: 'General', fields: ['Date', 'Notes', 'Amount', 'Quantity', 'Status', 'Customer'] },
  { group: 'Financial', fields: ['Revenue', 'Expense', 'Balance'] },
  { group: 'Worker', fields: ['Worker'] },
  { group: 'Transport', fields: ['Destination', 'Distance'] },
];

/** Always on every record: profit and per-worker results depend on them. */
export const LOCKED_FIELDS = ['Worker', 'Date', 'Revenue', 'Expense'];
/** Always required (can't be switched off). */
export const ALWAYS_REQUIRED = ['Worker', 'Date', 'Revenue'];

export const MONEY_FIELDS = ['Revenue', 'Expense', 'Amount', 'Balance'];

export const FIELD_HINTS = {
  Date: 'dd / mm / yyyy',
  Worker: 'Choose a worker',
  Destination: 'e.g. Lagos → Ibadan',
  Revenue: '0',
  Expense: '0',
  Amount: '0',
  Balance: '0',
  Notes: 'Anything to remember',
  Quantity: '0',
  Status: 'Paid / Owing',
  Customer: 'Customer name',
  Distance: 'km',
};

export const BUSINESS_TYPES = [
  { value: 'transport', label: 'Transport & haulage' },
  { value: 'retail', label: 'Retail shop' },
  { value: 'food', label: 'Food & catering' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
];

/** Suggested starting fields for each business type. */
export function defaultFieldsFor(type) {
  if (type === 'transport') return ['Worker', 'Date', 'Destination', 'Revenue', 'Expense'];
  if (type === 'retail') return ['Worker', 'Date', 'Customer', 'Quantity', 'Revenue', 'Expense'];
  return ['Worker', 'Date', 'Revenue', 'Expense', 'Notes'];
}

export function defaultRequired() {
  return Object.fromEntries(ALWAYS_REQUIRED.map((f) => [f, true]));
}
