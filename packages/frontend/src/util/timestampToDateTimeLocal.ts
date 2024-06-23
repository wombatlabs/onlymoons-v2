/**
 * @param timestamp in seconds
 * @returns string formatted for input type datetime-local
 */
export function timestampToDateTimeLocal(timestamp: Date | number): string {
  const d = timestamp instanceof Date ? timestamp : new Date(timestamp)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
