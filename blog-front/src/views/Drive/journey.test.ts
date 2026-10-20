import { expect, it } from 'vitest'
import { Vector3 } from 'three'
import { planetScale } from './planetSpace'
import {
  arrivalPose,
  arrivalProgress,
  arrivalDuration,
  orbitDuration,
  createArrivalJourney,
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
  expect(start.focus.y).toBe(-140 * planetScale(1))
  const landed = arrivalPose(1, end, focus, 1)
  expect(landed.position.distanceTo(end)).toBeLessThan(0.001)
  expect(landed.focus.distanceTo(focus)).toBeLessThan(0.001)
  let previous = start.position
  let previousStep = 0
  for (let i = 1; i <= arrivalDuration * 60; i++) {
    const current = arrivalPose(arrivalProgress(i / 60), end, focus, 1).position
    const step = current.distanceTo(previous) / planetScale(1)
    expect(step).toBeLessThan(5)
    expect(Math.abs(step - previousStep)).toBeLessThan(0.1)
    previousStep = step
    previous = current
  }
  expect(arrivalProgress(arrivalDuration)).toBe(1)
  expect(arrivalProgress(0, true)).toBe(1)
})

it('retains the accelerated approach timing and the approved reveal timing', () => {
  expect(arrivalProgress(7)).toBeCloseTo(0.43)
  expect(arrivalProgress(12.8)).toBeCloseTo(0.72)
  expect(arrivalProgress(arrivalDuration) - arrivalProgress(12.8)).toBeCloseTo(0.28)
  const before = (arrivalProgress(7) - arrivalProgress(6.999)) / 0.001
  const after = (arrivalProgress(7.001) - arrivalProgress(7)) / 0.001
  expect(before).toBeCloseTo(after, 4)
})

it('continuously descends through the spherical cloud shells without entering the terrain', () => {
  const focus = new Vector3(),
    destination = new Vector3(105, 123, 105)
  for (const aspect of [0.46, 1.44, 2.4]) {
    const scale = planetScale(aspect)
    const centre = new Vector3(0, -140 * scale, 0)
    let lastRadius = Infinity
    for (let i = 0; i <= 600; i++) {
      const pose = arrivalPose(i / 1000, destination, focus, aspect)
      const radius = pose.position.distanceTo(centre) / scale
      expect(radius).toBeLessThanOrEqual(lastRadius + 1e-6)
      expect(radius).toBeGreaterThan(146)
      lastRadius = radius
    }
    expect(
      arrivalPose(0.43, destination, focus, aspect).position.distanceTo(centre) / scale,
    ).toBeGreaterThan(175)
    expect(
      arrivalPose(0.53, destination, focus, aspect).position.distanceTo(centre) / scale,
    ).toBeLessThan(175)
  }
})

it('never climbs, retreats or changes flight direction even while hidden in clouds', () => {
  const focus = new Vector3(-12, 0, 12)
  for (const aspect of [0.46, 1.44, 2.4]) {
    const destination = new Vector3(105, 123 * Math.max(1, 1.05 / aspect), 105)
    let previous = arrivalPose(0, destination, focus, aspect).position
    const flight = destination.clone().sub(previous).normalize()
    for (let i = 1; i <= 1200; i++) {
      const current = arrivalPose(i / 1200, destination, focus, aspect).position
      expect(current.y).toBeLessThan(previous.y)
      expect(current.distanceTo(destination)).toBeLessThan(previous.distanceTo(destination))
      const velocity = current.clone().sub(previous).normalize()
      expect(velocity.dot(flight)).toBeGreaterThan(0.999)
      previous = current
    }
  }
})

it('frames the planet from a distance and eases gently into the overview', () => {
  const destination = new Vector3(105, 100, 105),
    focus = new Vector3()
  for (const aspect of [0.46, 1, 1.44, 2.4]) {
    const start = arrivalPose(0, destination, focus, aspect)
    expect(start.position.distanceTo(start.focus)).toBeGreaterThan(1000)
    const next = arrivalPose(1 / (arrivalDuration * 60), destination, focus, aspect)
    const beforeEnd = arrivalPose(1 - 1 / (arrivalDuration * 60), destination, focus, aspect)
    expect(next.position.distanceTo(start.position) / planetScale(aspect)).toBeLessThan(0.001)
    expect(beforeEnd.position.distanceTo(destination)).toBeLessThan(0.001)
  }
})
