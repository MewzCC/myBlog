import RAPIER from '@dimforge/rapier3d-compat'
import type { Solid, SolidPart } from './models'

function colliderFor(s: SolidPart) {
  if (s.shape === 'cylinder') return RAPIER.ColliderDesc.cylinder(s.h / 2, s.w / 2)
  if (s.shape === 'cone') return RAPIER.ColliderDesc.cone(s.h / 2, s.w / 2)
  if (s.shape === 'ball') return RAPIER.ColliderDesc.ball(s.w / 2)
  if (s.shape === 'road') {
    const vertices: number[] = []
    for (const level of [-1, 1])
      for (const x of [-1, 1])
        for (const z of [-1, 1]) {
          const inset = level > 0 ? -0.05 : 0.2
          vertices.push(x * (s.w / 2 + inset), (level * s.h) / 2, z * (s.d / 2 + inset))
        }
    return RAPIER.ColliderDesc.convexHull(new Float32Array(vertices))!
  }
  return RAPIER.ColliderDesc.cuboid(s.w / 2, s.h / 2, s.d / 2)
}

export function createSceneBody(world: RAPIER.World, s: Solid) {
  const desc = s.dynamic
    ? RAPIER.RigidBodyDesc.dynamic()
        .setLinearDamping(0.45)
        .setAngularDamping(0.65)
        .setCcdEnabled(true)
        .setAdditionalSolverIterations(4)
    : RAPIER.RigidBodyDesc.fixed()
  desc.setTranslation(s.x, s.y, s.z)
  if (s.rotation)
    desc.setRotation({ x: Math.sin(s.rotation / 2), y: 0, z: 0, w: Math.cos(s.rotation / 2) })
  const body = world.createRigidBody(desc)
  const parts = s.parts ?? [{ ...s, x: 0, y: 0, z: 0 }]
  const volumes = parts.map((p) =>
    p.shape === 'cone'
      ? (Math.PI * (p.w / 2) ** 2 * p.h) / 3
      : p.shape === 'cylinder'
        ? Math.PI * (p.w / 2) ** 2 * p.h
        : p.w * p.h * p.d,
  )
  const total = volumes.reduce((sum, v) => sum + v, 0)
  parts.forEach((part, i) => {
    const collider = colliderFor(part)
      .setTranslation(part.x, part.y, part.z)
      .setFriction(0.65)
      .setRestitution(0.12)
    if (s.dynamic) collider.setMass(((s.mass ?? 0.4) * volumes[i]!) / total)
    world.createCollider(collider, body)
  })
  return body
}
