const ImgEffectShader = {
  uniforms: {},

  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,

  fragmentShader: /* glsl */ `
    uniform sampler2D tex;
    uniform float time;
    uniform vec3 col;
    uniform vec2 range;
    uniform vec2 mouse;

    varying vec2 vUv;

    void main(void) {
      float dist = distance(vUv, vec2(0.5, 0.5));
      // if((vUv.x < range.x || vUv.x > range.y)) {

      if(dist < range.x || dist > range.y) {
        discard;
      }

      vec4 dest = texture2D(tex, vUv);
      dest.rgb *= col;

      gl_FragColor = dest;
    }`,
}

export { ImgEffectShader }
