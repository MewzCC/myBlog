import { expect, it } from 'vitest'
import { Vector3 } from 'three'
import { planetTerrain } from './planet'

it('builds deterministic ocean, coastline and raised terrain with safe clearance', () => {
  const heights: number[] = []
  for (let i = 0; i < 800; i++) {
    const y = 1 - (2 * (i + 0.5)) / 800,
      a = i * 2.399963
    const normal = new Vector3(
      Math.sqrt(1 - y * y) * Math.cos(a),
      y,
      Math.sqrt(1 - y * y) * Math.sin(a),
    )
    const first = planetTerrain(normal),
      second = planetTerrain(normal)
    expect(first.elevation).toBe(second.elevation)
    expect(first.color.equals(second.color)).toBe(true)
    expect(first.elevation).toBeLessThan(12)
    heights.push(first.elevation)
  }
  expect(heights.filter((h) => h === 0).length).toBeGreaterThan(150)
  expect(heights.filter((h) => h > 3).length).toBeGreaterThan(20)
})
