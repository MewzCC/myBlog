import { expect, it } from 'vitest'
import { Vector3 } from 'three'
import { arrivalPose, arrivalProgress, arrivalDuration, createArrivalJourney } from './journey'

it.each([false, true])(
  'holds the planet until the visitor lands even with reducedMotion=%s',
  (reduced) => {
    const journey = createArrivalJourney()
    for (let i = 0; i < 1200; i++) journey.step(1 / 60, reduced)
    expect(journey.phase).toBe('orbit')
    expect(journey.progress).toBe(0)
    journey.start()
    for (let i = 0; i < 421; i++) journey.step(1 / 60, reduced)
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
  for (let i = 1; i <= 420; i++) {
    const current = arrivalPose(arrivalProgress(i / 60), end, focus, 1).position
    expect(current.distanceTo(previous)).toBeLessThan(3)
    previous = current
  }
  expect(arrivalProgress(arrivalDuration)).toBe(1)
  expect(arrivalProgress(0, true)).toBe(1)
})
