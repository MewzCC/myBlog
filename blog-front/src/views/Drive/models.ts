import * as T from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { islandSize, stations, tokens } from './island'

export type Solid = {
  x: number
  y: number
  z: number
  w: number
  h: number
  d: number
  rotation?: number
  dynamic?: boolean
  mesh?: T.Object3D
}
export type IslandModels = ReturnType<typeof buildIsland>
const palette = {
  sand: '#e6ca92',
  grass: '#71947a',
  road: '#494f55',
  cream: '#fff0cf',
  coral: '#e9765e',
  mint: '#69bdab',
  ink: '#263a43',
  blue: '#7b9dc3',
  wood: '#a67249',
  gold: '#ffcd73',
}

export function buildIsland(scene: T.Scene) {
  const solids: Solid[] = []
  const lamps: T.MeshStandardMaterial[] = []
  const textures: T.Texture[] = []
  const materials = new Map<string, T.MeshStandardMaterial>()
  const mat = (color: string, roughness = 0.8, metalness = 0) => {
    const key = `${color}/${roughness}/${metalness}`
    if (!materials.has(key))
      materials.set(key, new T.MeshStandardMaterial({ color, roughness, metalness }))
    return materials.get(key)!
  }
  const mesh = <M extends T.Material>(
    geometry: T.BufferGeometry,
    material: M,
    position: [number, number, number],
    parent: T.Object3D = scene,
  ) => {
    const item = new T.Mesh(geometry, material)
    item.position.set(...position)
    item.castShadow = true
    item.receiveShadow = true
    parent.add(item)
    return item
  }
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
    parent: T.Object3D = scene,
    round = 0,
  ) =>
    mesh(
      round ? new RoundedBoxGeometry(w, h, d, 2, round) : new T.BoxGeometry(w, h, d),
      mat(color),
      [x, y, z],
      parent,
    )
  const cylinder = (
    x: number,
    y: number,
    z: number,
    r: number,
    height: number,
    color: string,
    parent: T.Object3D = scene,
    r2 = r,
    segments = 12,
  ) => mesh(new T.CylinderGeometry(r, r2, height, segments), mat(color), [x, y, z], parent)
  const sphere = (
    x: number,
    y: number,
    z: number,
    radius: number,
    color: string,
    parent: T.Object3D = scene,
  ) => mesh(new T.IcosahedronGeometry(radius, 1), mat(color), [x, y, z], parent)
  const solidBox = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
    parent: T.Object3D = scene,
    dynamic = false,
  ) => {
    const item = box(x, y, z, w, h, d, color, parent, 0.08)
    solids.push({ x, y, z, w, h, d, dynamic, mesh: item })
    return item
  }
  const text = (
    value: string,
    x: number,
    y: number,
    z: number,
    width: number,
    color = palette.ink,
    bg = palette.cream,
    parent: T.Object3D = scene,
  ) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 1024, 256)
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = 'bold 92px "Space Grotesk", sans-serif'
    ctx.fillText(value, 512, 132, 950)
    const texture = new T.CanvasTexture(canvas)
    texture.colorSpace = T.SRGBColorSpace
    textures.push(texture)
    return mesh(
      new T.PlaneGeometry(width, width / 4),
      new T.MeshStandardMaterial({ map: texture, roughness: 0.8, side: T.DoubleSide }),
      [x, y, z],
      parent,
    )
  }
  const glow = (color: string) => {
    const material = new T.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
      roughness: 0.35,
    })
    lamps.push(material)
    return material
  }

  // A complete, locally generated diorama: no runtime model downloads.
  const ground = box(0, -2.2, 0, islandSize.width, 4.3, islandSize.depth, palette.sand, scene, 4)
  const grass = box(0, -0.04, 0, 90, 0.14, 82, palette.grass, scene, 3)
  ground.receiveShadow = true
  grass.receiveShadow = true
  solids.push({ x: 0, y: -1, z: 0, w: islandSize.width - 2, h: 2, d: islandSize.depth - 2 })
  // Closed loop, central cross street, inlaid curbs and dashed markings.
  for (const z of [-18, 18]) {
    box(0, 0.06, z, 42, 0.1, 5.4, palette.road)
    for (const edge of [-2.9, 2.9]) box(0, 0.1, z + edge, 43, 0.15, 0.3, palette.cream)
    for (let x = -19; x < 21; x += 3.5) box(x, 0.12, z, 1.8, 0.015, 0.12, palette.cream)
  }
  for (const x of [-18, 18]) {
    box(x, 0.06, 0, 5.4, 0.1, 42, palette.road)
    for (const edge of [-2.9, 2.9]) box(x + edge, 0.1, 0, 0.3, 0.15, 43, palette.cream)
    for (let z = -14; z < 16; z += 3.5) box(x, 0.12, z, 0.12, 0.015, 1.8, palette.cream)
  }
  box(0, 0.06, 0, 5.4, 0.1, 37, palette.road)
  box(0, 0.06, 0, 37, 0.1, 5.4, palette.road)
  for (let z = -15; z <= 15; z += 3.5)
    if (Math.abs(z) > 4) box(0, 0.12, z, 0.12, 0.015, 1.7, palette.cream)
  for (let x = -15; x <= 15; x += 3.5)
    if (Math.abs(x) > 4) box(x, 0.12, 0, 1.7, 0.015, 0.12, palette.cream)
  for (let i = 0; i < 7; i++) {
    box(5, 0.13, -2 + i * 0.65, 2, 0.018, 0.3, palette.cream)
    box(-5, 0.13, -2 + i * 0.65, 2, 0.018, 0.3, palette.cream)
  }
  // Roundabout sculpture with planter, rotating rings and a glowing heart.
  cylinder(0, 0.2, 0, 3.25, 0.3, palette.cream)
  cylinder(0, 0.45, 0, 2.9, 0.3, palette.mint)
  cylinder(0, 1.3, 0, 0.7, 1.5, palette.ink)
  const sculpture = new T.Group()
  sculpture.position.set(0, 3.1, 0)
  scene.add(sculpture)
  const ring = mesh(
    new T.TorusGeometry(1.45, 0.13, 8, 40),
    mat(palette.gold, 0.3, 0.6),
    [0, 0, 0],
    sculpture,
  )
  ring.rotation.x = 0.9
  const innerRing = mesh(
    new T.TorusGeometry(1.15, 0.1, 8, 40),
    mat(palette.coral, 0.3, 0.6),
    [0, 0, 0],
    sculpture,
  )
  innerRing.rotation.y = 0.9
  mesh(new T.IcosahedronGeometry(0.55, 1), glow(palette.gold), [0, 0, 0], sculpture)
  solids.push({ x: 0, y: 0.5, z: 0, w: 5, h: 1, d: 5 })

  // Lighthouse, with balcony rails, lantern glass and an animated beacon.
  const lighthouse = new T.Group()
  lighthouse.position.set(-25, 0, -23)
  scene.add(lighthouse)
  cylinder(0, 0.35, 0, 3.9, 0.65, palette.cream, lighthouse)
  cylinder(0, 4.7, 0, 1.55, 8.6, palette.cream, lighthouse, 2)
  for (const y of [2.4, 5, 7.6])
    cylinder(0, y, 0, 2.03 - y * 0.052, 1, palette.coral, lighthouse, 2.08 - y * 0.052)
  cylinder(0, 9.3, 0, 2.25, 0.45, palette.ink, lighthouse)
  cylinder(0, 10.5, 0, 1.45, 1.9, palette.blue, lighthouse)
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5
    cylinder(Math.cos(a) * 2, 10, Math.sin(a) * 2, 0.055, 1.4, palette.cream, lighthouse)
    box(Math.cos(a) * 1.38, 10.5, Math.sin(a) * 1.38, 0.09, 2, 0.09, palette.ink, lighthouse)
  }
  const rail = mesh(
    new T.TorusGeometry(2, 0.065, 6, 32),
    mat(palette.cream),
    [0, 10.6, 0],
    lighthouse,
  )
  rail.rotation.x = Math.PI / 2
  cylinder(0, 11.8, 0, 0, 1.4, palette.coral, lighthouse, 2.1)
  const beacon = new T.Group()
  beacon.position.y = 10.5
  lighthouse.add(beacon)
  const beamMaterial = new T.MeshBasicMaterial({
    color: palette.gold,
    transparent: true,
    opacity: 0.08,
    side: T.DoubleSide,
    depthWrite: false,
  })
  const beam = mesh(new T.ConeGeometry(5, 27, 20, 1, true), beamMaterial, [0, 0, 14], beacon)
  beam.rotation.x = -Math.PI / 2
  mesh(new T.SphereGeometry(0.5, 12, 8), glow(palette.gold), [0, 0, 0], beacon)
  solids.push({ x: -25, y: 4, z: -23, w: 4, h: 8, d: 4 })
  text('SAKURA', -25, 1.2, -20.9, 2.4)

  const roof = (
    x: number,
    y: number,
    z: number,
    w: number,
    d: number,
    color: string,
    parent: T.Object3D,
  ) => {
    const geometry = new T.BufferGeometry()
    const v = [
      -w / 2,
      0,
      -d / 2,
      w / 2,
      0,
      -d / 2,
      0,
      1.7,
      -d / 2,
      -w / 2,
      0,
      d / 2,
      0,
      1.7,
      d / 2,
      w / 2,
      0,
      d / 2,
      -w / 2,
      0,
      -d / 2,
      0,
      1.7,
      -d / 2,
      -w / 2,
      0,
      d / 2,
      0,
      1.7,
      -d / 2,
      0,
      1.7,
      d / 2,
      -w / 2,
      0,
      d / 2,
      w / 2,
      0,
      -d / 2,
      w / 2,
      0,
      d / 2,
      0,
      1.7,
      -d / 2,
      0,
      1.7,
      -d / 2,
      w / 2,
      0,
      d / 2,
      0,
      1.7,
      d / 2,
    ]
    geometry.setAttribute('position', new T.Float32BufferAttribute(v, 3))
    geometry.computeVertexNormals()
    return mesh(geometry, mat(color), [x, y, z], parent)
  }
  const building = (x: number, z: number, w: number, d: number, color: string, name: string) => {
    const g = new T.Group()
    g.position.set(x, 0, z)
    scene.add(g)
    box(0, 0.22, 0, w + 1, 0.4, d + 1, palette.cream, g)
    box(0, 2, 0, w, 3.6, d, color, g, 0.12)
    roof(0, 3.8, 0, w + 1, d + 1, palette.ink, g)
    text(name, 0, 3.2, d / 2 + 0.06, w * 0.88, palette.ink, palette.cream, g)
    box(0, 1, d / 2 + 0.1, 1.3, 2, 0.12, palette.wood, g)
    for (const side of [-1, 1]) {
      box(side * w * 0.32, 1.8, d / 2 + 0.13, 1.6, 1.7, 0.18, palette.cream, g)
      mesh(
        new T.BoxGeometry(1.35, 1.4, 0.2),
        glow('#ffcb83'),
        [side * w * 0.32, 1.8, d / 2 + 0.26],
        g,
      )
      box(side * w * 0.32, 1.8, d / 2 + 0.4, 0.07, 1.4, 0.08, palette.ink, g)
      box(side * w * 0.32, 1.8, d / 2 + 0.4, 1.4, 0.07, 0.08, palette.ink, g)
    }
    solids.push({ x, y: 2, z, w, h: 4, d })
    return g
  }
  // Workshop includes sawtooth roof, open garage face, tools, antenna, solar cells.
  const garage = building(24, -24, 8, 6, palette.mint, 'MAKER GARAGE')
  box(0, 1.6, 3.35, 3.6, 2.7, 0.15, palette.ink, garage)
  for (let x = -1.5; x <= 1.6; x += 0.5) box(x, 1.6, 3.45, 0.12, 2.5, 0.06, palette.blue, garage)
  box(-2, 6, 0, 0.12, 4, 0.12, palette.ink, garage)
  mesh(new T.SphereGeometry(0.3, 8, 8), glow(palette.coral), [-2, 8, 0], garage)
  for (let i = 0; i < 3; i++) {
    const cell = box(2, 4.55, -1 + i * 0.9, 2.4, 0.1, 0.75, palette.blue, garage)
    cell.rotation.z = 0.4
  }
  box(2, 2, 3.6, 1.7, 0.35, 0.3, palette.coral, garage)
  // Bookshop with striped awning, outdoor book piles and chimney.
  const books = building(25, 23, 7, 5.5, palette.coral, 'LITTLE BOOKSHOP')
  for (let i = 0; i < 10; i++) {
    const awning = box(
      -3.3 + i * 0.73,
      2.7,
      3.3,
      0.7,
      0.12,
      1.5,
      i % 2 ? palette.coral : palette.cream,
      books,
    )
    awning.rotation.x = 0.15
  }
  box(2.2, 4.8, -1, 1, 2, 1, palette.cream, books)
  for (let i = 0; i < 4; i++)
    box(
      -2.5,
      0.4 + i * 0.22,
      4,
      1.1,
      0.18,
      0.8,
      [palette.blue, palette.gold, palette.mint, palette.cream][i],
      books,
    )
  // Post office with mailbox, letter slot and roadside bunting.
  const post = building(-25, 23, 7, 5.5, palette.blue, 'POST OFFICE')
  text('AIR MAIL', 0, 4.4, 2.9, 3.7, palette.cream, palette.coral, post)
  box(4.5, 0.65, 0, 0.25, 1.3, 0.25, palette.ink, post)
  box(4.5, 1.7, 0, 1.3, 1.2, 1.1, palette.coral, post, 0.15)
  box(4.5, 1.85, 0.6, 0.8, 0.13, 0.08, palette.ink, post)
  solids.push({ x: -20.5, y: 1, z: 23, w: 1.4, h: 2, d: 1.4 })

  // Station landing pads, overhead location markers and road signs.
  const markers = stations.map((s) => {
    const group = new T.Group()
    group.position.set(s.x, 0, s.z)
    scene.add(group)
    const rim = mesh(new T.TorusGeometry(2.7, 0.07, 6, 40), glow(s.color), [0, 0.15, 0], group)
    rim.rotation.x = Math.PI / 2
    const pin = mesh(new T.OctahedronGeometry(0.5), glow(s.color), [0, 5.5, 0], group)
    return { id: s.id, pin, rim, position: new T.Vector3(s.x, 3.5, s.z) }
  })
  for (const [x, z, label] of [
    [-10, -12, 'ABOUT ←'],
    [11, -12, 'GARAGE →'],
    [11, 12, 'NOTES →'],
    [-11, 12, '← POST'],
  ] as const) {
    cylinder(x, 1.25, z, 0.08, 2.5, palette.ink)
    text(label, x, 2.5, z, 3.5)
  }
  const tree = (x: number, z: number, s = 1, palm = false) => {
    const g = new T.Group()
    g.position.set(x, 0, z)
    g.scale.setScalar(s)
    scene.add(g)
    cylinder(0, 1.5, 0, 0.18, 3, palette.wood, g, 0.27, 7)
    if (palm) {
      for (let i = 0; i < 6; i++) {
        const leaf = box(0, 3.3, 1.25, 0.6, 0.13, 2.8, palette.mint, g, 0.05)
        leaf.rotation.y = (i * Math.PI) / 3
        leaf.position.x = Math.sin((i * Math.PI) / 3) * 1.1
        leaf.position.z = Math.cos((i * Math.PI) / 3) * 1.1
        leaf.rotation.x = 0.3
      }
      for (let i = 0; i < 3; i++)
        sphere(Math.sin(i * 2) * 0.25, 2.9, Math.cos(i * 2) * 0.25, 0.23, palette.wood, g)
    } else {
      for (let i = 0; i < 3; i++)
        cylinder(
          0,
          2 + i * 0.85,
          0,
          0.05,
          1.9,
          [palette.grass, palette.mint, palette.grass][i],
          g,
          1.5 - i * 0.3,
          6,
        )
    }
    solids.push({ x, y: 1.5 * s, z, w: 0.4 * s, h: 3 * s, d: 0.4 * s })
  }
  const treePositions = [
    [-10, -8],
    [-7, -10],
    [-11, -10],
    [10, -8],
    [8, -11],
    [12, -10],
    [-10, 8],
    [-7, 10],
    [-11, 10],
    [9, 9],
    [11, 8],
    [7, 12],
    [-28, -9],
    [-27, 7],
    [29, -8],
    [28, 6],
    [-8, -26],
    [7, -26],
    [-8, 26],
    [8, 27],
  ]
  treePositions.forEach(([x, z], i) => tree(x, z, 0.85 + (i % 4) * 0.15, i > 11))
  for (let i = 0; i < 25; i++) {
    const a = i * 2.4
    const x = Math.sin(a) * 29
    const z = Math.cos(a) * 27
    if (Math.abs(x) > 22 && Math.abs(z) > 17) continue
    sphere(x, 0.15, z, 0.3 + (i % 3) * 0.1, palette.cream)
  }
  // Picnic garden, radio mast, water tank, benches, fences, and flower planters.
  for (const [x, z] of [
    [-8, 6],
    [8, -6],
  ] as const) {
    box(x, 0.65, z, 2.7, 0.18, 1.3, palette.wood)
    for (const dx of [-1, 1]) box(x + dx, 0.3, z, 0.12, 0.6, 0.8, palette.ink)
    solids.push({ x, y: 0.5, z, w: 2.7, h: 1, d: 1.3 })
  }
  for (const [x, z] of [
    [-12, 5],
    [12, -5],
    [-12, -5],
    [12, 5],
  ] as const) {
    cylinder(x, 0.4, z, 0.7, 0.7, palette.coral)
    for (let i = 0; i < 5; i++) {
      const a = i * 1.25
      cylinder(x + Math.cos(a) * 0.3, 0.9, z + Math.sin(a) * 0.3, 0.03, 0.7, palette.grass)
      sphere(x + Math.cos(a) * 0.3, 1.3, z + Math.sin(a) * 0.3, 0.18, palette.gold)
    }
  }
  for (const x of [-50, 50])
    for (let z = -37; z < 38; z += 3) {
      box(x, 0.7, z, 0.12, 1.4, 0.12, palette.cream)
      box(x, 0.8, z + 1.5, 0.12, 0.16, 3, palette.cream)
    }
  for (const z of [-46, 46])
    for (let x = -35; x <= 35; x += 3) {
      box(x, 0.7, z, 0.12, 1.4, 0.12, palette.cream)
      box(x + 1.5, 0.8, z, 3, 0.16, 0.12, palette.cream)
    }
  // Physics boundaries are low beach edges; cars cannot quietly leave the island.
  for (const x of [-51, 51]) solids.push({ x, y: 0.5, z: 0, w: 0.5, h: 2, d: 95 })
  for (const z of [-47, 47]) solids.push({ x: 0, y: 0.5, z, w: 103, h: 2, d: 0.5 })
  const windmill = new T.Group()
  windmill.position.set(-9, 0, -24)
  scene.add(windmill)
  cylinder(0, 3.5, 0, 0.12, 7, palette.cream, windmill, 0.22)
  const turbine = new T.Group()
  turbine.position.set(0, 7, 0)
  windmill.add(turbine)
  sphere(0, 0, 0.15, 0.3, palette.coral, turbine)
  for (let i = 0; i < 3; i++) {
    const blade = box(0, 1.3, 0, 0.3, 2.7, 0.15, palette.cream, turbine, 0.1)
    const g = new T.Group()
    g.rotation.z = (i * Math.PI * 2) / 3
    turbine.add(g)
    g.add(blade)
  }
  // A short stunt ramp on the south cross road.
  const ramp = box(0, 0.45, 24, 4, 0.15, 5, palette.coral)
  ramp.rotation.x = -0.23
  solids.push({ x: 0, y: 0.45, z: 24, w: 4, h: 0.15, d: 5, rotation: -0.23 })
  text('JUMP!', 0, 0.45, 20.8, 2.5, palette.cream, palette.coral)
  for (let i = 0; i < 7; i++) {
    const x = 7 + (i % 3) * 1.1,
      z = 23 + Math.floor(i / 3) * 1.1
    const crate = solidBox(x, 0.55 + (i === 6 ? 1.1 : 0), z, 1, 1, 1, palette.wood, scene, true)
    // Strapped crate faces; child geometry moves with the simulated box.
    for (const dx of [-0.3, 0.3]) {
      const strap = box(dx, 0, 0.51, 0.12, 0.94, 0.03, palette.cream, crate)
      strap.castShadow = false
    }
  }
  for (const [x, z] of [
    [-6, 17],
    [6, -17],
    [17, 6],
    [-17, -6],
  ] as const) {
    cylinder(x, 0.3, z, 0.45, 0.12, palette.ink)
    cylinder(x, 0.65, z, 0, 1.1, palette.coral, scene, 0.35)
    cylinder(x, 0.6, z, 0.18, 0.18, palette.cream)
  }
  // Warm street lamps and spherical bulbs (shared emissive materials).
  const lampLights: T.PointLight[] = []
  for (const [x, z] of [
    [-14, -15],
    [14, -15],
    [-14, 15],
    [14, 15],
    [4, 5],
    [-4, -5],
  ] as const) {
    cylinder(x, 2, z, 0.075, 4, palette.ink)
    box(x + 0.4, 3.9, z, 0.8, 0.12, 0.15, palette.ink)
    mesh(new T.SphereGeometry(0.24, 8, 6), glow(palette.gold), [x + 0.8, 3.8, z])
    const light = new T.PointLight(palette.gold, 5, 10, 2)
    light.position.set(x + 0.8, 3.6, z)
    scene.add(light)
    lampLights.push(light)
  }
  // Wooden pier, moored sailboat and a bobbing buoy beyond the coastline.
  box(-24, -0.1, 52, 4, 0.35, 10, palette.wood)
  for (let z = 48; z < 57; z++) box(-24, 0.1, z, 4, 0.02, 0.05, palette.cream)
  for (const x of [-25.6, -22.4])
    for (const z of [48, 53, 56]) cylinder(x, -1, z, 0.15, 3, palette.wood)
  const boat = new T.Group()
  boat.position.set(-22, -0.7, 60)
  scene.add(boat)
  const hull = mesh(new T.SphereGeometry(1, 12, 8), mat(palette.cream), [0, 0, 0], boat)
  hull.scale.set(1.25, 0.55, 3)
  cylinder(0, 2.4, 0, 0.075, 5, palette.wood, boat)
  const sailGeometry = new T.BufferGeometry()
  sailGeometry.setAttribute(
    'position',
    new T.Float32BufferAttribute([0, 4.8, 0, 0, 0.8, 0, 0, 0.8, 2.4], 3),
  )
  sailGeometry.computeVertexNormals()
  mesh(
    sailGeometry,
    new T.MeshStandardMaterial({ color: palette.coral, side: T.DoubleSide }),
    [0, 0, 0],
    boat,
  )
  // Outer scenic loop: four districts surround the original little town.
  for (const z of [-36, 36]) {
    box(0, 0.06, z, 85, 0.1, 5.4, palette.road)
    for (const dz of [-2.9, 2.9]) box(0, 0.1, z + dz, 86, 0.15, 0.3, palette.cream)
    for (let x = -39; x < 40; x += 4) box(x, 0.12, z, 1.8, 0.015, 0.12, palette.cream)
  }
  for (const x of [-40, 40]) {
    box(x, 0.06, 0, 5.4, 0.1, 77, palette.road)
    for (const dx of [-2.9, 2.9]) box(x + dx, 0.1, 0, 0.3, 0.15, 78, palette.cream)
    for (let z = -33; z < 34; z += 4) box(x, 0.12, z, 0.12, 0.015, 1.8, palette.cream)
  }
  for (const z of [-27, 27]) box(0, 0.06, z, 5.4, 0.1, 18, palette.road)
  for (const x of [-30, 30]) box(x, 0.06, 0, 24, 0.1, 5.4, palette.road)
  for (const [x, z, label] of [
    [0, -30, 'NATURE LOOP'],
    [30, 0, 'HARBOR →'],
    [-30, 0, '← FOREST'],
    [0, 30, 'CAMP / 36'],
  ] as const) {
    cylinder(x + 3, 1.3, z, 0.07, 2.6, palette.ink)
    text(label, x + 3, 2.6, z, 4)
  }
  // Mossy west woodland and a turquoise duck pond with stepping stones.
  const pond = cylinder(-30, 0.08, -28, 5.7, 0.12, '#63b9b5', scene, 5.7, 40)
  pond.scale.z = 0.7
  const pondRim = mesh(new T.TorusGeometry(5.8, 0.16, 6, 48), mat(palette.cream), [-30, 0.16, -28])
  pondRim.rotation.x = Math.PI / 2
  pondRim.scale.y = 0.7
  for (let i = 0; i < 8; i++) {
    const a = i * 0.78
    sphere(-30 + Math.cos(a) * 6.8, 0.22, -28 + Math.sin(a) * 4.8, 0.45, palette.cream)
    const pad = cylinder(
      -30 + Math.cos(a) * 3,
      0.2,
      -28 + Math.sin(a) * 2,
      0.48,
      0.04,
      palette.grass,
    )
    if (i % 3 === 0) sphere(pad.position.x, 0.4, pad.position.z, 0.18, '#ef9eb2')
  }
  for (const [x, z] of [
    [-46, -20],
    [-46, -28],
    [-34, -12],
    [-30, -16],
    [-46, 14],
    [-45, 22],
    [-32, 28],
    [-29, 30],
    [-34, 22],
  ] as const)
    tree(x, z, 1.25, false)
  // Three cabin campsites: pitched canvas, sleeping rolls, lanterns and a fire circle.
  const campfires: T.Group[] = []
  for (const [x, z, color] of [
    [-12, 40, palette.coral],
    [13, 41, palette.gold],
    [29, 29, palette.mint],
  ] as const) {
    const tent = new T.Group()
    tent.position.set(x, 0, z)
    scene.add(tent)
    const canvas = new T.BufferGeometry()
    canvas.setAttribute(
      'position',
      new T.Float32BufferAttribute(
        [
          -2, 0, -2, 0, 3, -2, 0, 3, 2, -2, 0, -2, 0, 3, 2, -2, 0, 2, 0, 3, -2, 2, 0, -2, 2, 0, 2,
          0, 3, -2, 2, 0, 2, 0, 3, 2,
        ],
        3,
      ),
    )
    canvas.computeVertexNormals()
    const tentMaterial = mat(color).clone()
    tentMaterial.side = T.DoubleSide
    mesh(canvas, tentMaterial, [0, 0, 0], tent)
    box(0, 0.1, 0, 4, 0.18, 4, palette.cream, tent)
    box(0, 1.5, -2.1, 0.1, 3, 0.1, palette.wood, tent)
    cylinder(2.6, 0.3, 0, 0.32, 1.3, palette.blue, tent).rotation.z = Math.PI / 2
    solids.push({ x, y: 1, z, w: 4, h: 2, d: 4 })
    const fire = new T.Group()
    fire.position.set(x + 5, 0.15, z)
    scene.add(fire)
    campfires.push(fire)
    for (let i = 0; i < 9; i++) {
      const a = i * 0.7
      sphere(Math.cos(a) * 1.1, 0.15, Math.sin(a) * 1.1, 0.25, palette.cream, fire)
    }
    for (const angle of [-0.7, 0.7]) {
      const log = cylinder(0, 0.25, 0, 0.18, 1.6, palette.wood, fire)
      log.rotation.z = Math.PI / 2
      log.rotation.y = angle
    }
    mesh(new T.ConeGeometry(0.45, 1.1, 7), glow(palette.gold), [0, 0.65, 0], fire)
    mesh(new T.ConeGeometry(0.25, 0.8, 7), glow(palette.coral), [0.18, 0.7, 0], fire)
    cylinder(x - 3, 1.1, z, 0.08, 2.2, palette.wood)
    mesh(new T.SphereGeometry(0.25, 8, 6), glow(palette.gold), [x - 3, 2.2, z])
  }
  // East harbor market: striped kiosks, produce baskets, crates and a little arcade.
  for (const [x, z, color, label] of [
    [32, -27, palette.gold, 'LEMONADE'],
    [46, 13, palette.coral, 'ISLAND MART'],
    [29, 10, palette.mint, 'ARCADE'],
  ] as const) {
    solidBox(x, 1.2, z, 3.8, 2.4, 3.2, palette.cream)
    box(x, 2.8, z, 4.5, 0.24, 3.8, color)
    box(x, 1.45, z + 1.65, 2.8, 1.5, 0.06, palette.ink)
    box(x, 1, z + 2, 3.6, 0.16, 1, color)
    for (let i = 0; i < 5; i++)
      box(
        x - 1.8 + i * 0.8,
        2.6,
        z + 2.1,
        0.4,
        0.3,
        1,
        color === palette.coral ? palette.cream : color,
      )
    for (let i = 0; i < 7; i++)
      sphere(
        x - 1.4 + (i % 4) * 0.8,
        1.4,
        z + 2 + (i > 3 ? 0.35 : 0),
        0.25,
        i % 2 ? palette.gold : palette.coral,
      )
    text(label, x, 3.3, z, 3.8)
  }
  // North lookout, telescopes, extra palms, boardwalk, flower patches and beach umbrellas.
  box(18, 0.18, -28, 9, 0.3, 7, palette.wood)
  for (let x = 14; x < 23; x += 0.8) box(x, 0.35, -28, 0.03, 0.02, 7, palette.cream)
  cylinder(18, 1.1, -28, 0.08, 1.8, palette.ink)
  const telescope = cylinder(18, 2, -28, 0.28, 1.8, palette.blue)
  telescope.rotation.x = Math.PI / 2 + 0.3
  text('LOOK / WONDER', 18, 2.8, -31, 5)
  for (const [x, z] of [
    [-44, 40],
    [-36, 42],
    [43, 41],
    [46, -35],
    [46, -25],
    [-23, -43],
    [5, -43],
    [30, -42],
  ] as const)
    tree(x, z, 0.9, true)
  for (let i = 0; i < 10; i++) {
    const x = -25 + i * 5.5,
      z = -43
    for (let j = 0; j < 4; j++) {
      cylinder(x + j * 0.35, 0.4, z, 0.03, 0.7, palette.grass)
      sphere(x + j * 0.35, 0.8, z, 0.15, i % 2 ? palette.coral : palette.gold)
    }
  }
  for (const [x, z, color] of [
    [-43, 33, palette.coral],
    [42, 30, palette.gold],
    [-44, -36, palette.mint],
  ] as const) {
    cylinder(x, 1.8, z, 0.06, 3.6, palette.wood)
    cylinder(x, 3.6, z, 0.1, 0.8, color, scene, 2.5, 12)
    box(x + 0.8, 0.2, z + 1, 1.3, 0.25, 3, palette.cream, scene, 0.1)
  }
  const fireflies = new T.Group()
  scene.add(fireflies)
  for (let i = 0; i < 24; i++)
    mesh(
      new T.SphereGeometry(0.045, 5, 4),
      glow(palette.gold),
      [-30 + Math.sin(i * 2) * 7, 1.2 + (i % 4) * 0.4, -27 + Math.cos(i * 2) * 6],
      fireflies,
    )
  const cloudGroups: T.Group[] = []
  for (let i = 0; i < 8; i++) {
    const cloud = new T.Group()
    cloud.position.set(Math.sin(i * 2) * 67, 20 + (i % 3) * 3, Math.cos(i * 2) * 63)
    scene.add(cloud)
    for (let j = 0; j < 4; j++) {
      const puff = sphere(j * 1.7, Math.sin(j) * 0.5, 0, 1.7 + (j % 2), palette.cream, cloud)
      puff.castShadow = false
    }
    cloudGroups.push(cloud)
  }
  const tokenMeshes = tokens.map(([x, z]) =>
    mesh(new T.OctahedronGeometry(0.42), glow(palette.gold), [x, 1.7, z]),
  )
  const waterGeometry = new T.PlaneGeometry(500, 500, 70, 70)
  waterGeometry.rotateX(-Math.PI / 2)
  const water = mesh(
    waterGeometry,
    new T.MeshStandardMaterial({
      color: '#438d94',
      roughness: 0.28,
      metalness: 0.24,
      flatShading: true,
    }),
    [0, -1.1, 0],
  )
  water.receiveShadow = false
  water.castShadow = false
  // Foam lines outline the shoreline without expensive transparency effects.
  const foam = box(
    0,
    -0.82,
    0,
    islandSize.width + 2,
    0.07,
    islandSize.depth + 2,
    '#b5e0d1',
    scene,
    4,
  )
  foam.castShadow = false
  const birds = new T.Group()
  birds.position.y = 13
  scene.add(birds)
  for (let i = 0; i < 5; i++) {
    const g = new T.Group()
    g.position.set(i * 2, Math.sin(i) * 1.3, i * 0.5)
    birds.add(g)
    for (const side of [-1, 1]) {
      const wing = box(side * 0.3, 0, 0, 0.7, 0.035, 0.14, palette.ink, g)
      wing.rotation.z = side * 0.3
      wing.castShadow = false
    }
  }
  // Batch static architecture by material; moving parts retain individual meshes.
  const moving = new Set<T.Object3D>([
    sculpture,
    beacon,
    turbine,
    boat,
    birds,
    water,
    fireflies,
    ...campfires,
    ...cloudGroups,
    ...tokenMeshes,
    ...markers.map((m) => m.pin),
    ...solids.filter((s) => s.dynamic && s.mesh).map((s) => s.mesh!),
  ])
  scene.updateMatrixWorld(true)
  const batches = new Map<
    string,
    { material: T.Material; cast: boolean; receive: boolean; meshes: T.Mesh[] }
  >()
  scene.traverse((object) => {
    if (!(object instanceof T.Mesh) || Array.isArray(object.material)) return
    let ancestor: T.Object3D | null = object
    while (ancestor) {
      if (moving.has(ancestor)) return
      ancestor = ancestor.parent
    }
    const key = `${object.material.id}/${object.castShadow}/${object.receiveShadow}`
    if (!batches.has(key))
      batches.set(key, {
        material: object.material,
        cast: object.castShadow,
        receive: object.receiveShadow,
        meshes: [],
      })
    batches.get(key)!.meshes.push(object)
  })
  batches.forEach((batch) => {
    if (batch.meshes.length < 2) return
    const pieces = batch.meshes.map((m) => {
      const geometry = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()
      geometry.applyMatrix4(m.matrixWorld)
      if (!(batch.material instanceof T.MeshStandardMaterial && batch.material.map))
        geometry.deleteAttribute('uv')
      return geometry
    })
    const geometry = mergeGeometries(pieces)
    pieces.forEach((g) => g.dispose())
    if (!geometry) return
    const combined = new T.Mesh(geometry, batch.material)
    combined.castShadow = batch.cast
    combined.receiveShadow = batch.receive
    scene.add(combined)
    batch.meshes.forEach((m) => {
      m.removeFromParent()
      m.geometry.dispose()
    })
  })
  const animate = (time: number, dark: boolean, reduced: boolean) => {
    water.material.color.lerp(new T.Color(dark ? '#173e53' : '#438d94'), 0.04)
    water.material.roughness = dark ? 0.4 : 0.28
    lamps.forEach((m) => {
      m.emissiveIntensity = dark ? 2.2 : 0.15
    })
    lampLights.forEach((l) => {
      l.visible = dark
      l.intensity = dark ? 14 : 0
    })
    beam.visible = dark
    fireflies.visible = dark
    if (reduced) return
    sculpture.rotation.y = time * 0.25
    campfires.forEach((g, i) => {
      g.children.slice(-2).forEach((flame) => {
        flame.scale.y = 1 + Math.sin(time * 8 + i) * 0.12
        flame.rotation.y = time * 0.7
      })
    })
    fireflies.position.y = Math.sin(time * 0.7) * 0.3
    turbine.rotation.z = time * 0.65
    beacon.rotation.y = time * 0.3
    boat.position.y = -0.65 + Math.sin(time * 0.8) * 0.16
    boat.rotation.z = Math.sin(time * 0.6) * 0.045
    birds.position.x = Math.cos(time * 0.09) * 40
    birds.position.z = Math.sin(time * 0.09) * 40
    birds.rotation.y = -time * 0.09
    markers.forEach((m, i) => {
      m.pin.position.y = 5 + Math.sin(time * 1.6 + i) * 0.35
      m.pin.rotation.y = time * 0.7
    })
    tokenMeshes.forEach((m, i) => {
      m.rotation.y = time
      m.position.y = 1.5 + Math.sin(time * 2 + i) * 0.2
    })
    const vertices = waterGeometry.attributes.position
    for (let i = 0; i < vertices.count; i++)
      vertices.setY(
        i,
        Math.sin(vertices.getX(i) * 0.13 + time * 0.8) *
          Math.cos(vertices.getZ(i) * 0.13 + time * 0.4) *
          0.1,
      )
    vertices.needsUpdate = true
    cloudGroups.forEach((g, i) => {
      g.position.x = Math.sin(time * 0.015 + i * 2) * 67
    })
  }
  return {
    solids,
    markers,
    tokenMeshes,
    animate,
    textures,
    box,
    cylinder,
    mesh,
    mat,
    glow,
    palette,
  }
}

export function buildCar(scene: T.Scene, models: IslandModels) {
  const { box, cylinder, mesh, mat, glow, palette } = models
  const car = new T.Group()
  scene.add(car)
  const body = new T.Group()
  car.add(body)
  box(0, 0.55, 0, 1.65, 0.52, 2.9, palette.coral, body, 0.17)
  box(0, 0.26, 0, 1.4, 0.2, 2.7, palette.ink, body, 0.05)
  box(0, 0.78, 0.9, 1.48, 0.25, 0.8, palette.coral, body, 0.08)
  box(0, 1, -0.28, 1.45, 0.75, 1.4, palette.cream, body, 0.13)
  box(0, 1.45, -0.3, 1.55, 0.18, 1.52, palette.coral, body, 0.08)
  const glass = mat('#326c80', 0.15, 0.25)
  mesh(new T.BoxGeometry(1.23, 0.49, 0.05), glass, [0, 1.08, 0.44], body).rotation.x = -0.12
  mesh(new T.BoxGeometry(1.23, 0.46, 0.05), glass, [0, 1.08, -1.01], body)
  for (const side of [-1, 1]) {
    mesh(new T.BoxGeometry(0.04, 0.45, 1.05), glass, [side * 0.735, 1.07, -0.28], body)
    box(side * 0.76, 1.08, -0.23, 0.035, 0.5, 0.065, palette.cream, body)
    box(side * 0.76, 0.81, -0.5, 0.03, 0.055, 0.25, palette.ink, body)
    box(side * 0.94, 1.02, 0.25, 0.25, 0.17, 0.25, palette.coral, body, 0.04)
    mesh(new T.BoxGeometry(0.38, 0.22, 0.07), glow('#ffefb7'), [side * 0.5, 0.65, 1.48], body)
    mesh(new T.BoxGeometry(0.28, 0.18, 0.06), glow('#ff614b'), [side * 0.58, 0.55, -1.49], body)
  }
  box(0, 0.35, 1.48, 1.55, 0.12, 0.13, palette.cream, body, 0.03)
  box(0, 0.35, -1.48, 1.55, 0.12, 0.13, palette.cream, body, 0.03)
  for (let i = 0; i < 5; i++) box(-0.25 + i * 0.12, 0.6, 1.49, 0.05, 0.17, 0.035, palette.ink, body)
  // Roof rack, leather straps, suitcase and a tiny antenna.
  for (const x of [-0.57, 0.57]) box(x, 1.61, -0.3, 0.045, 0.12, 1.3, palette.ink, body)
  for (const z of [-0.85, 0.25]) box(0, 1.65, z, 1.3, 0.06, 0.05, palette.ink, body)
  box(0, 1.86, -0.3, 0.95, 0.36, 0.82, palette.gold, body, 0.05)
  for (const x of [-0.3, 0.3]) box(x, 1.87, -0.3, 0.08, 0.38, 0.84, palette.wood, body)
  cylinder(-0.6, 1.83, -0.95, 0.018, 0.65, palette.ink, body)
  const wheels: T.Group[] = [],
    steering: T.Group[] = []
  for (const z of [-0.91, 0.91])
    for (const x of [-0.84, 0.84]) {
      const axle = new T.Group()
      axle.position.set(x, 0.32, z)
      car.add(axle)
      steering.push(axle)
      const wheel = new T.Group()
      axle.add(wheel)
      wheels.push(wheel)
      const tire = mesh(
        new T.CylinderGeometry(0.38, 0.38, 0.3, 16),
        mat(palette.ink, 0.95),
        [0, 0, 0],
        wheel,
      )
      tire.rotation.z = Math.PI / 2
      const hub = cylinder(Math.sign(x) * 0.16, 0, 0, 0.22, 0.025, palette.cream, wheel)
      hub.rotation.z = Math.PI / 2
      const center = cylinder(Math.sign(x) * 0.18, 0, 0, 0.075, 0.028, palette.coral, wheel)
      center.rotation.z = Math.PI / 2
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI) / 8
        const tread = box(
          0,
          Math.cos(a) * 0.375,
          Math.sin(a) * 0.375,
          0.32,
          0.045,
          0.08,
          '#1f3038',
          wheel,
        )
        tread.rotation.x = a
      }
    }
  const headlight = new T.SpotLight('#ffe6aa', 0, 17, 0.38, 0.5, 1.5)
  headlight.position.set(0, 0.75, 1.1)
  headlight.target.position.set(0, 0, 12)
  car.add(headlight, headlight.target)
  return { car, body, wheels, steering, headlight }
}
