import { expect, it } from 'vitest'
import { Vector3 } from 'three'
import {
  arrivalPose,
  arrivalProgress,
  arrivalDuration,
  orbitDuration,
  createArrivalJourney,
  landingAlignment,
} from './journey'

it.each([false, true])(
  'shows the planet first then automatically approaches with reducedMotion=%s',
  (reduced) => {
    const journey = createArrivalJourney()
    journey.step(orbitDuration / 2, reduced)
    expect(journey.phase).toBe('orbit')
    expect(journey.progress).toBe(0)
    for (let i = 0; i < Math.ceil((arrivalDuration + orbitDuration) * 60); i++)
      journey.step(1 / 60, reduced)
    expect(journey.phase).toBe('landed')
    expect(journey.progress).toBe(1)
  },
)
it('starts above a globe and reaches the actual destination continuously', () => {
  const end = new Vector3(105, 100, 105),
    focus = new Vector3()
  const start = arrivalPose(0, end, focus, 1)
  expect(start.position.distanceTo(end)).toBeGreaterThan(300)
  expect(start.focus.y).toBe(-140)
  const landed = arrivalPose(1, end, focus, 1)
  expect(landed.position.distanceTo(end)).toBeLessThan(0.001)
  expect(landed.focus.distanceTo(focus)).toBeLessThan(0.001)
  let previous = start.position
  for (let i = 1; i <= arrivalDuration * 60; i++) {
    const current = arrivalPose(arrivalProgress(i / 60), end, focus, 1).position
    expect(current.distanceTo(previous)).toBeLessThan(4)
    previous = current
  }
  expect(arrivalProgress(arrivalDuration)).toBe(1)
  expect(arrivalProgress(0, true)).toBe(1)
})

it('straightens over the landing site before cloud rendering begins', () => {
  const focus = new Vector3(-12, 0, 12),
    destination = new Vector3(105, 123, 105)
  const aligned = arrivalPose(landingAlignment, destination, focus, 1.44)
  expect(aligned.focus.distanceTo(focus)).toBe(0)
  expect(aligned.position.x).toBe(focus.x)
  expect(aligned.position.y).toBe(240)
  expect(Math.atan2(aligned.position.z - focus.z, aligned.position.y)).toBeLessThan(0.06)
  const entering = arrivalPose(0.43, destination, focus, 1.44)
  expect(entering.position.distanceTo(aligned.position)).toBeLessThan(1)
})

it('frames the planet from a distance and eases gently into the overview', () => {
  const destination = new Vector3(105, 100, 105),
    focus = new Vector3()
  for (const aspect of [0.46, 1, 1.44, 2.4]) {
    const start = arrivalPose(0, destination, focus, aspect)
    expect(start.position.distanceTo(start.focus)).toBeGreaterThan(1000)
    const next = arrivalPose(1 / (arrivalDuration * 60), destination, focus, aspect)
    const beforeEnd = arrivalPose(1 - 1 / (arrivalDuration * 60), destination, focus, aspect)
    expect(next.position.distanceTo(start.position)).toBeLessThan(0.001)
    expect(beforeEnd.position.distanceTo(destination)).toBeLessThan(0.001)
  }
})
