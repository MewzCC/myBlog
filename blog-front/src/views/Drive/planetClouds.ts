import * as T from 'three'

// Coordinates are planet-local: the water radius is 140. The camera actually
// enters this density field; the sphere is only a bound for ray integration.
export const cloudBounds = { bottom: 146, top: 178 }

export function buildPlanetClouds(parent: T.Group) {
  const material = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: T.BackSide,
    uniforms: {
      eye: { value: new T.Vector3() },
      time: { value: 0 },
      fade: { value: 1 },
      night: { value: 0 },
    },
    vertexShader: `
      varying vec3 boundPoint;
      void main() {
        boundPoint=position;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
      }
    `,
    fragmentShader: `
      varying vec3 boundPoint;
      uniform vec3 eye;
      uniform float time, fade, night;
      float hash(vec3 p) {
        p=fract(p*.1031);
        p+=dot(p,p.yzx+33.33);
        return fract((p.x+p.y)*p.z);
      }
      float noise(vec3 p) {
        vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),
          mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
          mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
          mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
      }
      vec2 sphere(vec3 ro,vec3 rd,float radius) {
        float b=dot(ro,rd),d=b*b-dot(ro,ro)+radius*radius;
        if(d<0.)return vec2(-1.);
        return vec2(-b-sqrt(d),-b+sqrt(d));
      }
      float density(vec3 p) {
        vec3 radial=normalize(p);
        float towers=smoothstep(.8,.97,dot(radial,normalize(vec3(.16,1.,.22))));
        float bottom=mix(141.,146.,towers),top=mix(149.,178.,towers);
        float height=length(p);
        float envelope=smoothstep(bottom,bottom+3.,height)*(1.-smoothstep(top-7.,top,height));
        // Wind advects the whole bank; different frequencies evolve independently.
        vec3 wind=vec3(time*.32,time*.045,-time*.18);
        float weather=smoothstep(.43,.68,noise(normalize(p+wind)*8.));
        vec3 q=(p+wind)*.17;
        q+=vec3(sin(q.y+time*.08),sin(q.z-time*.06),cos(q.x+time*.07))*.45;
        float billow=noise(q)*.6+noise(q*2.07+time*.035)*.25;
        float erosion=noise(q*5.1-vec3(0.,time*.12,0.))*.15;
        return smoothstep(.46,.6,billow+erosion)*envelope*weather;
      }
      void main() {
        vec3 ray=normalize(boundPoint-eye);
        vec2 bounds=sphere(eye,ray,178.);
        float start=max(0.,bounds.x),end=bounds.y;
        // Only integrate the visible hemisphere. Back-horizon clouds otherwise
        // accumulate into a bright ring around the ocean's silhouette.
        end=min(end,max(start,-dot(eye,ray)));
        // Stop at the front surface, so clouds on the far hemisphere cannot show through.
        vec2 ground=sphere(eye,ray,140.);
        if(ground.x>0.)end=min(end,ground.x);
        if(end<=start)discard;
        float stepSize=(end-start)/48.;
        float jitter=.35+hash(vec3(gl_FragCoord.xy,0.))*.3;
        vec3 sum=vec3(0.);
        float transmission=1.;
        vec3 sun=normalize(vec3(-.5,1.,.7));
        for(int i=0;i<48;i++) {
          vec3 p=eye+ray*(start+(float(i)+jitter)*stepSize);
          float d=density(p);
          if(d>.005) {
            float shadow=density(p+sun*5.);
            float light=exp(-shadow*12.);
            float altitude=smoothstep(146.,178.,length(p));
            vec3 shade=mix(vec3(.19,.28,.38),vec3(1.,.97,.88),.12+light*.7+altitude*.12);
            shade=mix(shade,shade*vec3(.42,.54,.72),night*.65);
            float alpha=1.-exp(-d*stepSize*.24);
            sum+=transmission*alpha*shade;
            transmission*=1.-alpha;
            if(transmission<.015)break;
          }
        }
        float opacity=1.-transmission;
        if(opacity<.002)discard;
        gl_FragColor=vec4(sum/max(opacity,.001),opacity*fade);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })
  const mesh = new T.Mesh(new T.SphereGeometry(cloudBounds.top, 64, 48), material)
  mesh.name = 'earth-volume-clouds'
  mesh.renderOrder = 20
  mesh.onBeforeRender = (_renderer, _scene, camera) => {
    camera.getWorldPosition(material.uniforms.eye.value)
    parent.worldToLocal(material.uniforms.eye.value)
  }
  parent.add(mesh)
  return {
    animate(time: number, fade: number, night: number) {
      material.uniforms.time.value = time
      material.uniforms.fade.value = fade
      material.uniforms.night.value = night
    },
  }
}
