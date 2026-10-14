import * as T from 'three'

export function arrivalAtmosphere(progress: number) {
  const entering = T.MathUtils.smoothstep(progress, 0.2, 0.42)
  const clearing = T.MathUtils.smoothstep(progress, 0.58, 0.96)
  return { cover: entering * (1 - clearing), clearing, islandVisible: progress >= 0.5 }
}

// Camera-space cloud bank: billows expand past the lens, then open unevenly from the centre.
export function buildArrivalClouds(camera: T.PerspectiveCamera) {
  const material = new T.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      cover: { value: 0 },
      clearing: { value: 0 },
      travel: { value: 0 },
      aspect: { value: 1 },
      tint: { value: new T.Color('#e9f2eb') },
    },
    vertexShader: `
      varying vec2 cloudUv;
      void main() {
        cloudUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 cloudUv;
      uniform float cover, clearing, travel, aspect;
      uniform vec3 tint;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 cell = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(cell), hash(cell + vec2(1., 0.)), f.x),
          mix(hash(cell + vec2(0., 1.)), hash(cell + vec2(1., 1.)), f.x), f.y);
      }
      float billow(vec2 p) {
        return noise(p) * .55 + noise(p * 2.03 + 7.) * .3 + noise(p * 4.1) * .15;
      }
      void main() {
        vec2 p = (cloudUv - .5) * vec2(aspect, 1.);
        vec2 flow = p * mix(5.5, 2.0, travel) + vec2(travel * 1.4, -travel * 2.3);
        float cloud = billow(flow);
        float detail = billow(flow * 1.6 + vec2(9., travel));
        float edge = length(p) / max(1., aspect * .55);
        float opening = clearing * 1.7 - edge * .45;
        float wisps = smoothstep(opening - .16, opening + .19, cloud);
        // Fully opaque while switching worlds; clearing exposes separate patches of coastline.
        float alpha = mix(smoothstep(.22, .68, cloud) * cover, 1., pow(cover, 5.));
        float departing = wisps * (1. - smoothstep(.8, 1., clearing));
        alpha = mix(alpha, departing, smoothstep(0., .05, clearing));
        vec3 shade = tint * (.55 + cloud * .5 + detail * .15);
        gl_FragColor = vec4(shade, alpha);
        #include <colorspace_fragment>
      }
    `,
  })
  const bank = new T.Mesh(new T.PlaneGeometry(1, 1), material)
  bank.position.z = -2
  bank.renderOrder = 1000
  bank.frustumCulled = false
  camera.add(bank)
  return {
    animate(progress: number, night: number) {
      const atmosphere = arrivalAtmosphere(progress)
      bank.visible = atmosphere.cover > 0
      const height = 4 * Math.tan(T.MathUtils.degToRad(camera.fov / 2))
      bank.scale.set(height * camera.aspect * 1.02, height * 1.02, 1)
      material.uniforms.cover.value = atmosphere.cover
      material.uniforms.clearing.value = atmosphere.clearing
      material.uniforms.travel.value = T.MathUtils.smoothstep(progress, 0.2, 0.96)
      material.uniforms.aspect.value = camera.aspect
      material.uniforms.tint.value.set('#e9f2eb').lerp(new T.Color('#7e97b0'), night * 0.65)
      return atmosphere
    },
  }
}
