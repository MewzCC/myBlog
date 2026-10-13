import RAPIER from '@dimforge/rapier3d-compat'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createVehicleBody, applyVehicleInput } from './physics'
import type { DriveInput } from './island'

let world: RAPIER.World, body: RAPIER.RigidBody
beforeAll(async () => {
  await RAPIER.init()
})
beforeEach(() => {
  world = new RAPIER.World({ x: 0, y: -18, z: 0 })
  world.timestep = 1 / 60
  const ground = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0))
  world.createCollider(RAPIER.ColliderDesc.cuboid(50, 1, 50).setFriction(0.65), ground)
  body = createVehicleBody(world)
  for (let i = 0; i < 60; i++) world.step()
})
afterEach(() => world.free())
const run = (input: DriveInput, steps = 60) => {
  for (let i = 0; i < steps; i++) {
    applyVehicleInput(body, input, true)
    world.step()
  }
}
const yaw = () => {
  const q = body.rotation()
  return 2 * Math.atan2(q.y, q.w)
}

describe('island vehicle physics on real Rapier contacts', () => {
  it('S slows forward motion then reverses; space overrides the throttle and stops', () => {
    run({ throttle: 1, steer: 0, brake: false, boost: false })
    const speed = body.linvel().z
    run({ throttle: -1, steer: 0, brake: false, boost: false }, 15)
    expect(body.linvel().z).toBeLessThan(speed)
    run({ throttle: -1, steer: 0, brake: false, boost: false }, 90)
    expect(body.linvel().z).toBeLessThan(-2)
    run({ throttle: 1, steer: 0, brake: true, boost: false }, 90)
    expect(Math.abs(body.linvel().z)).toBeLessThan(0.01)
  })
  it('accelerates on the floor and brakes without sliding indefinitely', () => {
    run({ throttle: 1, steer: 0, brake: false, boost: false })
    const z = body.translation().z
    expect(z).toBeGreaterThan(10)
    expect(body.linvel().z).toBeGreaterThan(5)
    run({ throttle: 0, steer: 0, brake: true, boost: false })
    expect(Math.abs(body.linvel().z)).toBeLessThan(0.05)
    expect(body.translation().z - z).toBeLessThan(2)
  })
  it('does not let ground friction cancel low-speed steering', () => {
    run({ throttle: 0, steer: 1, brake: true, boost: false }, 120)
    expect(yaw()).toBeGreaterThan(0.25)
    expect(Math.abs(body.translation().y - 0.56)).toBeLessThan(0.02)
  })
  it('keeps steering direction stable after braking but reverses it while backing up', () => {
    body.setLinvel({ x: 0, y: 0, z: -0.00001 }, true)
    run({ throttle: 0, steer: 1, brake: true, boost: false }, 10)
    expect(yaw()).toBeGreaterThan(0)
    body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
    body.setLinvel({ x: 0, y: 0, z: -3 }, true)
    run({ throttle: -1, steer: 1, brake: false, boost: false }, 30)
    expect(yaw()).toBeLessThan(-0.1)
  })
})
