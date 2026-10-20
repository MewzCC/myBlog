import { expect, it } from 'vitest'
import { Vector3, Ray, Sphere, Scene, Mesh, Raycaster, FrontSide, Material } from 'three'
import { buildPlanet, planetTerrain } from './planet'
import { arrivalPose } from './journey'
import { planetScale } from './planetSpace'

it('covers every direction with opaque ocean and excludes cloud backsides', () => {
  const scene = new Scene()
  const planet = buildPlanet(scene)
  planet.animate(0.4, 2, 1.44)
  scene.updateMatrixWorld(true)
  const ocean = scene.getObjectByName('earth-ocean') as Mesh
  const centre = ocean.getWorldPosition(new Vector3())
  for (let i = 0; i < 160; i++) {
    const y = 1 - (2 * (i + 0.5)) / 160
    const direction = new Vector3(
      Math.sqrt(1 - y * y) * Math.cos(i * 2.399963),
      y,
      Math.sqrt(1 - y * y) * Math.sin(i * 2.399963),
    )
    const ray = new Raycaster(
      centre.clone().addScaledVector(direction, 2000),
      direction.clone().negate(),
    )
    expect(ray.intersectObject(ocean).length).toBeGreaterThan(0)
  }
  expect((ocean.material as Material).transparent).toBe(false)
  expect((ocean.material as Material).depthWrite).toBe(true)
  for (const index of [0, 1]) {
    const cloud = scene.getObjectByName(`earth-cloud-shell-${index}`) as Mesh
    expect((cloud.material as Material).side).toBe(FrontSide)
    expect(cloud.scale.x - 140).toBeLessThanOrEqual(3.5)
  }
  scene.traverse((object) => {
    if (object instanceof Mesh) {
      object.geometry.dispose()
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((material) => material.dispose())
    }
  })
})

it('builds deterministic ocean, coastline and raised terrain with safe clearance', () => {
  const heights: number[] = []
  for (let i = 0; i < 800; i++) {
    const y = 1 - (2 * (i + 0.5)) / 800,
      a = i * 2.399963
    const normal = new Vector3(
      Math.sqrt(1 - y * y) * Math.cos(a),
      y,
      Math.sqrt(1 - y * y) * Math.sin(a),
    )
    const first = planetTerrain(normal),
      second = planetTerrain(normal)
    expect(first.elevation).toBe(second.elevation)
    expect(first.color.equals(second.color)).toBe(true)
    expect(first.elevation).toBeLessThan(12)
    heights.push(first.elevation)
  }
  expect(heights.filter((h) => h === 0).length).toBeGreaterThan(150)
  expect(heights.filter((h) => h > 3).length).toBeGreaterThan(20)
})

it('aims the descending camera at open water across desktop and mobile viewports', () => {
  for (const aspect of [0.46, 1.44, 2.4]) {
    const scale = planetScale(aspect)
    const centre = new Vector3(0, -140 * scale, 0)
    const sphere = new Sphere(centre, 140 * scale)
    for (let i = 35; i <= 60; i++) {
      const pose = arrivalPose(
        i / 100,
        new Vector3(105, 123 * Math.max(1, 1.05 / aspect), 105),
        new Vector3(),
        aspect,
      )
      const ray = new Ray(pose.position, pose.focus.clone().sub(pose.position).normalize())
      const hit = ray.intersectSphere(sphere, new Vector3())
      expect(hit).not.toBeNull()
      const terrain = planetTerrain(hit!.sub(centre).normalize())
      expect(terrain.elevation).toBe(0)
      expect(terrain.color.b).toBeGreaterThan(terrain.color.r)
    }
  }
})
