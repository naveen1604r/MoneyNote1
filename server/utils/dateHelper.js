/**
 * Server Date Formatting Utility
 * Prevents timezone shifting bugs when converting MySQL DATE strings to YYYY-MM-DD
 */

function formatDateString(dateVal) {
  if (!dateVal) return null;

  // If already string (e.g. '2026-07-01' or '2026-07-01T00:00:00.000Z')
  if (typeof dateVal === 'string') {
    return dateVal.split('T')[0];
  }

  // If Date object
  if (dateVal instanceof Date) {
    const yyyy = dateVal.getFullYear();
    const mm = String(dateVal.getMonth() + 1).padStart(2, '0');
    const dd = String(dateVal.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return String(dateVal).split('T')[0];
}

module.exports = {
  formatDateString,
};
