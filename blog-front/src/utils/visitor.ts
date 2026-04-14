const VISITOR_ID_KEY = 'blog:visitorId'

export const getVisitorId = () => {
  const existing = localStorage.getItem(VISITOR_ID_KEY)
  if (existing) return existing
  const next = crypto.randomUUID()
  localStorage.setItem(VISITOR_ID_KEY, next)
  return next
}
