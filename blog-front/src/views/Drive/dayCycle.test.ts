import { expect, it } from 'vitest'
import { advanceHour, solarState, formatIslandTime, dayDuration } from './dayCycle'
it('advances through midnight and completes a full day in eight minutes', () => {
  expect(advanceHour(23.9, 4)).toBeCloseTo(0.1)
  expect(advanceHour(9, dayDuration)).toBeCloseTo(9)
  expect(formatIslandTime(24.5)).toBe('00:30')
})
it('has daylight at noon, darkness at midnight and continuous dawn and dusk', () => {
  expect(solarState(12).daylight).toBe(1)
  expect(solarState(0).night).toBe(1)
  expect(solarState(5.99).daylight).toBeLessThan(solarState(6.01).daylight)
  expect(solarState(17.99).daylight).toBeGreaterThan(solarState(18.01).daylight)
  expect(Math.abs(solarState(17.99).daylight - solarState(18.01).daylight)).toBeLessThan(0.04)
})
