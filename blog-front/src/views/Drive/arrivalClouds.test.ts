import { expect, it } from 'vitest'
import { arrivalAtmosphere } from './arrivalClouds'

it('conceals the scene switch inside an opaque cloud bank then gradually clears', () => {
  expect(arrivalAtmosphere(0)).toEqual({ cover: 0, clearing: 0, islandVisible: false })
  expect(arrivalAtmosphere(0.639).islandVisible).toBe(false)
  for (const progress of [0.63, 0.64, 0.65]) expect(arrivalAtmosphere(progress).cover).toBe(1)
  expect(arrivalAtmosphere(0.64).islandVisible).toBe(true)
  for (const progress of [0.2, 0.3, 0.4, 0.43]) expect(arrivalAtmosphere(progress).cover).toBe(0)
  expect(arrivalAtmosphere(0.53).cover).toBe(0)
  expect(arrivalAtmosphere(0.6).cover).toBeCloseTo(0.5)
  let previous = 1
  for (let i = 72; i <= 100; i++) {
    const state = arrivalAtmosphere(i / 100)
    expect(state.cover).toBeLessThanOrEqual(previous)
    expect(previous - state.cover).toBeLessThan(0.08)
    previous = state.cover
  }
  expect(arrivalAtmosphere(1)).toEqual({ cover: 0, clearing: 1, islandVisible: true })
})
