/**
 * @template T {unknown} - type used in array
 * @param input {Array<T>} - input array
 * @param maxSize {number} - max size of the array. does not fill.
 * @return a new array, clamped to `maxSize`
 */
export function limitArraySize<T = unknown>(input: Array<T>, maxSize: number): Array<T> {
  // if input array is smaller than maxSize, spread it into a new array and return
  if (input.length <= maxSize) return [...input]
  // create a new array of the correct size and fill it
  return new Array(Math.min(maxSize, input.length)).fill(null).map((_, index) => input[index])
}
