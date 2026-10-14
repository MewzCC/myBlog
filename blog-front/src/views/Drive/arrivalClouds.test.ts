import { expect, it } from 'vitest'
import { arrivalAtmosphere } from './arrivalClouds'

it('conceals the scene switch inside an opaque cloud bank then gradually clears', () => {
  expect(arrivalAtmosphere(0)).toEqual({ cover: 0, clearing: 0, islandVisible: false })
  expect(arrivalAtmosphere(0.499).islandVisible).toBe(false)
  for (const progress of [0.49, 0.5, 0.51]) expect(arrivalAtmosphere(progress).cover).toBe(1)
  expect(arrivalAtmosphere(0.5).islandVisible).toBe(true)
  let previous = 1
  for (let i = 58; i <= 100; i++) {
    const state = arrivalAtmosphere(i / 100)
    expect(state.cover).toBeLessThanOrEqual(previous)
    expect(previous - state.cover).toBeLessThan(0.05)
    previous = state.cover
  }
  expect(arrivalAtmosphere(1)).toEqual({ cover: 0, clearing: 1, islandVisible: true })
})
