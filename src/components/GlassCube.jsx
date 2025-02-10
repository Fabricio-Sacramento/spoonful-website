import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import DynamicEnvMap from "./DynamicEnvMap";

const GlassCube = () => {
  const cubeRef = useRef();
  const [envMap, setEnvMap] = useState(null);

  // 🔹 Usamos useRef para armazenar a velocidade de rotação
  const rotationSpeed = useRef({ x: 0, y: 0, z: 0 });

  // 🔹 Definimos valores aleatórios de rotação no carregamento
  useEffect(() => {
    rotationSpeed.current = {
      x: (Math.random() * 0.02) - 0.01, // 🔹 Valor entre -0.01 e 0.01
      y: (Math.random() * 0.02) - 0.01,
      z: (Math.random() * 0.02) - 0.01,
    };
  }, []);

  useFrame(() => {
    if (cubeRef.current) {
      // 🔹 Aplicamos a rotação constante ao cubo
      cubeRef.current.rotation.x += rotationSpeed.current.x;
      cubeRef.current.rotation.y += rotationSpeed.current.y;
      cubeRef.current.rotation.z += rotationSpeed.current.z;

      // 🔹 Mantemos o environment map atualizado
      cubeRef.current.material.envMap = envMap;
      cubeRef.current.material.needsUpdate = true;
    }
  });

  return (
    <>
      <DynamicEnvMap setEnvMap={setEnvMap} />

      <mesh ref={cubeRef}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshPhysicalMaterial 
          color="white"
          //transparent
          //opacity={0.3}
          roughness={0.0}
          metalness={0.1}
          transmission={1}
          ior={1.5}
          thickness={0.5}
          clearcoat={1}
          envMap={envMap}
          envMapIntensity={1.5}
          reflectivity={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
};

export default GlassCube;
