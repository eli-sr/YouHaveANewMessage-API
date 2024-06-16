
export function getIp (reqIp: string | undefined): string | null {
  if (reqIp === undefined) { return null }
  if (reqIp.startsWith('::ffff:')) {
    return reqIp.slice(7)
  }
  return reqIp
}
