import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree, useLoader } from "@react-three/fiber";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

const Glass = () => {
  const glassRef = useRef();
  const wireframeRef = useRef();
  const { scene } = useThree();

  // 🔹 Carregar HDRI apenas para reflexos
  const envMap = useLoader(RGBELoader, "/src/assets/hdri/studio_small_08_4k.hdr");
  envMap.mapping = THREE.EquirectangularReflectionMapping;

  useEffect(() => {
    if (scene) {
      scene.environment = envMap; // 🔹 Apenas afeta reflexos
      scene.background = null; // 🔹 Mantém o fundo dinâmico visível
    }
  }, [scene, envMap]);

  return (
    <>
      {/* 🔹 Vidro Icosaédrico */}
      <mesh ref={glassRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshPhysicalMaterial
          attach="material" // 🔹 Garante que o material seja aplicado corretamente
          color={"white"}
          transparent
          opacity={0.7}
          roughness={0.05}
          metalness={0}
          transmission={1}
          ior={1.5}
          reflectivity={0.9}
          envMap={envMap}
          envMapIntensity={0.8}
          clearcoat={1}
          clearcoatRoughness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 🔹 Wireframe sobreposto para destacar as arestas */}
      <mesh ref={wireframeRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.55, 2]} />
        <meshBasicMaterial attach="material" color={"white"} wireframe transparent opacity={0.2} />
      </mesh>
    </>
  );
};

export default Glass;
