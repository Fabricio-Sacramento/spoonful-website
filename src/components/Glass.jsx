import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import DynamicEnvMap from "./DynamicEnvMap";

const Glass = () => {
  const glassRef = useRef();
  const [envMap, setEnvMap] = useState(null);

  useFrame(() => {
    if (glassRef.current) {
      glassRef.current.material.envMap = envMap;
      glassRef.current.material.needsUpdate = true;
    }
  });

  return (
    <>
      <DynamicEnvMap setEnvMap={setEnvMap} />

      <mesh ref={glassRef}>
        <icosahedronGeometry args={[3.5, 2]} />
        <meshPhysicalMaterial 
          //color="white"
          transparent
          opacity={0.3}
          roughness={0.05}
          metalness={0}
          transmission={1.3}
          thickness={0.3}
          ior={1}
          reflectivity={1}
          envMap={envMap}
          envMapIntensity={3}
          clearcoat={1}
          clearcoatRoughness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshBasicMaterial color="white" transparent opacity={1} />
      </mesh>
    </>
  );
};

export default Glass;
