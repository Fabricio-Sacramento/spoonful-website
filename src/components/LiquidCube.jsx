import { useRef, useState } from "react"; // 🔹 Adicionando useState
import { useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import DynamicEnvMap from "./DynamicEnvMap";

// 🔹 Shader para deformação do cubo líquido
const LiquidShaderMaterial = shaderMaterial(
  {
    time: 0,
    envMap: null,
  },
  `
    varying vec3 vNormal;
    varying vec3 vPosition;

    uniform float time;

    void main() {
        vNormal = normal;
        vPosition = position;

        // 🔹 Simulação de fluidez: deslocamos os vértices com senoides
        vec3 pos = position;
        pos.y += sin(pos.x * 3.0 + time) * 0.2;
        pos.x += sin(pos.z * 3.0 + time) * 0.2;
        pos.z += sin(pos.y * 3.0 + time) * 0.2;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  `
    uniform samplerCube envMap;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vec3 viewDir = normalize(vPosition - cameraPosition);
        vec3 reflectDir = reflect(viewDir, normalize(vNormal));
        vec4 reflectedColor = textureCube(envMap, reflectDir);

        // 🔹 Mistura de cores para efeito de líquido transparente e reflexivo
        vec3 liquidColor = mix(vec3(0.1, 0.5, 0.8), reflectedColor.rgb, 0.5);

        gl_FragColor = vec4(liquidColor, 0.7);
    }
  `
);

extend({ LiquidShaderMaterial });

const LiquidCube = () => {
    const materialRef = useRef();
    const [envMap, setEnvMap] = useState(null);
  
    useFrame(({ clock }) => {
      if (materialRef.current) {
        materialRef.current.uniforms.time.value = clock.getElapsedTime();
  
        if (envMap && materialRef.current.uniforms.envMap.value !== envMap) {
          materialRef.current.uniforms.envMap.value = envMap;
        }
      }
    });
  
    return (
      <>
        <DynamicEnvMap setEnvMap={setEnvMap} />
  
        <mesh>
          <boxGeometry args={[2, 2, 2, 32, 32, 32]} />
          {envMap ? (
            <liquidShaderMaterial ref={materialRef} envMap={envMap} />
          ) : (
            <meshBasicMaterial color="white" wireframe />
          )}
        </mesh>
      </>
    );
  };
  

export default LiquidCube;
