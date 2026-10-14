import * as T from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export async function buildEnvironment(scene: T.Scene, signal: AbortSignal) {
  const root = new T.Group()
  root.name = 'living-coast'
  root.userData.keepDynamic = true
  const loader = new GLTFLoader()
  const names = ['grass_large', 'tree_palmBend', 'rock_largeA', 'rock_tallA', 'plant_bush']
  const assets = await Promise.all(
    names.map((name) => loader.loadAsync(`/assets/nature/${name}.glb`)),
  )
  if (signal.aborted) {
    assets.forEach((asset) =>
      asset.scene.traverse((o) => {
        if (o instanceof T.Mesh) {
          o.geometry.dispose()
          ;(Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose())
        }
      }),
    )
    throw new DOMException('Cancelled', 'AbortError')
  }
  scene.add(root)
  const wind = { value: 0 }
  let compiled = false
  const instance = (
    assetIndex: number,
    placements: { x: number; y: number; z: number; scale: number; angle: number }[],
    sway = false,
  ) => {
    const asset = assets[assetIndex]!.scene
    asset.updateMatrixWorld(true)
    asset.traverse((o) => {
      if (!(o instanceof T.Mesh)) return
      const geometry = o.geometry.clone().applyMatrix4(o.matrixWorld)
      geometry.computeBoundingBox()
      geometry.boundingBox?.expandByScalar(0.4)
      geometry.computeBoundingSphere()
      if (sway && geometry.boundingSphere)
        geometry.boundingSphere.radius +=
          Math.pow(Math.max(geometry.boundingBox?.max.y ?? 0, 0), 1.4) * 0.14
      const materials = (Array.isArray(o.material) ? o.material : [o.material]).map((original) => {
        const material = original.clone()
        if (material instanceof T.MeshStandardMaterial && sway) {
          material.onBeforeCompile = (shader) => {
            compiled = true
            shader.uniforms.uIslandWind = wind
            shader.vertexShader = `uniform float uIslandWind;\n${shader.vertexShader}`.replace(
              '#include <begin_vertex>',
              '#include <begin_vertex>\nfloat phase = dot(instanceMatrix[3].xz, vec2(.17,.11));\ntransformed.x += sin(uIslandWind * 1.7 + phase) * pow(max(position.y, 0.0), 1.4) * .14;',
            )
          }
          material.customProgramCacheKey = () => 'island-wind-v1'
        }
        return material
      })
      const mesh = new T.InstancedMesh(
        geometry,
        Array.isArray(o.material) ? materials : materials[0]!,
        placements.length,
      )
      mesh.castShadow = true
      mesh.receiveShadow = true
      if (sway) {
        const depth = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking })
        depth.onBeforeCompile = materials[0]!.onBeforeCompile
        depth.customProgramCacheKey = () => 'island-wind-depth-v1'
        mesh.customDepthMaterial = depth
      }
      const dummy = new T.Object3D()
      placements.forEach((p, i) => {
        dummy.position.set(p.x, p.y, p.z)
        dummy.rotation.y = p.angle
        dummy.scale.setScalar(p.scale)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      mesh.computeBoundingSphere()
      root.add(mesh)
    })
  }
  const grass = Array.from({ length: 120 }, (_, i) => ({
    x: (i % 2 ? -1 : 1) * (24 + ((i * 7) % 18)),
    y: 0.035,
    z: -37 + ((i * 13) % 74),
    scale: 0.45 + (i % 4) * 0.12,
    angle: i * 2.4,
  }))
  instance(0, grass, true)
  instance(
    4,
    grass.filter((_, i) => i % 9 === 0).map((p) => ({ ...p, scale: 0.7 })),
    true,
  )
  const islets = [
    { x: -120, z: -88 },
    { x: 126, z: 68 },
    { x: -96, z: 116 },
  ]
  islets.forEach((p, i) => {
    const sand = new T.Mesh(
      new T.SphereGeometry(1, 24, 10),
      new T.MeshStandardMaterial({ color: '#d5b887', roughness: 1 }),
    )
    sand.position.set(p.x, -1.1, p.z)
    sand.scale.set(20 + i * 3, 3, 14 + i * 2)
    sand.receiveShadow = true
    root.add(sand)
  })
  instance(
    1,
    islets.flatMap((p, i) =>
      [-1, 1].map((side) => ({
        x: p.x + side * 6,
        y: 0.8,
        z: p.z + side * 3,
        scale: 4 + i,
        angle: i + side,
      })),
    ),
    true,
  )
  instance(
    2,
    islets.map((p, i) => ({ x: p.x + 8, y: 1, z: p.z - 5, scale: 7 + i, angle: i * 1.2 })),
  )
  instance(
    3,
    Array.from({ length: 16 }, (_, i) => ({
      x: (i % 2 ? -1 : 1) * (54 + (i % 4) * 2),
      y: -0.9,
      z: -40 + i * 5.5,
      scale: 2 + (i % 3),
      angle: i * 1.7,
    })),
  )
  const foam: T.LineLoop[] = []
  for (let j = 0; j < 4; j++) {
    const points = Array.from({ length: 128 }, (_, i) => {
      const a = (i / 128) * Math.PI * 2,
        c = Math.cos(a),
        s = Math.sin(a)
      return new T.Vector3(
        Math.sign(c) * Math.abs(c) ** 0.3 * (54 + j * 1.4),
        -0.75,
        Math.sign(s) * Math.abs(s) ** 0.3 * (49 + j * 1.4),
      )
    })
    const line = new T.LineLoop(
      new T.BufferGeometry().setFromPoints(points),
      new T.LineBasicMaterial({
        color: '#e0eee0',
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      }),
    )
    root.add(line)
    foam.push(line)
  }
  const buoys = Array.from({ length: 8 }, (_, i) => {
    const group = new T.Group()
    group.position.set(62 + i * 7, -0.8, 29 + i * 5)
    const base = new T.Mesh(
      new T.CylinderGeometry(0.6, 0.8, 0.7, 10),
      new T.MeshStandardMaterial({ color: i % 2 ? '#ed9d7a' : '#efddba' }),
    )
    group.add(base)
    const lamp = new T.Mesh(
      new T.SphereGeometry(0.16, 8, 6),
      new T.MeshStandardMaterial({ color: '#ffeac0', emissive: '#ffb65b', emissiveIntensity: 0 }),
    )
    lamp.position.y = 0.8
    group.add(lamp)
    root.add(group)
    return { group, lamp }
  })
  // Imported prototype resources are no longer needed after instancing.
  assets.forEach((asset) =>
    asset.scene.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.geometry.dispose()
        ;(Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose())
      }
    }),
  )
  let lastTime = 0
  const animate = (time: number, night: number, reduced: boolean) => {
    buoys.forEach(({ lamp }) => {
      lamp.material.emissiveIntensity = night * 2
    })
    if (reduced) return
    lastTime = time
    wind.value = time
    foam.forEach((line, i) => {
      const swell = 1 + Math.sin(time * 0.8 + i) * 0.009
      line.scale.set(swell, 1, swell)
      ;(line.material as T.LineBasicMaterial).opacity = 0.13 + Math.sin(time * 0.8 + i) * 0.08
    })
    buoys.forEach(({ group }, i) => {
      group.position.y = -0.8 + Math.sin(time * 0.9 + i) * 0.12
      group.rotation.z = Math.sin(time * 0.7 + i) * 0.08
    })
  }
  return {
    root,
    animate,
    telemetry: () => ({
      assets: names.length,
      grass: grass.length,
      islets: islets.length,
      buoys: buoys.length,
      windTime: wind.value,
      windSample: Math.sin(lastTime * 1.7) * 0.14,
      windCompiled: compiled,
    }),
  }
}
