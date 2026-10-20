import * as T from 'three'
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
  const ease = (p: number) => p * p * p * (p * (p * 6 - 15) + 10)
  // Keep the established island reveal path from 72% onward.
  const revealPose = () => {
    const aligned = new T.Vector3(focus.x, 240 * Math.max(1, 0.8 / aspect), focus.z + 12)
    const t = ease((progress - landingAlignment) / (1 - landingAlignment))
    return { position: aligned.lerp(destination, t), focus: focus.clone() }
  }
  const start = new T.Vector3(560 / Math.min(1, aspect), 520, 645 / Math.min(1, aspect))
  const centre = new T.Vector3(0, -140, 0)
  const landingNormal = new T.Vector3(0.16, 1, 0.22).normalize()
  const entry = centre.clone().addScaledVector(landingNormal, 162)
  const ground = centre.clone().addScaledVector(landingNormal, 140)
  if (progress <= 0.6) {
    const t = ease(progress / 0.6)
    const relative = start.clone().sub(centre)
    const radius = Math.exp(T.MathUtils.lerp(Math.log(relative.length()), Math.log(162), t))
    const rotation = new T.Quaternion().setFromUnitVectors(relative.normalize(), landingNormal)
    relative.applyQuaternion(new T.Quaternion().slerp(rotation, t))
    return {
      position: centre.clone().addScaledVector(relative, radius),
      focus: centre.clone().lerp(ground, t),
    }
  }
  const revealed = revealPose()
  if (progress < 0.72) {
    // This handoff takes place entirely inside the existing opaque cloud bank.
    const t = ease((progress - 0.6) / 0.12)
    return { position: entry.lerp(revealed.position, t), focus: ground.lerp(revealed.focus, t) }
  }
  return revealed
}
