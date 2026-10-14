import RAPIER from '@dimforge/rapier3d-compat'
import { Euler, Quaternion } from 'three'
import { spawn, type DriveInput } from './island'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
export const vehicleMass = 10
const vehicleWorlds = new WeakMap<RAPIER.RigidBody, RAPIER.World>()

export function createVehicleBody(world: RAPIER.World) {
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(spawn.x, spawn.y, spawn.z)
      .setLinearDamping(0.35)
      .setAngularDamping(5)
      .setCcdEnabled(true)
      .setCanSleep(false),
  )
  vehicleWorlds.set(body, world)
  body.setEnabledRotations(true, true, true, true)
  // Grip is handled below; contact friction must not cancel steering at rest.
  const chassis: number[] = []
  for (const [height, width, length] of [
    [-0.34, 0.7, 1.35],
    [-0.2, 0.85, 1.54],
    [0.31, 0.85, 1.54],
  ])
    for (const x of [-1, 1]) for (const z of [-1, 1]) chassis.push(x * width!, height!, z * length!)
  world.createCollider(
    RAPIER.ColliderDesc.convexHull(new Float32Array(chassis))!
      .setFriction(0)
      .setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min)
      .setRestitution(0.08)
      .setMass(vehicleMass * 0.85),
    body,
  )
  // Round tire contacts climb small road lips in both driving directions.
  // The body has the same ground clearance as the visible chassis.
  for (const x of [-0.84, 0.84])
    for (const z of [-0.91, 0.91]) {
      world.createCollider(
        RAPIER.ColliderDesc.cylinder(0.15, 0.38)
          .setTranslation(x, -0.18, z)
          .setRotation({ x: 0, y: 0, z: Math.SQRT1_2, w: Math.SQRT1_2 })
          .setFriction(0)
          .setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min)
          .setRestitution(0)
          .setMass(vehicleMass * 0.02),
        body,
      )
    }
  // Cabin and luggage are solid too, including when hitting a fallen resident.
  for (const [x, y, z, hx, hy, hz, mass] of [
    [0, 0.56, -0.3, 0.76, 0.5, 0.76, vehicleMass * 0.06],
    [0, 1.36, -0.3, 0.5, 0.2, 0.44, vehicleMass * 0.01],
  ]) {
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(hx!, hy!, hz!)
        .setTranslation(x!, y!, z!)
        .setFriction(0)
        .setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min)
        .setRestitution(0.08)
        .setMass(mass!),
      body,
    )
  }
  return body
}

export function applyVehicleInput(body: RAPIER.RigidBody, input: DriveInput, drive: boolean) {
  const q = body.rotation(),
    attitude = new Euler().setFromQuaternion(new Quaternion(q.x, q.y, q.z, q.w), 'YXZ'),
    yaw = attitude.y,
    v = body.linvel()
  const sx = Math.sin(yaw),
    cz = Math.cos(yaw),
    speed = v.x * sx + v.z * cz,
    side = v.x * cz - v.z * sx
  const throttle = drive && !input.brake ? clamp(input.throttle, -1, 1) : 0,
    maxSpeed = input.boost ? 17 : 10
  const acceleration =
    throttle * (Math.sign(throttle) !== Math.sign(speed) && Math.abs(speed) > 1 ? 18 : 10)
  let next = clamp(speed + acceleration / 60, -5, maxSpeed)
  next *= input.brake ? 0.9 : throttle === 0 ? 0.985 : 0.999
  const slide = side * (input.brake ? 0.985 : 0.79)
  body.setLinvel({ x: sx * next + cz * slide, y: v.y, z: cz * next - sx * slide }, true)
  // A tiny residual reverse velocity after braking is not intentional reversing.
  // Forward is +Z: the driver's right is -X, so right input needs negative yaw.
  const world = vehicleWorlds.get(body),
    position = body.translation()
  const heights = [-1, 1].flatMap((x) =>
    [-1, 1].map((z) => {
      const px = position.x + cz * x * 0.84 + sx * z * 1.35
      const pz = position.z - sx * x * 0.84 + cz * z * 1.35
      const origin = { x: px, y: position.y + 0.65, z: pz }
      const hit = world?.castRayAndGetNormal(
        new RAPIER.Ray(origin, { x: 0, y: -1, z: 0 }),
        1.9,
        true,
        undefined,
        undefined,
        undefined,
        body,
        (c) => c.parent()?.isFixed() ?? true,
      )
      const height = hit ? origin.y - hit.timeOfImpact : undefined
      return hit && hit.normal.y > 0.65 && height! < position.y + 0.1 ? height! : undefined
    }),
  )
  const supported = heights.every((h) => h !== undefined)
  const pitch = supported
    ? clamp(
        Math.atan2((heights[0]! + heights[2]! - heights[1]! - heights[3]!) / 2, 2.7),
        -0.32,
        0.32,
      )
    : 0
  const roll = supported
    ? clamp(
        Math.atan2((heights[2]! + heights[3]! - heights[0]! - heights[1]!) / 2, 1.68),
        -0.24,
        0.24,
      )
    : 0
  const pitchRate = clamp((pitch - attitude.x) * (supported ? 8 : 2), -1.8, 1.8)
  const rollRate = clamp((roll - attitude.z) * (supported ? 8 : 2), -1.8, 1.8)
  body.setAngvel(
    {
      x: cz * pitchRate + sx * rollRate,
      y: drive
        ? -clamp(input.steer, -1, 1) *
          clamp(Math.abs(speed) * 0.18, 0.2, 2.5) *
          (speed < -0.25 ? -1 : 1)
        : 0,
      z: -sx * pitchRate + cz * rollRate,
    },
    true,
  )
}
