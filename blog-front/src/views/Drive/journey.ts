import * as T from 'three'

export const arrivalDuration = 20
export const landingAlignment = 0.4
export const orbitDuration = 1.2
export function createArrivalJourney() {
  let phase: 'orbit' | 'approach' | 'landed' = 'orbit'
  let seconds = 0
  return {
    skip() {
      phase = 'landed'
      seconds = arrivalDuration
    },
    step(dt: number, reduced: boolean) {
      if (phase === 'orbit') {
        seconds += dt
        if (seconds < orbitDuration) return
        phase = 'approach'
        seconds -= orbitDuration
      }
      if (phase !== 'approach') return
      seconds = reduced ? arrivalDuration : Math.min(arrivalDuration, seconds + dt)
      if (seconds >= arrivalDuration) phase = 'landed'
    },
    get phase() {
      return phase
    },
    get progress() {
      return phase === 'orbit' ? 0 : arrivalProgress(seconds)
    },
  }
}
export function arrivalProgress(seconds: number, reduced = false) {
  return reduced ? 1 : Math.min(1, Math.max(0, seconds / arrivalDuration))
}
export function arrivalPose(
  progress: number,
  destination: T.Vector3,
  focus: T.Vector3,
  aspect: number,
) {
  const ease = (p: number) => p * p * p * (p * (p * 6 - 15) + 10)
  const start = new T.Vector3(560 / Math.min(1, aspect), 520, 645 / Math.min(1, aspect))
  // Approach the planet and straighten above the landing site before crossing clouds.
  const aligned = new T.Vector3(focus.x, 240 * Math.max(1, 0.8 / aspect), focus.z + 12)
  if (progress <= landingAlignment) {
    const t = ease(progress / landingAlignment)
    return { position: start.lerp(aligned, t), focus: new T.Vector3(0, -140, 0).lerp(focus, t) }
  }
  const t = ease((progress - landingAlignment) / (1 - landingAlignment))
  return { position: aligned.lerp(destination, t), focus: focus.clone() }
}
export function buildPlanet(scene: T.Scene) {
  const group = new T.Group()
  scene.add(group)
  const geometry = new T.SphereGeometry(140, 64, 40)
  const colors: number[] = []
  const positions = geometry.attributes.position
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i) / 140,
      y = positions.getY(i) / 140,
      z = positions.getZ(i) / 140
    const land = Math.sin(x * 8 + z * 3) + Math.cos(z * 9 - y * 5) + Math.sin(y * 11 + x * 3) > 0.95
    const color = new T.Color(land ? '#7fa783' : '#3c7e95')
    if (Math.abs(y) > 0.9) color.set('#e6eade')
    colors.push(color.r, color.g, color.b)
  }
  geometry.setAttribute('color', new T.Float32BufferAttribute(colors, 3))
  const material = new T.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.75,
    transparent: true,
  })
  const planet = new T.Mesh(geometry, material)
  planet.position.y = -140
  group.add(planet)
  const halo = new T.Mesh(
    new T.SphereGeometry(144, 48, 32),
    new T.MeshBasicMaterial({
      color: '#a1ddd8',
      transparent: true,
      opacity: 0.12,
      side: T.BackSide,
      depthWrite: false,
    }),
  )
  halo.position.y = -140
  group.add(halo)
  const starPositions: number[] = []
  for (let i = 0; i < 500; i++) {
    const a = i * 2.399963,
      b = Math.acos(1 - (2 * (i + 0.5)) / 500),
      r = 1800
    starPositions.push(
      Math.sin(b) * Math.cos(a) * r,
      Math.cos(b) * r,
      Math.sin(b) * Math.sin(a) * r,
    )
  }
  const stars = new T.Points(
    new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(starPositions, 3)),
    new T.PointsMaterial({ color: '#f4e9cb', size: 1.2, transparent: true, depthWrite: false }),
  )
  group.add(stars)
  return {
    animate: (progress: number, time = 0) => {
      planet.rotation.y = time * 0.025
      group.visible = progress < 1
      material.opacity = 1 - T.MathUtils.smoothstep(progress, 0.6, 0.64)
      halo.material.opacity = 0.12 * (1 - progress)
      stars.material.opacity = 1 - progress
    },
  }
}
