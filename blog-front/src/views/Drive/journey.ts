import * as T from 'three'
import { planetScale } from './planetSpace'
export { buildPlanet } from './planet'

const approachBoundary = 0.43
const approachSeconds = 7
const cloudPaceSeconds = 20
export const arrivalDuration = approachSeconds + (1 - approachBoundary) * cloudPaceSeconds
export const landingAlignment = 0.4
export const orbitDuration = 1.2
export function createArrivalJourney() {
  let phase: 'orbit' | 'approach' | 'landed' = 'orbit'
  let seconds = 0
  return {
    skip() {
      phase = 'landed'
      seconds = arrivalDuration
    },
    step(dt: number, reduced: boolean) {
      if (phase === 'orbit') {
        seconds += dt
        if (seconds < orbitDuration) return
        phase = 'approach'
        seconds -= orbitDuration
      }
      if (phase !== 'approach') return
      seconds = reduced ? arrivalDuration : Math.min(arrivalDuration, seconds + dt)
      if (seconds >= arrivalDuration) phase = 'landed'
    },
    get phase() {
      return phase
    },
    get progress() {
      return phase === 'orbit' ? 0 : arrivalProgress(seconds)
    },
  }
}
export function arrivalProgress(seconds: number, reduced = false) {
  if (reduced) return 1
  const elapsed = Math.max(0, seconds)
  if (elapsed < approachSeconds) {
    const t = elapsed / approachSeconds
    const endSlope = approachSeconds / (approachBoundary * cloudPaceSeconds)
    // Accelerate the approach, matching the original cloud speed at the boundary.
    return approachBoundary * ((2 - endSlope) * t + (endSlope - 1) * t * t)
  }
  return Math.min(1, approachBoundary + (elapsed - approachSeconds) / cloudPaceSeconds)
}
export function arrivalPose(
  progress: number,
  destination: T.Vector3,
  focus: T.Vector3,
  aspect: number,
) {
  const scale = planetScale(aspect)
  const p = T.MathUtils.clamp(progress, 0, 1)
  const eased = p * p * p * (p * (p * 6 - 15) + 10)
  const remaining = (Math.exp(-7 * eased) - Math.exp(-7)) / (1 - Math.exp(-7))
  const start = new T.Vector3(
    560 / Math.min(1, aspect),
    520,
    645 / Math.min(1, aspect),
  ).multiplyScalar(scale)
  // One continuous descent. No waypoint, hidden reposition, or upward return inside clouds.
  return {
    position: destination.clone().lerp(start, remaining),
    focus: focus.clone().lerp(new T.Vector3(0, -140 * scale, 0), remaining),
  }
}
