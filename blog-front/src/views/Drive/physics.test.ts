import RAPIER from '@dimforge/rapier3d-compat'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createVehicleBody, applyVehicleInput } from './physics'
import type { DriveInput } from './island'
import { createSceneBody } from './scenePhysics'

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
  it.each([1, -1])('rolls over a wheel-height curb from rest with throttle %s', (direction) => {
    const curb = createSceneBody(world, { x: 0, y: 0.1, z: 13, w: 8, h: 0.2, d: 6 })
    body.setTranslation({ x: 0, y: 0.57, z: 8.42 }, true)
    body.setRotation({ x: 0, y: direction === -1 ? 1 : 0, z: 0, w: direction === -1 ? 0 : 1 }, true)
    body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    let deepest = 0
    for (let i = 0; i < 300; i++) {
      applyVehicleInput(body, { throttle: direction, steer: 0, brake: false, boost: false }, true)
      world.step()
      for (let j = 0; j < body.numColliders(); j++)
        world.contactPair(body.collider(j), curb.collider(0), (manifold) => {
          for (let k = 0; k < manifold.numSolverContacts(); k++)
            deepest = Math.min(deepest, manifold.solverContactDist(k))
        })
    }
    expect(body.translation().z).toBeGreaterThan(15)
    expect(deepest).toBeGreaterThan(-0.035)
  })
  it.each([1, -1])('retains solid-wall collision at high speed with throttle %s', (direction) => {
    createSceneBody(world, { x: 0, y: 2, z: 13, w: 8, h: 4, d: 0.3 })
    body.setRotation({ x: 0, y: direction === -1 ? 1 : 0, z: 0, w: direction === -1 ? 0 : 1 }, true)
    run({ throttle: direction, steer: 0, brake: false, boost: true }, 300)
    expect(body.translation().z).toBeLessThan(11.6)
    expect(Math.abs(body.translation().x)).toBeLessThan(0.2)
  })
  it.each([1, -1])(
    'climbs the same road lip using throttle %s without requiring a running start',
    (direction) => {
      createSceneBody(world, { x: 0, y: 0.04, z: 13, w: 8, h: 0.16, d: 6, shape: 'road' })
      body.setTranslation({ x: 0, y: 0.57, z: 7.9 }, true)
      body.setRotation(
        { x: 0, y: direction === -1 ? 1 : 0, z: 0, w: direction === -1 ? 0 : 1 },
        true,
      )
      body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      for (let i = 0; i < 240; i++) {
        applyVehicleInput(body, { throttle: direction, steer: 0, brake: false, boost: false }, true)
        world.step()
      }
      expect(body.translation().z).toBeGreaterThan(15)
    },
  )

  it.each([1, -1])('climbs the jump ramp using throttle %s from its entrance', (direction) => {
    createSceneBody(world, { x: 0, y: 0.45, z: 13, w: 4, h: 0.15, d: 5, rotation: -0.23 })
    body.setTranslation({ x: 0, y: 0.57, z: 7.9 }, true)
    body.setRotation({ x: 0, y: direction === -1 ? 1 : 0, z: 0, w: direction === -1 ? 0 : 1 }, true)
    body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    let peak = 0
    for (let i = 0; i < 300; i++) {
      applyVehicleInput(body, { throttle: direction, steer: 0, brake: false, boost: false }, true)
      world.step()
      peak = Math.max(peak, body.translation().y)
    }
    expect(body.translation().z).toBeGreaterThan(17)
    expect(peak).toBeGreaterThan(1.1)
  })
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
    expect(yaw()).toBeLessThan(-0.25)
    expect(Math.abs(body.translation().y - 0.56)).toBeLessThan(0.02)
  })
  it('keeps steering direction stable after braking but reverses it while backing up', () => {
    body.setLinvel({ x: 0, y: 0, z: -0.00001 }, true)
    run({ throttle: 0, steer: 1, brake: true, boost: false }, 10)
    expect(yaw()).toBeLessThan(0)
    body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
    body.setLinvel({ x: 0, y: 0, z: -3 }, true)
    run({ throttle: -1, steer: 1, brake: false, boost: false }, 30)
    expect(yaw()).toBeGreaterThan(0.1)
  })
  it.each([-1, 1])('steers toward the driver’s %s side when driving forward', (steer) => {
    run({ throttle: 1, steer, brake: false, boost: false }, 90)
    // The car faces +Z: its right is -X, and its left is +X.
    expect(body.translation().x * steer).toBeLessThan(-1)
    expect(yaw() * steer).toBeLessThan(-0.1)
  })
})
