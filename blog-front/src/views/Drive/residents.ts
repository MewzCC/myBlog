import * as T from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { IslandModels } from './models'
import type { ResidentTelemetry } from './island'
import { ResidentLife } from './residentLife'

export const residentSpecs = [
  { id: 'momo', name: 'MOMO', kind: '邮差机器人', shape: 'robot', x: 0, z: 16, color: '#81dbc5' },
  { id: 'foxy', name: '橘子', kind: '赤狐', shape: 'fox', x: 18, z: 5, color: '#ea9467' },
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
      parent: T.Object3D = figure,
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
      parent: T.Object3D = figure,
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
      block(-0.72, 1.06, 0, 0.27, 0.75, 0.3, spec.color).rotation.z = -0.2
      block(0.72, 1.06, 0, 0.27, 0.75, 0.3, spec.color).rotation.z = 0.2
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
              figure,
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
    // Batch the static body, preserving separate articulated legs and impact stars.
    figure.updateMatrixWorld(true)
    const bodyBatches = new Map<T.Material, T.Mesh[]>()
    figure.traverse((item) => {
      if (!(item instanceof T.Mesh) || Array.isArray(item.material)) return
      let parent: T.Object3D | null = item
      while (parent) {
        if (legs.includes(parent as T.Group)) return
        parent = parent.parent
      }
      const list = bodyBatches.get(item.material) || []
      list.push(item)
      bodyBatches.set(item.material, list)
    })
    bodyBatches.forEach((items, material) => {
      if (items.length < 2) return
      const pieces = items.map((item) => {
        const geometry = item.geometry.index ? item.geometry.toNonIndexed() : item.geometry.clone()
        geometry.applyMatrix4(item.matrixWorld)
        return geometry
      })
      const merged = mergeGeometries(pieces)
      pieces.forEach((g) => g.dispose())
      if (!merged) return
      const combined = new T.Mesh(merged, material)
      combined.castShadow = true
      combined.receiveShadow = true
      figure.add(combined)
      items.forEach((item) => {
        item.removeFromParent()
        item.geometry.dispose()
      })
    })
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
    const actorBody = world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(spec.x, 0.95, spec.z),
    )
    const collider = world.createCollider(
      RAPIER.ColliderDesc.capsule(0.3, 0.65)
        .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
        .setRestitution(0.15),
      actorBody,
    )
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
      actorBody,
      collider,
      life: new ResidentLife(),
      paintedHp: -1,
      offset: new T.Vector2(),
      walking: new T.Vector2(),
    }
  })
  const byCollider = new Map(actors.map((a) => [a.collider.handle, a]))
  let hits = 0,
    lastHit: { name: string; damage: number; hp: number; at: number } | null = null
  const step = (now: number) => {
    actors.forEach((a) => {
      if (a.life.tick(now)) {
        a.collider.setEnabled(true)
        a.offset.set(0, 0)
      }
      const asleep = a.life.hp === 0,
        stunned = now - a.life.lastImpact < 0.8
      const speed = asleep || stunned ? 0 : 0.28
      a.walking.set(
        Math.sin(now * speed + a.index) * 0.8,
        Math.sin(now * speed * 0.7 + a.index) * 0.7,
      )
      a.offset.multiplyScalar(0.975)
      a.actorBody.setNextKinematicTranslation({
        x: a.spec.x + a.walking.x + a.offset.x,
        y: 0.95,
        z: a.spec.z + a.walking.y + a.offset.y,
      })
    })
  }
  const collisions = (queue: RAPIER.EventQueue, speed: number, now: number) => {
    queue.drainCollisionEvents((first, second, started) => {
      if (!started) return
      const car = vehicle.collider(0).handle
      const actor =
        first === car ? byCollider.get(second) : second === car ? byCollider.get(first) : undefined
      if (!actor) return
      const damage = actor.life.impact(speed, now)
      if (damage === null) return
      const q = vehicle.rotation(),
        yaw = 2 * Math.atan2(q.y, q.w)
      actor.offset.add(
        new T.Vector2(Math.sin(yaw), Math.cos(yaw)).multiplyScalar(Math.min(2.8, speed * 0.25)),
      )
      hits++
      lastHit = { name: actor.spec.name, damage, hp: actor.life.hp, at: now }
      if (actor.life.hp === 0) actor.collider.setEnabled(false)
    })
  }
  const animate = (now: number, camera: T.Camera, overview: boolean, reduced: boolean) => {
    const car = vehicle.translation()
    actors.forEach((a) => {
      const p = a.actorBody.translation(),
        asleep = a.life.hp === 0,
        recent = now - a.life.lastImpact
      a.root.position.set(p.x, 0, p.z)
      a.root.rotation.y = asleep ? 0 : Math.cos(now * 0.28 + a.index) * 0.35
      a.figure.rotation.z = asleep ? Math.PI / 2 : recent < 0.7 ? Math.sin(recent * 20) * 0.22 : 0
      a.figure.position.y = asleep ? 0.25 : reduced ? 0 : Math.sin(now * 5 + a.index) * 0.035
      a.legs.forEach((leg, i) => {
        leg.rotation.x = asleep || reduced ? 0 : Math.sin(now * 5 + i * Math.PI) * 0.15
      })
      a.stars.visible = asleep || recent < 0.7
      a.stars.rotation.y = now * 2
      a.skins.forEach((m) => {
        m.emissive.set('#ff7968')
        m.emissiveIntensity = recent < 0.45 ? (1 - recent / 0.45) * 0.6 : 0
      })
      a.hpGroup.position.set(p.x, asleep ? 1.6 : 3, p.z)
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
      x: a.actorBody.translation().x,
      z: a.actorBody.translation().z,
      hp: a.life.hp,
      recovering: a.life.hp === 0,
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
