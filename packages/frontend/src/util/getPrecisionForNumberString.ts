/**
 *
 * @param input {string|number} - number or number string to check.
 * @param maxPrecision {number} - maximum precision to return.
 * @param maxNums {number} - maximum number of non-zero decimals.
 *  ie maxNums=3 will return something like 0.00123
 */
export function getPrecisionForNumberString(input: string | number, maxPrecision = 16, maxNums = 3): number {
  const numberString = typeof input === 'number' ? input.toString() : input
  const [_wholeNumbers, decimalNumbers] = numberString.split('.')
  if (!decimalNumbers || decimalNumbers === '0') {
    return 0
  }
  const [zeroes, nums] = decimalNumbers.split('').reduce(
    ([currentZeroes, currentNums], value) =>
      value === '0' && currentNums < maxNums - 1
        ? // only increment zeroes, clamped
          [Math.min(currentZeroes + 1, maxPrecision - maxNums), currentNums]
        : // only increment nums, clamped
          [currentZeroes, Math.min(currentNums + 1, maxNums)],
    [0, 0],
  )
  return zeroes + nums
}
