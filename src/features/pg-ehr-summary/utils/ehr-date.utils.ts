/**
 * Converts a date string from YYYY-MM-DD format to YYYYMMDDHHMM format
 * If time is not provided, defaults to 0000
 */
export function toVnMohDateFormat(dateString: string): string {
  if (!dateString) return '';

  // Remove any hyphens and colons
  const cleanDate = dateString.replace(/[-:T\s]/g, '');

  // If it's a date-only format (YYYY-MM-DD becomes YYYYMMDD)
  if (cleanDate.length === 8) {
    // Add default time 00:00
    return `${cleanDate}0000`;
  }

  // If it's datetime format (YYYY-MM-DDTHH:MM becomes YYYYMMDDHHMM)
  if (cleanDate.length >= 12) {
    return cleanDate.substring(0, 12);
  }

  // Pad with zeros if needed
  return cleanDate.padEnd(12, '0');
}

/**
 * Converts a datetime-local string (YYYY-MM-DDTHH:mm) to YYYYMMDDHHMM format
 */
export function toVnMohDateTimeFormat(dateTimeString: string): string {
  if (!dateTimeString) return '';

  // datetime-local format: 2023-05-15T07:30
  const cleanDateTime = dateTimeString.replace(/[-:T]/g, '');

  // Ensure we have exactly 12 characters
  return cleanDateTime.padEnd(12, '0').substring(0, 12);
}
