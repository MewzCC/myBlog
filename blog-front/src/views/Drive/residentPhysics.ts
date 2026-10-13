import RAPIER from '@dimforge/rapier3d-compat'
import { Quaternion, Vector3 } from 'three'

export type ResidentPart = {
  name: string
  center: Vector3
  half: Vector3
  anchor: Vector3
  hinge: boolean
}
export type ResidentMotion = 'walking' | 'ragdoll' | 'getting-up'

// The upright compound and the articulated rig use the same model bounds.
// Only one representation is enabled at a time, including during recovery.
export function createResidentRig(
  world: RAPIER.World,
  definitions: ResidentPart[],
  x: number,
  z: number,
) {
  const standing = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x, 0.18, z)
      .setLinearDamping(3)
      .setAngularDamping(8)
      .setCcdEnabled(true)
      .setCanSleep(false),
  )
  standing.setEnabledRotations(false, true, false, true)
  const shape = (part: ResidentPart) =>
    RAPIER.ColliderDesc.cuboid(part.half.x, part.half.y, part.half.z)
      .setFriction(0.65)
      .setRestitution(0.08)
      .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
  const standingColliders = definitions.map((part) =>
    world.createCollider(
      shape(part).setTranslation(part.center.x, part.center.y, part.center.z).setDensity(1.5),
      standing,
    ),
  )
  const parts = definitions.map((part) => {
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(x + part.center.x, 0.18 + part.center.y, z + part.center.z)
        .setLinearDamping(0.7)
        .setAngularDamping(1.5)
        .setCcdEnabled(true)
        .setAdditionalSolverIterations(8)
        .setEnabled(false),
    )
    const collider = world.createCollider(
      shape(part).setDensity(part.name === 'torso' ? 2 : 0.8),
      body,
    )
    return { ...part, body, collider }
  })
  const torso = parts[0]!
  const joints = parts.slice(1).map((part) => {
    const first = part.anchor.clone().sub(torso.center)
    const second = part.anchor.clone().sub(part.center)
    const joint = world.createImpulseJoint(
      part.hinge
        ? RAPIER.JointData.revolute(first, second, { x: 1, y: 0, z: 0 })
        : RAPIER.JointData.spherical(first, second),
      torso.body,
      part.body,
      true,
    )
    joint.setContactsEnabled(false)
    if (joint instanceof RAPIER.RevoluteImpulseJoint) joint.setLimits(-1.05, 1.05)
    return { joint, part, first, second }
  })
  const ownBodies = new Set([standing.handle, ...parts.map((part) => part.body.handle)])
  const external = (collider: RAPIER.Collider) => !ownBodies.has(collider.parent()?.handle ?? -1)
  let motion: ResidentMotion = 'walking'
  let until = 0,
    gettingUpAt = 0,
    lastAttempt = -10,
    ground = 0
  let recoveryFrom: { position: Vector3; rotation: Quaternion }[] = []
  const rotation = (body: RAPIER.RigidBody) => {
    const q = body.rotation()
    return new Quaternion(q.x, q.y, q.z, q.w)
  }
  const position = () => (motion === 'ragdoll' ? torso.body.translation() : standing.translation())
  const hit = (velocity: RAPIER.Vector, now: number, restingUntil: number) => {
    const speed = Math.hypot(velocity.x, velocity.z)
    if (motion !== 'ragdoll') {
      const p = standing.translation(),
        q = rotation(standing)
      standing.setEnabled(false)
      parts.forEach((part) => {
        const point = part.center
          .clone()
          .applyQuaternion(q)
          .add(new Vector3(p.x, p.y, p.z))
        part.body.setTranslation(point, true)
        part.body.setRotation(q, true)
        part.body.setEnabled(true)
      })
      motion = 'ragdoll'
    }
    const factor = Math.min(0.7, 10 / Math.max(speed, 0.01))
    parts.forEach((part, i) => {
      const v = part.body.linvel()
      part.body.setLinvel(
        {
          x: velocity.x * factor,
          y: Math.max(v.y, 1.5 + Math.min(speed * 0.16, 2.3)),
          z: velocity.z * factor,
        },
        true,
      )
      part.body.setAngvel(
        { x: velocity.z * 0.18, y: (i % 2 ? -1 : 1) * 0.45, z: -velocity.x * 0.18 },
        true,
      )
    })
    until = Math.max(now + 2.8, restingUntil)
  }
  const tryStand = (now: number) => {
    if (motion !== 'ragdoll' || now < until || now - lastAttempt < 0.3) return false
    lastAttempt = now
    const current = torso.body.translation()
    const offsets = [
      [0, 0],
      [1.8, 0],
      [-1.8, 0],
      [0, 1.8],
      [0, -1.8],
      [2.6, 2.6],
      [-2.6, -2.6],
      [2.6, -2.6],
      [-2.6, 2.6],
    ]
    for (const [dx, dz] of offsets) {
      const px = current.x + dx!,
        pz = current.z + dz!
      if (Math.abs(px) > 48 || Math.abs(pz) > 44) continue
      const ray = new RAPIER.Ray({ x: px, y: 8, z: pz }, { x: 0, y: -1, z: 0 })
      const floor = world.castRay(
        ray,
        12,
        true,
        undefined,
        undefined,
        undefined,
        undefined,
        (collider) => external(collider) && (collider.parent()?.isFixed() ?? true),
      )
      if (!floor || 8 - floor.timeOfImpact > 1) continue
      const floorY = 8 - floor.timeOfImpact
      const candidate = new Vector3(px, floorY + 0.035, pz)
      let blocked = false
      definitions.forEach((part) => {
        const center = candidate.clone().add(part.center)
        world.intersectionsWithShape(
          center,
          { x: 0, y: 0, z: 0, w: 1 },
          new RAPIER.Cuboid(part.half.x, part.half.y, part.half.z),
          () => {
            blocked = true
            return false
          },
          undefined,
          undefined,
          undefined,
          undefined,
          external,
        )
      })
      if (blocked) continue
      recoveryFrom = parts.map((part) => ({
        position: new Vector3().copy(part.body.translation()),
        rotation: rotation(part.body),
      }))
      parts.forEach((part) => part.body.setEnabled(false))
      standing.setTranslation(candidate, true)
      standing.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
      standing.setLinvel({ x: 0, y: 0, z: 0 }, true)
      standing.setAngvel({ x: 0, y: 0, z: 0 }, true)
      standing.setEnabled(true)
      motion = 'getting-up'
      gettingUpAt = now
      ground = floorY
      return true
    }
    return false
  }
  const walk = (target: Vector3, now: number) => {
    if (motion === 'getting-up' && now - gettingUpAt >= 0.65) motion = 'walking'
    if (motion !== 'walking') return
    const p = standing.translation(),
      v = standing.linvel()
    const dx = target.x - p.x,
      dz = target.z - p.z,
      distance = Math.hypot(dx, dz)
    const speed = Math.min(0.48, distance * 1.5)
    const vx = distance > 0.03 ? (dx / distance) * speed : 0
    const vz = distance > 0.03 ? (dz / distance) * speed : 0
    // Velocity control leaves contact resolution to Rapier; never teleport a walker.
    standing.setLinvel({ x: vx, y: v.y, z: vz }, true)
    if (speed > 0.04) {
      const q = standing.rotation(),
        yaw = 2 * Math.atan2(q.y, q.w)
      const desired = Math.atan2(dx, dz)
      const difference = Math.atan2(Math.sin(desired - yaw), Math.cos(desired - yaw))
      standing.setAngvel({ x: 0, y: Math.max(-1.5, Math.min(1.5, difference * 3)), z: 0 }, true)
    }
  }
  const poses = (now: number) =>
    parts.map((part, i) => {
      if (motion === 'ragdoll')
        return {
          position: new Vector3().copy(part.body.translation()),
          rotation: rotation(part.body),
        }
      const q = rotation(standing)
      const target = part.center
        .clone()
        .applyQuaternion(q)
        .add(new Vector3().copy(standing.translation()))
      if (motion === 'walking') return { position: target, rotation: q }
      const t = Math.min(1, Math.max(0, (now - gettingUpAt) / 0.65)),
        ease = t * t * (3 - 2 * t)
      const from = recoveryFrom[i]!
      const point = from.position.clone().lerp(target, ease)
      point.y += Math.sin(t * Math.PI) * 0.35
      const turn = from.rotation.clone().slerp(q, ease)
      const matrix = new Vector3(0, 1, 0).applyQuaternion(turn.clone().invert())
      const extent =
        Math.abs(matrix.x) * part.half.x +
        Math.abs(matrix.y) * part.half.y +
        Math.abs(matrix.z) * part.half.z
      point.y = Math.max(point.y, ground + extent + 0.01)
      return { position: point, rotation: turn }
    })
  const jointError = () =>
    motion !== 'ragdoll'
      ? 0
      : Math.max(
          0,
          ...joints.map(({ part, first, second }) => {
            const a = first
              .clone()
              .applyQuaternion(rotation(torso.body))
              .add(new Vector3().copy(torso.body.translation()))
            const b = second
              .clone()
              .applyQuaternion(rotation(part.body))
              .add(new Vector3().copy(part.body.translation()))
            return a.distanceTo(b)
          }),
        )
  return {
    standing,
    standingColliders,
    parts,
    hit,
    tryStand,
    walk,
    position,
    poses,
    jointError,
    get motion() {
      return motion
    },
  }
}
