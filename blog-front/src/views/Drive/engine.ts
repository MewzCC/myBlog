import * as T from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { buildCar, buildIsland } from './models'
import { createVehicleBody, applyVehicleInput } from './physics'
import { StationArrival } from './arrival'
import { buildResidents } from './residents'
import { createSceneBody } from './scenePhysics'
import { advanceHour, solarState } from './dayCycle'
import {
  initialTelemetry,
  islandSize,
  spawn,
  stations,
  tokens,
  type DriveInput,
  type IslandSettings,
  type IslandTelemetry,
  type StationId,
} from './island'

type EngineOptions = {
  getSettings: () => IslandSettings
  getInput: () => DriveInput
  onTelemetry: (data: IslandTelemetry) => void
  onStation: (id: StationId) => void
  onReady: () => void
}
export type IslandEngine = Awaited<ReturnType<typeof createIslandEngine>>
let physicsReady: Promise<void> | undefined

export async function createIslandEngine(
  canvas: HTMLCanvasElement,
  options: EngineOptions,
  signal: AbortSignal,
) {
  physicsReady ??= RAPIER.init()
  await physicsReady
  if (signal.aborted) throw new DOMException('Cancelled', 'AbortError')
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.outputColorSpace = T.SRGBColorSpace
  renderer.toneMapping = T.ACESFilmicToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = T.PCFShadowMap
  const scene = new T.Scene()
  const daySky = new T.Color('#d3e4dc'),
    duskSky = new T.Color('#d79a85')
  const daySun = new T.Color('#ffe1ab'),
    duskSun = new T.Color('#ff996b')
  scene.background = new T.Color('#102537')
  scene.fog = new T.Fog('#102537', 90, 220)
  const camera = new T.PerspectiveCamera(40, 1, 0.1, 900)
  const hemi = new T.HemisphereLight('#c9e9ff', '#89724d', 2.4)
  scene.add(hemi)
  const sun = new T.DirectionalLight('#ffe1ab', 3)
  sun.position.set(-45, 68, 32)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.left = -68
  sun.shadow.camera.right = 68
  sun.shadow.camera.top = 68
  sun.shadow.camera.bottom = -68
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 165
  sun.shadow.normalBias = 0.04
  sun.shadow.bias = -0.0001
  scene.add(sun)
  const moon = new T.DirectionalLight('#a8c9ed', 0.65)
  moon.castShadow = true
  moon.shadow = sun.shadow.clone()
  moon.shadow.mapSize.set(1024, 1024)
  scene.add(moon)
  const models = buildIsland(scene),
    vehicle = buildCar(scene, models)
  const world = new RAPIER.World({ x: 0, y: -18, z: 0 })
  world.timestep = 1 / 60
  let islandHour = new Date().getHours() + new Date().getMinutes() / 60
  const dynamics: { body: RAPIER.RigidBody; mesh: T.Object3D; x: number; z: number }[] = []
  for (const s of models.solids) {
    const body = createSceneBody(world, s)
    if (s.dynamic && s.mesh) dynamics.push({ body, mesh: s.mesh, x: s.x, z: s.z })
  }
  const body = createVehicleBody(world)
  const residents = buildResidents(scene, models, world, body)
  const collisionQueue = new RAPIER.EventQueue(true)
  const dustGeometry = new T.BufferGeometry(),
    dustArray = new Float32Array(60 * 3),
    dustAge = new Float32Array(60).fill(2)
  dustGeometry.setAttribute('position', new T.BufferAttribute(dustArray, 3))
  const dustMaterial = new T.PointsMaterial({
    color: '#eed7b3',
    size: 0.14,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  })
  const dust = new T.Points(dustGeometry, dustMaterial)
  scene.add(dust)
  let dustCursor = 0,
    frame = 0,
    last = performance.now(),
    accumulator = 0,
    time = 0,
    lastPublish = 0,
    lastQuality = options.getSettings().quality
  let fpsStart = last,
    fpsFrames = 0,
    fps = 60,
    adaptiveLow = false,
    disposed = false,
    visible = true
  const visited = new Set<StationId>(),
    collected = new Set<number>()
  const arrival = new StationArrival()
  let nearest: StationId | null = null,
    dragging = false,
    orbit = 0.75,
    zoom = 1,
    downX = 0,
    originX = 0,
    originY = 0,
    dragMoved = false
  const focus = new T.Vector3(0, 0, 0),
    targetFocus = new T.Vector3(),
    cameraTarget = new T.Vector3(),
    forward = new T.Vector3(),
    offset = new T.Vector3(),
    color = new T.Color()
  const raycaster = new T.Raycaster(),
    mouse = new T.Vector2()
  let audio: AudioContext | null = null,
    oscillator: OscillatorNode | null = null,
    gain: GainNode | null = null
  const unlockSound = () => {
    if (!options.getSettings().sound) return
    if (!audio) {
      audio = new AudioContext()
      oscillator = audio.createOscillator()
      gain = audio.createGain()
      oscillator.type = 'triangle'
      oscillator.connect(gain)
      gain.connect(audio.destination)
      gain.gain.value = 0
      oscillator.start()
    }
    void audio.resume()
  }
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect()
    if (!width || !height) return
    const low = options.getSettings().quality === 'low' || adaptiveLow
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, low ? 1 : 1.7))
    renderer.setSize(width, height, false)
    renderer.shadowMap.enabled = !low
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const reset = () => {
    arrival.suppress(null)
    body.setTranslation(spawn, true)
    body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
    body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    options.onTelemetry({
      ...initialTelemetry,
      ...residents.telemetry(time),
      collected: collected.size,
      visited: [...visited],
      fps,
    })
  }
  const teleport = (id: StationId) => {
    const s = stations.find((s) => s.id === id)!
    body.setTranslation({ x: s.x, y: 1.1, z: s.z }, true)
    body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    visited.add(id)
    nearest = id
    arrival.suppress(id)
    options.onStation(id)
  }
  const interact = () => {
    if (nearest) {
      arrival.suppress(nearest)
      visited.add(nearest)
      options.onStation(nearest)
    }
  }
  const visitResident = (id: string) => {
    const target = residents.telemetry(time).residents.find((r) => r.id === id)
    if (!target) return
    let approach: { x: number; y: number; z: number; yaw: number } | null = null
    for (const yaw of [0, Math.PI / 2, -Math.PI / 2, Math.PI, 0.75, -0.75, 2.4, -2.4]) {
      const x = target.x - Math.sin(yaw) * 6,
        z = target.z - Math.cos(yaw) * 6
      if (Math.abs(x) > 48 || Math.abs(z) > 44) continue
      const floor = world.castRay(
        new RAPIER.Ray({ x, y: 8, z }, { x: 0, y: -1, z: 0 }),
        12,
        true,
        undefined,
        undefined,
        undefined,
        body,
        (c) => c.parent()?.isFixed() ?? true,
      )
      if (!floor || 8 - floor.timeOfImpact > 0.4) continue
      const groundY = 8 - floor.timeOfImpact
      const rotation = { x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) }
      const blocked = world.castShape(
        { x, y: groundY + 1.15, z },
        rotation,
        { x: Math.sin(yaw), y: 0, z: Math.cos(yaw) },
        new RAPIER.Cuboid(1.02, 1.12, 1.56),
        0.01,
        2.4,
        true,
        undefined,
        undefined,
        undefined,
        body,
      )
      if (blocked) continue
      approach = { x, y: groundY + 0.8, z, yaw }
      break
    }
    if (!approach) return
    body.setTranslation(approach, true)
    body.setRotation(
      { x: 0, y: Math.sin(approach.yaw / 2), z: 0, w: Math.cos(approach.yaw / 2) },
      true,
    )
    body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    arrival.suppress(null)
  }
  const onDown = (event: PointerEvent) => {
    unlockSound()
    dragging = true
    dragMoved = false
    downX = event.clientX
    originX = downX
    originY = event.clientY
    canvas.setPointerCapture(event.pointerId)
  }
  const onMove = (event: PointerEvent) => {
    if (!dragging || (options.getSettings().driving && !options.getSettings().overview)) return
    const dx = event.clientX - downX
    if (Math.abs(event.clientX - originX) + Math.abs(event.clientY - originY) > 4) dragMoved = true
    orbit += dx * 0.005
    downX = event.clientX
  }
  const onUp = (event: PointerEvent) => {
    if (dragging && !dragMoved) {
      const rect = canvas.getBoundingClientRect()
      mouse.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(models.markers.map((m) => m.pin))
      if (hits[0]) {
        const marker = models.markers.find((m) => m.pin === hits[0].object)
        if (marker) teleport(marker.id)
      } else {
        const point = raycaster.ray.intersectPlane(
          new T.Plane(new T.Vector3(0, 1, 0), 0),
          new T.Vector3(),
        )
        const station =
          point && stations.find((s) => Math.hypot(point.x - s.x, point.z - s.z) < 3.2)
        if (station) teleport(station.id)
      }
    }
    dragging = false
  }
  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    zoom = T.MathUtils.clamp(zoom + event.deltaY * 0.0006, 0.65, 1.5)
  }
  const onVisibility = () => {
    visible = !document.hidden
    last = performance.now()
    fpsStart = last
    fpsFrames = 0
    accumulator = 0
    if (!visible && gain) gain.gain.value = 0
  }
  const contextLost = (event: Event) => {
    event.preventDefault()
    visible = false
    canvas.dispatchEvent(
      new CustomEvent('island-error', { detail: '显卡连接暂时中断，请重新加载岛屿。' }),
    )
  }
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)
  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('webglcontextlost', contextLost)
  document.addEventListener('visibilitychange', onVisibility)
  const updatePhysics = (input: DriveInput, drive: boolean) => {
    residents.step(time)
    applyVehicleInput(body, input, drive)
    const velocity = body.linvel()
    world.step(collisionQueue)
    residents.collisions(collisionQueue, velocity, time)
  }
  const render = (now: number) => {
    if (disposed) return
    frame = requestAnimationFrame(render)
    const dt = Math.min((now - last) / 1000, 0.08)
    last = now
    const settings = options.getSettings(),
      input = options.getInput()
    if (!visible) return
    if (settings.quality !== lastQuality) {
      lastQuality = settings.quality
      adaptiveLow = false
      resize()
    }
    fpsFrames++
    if (now - fpsStart > 2000) {
      fps = Math.round((fpsFrames * 1000) / (now - fpsStart))
      fpsFrames = 0
      fpsStart = now
      if (settings.quality === 'auto' && fps < 28 && !adaptiveLow) {
        adaptiveLow = true
        resize()
      }
    }
    if (!settings.paused) {
      time += dt
      if (settings.dayCycle) islandHour = advanceHour(islandHour, dt)
      accumulator += dt
      while (accumulator >= 1 / 60) {
        updatePhysics(input, settings.driving)
        accumulator -= 1 / 60
      }
    } else accumulator = 0
    const p = body.translation(),
      q = body.rotation(),
      v = body.linvel(),
      speed = Math.hypot(v.x, v.z),
      yaw = 2 * Math.atan2(q.y, q.w)
    if (
      p.y < -5 ||
      Math.abs(p.x) > islandSize.width / 2 + 3 ||
      Math.abs(p.z) > islandSize.depth / 2 + 3
    )
      reset()
    vehicle.car.position.set(p.x, p.y - 0.5, p.z)
    vehicle.car.quaternion.set(q.x, q.y, q.z, q.w)
    if (!settings.paused) {
      const longitudinal = v.x * Math.sin(yaw) + v.z * Math.cos(yaw)
      vehicle.wheels.forEach((w) => {
        w.rotation.x += (longitudinal * dt) / 0.38
      })
      vehicle.steering.slice(2).forEach((w) => {
        w.rotation.y = -input.steer * 0.35
      })
      vehicle.body.rotation.z = T.MathUtils.lerp(
        vehicle.body.rotation.z,
        input.steer * Math.min(speed / 80, 0.12),
        0.1,
      )
      vehicle.body.rotation.x = T.MathUtils.lerp(
        vehicle.body.rotation.x,
        input.throttle * -0.025,
        0.1,
      )
      dynamics.forEach(({ body, mesh }) => {
        const p = body.translation(),
          q = body.rotation()
        mesh.position.set(p.x, p.y, p.z)
        mesh.quaternion.set(q.x, q.y, q.z, q.w)
      })
      if (speed > 3 && settings.driving && !reduced.matches) {
        const i = (dustCursor++ % 60) * 3
        dustArray[i] = p.x - Math.sin(yaw) * 1.5 + (Math.random() - 0.5)
        dustArray[i + 1] = 0.25
        dustArray[i + 2] = p.z - Math.cos(yaw) * 1.5 + (Math.random() - 0.5)
        dustAge[i / 3] = 0
      }
      for (let i = 0; i < 60; i++) {
        dustAge[i] += dt
        if (dustAge[i] < 0.8) dustArray[i * 3 + 1] += 0.25 * dt
        else dustArray[i * 3 + 1] = -10
      }
      dustGeometry.attributes.position.needsUpdate = true
    }
    if (!settings.dayCycle) islandHour = settings.dark ? 0 : 12
    const solar = solarState(islandHour)
    models.animate(time, solar.night > 0.5, reduced.matches || settings.paused)
    nearest = null
    let distance = Infinity
    stations.forEach((s) => {
      const d = Math.hypot(p.x - s.x, p.z - s.z)
      if (d < 7 && d < distance) {
        distance = d
        nearest = s.id
        visited.add(s.id)
      }
    })
    const arrived = arrival.update(
      nearest,
      distance,
      speed,
      dt,
      settings.driving &&
        !settings.paused &&
        p.y < 1.1 &&
        (input.brake || !input.throttle) &&
        !input.steer,
    )
    if (arrived) options.onStation(arrived)
    tokens.forEach(([x, z], i) => {
      if (!collected.has(i) && Math.hypot(p.x - x, p.z - z) < 1.7) {
        collected.add(i)
        models.tokenMeshes[i].visible = false
      }
    })
    scene.background = (scene.background as T.Color).lerp(
      color
        .set('#102537')
        .lerp(daySky, solar.daylight)
        .lerp(duskSky, solar.dusk * 0.6),
      0.04,
    )
    ;(scene.fog as T.Fog).color.copy(scene.background as T.Color)
    hemi.intensity = T.MathUtils.lerp(
      hemi.intensity,
      0.65 + solar.daylight * 1.85,
      1 - Math.exp(-dt * 3),
    )
    sun.intensity = T.MathUtils.lerp(sun.intensity, solar.daylight * 3.8, 1 - Math.exp(-dt * 3))
    sun.color.lerp(color.copy(daySun).lerp(duskSun, solar.dusk * 0.7), 1 - Math.exp(-dt * 3))
    sun.position.set(Math.cos(solar.angle) * 68, Math.max(1, solar.elevation * 72), 32)
    moon.position.set(-Math.cos(solar.angle) * 68, Math.max(10, -solar.elevation * 72), -32)
    moon.intensity = solar.night * 0.65
    renderer.toneMappingExposure = T.MathUtils.lerp(
      renderer.toneMappingExposure,
      0.9 + solar.daylight * 0.2,
      0.04,
    )
    vehicle.headlight.intensity = solar.night * 30
    const overview = settings.overview || !settings.driving
    targetFocus.set(
      overview && camera.aspect > 1.2 ? -12 : overview ? 0 : p.x,
      overview ? 0 : 1,
      overview && camera.aspect > 1.2 ? 12 : overview ? 0 : p.z,
    )
    focus.lerp(targetFocus, 1 - Math.exp(-dt * 4))
    const narrow = camera.aspect < 0.85
    if (overview) {
      const radius = 145 * Math.max(1, 1.05 / camera.aspect) * zoom
      offset.set(Math.sin(orbit) * radius, radius * 0.85, Math.cos(orbit) * radius)
    } else {
      const radius = (narrow ? 26 : 20) * zoom
      forward.set(Math.sin(yaw), 0, Math.cos(yaw))
      offset.set(-forward.x * radius + 9, radius * 0.85, -forward.z * radius + 9)
    }
    cameraTarget.copy(focus).add(offset)
    camera.position.lerp(cameraTarget, 1 - Math.exp(-dt * 3))
    camera.lookAt(focus)
    residents.animate(time, camera, overview, reduced.matches || settings.paused)
    const distanceToFocus = camera.position.distanceTo(focus)
    const far = Math.max(900, distanceToFocus + 350)
    if (Math.abs(camera.far - far) > 10) {
      camera.far = far
      camera.updateProjectionMatrix()
    }
    ;(scene.fog as T.Fog).near = distanceToFocus + 50
    ;(scene.fog as T.Fog).far = distanceToFocus + 180
    if (gain && oscillator && audio) {
      gain.gain.setTargetAtTime(
        settings.sound && settings.driving && !settings.paused ? 0.025 : 0,
        audio.currentTime,
        0.1,
      )
      oscillator.frequency.setTargetAtTime(45 + speed * 6, audio.currentTime, 0.1)
    }
    if (now - lastPublish > 100) {
      options.onTelemetry({
        hour: islandHour,
        daylight: solar.daylight,
        y: p.y,
        x: p.x,
        z: p.z,
        yaw,
        speed: Math.round(speed * 3.6),
        nearest,
        collected: collected.size,
        visited: [...visited],
        fps,
        ...residents.telemetry(time),
      })
      lastPublish = now
      canvas.dataset.audioState = audio?.state || 'off'
      canvas.dataset.hour = String(islandHour)
      canvas.dataset.daylight = String(solar.daylight)
      canvas.dataset.sunHeight = String(sun.position.y)
      canvas.dataset.lighting = JSON.stringify({
        sun: sun.intensity,
        moon: moon.intensity,
        headlights: vehicle.headlight.intensity,
      })
      canvas.dataset.residents = JSON.stringify(residents.telemetry(time).residents)
      canvas.dataset.islandSize = `${islandSize.width}x${islandSize.depth}`
      canvas.dataset.hits = String(residents.telemetry(time).hits)
      canvas.dataset.propsMoved = String(
        dynamics.filter((d) => {
          const p = d.body.translation()
          return Math.hypot(p.x - d.x, p.z - d.z) > 0.35
        }).length,
      )
      canvas.dataset.props = JSON.stringify(
        dynamics.map((d) => ({
          name: d.mesh.name,
          origin: { x: d.x, z: d.z },
          position: d.body.translation(),
          rotation: d.body.rotation(),
          mass: d.body.mass(),
          colliders: d.body.numColliders(),
        })),
      )
    }
    renderer.render(scene, camera)
    canvas.dataset.drawCalls = String(renderer.info.render.calls)
  }
  camera.position.set(105, 100, 105)
  camera.lookAt(0, 0, 0)
  frame = requestAnimationFrame(render)
  options.onReady()
  const dispose = () => {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    observer.disconnect()
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerup', onUp)
    canvas.removeEventListener('pointercancel', onUp)
    canvas.removeEventListener('wheel', onWheel)
    canvas.removeEventListener('webglcontextlost', contextLost)
    document.removeEventListener('visibilitychange', onVisibility)
    const geometries = new Set<T.BufferGeometry>(),
      materials = new Set<T.Material>()
    scene.traverse((o) => {
      if (o instanceof T.Mesh || o instanceof T.Points) {
        geometries.add(o.geometry)
      }
      if (o instanceof T.Mesh || o instanceof T.Points || o instanceof T.Sprite) {
        ;(Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => materials.add(m))
      }
    })
    geometries.forEach((g) => g.dispose())
    materials.forEach((m) => m.dispose())
    models.textures.forEach((t) => t.dispose())
    residents.dispose()
    world.free()
    collisionQueue.free()
    renderer.dispose()
    renderer.forceContextLoss()
    oscillator?.stop()
    void audio?.close()
  }
  return { reset, teleport, visitResident, interact, unlockSound, dispose }
}
