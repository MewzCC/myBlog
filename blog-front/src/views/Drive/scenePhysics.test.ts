import RAPIER from '@dimforge/rapier3d-compat'
import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest'
import { createSceneBody } from './scenePhysics'
import { trafficConeParts } from './models'
import { createVehicleBody, applyVehicleInput, vehicleMass } from './physics'

let world: RAPIER.World
beforeAll(async () => {
  await RAPIER.init()
})
beforeEach(() => {
  world = new RAPIER.World({ x: 0, y: -18, z: 0 })
  world.timestep = 1 / 60
  world.createCollider(RAPIER.ColliderDesc.cuboid(50, 0.5, 50).setTranslation(0, -0.5, 0))
})
afterEach(() => world.free())

it('covers the cone base rim, white ring and upper tip with one compound body', () => {
  const cone = createSceneBody(world, {
    x: 0,
    y: 0,
    z: 0,
    w: 0.9,
    h: 1.2,
    d: 0.9,
    dynamic: true,
    mass: 0.06,
    parts: trafficConeParts,
  })
  expect(cone.numColliders()).toBe(3)
  for (const point of [
    { x: 0.43, y: 0.06, z: 0 },
    { x: 0.195, y: 0.6, z: 0 },
    { x: 0, y: 1.18, z: 0 },
  ]) {
    expect(
      Array.from({ length: cone.numColliders() }, (_, i) => cone.collider(i)).some((c) =>
        c.containsPoint(point),
      ),
    ).toBe(true)
  }
  cone.recomputeMassPropertiesFromColliders()
  expect(cone.mass()).toBeCloseTo(0.06)
})

it('lets the actual car knock a light cone aside instead of stopping at an invisible fixed volume', () => {
  const car = createVehicleBody(world)
  const cone = createSceneBody(world, {
    x: 0.8,
    y: 0.03,
    z: 12,
    w: 0.9,
    h: 1.2,
    d: 0.9,
    dynamic: true,
    mass: 0.06,
    parts: trafficConeParts,
  })
  for (let i = 0; i < 60; i++) world.step()
  expect(car.mass()).toBeCloseTo(vehicleMass)
  expect(cone.mass()).toBeLessThan(car.mass())
  for (let i = 0; i < 150; i++) {
    applyVehicleInput(car, { throttle: 1, steer: 0, brake: false, boost: true }, true)
    world.step()
  }
  expect(Math.hypot(cone.translation().x - 0.8, cone.translation().z - 12)).toBeGreaterThan(2)
  expect(car.translation().z).toBeGreaterThan(17)
  expect(cone.translation().y).toBeGreaterThan(-0.05)
})

it('responds less to the same impulse as movable-object mass increases', () => {
  const light = createSceneBody(world, {
    x: -4,
    y: 2,
    z: 0,
    w: 1,
    h: 1,
    d: 1,
    dynamic: true,
    mass: 0.4,
  })
  const heavy = createSceneBody(world, {
    x: 4,
    y: 2,
    z: 0,
    w: 1,
    h: 1,
    d: 1,
    dynamic: true,
    mass: 1.1,
  })
  world.step()
  light.applyImpulse({ x: 0, y: 0, z: 1 }, true)
  heavy.applyImpulse({ x: 0, y: 0, z: 1 }, true)
  expect(light.linvel().z).toBeGreaterThan(heavy.linvel().z * 2)
})
