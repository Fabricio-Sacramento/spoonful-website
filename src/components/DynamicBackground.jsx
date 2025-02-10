import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const DynamicBackground = () => {
  const meshRef = useRef();
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
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
      varying vec2 vUv;
      void main() {
          vec2 uv = vUv;
          vec3 color = vec3(uv, 0.5 + 0.5 * sin(time));
          gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.BackSide,
  });

  useFrame(({ clock }) => {
    shaderMaterial.uniforms.time.value = clock.getElapsedTime();

    if (meshRef.current) {
      // 🔹 Mantém a rotação do background fixa
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
