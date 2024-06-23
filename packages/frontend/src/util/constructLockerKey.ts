export function constructLockerKey(chainId: number, lockId: number): string {
  return `${chainId}_${lockId}`
}
