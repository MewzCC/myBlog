import RAPIER from '@dimforge/rapier3d-compat'
import { Vector3, Quaternion } from 'three'
import { beforeAll, beforeEach, afterEach, expect, it } from 'vitest'
import { createResidentRig, type ResidentPart } from './residentPhysics'

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
const parts: ResidentPart[] = [
  {
    name: 'torso',
    center: new Vector3(0, 1, 0),
    half: new Vector3(0.5, 0.5, 0.35),
    anchor: new Vector3(0, 1, 0),
    hinge: false,
  },
  {
    name: 'head',
    center: new Vector3(0, 1.85, 0),
    half: new Vector3(0.6, 0.35, 0.45),
    anchor: new Vector3(0, 1.55, 0),
    hinge: false,
  },
  ...[-1, 1].map((side) => ({
    name: 'leg-' + side,
    center: new Vector3(side * 0.3, 0.26, 0),
    half: new Vector3(0.14, 0.25, 0.2),
    anchor: new Vector3(side * 0.3, 0.51, 0),
    hinge: true,
  })),
]

it('walks with physical contacts and cannot teleport through a wall', () => {
  const rig = createResidentRig(world, parts, 0, 0)
  world.createCollider(RAPIER.ColliderDesc.cuboid(5, 2, 0.2).setTranslation(0, 2, 1.5))
  for (let i = 0; i < 360; i++) {
    rig.walk(new Vector3(0, 0, 4), i / 60)
    world.step()
  }
  expect(rig.position().z).toBeGreaterThan(0.2)
  expect(rig.position().z).toBeLessThan(0.96)
  expect(rig.standingColliders).toHaveLength(4)
})

it('throws jointed parts, keeps them attached and retains ground collision after falling', () => {
  const rig = createResidentRig(world, parts, 0, 0)
  for (let i = 0; i < 30; i++) world.step()
  rig.hit({ x: 0, y: 0, z: 10 }, 0, 12)
  expect(rig.motion).toBe('ragdoll')
  expect(rig.standing.isEnabled()).toBe(false)
  for (let i = 0; i < 180; i++) world.step()
  expect(rig.position().z).toBeGreaterThan(1)
  expect(rig.jointError()).toBeLessThan(0.12)
  expect(Math.abs(rig.parts[0]!.body.rotation().x)).toBeGreaterThan(0.1)
  for (const part of rig.parts) {
    expect(part.body.isEnabled()).toBe(true)
    const q = part.body.rotation(),
      axis = new Vector3(0, 1, 0).applyQuaternion(new Quaternion(q.x, q.y, q.z, q.w).invert())
    const extent =
      Math.abs(axis.x) * part.half.x +
      Math.abs(axis.y) * part.half.y +
      Math.abs(axis.z) * part.half.z
    expect(part.body.translation().y - extent).toBeGreaterThan(-0.035)
  }
  expect(rig.tryStand(11.9)).toBe(false)
})

it('recovers beside an obstruction instead of enabling an upright collider inside it', () => {
  const rig = createResidentRig(world, parts, 0, 0)
  rig.hit({ x: 0, y: 0, z: 6 }, 0, 0)
  for (let i = 0; i < 180; i++) world.step()
  const p = rig.position()
  world.createCollider(RAPIER.ColliderDesc.cuboid(0.8, 2, 0.8).setTranslation(p.x, 2, p.z))
  world.step()
  expect(rig.tryStand(4)).toBe(true)
  expect(rig.motion).toBe('getting-up')
  expect(rig.standing.isEnabled()).toBe(true)
  expect(rig.parts.every((part) => !part.body.isEnabled())).toBe(true)
  expect(Math.hypot(rig.position().x - p.x, rig.position().z - p.z)).toBeGreaterThan(1)
  rig.walk(new Vector3(0, 0, 0), 5)
  expect(rig.motion).toBe('walking')
})
