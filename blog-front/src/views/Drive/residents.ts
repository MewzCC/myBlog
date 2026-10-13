import * as T from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { IslandModels } from './models'
import type { ResidentTelemetry } from './island'
import { ResidentLife } from './residentLife'
import { createResidentRig } from './residentPhysics'

export const residentSpecs = [
  { id: 'momo', name: 'MOMO', kind: '邮差机器人', shape: 'robot', x: 0, z: 16, color: '#81dbc5' },
  { id: 'foxy', name: '橘子', kind: '赤狐', shape: 'fox', x: 19.4, z: 4, color: '#ea9467' },
  { id: 'puddle', name: '泡泡', kind: '小鸭', shape: 'duck', x: -18, z: 10, color: '#ffe29b' },
  { id: 'capy', name: '慢慢', kind: '水豚', shape: 'capy', x: -40, z: -15, color: '#bf9c77' },
  { id: 'bunny', name: '棉花', kind: '露营兔', shape: 'rabbit', x: 32, z: 36, color: '#f4e9ce' },
  { id: 'bolt', name: 'BOLT', kind: '港口机器人', shape: 'robot', x: 40, z: -8, color: '#a6bafa' },
  { id: 'miso', name: '米酥', kind: '观景猫', shape: 'cat', x: -10, z: -36, color: '#e9b771' },
] as const

export function buildResidents(
  scene: T.Scene,
  models: IslandModels,
  world: RAPIER.World,
  vehicle: RAPIER.RigidBody,
) {
  const { box, mesh, mat } = models
  const barGeometry = new T.PlaneGeometry(1.9, 0.14)
  const ink = new T.MeshBasicMaterial({ color: '#21373d' })
  const green = new T.MeshBasicMaterial({ color: '#81dbc5' })
  const red = new T.MeshBasicMaterial({ color: '#ff9580' })
  const actors = residentSpecs.map((spec, index) => {
    const root = new T.Group()
    scene.add(root)
    const figure = new T.Group()
    root.add(figure)
    const torso = new T.Group(),
      head = new T.Group()
    torso.name = 'torso'
    head.name = 'head'
    figure.add(torso, head)
    const partGroups = [torso, head]
    const bodyPart = (y: number) => (y >= (spec.shape === 'robot' ? 1.6 : 1.1) ? head : torso)
    const skins: T.MeshStandardMaterial[] = []
    const skinCache = new Map<string, T.MeshStandardMaterial>()
    const skin = (color: string) => {
      if (!skinCache.has(color)) {
        const m = mat(color, 0.65).clone()
        skins.push(m)
        skinCache.set(color, m)
      }
      return skinCache.get(color)!
    }
    const ball = (
      x: number,
      y: number,
      z: number,
      rx: number,
      ry: number,
      rz: number,
      color: string,
      parent: T.Object3D = bodyPart(y),
    ) => {
      const item = mesh(new T.SphereGeometry(1, 12, 8), skin(color), [x, y, z], parent)
      item.scale.set(rx, ry, rz)
      return item
    }
    const block = (
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      color: string,
      parent: T.Object3D = bodyPart(y),
    ) => {
      const item = box(x, y, z, w, h, d, color, parent, Math.min(0.12, w / 4, h / 4, d / 4))
      item.material = skin(color)
      return item
    }
    const legs: T.Group[] = []
    const robotic = spec.shape === 'robot'
    const quadruped = ['fox', 'cat', 'capy'].includes(spec.shape)
    for (const x of [-0.34, 0.34])
      for (const z of quadruped ? [-0.38, 0.38] : [0]) {
        const leg = new T.Group()
        leg.position.set(x, 0.3, z)
        figure.add(leg)
        legs.push(leg)
        leg.name = `leg-${legs.length}`
        partGroups.push(leg)
        block(0, -0.08, 0, 0.23, 0.38, 0.3, robotic ? '#21373d' : spec.color, leg)
        block(
          0,
          -0.23,
          0.06,
          0.28,
          0.13,
          0.37,
          robotic ? '#ffbd69' : spec.shape === 'duck' ? '#e99557' : '#fff4da',
          leg,
        )
      }
    if (robotic) {
      block(0, 1.05, 0, 1.05, 1.1, 0.75, spec.color)
      block(0, 1.85, 0.06, 1.3, 0.7, 0.9, '#fff4da')
      block(0, 1.85, 0.53, 1.05, 0.38, 0.07, '#21373d')
      for (const x of [-0.26, 0.26]) ball(x, 1.9, 0.59, 0.09, 0.09, 0.035, '#81dbc5')
      for (const side of [-1, 1]) {
        const arm = new T.Group()
        arm.name = `arm-${side}`
        arm.position.set(side * 0.72, 1.06, 0)
        arm.rotation.z = side * 0.2
        figure.add(arm)
        partGroups.push(arm)
        block(0, 0, 0, 0.27, 0.75, 0.3, spec.color, arm)
      }
      block(0, 1.05, -0.5, 0.8, 0.8, 0.4, '#a67249')
      block(0, 1.06, 0.4, 0.48, 0.32, 0.03, '#fff4da')
      block(0, 2.32, 0, 0.06, 0.3, 0.06, '#21373d')
      ball(0, 2.5, 0, 0.12, 0.12, 0.12, '#ffbd69')
    } else {
      ball(0, 0.85, -0.12, 0.67, 0.55, quadruped ? 0.88 : 0.5, spec.color)
      ball(
        0,
        1.3,
        quadruped ? 0.58 : 0.12,
        spec.shape === 'capy' ? 0.58 : 0.48,
        0.48,
        0.48,
        spec.color,
      )
      const faceZ = quadruped ? 0.99 : 0.53
      if (spec.shape === 'duck') {
        block(0, 1.2, 0.62, 0.62, 0.2, 0.45, '#e99557')
        for (const x of [-0.59, 0.59])
          ball(x, 0.88, -0.13, 0.17, 0.36, 0.47, '#ffcc77').rotation.z = x * 0.3
      } else {
        ball(0, 1.16, faceZ, 0.28, 0.22, 0.21, spec.shape === 'capy' ? spec.color : '#fff4da')
        ball(0, 1.25, faceZ + 0.18, 0.1, 0.08, 0.06, '#21373d')
        for (const x of [-0.32, 0.32]) {
          if (spec.shape === 'rabbit') {
            block(x, 2.05, 0.06, 0.25, 1.15, 0.26, spec.color).rotation.z = x * 0.35
            block(x, 2.05, 0.21, 0.12, 0.82, 0.04, '#eab5ad').rotation.z = x * 0.35
          } else if (spec.shape === 'capy') ball(x, 1.73, 0.54, 0.15, 0.12, 0.13, spec.color)
          else {
            const ear = mesh(
              new T.ConeGeometry(0.22, 0.54, 5),
              skin(spec.color),
              [x, 1.86, 0.6],
              head,
            )
            ear.rotation.z = -x * 0.45
            ball(x, 1.88, 0.7, 0.09, 0.12, 0.035, '#eab5ad')
          }
        }
        if (spec.shape === 'fox' || spec.shape === 'cat') {
          const tail = ball(0.4, 0.9, -0.97, 0.25, 0.27, 0.65, spec.color)
          tail.rotation.y = -0.5
          ball(0.67, 0.95, -1.44, 0.2, 0.23, 0.23, '#fff4da')
        }
      }
      for (const x of [-0.23, 0.23]) {
        ball(x, 1.46, faceZ, 0.075, 0.095, 0.065, '#21373d')
        ball(x - 0.02, 1.5, faceZ + 0.05, 0.025, 0.025, 0.015, '#fff4da')
      }
      if (spec.shape === 'rabbit') {
        block(0, 0.95, -0.45, 0.7, 0.6, 0.3, '#81dbc5')
        ball(0, 0.83, -0.69, 0.14, 0.14, 0.14, '#fff4da')
      }
      if (spec.shape === 'capy') block(0, 1.88, 0.4, 0.6, 0.08, 0.5, '#81dbc5')
    }
    // Merge within each articulated part, never across a neck, hip or shoulder.
    figure.updateMatrixWorld(true)
    partGroups.forEach((group) => {
      const bodyBatches = new Map<T.Material, T.Mesh[]>()
      group.traverse((item) => {
        if (!(item instanceof T.Mesh) || Array.isArray(item.material)) return
        const list = bodyBatches.get(item.material) || []
        list.push(item)
        bodyBatches.set(item.material, list)
      })
      bodyBatches.forEach((items, material) => {
        if (items.length < 2) return
        const pieces = items.map((item) => {
          const geometry = item.geometry.index
            ? item.geometry.toNonIndexed()
            : item.geometry.clone()
          geometry.applyMatrix4(
            new T.Matrix4().copy(group.matrixWorld).invert().multiply(item.matrixWorld),
          )
          return geometry
        })
        const merged = mergeGeometries(pieces)
        pieces.forEach((g) => g.dispose())
        if (!merged) return
        const combined = new T.Mesh(merged, material)
        combined.castShadow = true
        combined.receiveShadow = true
        group.add(combined)
        items.forEach((item) => {
          item.removeFromParent()
          item.geometry.dispose()
        })
      })
    })
    const visualParts = partGroups.map((group) => {
      const bounds = new T.Box3().setFromObject(group)
      const center = bounds.getCenter(new T.Vector3())
      const half = bounds.getSize(new T.Vector3()).multiplyScalar(0.5).addScalar(0.012)
      const pivot = group.position.clone()
      const restRotation = group.quaternion.clone()
      const leg = legs.includes(group)
      const anchor = leg
        ? pivot.clone()
        : group.name.startsWith('arm')
          ? pivot.clone().add(new T.Vector3(0, 0.3, 0))
          : new T.Vector3(0, robotic ? 1.55 : 1.08, quadruped ? 0.35 : 0)
      return { group, center, half, pivot, restRotation, name: group.name, anchor, hinge: leg }
    })
    const rig = createResidentRig(world, visualParts, spec.x, spec.z)
    const stars = new T.Group()
    stars.position.y = 2.2
    figure.add(stars)
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3
      mesh(
        new T.OctahedronGeometry(0.14),
        mat('#ffbd69'),
        [Math.cos(a) * 0.8, 0.15, Math.sin(a) * 0.8],
        stars,
      )
    }
    const labelCanvas = document.createElement('canvas')
    labelCanvas.width = 384
    labelCanvas.height = 80
    const context = labelCanvas.getContext('2d')!
    const texture = new T.CanvasTexture(labelCanvas)
    texture.colorSpace = T.SRGBColorSpace
    models.textures.push(texture)
    const labelMaterial = new T.SpriteMaterial({ map: texture, depthTest: false })
    const label = new T.Sprite(labelMaterial)
    label.scale.set(2.8, 0.58, 1)
    const hpGroup = new T.Group()
    scene.add(hpGroup)
    label.position.y = 0.46
    hpGroup.add(label)
    const back = new T.Mesh(barGeometry, ink)
    hpGroup.add(back)
    const fill = new T.Mesh(barGeometry, green)
    fill.position.z = 0.01
    hpGroup.add(fill)
    return {
      spec,
      index,
      root,
      figure,
      legs,
      skins,
      stars,
      hpGroup,
      fill,
      context,
      texture,
      rig,
      visualParts,
      life: new ResidentLife(),
      paintedHp: -1,
    }
  })
  const byCollider = new Map(
    actors.flatMap((a) =>
      [...a.rig.standingColliders, ...a.rig.parts.map((p) => p.collider)].map(
        (c) => [c.handle, a] as const,
      ),
    ),
  )
  let hits = 0,
    lastHit: { name: string; damage: number; hp: number; at: number } | null = null
  const step = (now: number) => {
    actors.forEach((a) => {
      if (a.rig.tryStand(now)) a.life.tick(now)
      a.rig.walk(
        new T.Vector3(
          a.spec.x + Math.sin(now * 0.28 + a.index) * 0.8,
          0,
          a.spec.z + Math.sin(now * 0.196 + a.index) * 0.7,
        ),
        now,
      )
    })
  }
  const collisions = (queue: RAPIER.EventQueue, velocity: RAPIER.Vector, now: number) => {
    const car = new Set(
      Array.from({ length: vehicle.numColliders() }, (_, i) => vehicle.collider(i).handle),
    )
    queue.drainCollisionEvents((first, second, started) => {
      if (!started) return
      const actor = car.has(first)
        ? byCollider.get(second)
        : car.has(second)
          ? byCollider.get(first)
          : undefined
      if (!actor) return
      const damage = actor.life.impact(Math.hypot(velocity.x, velocity.z), now)
      if (damage === null) return
      actor.rig.hit(velocity, now, actor.life.recoveringUntil)
      hits++
      lastHit = { name: actor.spec.name, damage, hp: actor.life.hp, at: now }
    })
  }
  const animate = (now: number, camera: T.Camera, overview: boolean, reduced: boolean) => {
    const car = vehicle.translation()
    actors.forEach((a) => {
      const p = a.rig.position(),
        asleep = a.life.hp === 0,
        recent = now - a.life.lastImpact
      const upright = a.rig.motion === 'walking'
      a.root.position.set(upright ? p.x : 0, upright ? p.y : 0, upright ? p.z : 0)
      const q = a.rig.standing.rotation()
      a.root.quaternion.set(
        upright ? q.x : 0,
        upright ? q.y : 0,
        upright ? q.z : 0,
        upright ? q.w : 1,
      )
      const poses = upright ? [] : a.rig.poses(now)
      const speed = Math.hypot(a.rig.standing.linvel().x, a.rig.standing.linvel().z)
      a.visualParts.forEach((part, i) => {
        if (upright) {
          part.group.position.copy(part.pivot)
          part.group.quaternion.copy(part.restRotation)
          const legIndex = a.legs.indexOf(part.group)
          if (legIndex >= 0 && !reduced) {
            const phase =
              a.legs.length === 4
                ? legIndex === 0 || legIndex === 3
                  ? 0
                  : Math.PI
                : legIndex * Math.PI
            part.group.rotation.x = Math.sin(now * 8 + phase) * 0.24 * Math.min(speed / 0.4, 1)
            const turn = part.group.quaternion
            const relative = part.center.clone().sub(part.pivot).applyQuaternion(turn)
            const axis = new T.Vector3(0, 1, 0).applyQuaternion(turn.clone().invert())
            const extent =
              Math.abs(axis.x) * part.half.x +
              Math.abs(axis.y) * part.half.y +
              Math.abs(axis.z) * part.half.z
            part.group.position.y += Math.max(0, extent - (part.pivot.y + relative.y) + 0.012)
          }
        } else {
          const pose = poses[i]!
          const offset = part.center.clone().sub(part.pivot).applyQuaternion(pose.rotation)
          part.group.position.copy(pose.position).sub(offset)
          part.group.quaternion.copy(pose.rotation).multiply(part.restRotation)
        }
      })
      a.stars.position.set(upright ? 0 : p.x, upright ? 2.7 : p.y + 1.3, upright ? 0 : p.z)
      a.stars.visible = asleep || recent < 0.7
      a.stars.rotation.y = now * 2
      a.skins.forEach((m) => {
        m.emissive.set('#ff7968')
        m.emissiveIntensity = recent < 0.45 ? (1 - recent / 0.45) * 0.6 : 0
      })
      a.hpGroup.position.set(p.x, p.y + (upright ? 3.1 : 1.5), p.z)
      a.hpGroup.quaternion.copy(camera.quaternion)
      a.hpGroup.visible = overview ? a.life.hp < 100 : Math.hypot(p.x - car.x, p.z - car.z) < 23
      a.fill.scale.x = a.life.hp / 100
      a.fill.position.x = -(1 - a.life.hp / 100) * 0.95
      a.fill.material = a.life.hp < 35 ? red : green
      if (a.paintedHp !== a.life.hp) {
        a.context.clearRect(0, 0, 384, 80)
        a.context.fillStyle = '#fff4da'
        a.context.beginPath()
        a.context.roundRect(0, 0, 384, 80, 24)
        a.context.fill()
        a.context.fillStyle = '#21373d'
        a.context.font = "700 30px 'Zen Maru Gothic',sans-serif"
        a.context.textAlign = 'center'
        a.context.fillText(`${a.spec.name}  ${a.life.hp}/100${asleep ? ' · Zz' : ''}`, 192, 50)
        a.texture.needsUpdate = true
        a.paintedHp = a.life.hp
      }
    })
  }
  const telemetry = (now: number) => ({
    residents: actors.map((a) => ({
      id: a.spec.id,
      name: a.spec.name,
      kind: a.spec.kind,
      x: a.rig.position().x,
      z: a.rig.position().z,
      hp: a.life.hp,
      recovering: a.life.hp === 0,
      motion: a.rig.motion,
      bodyParts: a.rig.parts.length,
      jointError: a.rig.jointError(),
      tilt:
        a.rig.motion === 'ragdoll'
          ? Math.acos(
              T.MathUtils.clamp(
                new T.Vector3(0, 1, 0).applyQuaternion(a.rig.poses(now)[0]!.rotation).y,
                -1,
                1,
              ),
            )
          : 0,
      physicalParts:
        a.rig.motion === 'ragdoll'
          ? a.rig.parts.filter((part) => part.body.isEnabled() && part.collider.isEnabled()).length
          : a.rig.standingColliders.filter((c) => c.isEnabled()).length,
    })) as ResidentTelemetry[],
    hits,
    lastHit:
      lastHit && now - lastHit.at < 2
        ? { name: lastHit.name, damage: lastHit.damage, hp: lastHit.hp }
        : null,
  })
  const dispose = () => {
    red.dispose()
    green.dispose()
    ink.dispose()
    barGeometry.dispose()
  }
  return { step, collisions, animate, telemetry, dispose }
}
