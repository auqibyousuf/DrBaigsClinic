// Shared "DD Mon YY" date formatting (e.g. "03 Sep 26") for admin data
// tables — used instead of raw ISO strings or locale-dependent formats so
// every table shows dates the same way.
export function formatShortDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  // Date-only strings ("YYYY-MM-DD") parse as UTC midnight — in a timezone
  // behind UTC that rolls back to the previous day, so parse the parts
  // directly instead of handing the raw string to `new Date()`.
  let date: Date;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split('-').map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  }
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = String(date.getFullYear()).slice(-2);
  return `${day} ${month} ${year}`;
}
