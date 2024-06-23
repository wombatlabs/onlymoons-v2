export function isNumeric(n: string) {
  const f = parseFloat(n)
  return !isNaN(f) && isFinite(f)
}
