/**
 *
 */
export function isAtBottom() {
  return globalThis.scrollY >= document.documentElement.scrollHeight - document.documentElement.clientHeight
}
