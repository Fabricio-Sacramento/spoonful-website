import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import DynamicEnvMap from "./DynamicEnvMap";


const GlassCube = () => {
  const groupRef = useRef(); // 🔹 Criamos um grupo para conter o cubo e as partículas
  const [envMap, setEnvMap] = useState(null);
  const rotationSpeed = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    rotationSpeed.current = {
      x: (Math.random() * 0.02) - 0.01,
      y: (Math.random() * 0.02) - 0.01,
      z: (Math.random() * 0.02) - 0.01,
    };
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += rotationSpeed.current.x;
      groupRef.current.rotation.y += rotationSpeed.current.y;
      groupRef.current.rotation.z += rotationSpeed.current.z;
    }
  });

  return (
    <>
      <DynamicEnvMap setEnvMap={setEnvMap} />

      {/* 🔹 Agrupamos o cubo e as partículas para que compartilhem a rotação */}
      <group ref={groupRef}>
        <mesh>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshPhysicalMaterial 
            color="white"
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
      </group>
    </>
  );
};

export default GlassCube;
