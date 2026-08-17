/**
 * MoneyNote Safe Date-Only Utility Functions
 * Avoids off-by-one timezone shifting bugs when handling date-only financial fields.
 */

/**
 * Safely parses a date-only string (e.g. "2026-07-01") or Date object into a local Date instance.
 * Unlike new Date("2026-07-01") which parses as UTC midnight, this creates a local Date set to 00:00:00 local time.
 */
export const parseDateOnly = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;

  // Extract YYYY-MM-DD string part
  const cleanStr = String(dateStr).split('T')[0].split(' ')[0];
  const parts = cleanStr.split('-');

  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed month
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }

  return new Date(dateStr);
};

/**
 * Formats a date-only string or Date object into a YYYY-MM-DD string using local calendar values.
 * NEVER uses toISOString() which causes timezone shifting.
 */
export const formatDateToYYYYMMDD = (d) => {
  if (!d) return '';
  const dateObj = typeof d === 'string' ? parseDateOnly(d) : d;
  if (!dateObj || isNaN(dateObj.getTime())) return '';

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date-only string (e.g., "2026-07-01") into a human-readable string without timezone conversion.
 * Example: formatDateOnly("2026-07-01", { month: 'short', day: '2-digit', year: 'numeric' })
 * Outputs "Jul 01, 2026" consistently in all browser timezones.
 */
export const formatDateOnly = (
  dateStr,
  options = { month: 'short', day: '2-digit', year: 'numeric' },
  locale = 'en-US'
) => {
  if (!dateStr) return '';
  const d = parseDateOnly(dateStr);
  if (!d || isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString(locale, options);
};

/**
 * Returns today's calendar date as a YYYY-MM-DD string in local browser time.
 */
export const getTodayDateString = () => {
  return formatDateToYYYYMMDD(new Date());
};
