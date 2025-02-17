// GlassCube.jsx
import { useState } from "react";
import * as THREE from "three";
import DynamicEnvMap from "./DynamicEnvMap";

const GlassCube = () => {
  const [envMap, setEnvMap] = useState(null);
  
  // Defina o tamanho do cubo
  const cubeSize = 1.5;

  return (
    <>
      <DynamicEnvMap setEnvMap={setEnvMap} />

      <mesh>
        {/* Utilize o cubeSize para definir as dimensões */}
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
        <meshPhysicalMaterial 
          color="white"
          roughness={0.0}
          metalness={0.1}
          transmission={1}
          ior={1}
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
