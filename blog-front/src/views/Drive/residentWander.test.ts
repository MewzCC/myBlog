import { expect, it } from 'vitest'
import { createResidentWander } from './residentWander'

it('roams beyond a tiny loop, pauses and keeps destinations within island boundaries', () => {
  const wander = createResidentWander({ x: 40, z: 36 }, 71, 1.2)
  const p = { x: 40, z: 36 }
  let farthest = 0,
    rests = 0,
    turns = 0,
    previousHeading = 0
  for (let i = 0; i < 2400; i++) {
    const command = wander.update(p, i / 30, () => true)
    const dx = command.target.x - p.x,
      dz = command.target.z - p.z
    const distance = Math.hypot(dx, dz)
    if (distance > 0) {
      const heading = Math.atan2(dx, dz)
      if (Math.abs(heading - previousHeading) > 0.4) turns++
      previousHeading = heading
      p.x += ((dx / distance) * command.speed) / 30
      p.z += ((dz / distance) * command.speed) / 30
    } else rests++
    farthest = Math.max(farthest, Math.hypot(p.x - 40, p.z - 36))
    expect(Math.abs(p.x)).toBeLessThan(47)
    expect(Math.abs(p.z)).toBeLessThan(43)
  }
  expect(farthest).toBeGreaterThan(3)
  expect(rests).toBeGreaterThan(10)
  expect(turns).toBeGreaterThan(3)
})

it('chooses a clear detour and rests instead of pushing continuously into a blocked area', () => {
  const wander = createResidentWander({ x: 0, z: 0 }, 3, 1)
  const attempted: number[] = []
  const command = wander.update({ x: 0, z: 0 }, 0, (angle) => {
    attempted.push(angle)
    return attempted.length === 2
  })
  expect(attempted).toHaveLength(2)
  expect(Math.atan2(command.target.x, command.target.z)).toBeCloseTo(attempted[1]!)
  const blocked = wander.update({ x: 0, z: 0 }, 1, () => false)
  expect(blocked.activity).toBe('resting')
  expect(blocked.speed).toBe(0)
  expect(blocked.target).toEqual({ x: 0, z: 0 })
  wander.reset()
  expect(wander.update({ x: 3, z: 0 }, 5, () => true).activity).toBe('wandering')
})
