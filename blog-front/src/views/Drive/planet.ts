import * as T from 'three'
import { planetScale } from './planetSpace'
import { buildPlanetClouds } from './planetClouds'

const centre = new T.Vector3(0, -140, 0)

function noise(x: number, y: number, z: number) {
  const hash = (a: number, b: number, c: number) => {
    const value = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453
    return value - Math.floor(value)
  }
  const ix = Math.floor(x),
    iy = Math.floor(y),
    iz = Math.floor(z)
  const smooth = (a: number) => a * a * (3 - 2 * a)
  const u = smooth(x - ix),
    v = smooth(y - iy),
    w = smooth(z - iz)
  const layer = (dz: number) =>
    T.MathUtils.lerp(
      T.MathUtils.lerp(hash(ix, iy, iz + dz), hash(ix + 1, iy, iz + dz), u),
      T.MathUtils.lerp(hash(ix, iy + 1, iz + dz), hash(ix + 1, iy + 1, iz + dz), u),
      v,
    )
  return T.MathUtils.lerp(layer(0), layer(1), w)
}

export function planetTerrain(normal: T.Vector3) {
  const { x, y, z } = normal
  const naturalContinental =
    noise(x * 3 + 8, y * 3 - 2, z * 3 + 4) * 0.65 +
    noise(x * 7 + 3, y * 7, z * 7) * 0.25 +
    noise(x * 17, y * 17 + 8, z * 17) * 0.1
  // The island lies in the ocean under the approach corridor, not on a mountain.
  // Blend the basin into distant continents rather than cutting a circular hole.
  const oceanBasin = 1 - T.MathUtils.smoothstep(Math.hypot(x, y - 1, z), 0.5, 0.85)
  const continental = T.MathUtils.lerp(
    naturalContinental,
    0.38 + noise(x * 12, y * 12, z * 12) * 0.04,
    oceanBasin,
  )
  const land = T.MathUtils.smoothstep(continental, 0.48, 0.59)
  const ridge = 1 - Math.abs(noise(x * 14, y * 14, z * 14) * 2 - 1)
  const elevation = land * (0.5 + Math.pow(ridge, 5) * 5 + Math.max(0, continental - 0.6) * 14)
  const color = new T.Color('#103b67').lerp(
    new T.Color('#269bb0'),
    T.MathUtils.smoothstep(continental, 0.35, 0.49),
  )
  if (continental > 0.48) {
    color
      .set('#c2c49a')
      .lerp(new T.Color('#3c805c'), T.MathUtils.smoothstep(continental, 0.48, 0.54))
    color.lerp(new T.Color('#205442'), T.MathUtils.smoothstep(continental, 0.55, 0.72))
    color.lerp(new T.Color('#8e8972'), T.MathUtils.smoothstep(elevation, 2.8, 5.2))
    color.lerp(new T.Color('#edf2e3'), T.MathUtils.smoothstep(elevation, 5.3, 7))
    const desert =
      T.MathUtils.smoothstep(noise(x * 5 + 40, y * 5, z * 5), 0.58, 0.8) *
      (1 - T.MathUtils.smoothstep(elevation, 1, 3))
    color.lerp(new T.Color('#c4ad7d'), desert)
  }
  const ice = T.MathUtils.smoothstep(Math.abs(z) + (continental - 0.5) * 0.12, 0.86, 0.98)
  color.lerp(new T.Color('#e3eee9'), ice)
  return { elevation, color }
}

const cloudNoise = `
  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),
      mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
      mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
      mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float fbm(vec3 p) {
    return noise(p)*.53+noise(p*2.03+7.)*.27+noise(p*4.1+13.)*.13+noise(p*8.3)*.07;
  }
`

export function buildPlanet(scene: T.Scene) {
  const group = new T.Group()
  group.name = 'orbital-earth'
  group.position.copy(centre)
  scene.add(group)
  group.add(new T.HemisphereLight('#d0e9ff', '#29555b', 1.6))
  // A closed ocean under the relief prevents gaps and keeps the approach basin blue.
  const oceanMaterial = new T.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      varying vec3 oceanPoint, viewPoint, oceanNormal;
      void main() {
        oceanPoint=normalize(position);
        vec4 p=modelViewMatrix*vec4(position,1.);
        viewPoint=p.xyz;
        oceanNormal=normalize(normalMatrix*normal);
        gl_Position=projectionMatrix*p;
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 oceanPoint, viewPoint, oceanNormal;
      ${cloudNoise}
      void main() {
        vec3 p=normalize(oceanPoint);
        float depth=fbm(p*12.);
        vec3 water=mix(vec3(.006,.025,.075),vec3(.012,.115,.19),smoothstep(.28,.78,depth));
        float wave=noise(p*340.+vec3(time*.05,0.,-time*.03))*2.-1.;
        float detail=noise(p*580.+time*.02);
        vec3 n=normalize(oceanNormal);
        vec3 v=normalize(-viewPoint);
        float facing=max(0.,dot(n,v));
        float fresnel=pow(1.-facing,4.);
        float light=.55+.45*max(0.,dot(p,normalize(vec3(-.5,1.,.7))));
        float glint=pow(max(0.,dot(n,normalize(v+vec3(-.35,.7,.6)))),60.);
        water*=light*(.92+detail*.12+wave*.025);
        water+=vec3(.22,.38,.45)*fresnel*.35;
        water+=vec3(.75,.84,.76)*glint*(.08+detail*.08+wave*.03);
        gl_FragColor=vec4(water,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })
  const ocean = new T.Mesh(new T.SphereGeometry(140, 192, 128), oceanMaterial)
  ocean.name = 'earth-ocean'
  group.add(ocean)
  const geometry = new T.SphereGeometry(140, 192, 128)
  const positions = geometry.attributes.position
  const colors: number[] = []
  const elevations: number[] = []
  const normal = new T.Vector3()
  for (let i = 0; i < positions.count; i++) {
    normal.fromBufferAttribute(positions, i).normalize()
    const terrain = planetTerrain(normal)
    elevations.push(terrain.elevation)
    colors.push(terrain.color.r, terrain.color.g, terrain.color.b)
    positions.setXYZ(
      i,
      normal.x * (140 + terrain.elevation),
      normal.y * (140 + terrain.elevation),
      normal.z * (140 + terrain.elevation),
    )
  }
  geometry.setAttribute('color', new T.Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  // Keep coastal triangles but remove coplanar water triangles to avoid z-fighting.
  const indices = geometry.index!
  const landIndices: number[] = []
  for (let i = 0; i < indices.count; i += 3) {
    const a = indices.getX(i),
      b = indices.getX(i + 1),
      c = indices.getX(i + 2)
    if (Math.max(elevations[a], elevations[b], elevations[c]) > 0) {
      landIndices.push(a, b, c)
    }
  }
  geometry.setIndex(landIndices)
  const surfaceMaterial = new T.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.78,
    metalness: 0.08,
    transparent: false,
    emissive: '#153c4a',
    emissiveIntensity: 0.15,
    fog: false,
  })
  surfaceMaterial.onBeforeCompile = (shader) => {
    shader.vertexShader = `varying vec3 reliefPoint;\n${shader.vertexShader}`.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nreliefPoint=normalize(position);',
    )
    shader.fragmentShader =
      `varying vec3 reliefPoint;\n${cloudNoise}\n${shader.fragmentShader}`.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
       float grain=fbm(reliefPoint*210.);
       float valleys=noise(reliefPoint*70.);
       diffuseColor.rgb*=.78+grain*.32+valleys*.16;`,
      )
  }
  const surface = new T.Mesh(geometry, surfaceMaterial)
  surface.name = 'earth-relief'
  group.add(surface)

  const shellGeometry = new T.SphereGeometry(1, 96, 64)
  const clouds = buildPlanetClouds(group)

  const atmosphereMaterial = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: T.BackSide,
    blending: T.AdditiveBlending,
    uniforms: { fade: { value: 1 } },
    vertexShader: `
      varying vec3 viewNormal, viewDirection;
      void main() {
        vec4 p=modelViewMatrix*vec4(position,1.);
        viewNormal=normalize(normalMatrix*normal);
        viewDirection=normalize(-p.xyz);
        gl_Position=projectionMatrix*p;
      }
    `,
    fragmentShader: `
      varying vec3 viewNormal, viewDirection;
      uniform float fade;
      void main() {
        float facing=abs(dot(normalize(viewNormal),normalize(viewDirection)));
        float rim=pow(1.-facing,3.)*smoothstep(0.,.18,facing);
        gl_FragColor=vec4(.22,.58,.85,rim*.38*fade);
        #include <colorspace_fragment>
      }
    `,
  })
  const atmosphere = new T.Mesh(shellGeometry, atmosphereMaterial)
  atmosphere.scale.setScalar(144.5)
  group.add(atmosphere)
  const starPositions: number[] = []
  for (let i = 0; i < 600; i++) {
    const a = i * 2.399963,
      b = Math.acos(1 - (2 * (i + 0.5)) / 600)
    starPositions.push(
      Math.sin(b) * Math.cos(a) * 2400,
      Math.cos(b) * 2400,
      Math.sin(b) * Math.sin(a) * 2400,
    )
  }
  const stars = new T.Points(
    new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(starPositions, 3)),
    new T.PointsMaterial({
      color: '#f4e9cb',
      size: 2,
      transparent: true,
      depthWrite: false,
      fog: false,
    }),
  )
  group.add(stars)
  return {
    animate(progress: number, time = 0, aspect = 1, night = 0) {
      const scale = planetScale(aspect)
      group.scale.setScalar(scale)
      group.position.copy(centre).multiplyScalar(scale)
      const fade = 1 - T.MathUtils.smoothstep(progress, 0.6, 0.64)
      group.visible = progress < 0.64
      oceanMaterial.uniforms.time.value = time
      // Keep the ground opaque so it cannot paint over the transparent cloud shells.
      // The whole globe is removed only once the lens is fully inside dense cloud.
      clouds.animate(time, fade, night)
      // The orbital rim must disappear before the camera enters its shell.
      atmosphereMaterial.uniforms.fade.value = 1 - T.MathUtils.smoothstep(progress, 0.3, 0.46)
      stars.material.opacity = 1 - T.MathUtils.smoothstep(progress, 0.15, 0.5)
    },
  }
}
