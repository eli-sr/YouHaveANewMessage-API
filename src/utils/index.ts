
export function getIp (reqIp: string | undefined): string | null {
  if (reqIp === undefined) { return null }
  if (reqIp.startsWith('::ffff:')) {
    return reqIp.slice(7)
  }
  return reqIp
}

export function isCreatedAtWithinLastDay (createdAt: string): boolean {
  const createdAtDate = new Date(createdAt)
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  return createdAtDate > oneDayAgo
}
