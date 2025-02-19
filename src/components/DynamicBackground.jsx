import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const DynamicBackground = () => {
  const meshRef = useRef();
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      // Novos valores de cores convertidos para floats (0-1)
      color1: { value: new THREE.Vector3(0.9569, 0.6549, 0.0431) }, // #F4A70B
      color2: { value: new THREE.Vector3(0.2157, 0.2157, 0.2157) }, // #373737
      color3: { value: new THREE.Vector3(0.0745, 0.0745, 0.0745) }  // #131313
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec2 resolution;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      varying vec2 vUv;
      
      void main() {
        vec2 uv = vUv;
        // Interpolação entre color1 e color2 ao longo do eixo horizontal
        vec3 mixColor = mix(color1, color2, uv.x);
        // Interpolação do resultado com color3 ao longo do eixo vertical
        vec3 finalColor = mix(mixColor, color3, uv.y);
        // Modula a intensidade da cor com o tempo (desacelerado por 0.5)
        finalColor *= 0.5 + 0.5 * sin(time * 0.5);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    side: THREE.BackSide,
  });

  useFrame(({ clock }) => {
    shaderMaterial.uniforms.time.value = clock.getElapsedTime();

    if (meshRef.current) {
      // Mantém o background fixo em posição e rotação
      meshRef.current.rotation.set(0, 0, 0);
      meshRef.current.position.set(0, 0, 0);
    }
  });

  return (
    <mesh ref={meshRef} scale={[100, 100, 100]}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
};

export default DynamicBackground;
