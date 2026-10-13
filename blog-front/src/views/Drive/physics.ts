import RAPIER from '@dimforge/rapier3d-compat'
import { spawn, type DriveInput } from './island'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function createVehicleBody(world: RAPIER.World) {
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(spawn.x, spawn.y, spawn.z)
      .setLinearDamping(0.35)
      .setAngularDamping(5)
      .setCcdEnabled(true)
      .setCanSleep(false),
  )
  body.setEnabledRotations(false, true, false, true)
  // Grip is handled below; contact friction must not cancel steering at rest.
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(0.77, 0.38, 1.4)
      .setTranslation(0, -0.18, 0)
      .setFriction(0)
      .setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min)
      .setRestitution(0.08)
      .setDensity(2),
    body,
  )
  return body
}

export function applyVehicleInput(body: RAPIER.RigidBody, input: DriveInput, drive: boolean) {
  const q = body.rotation(),
    yaw = 2 * Math.atan2(q.y, q.w),
    v = body.linvel()
  const sx = Math.sin(yaw),
    cz = Math.cos(yaw),
    speed = v.x * sx + v.z * cz,
    side = v.x * cz - v.z * sx
  const throttle = drive ? clamp(input.throttle, -1, 1) : 0,
    maxSpeed = input.boost ? 17 : 10
  const acceleration =
    throttle * (Math.sign(throttle) !== Math.sign(speed) && Math.abs(speed) > 1 ? 18 : 10)
  let next = clamp(speed + acceleration / 60, -5, maxSpeed)
  next *= input.brake ? 0.9 : throttle === 0 ? 0.985 : 0.999
  const slide = side * (input.brake ? 0.985 : 0.79)
  body.setLinvel({ x: sx * next + cz * slide, y: v.y, z: cz * next - sx * slide }, true)
  // A tiny residual reverse velocity after braking is not intentional reversing.
  body.setAngvel(
    {
      x: 0,
      y: drive
        ? clamp(input.steer, -1, 1) *
          clamp(Math.abs(speed) * 0.18, 0.2, 2.5) *
          (speed < -0.25 ? -1 : 1)
        : 0,
      z: 0,
    },
    true,
  )
}
