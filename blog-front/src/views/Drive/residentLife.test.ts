import { describe, expect, it } from 'vitest'
import { ResidentLife } from './residentLife'

describe('island resident hit and recovery rules', () => {
  it('scales collision damage with speed and debounces a sustained contact', () => {
    const life = new ResidentLife()
    expect(life.impact(6, 0)).toBe(15)
    expect(life.hp).toBe(85)
    expect(life.impact(6, 0.3)).toBeNull()
    expect(life.impact(12, 0.8)).toBe(30)
    expect(life.hp).toBe(55)
  })
  it('does not damage on a stationary overlap or invalid velocity', () => {
    const life = new ResidentLife()
    for (const speed of [0, 0.5, -2, NaN, Infinity]) expect(life.impact(speed, 1)).toBeNull()
    expect(life.hp).toBe(100)
  })
  it('never goes negative, rests twelve seconds and then recovers with a grace period', () => {
    const life = new ResidentLife()
    expect(life.impact(20, 0)).toBe(40)
    expect(life.impact(20, 1)).toBe(40)
    expect(life.impact(20, 2)).toBe(20)
    expect(life.hp).toBe(0)
    expect(life.impact(20, 3)).toBeNull()
    expect(life.tick(13.9)).toBe(false)
    expect(life.tick(14)).toBe(true)
    expect(life.hp).toBe(100)
    expect(life.impact(20, 14.5)).toBeNull()
    expect(life.impact(20, 15)).toBe(40)
  })
})
