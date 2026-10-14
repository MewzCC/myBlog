export const dayDuration = 480
export const wrapHour = (hour: number) => ((hour % 24) + 24) % 24
export const advanceHour = (hour: number, seconds: number) =>
  wrapHour(hour + (seconds * 24) / dayDuration)
export function solarState(hour: number) {
  const angle = ((wrapHour(hour) - 6) / 24) * Math.PI * 2
  const elevation = Math.sin(angle)
  const t = Math.max(0, Math.min(1, (elevation + 0.12) / 0.35))
  const daylight = t * t * (3 - 2 * t)
  const dusk = Math.max(0, 1 - Math.abs(elevation - 0.05) / 0.24)
  return { angle, elevation, daylight, night: 1 - daylight, dusk }
}
export function formatIslandTime(hour: number) {
  const minutes = Math.floor(wrapHour(hour) * 60)
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}
