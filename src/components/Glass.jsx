import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { DynamicEnvMap } from "./DynamicEnvMap"; // 🔹 Novo Environment Map Dinâmico

const Glass = () => {
  const glassRef = useRef();
  const { scene } = useThree();

  useEffect(() => {
    if (scene) {
      scene.environment = DynamicEnvMap; // 🔹 Agora reflete dinamicamente o background
      scene.background = null; // 🔹 Mantém o fundo dinâmico visível
    }
  }, [scene]);

  return (
    <>
      {/* 🔹 Icosaedro de vidro */}
      <mesh ref={glassRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshPhysicalMaterial
          color="white"
          transparent
          opacity={0.15} // 🔹 Aumenta a transparência
          roughness={0.3} // 🔹 Superfície lisa para refletir melhor a luz
          metalness={0.3} // 🔹 Remove aparência metálica
          transmission={0.9} // 🔹 Garante transparência realista
          thickness={0.1} // 🔹 Define a espessura do vidro
          ior={1.5} // 🔹 Índice de refração para efeito de distorção
          reflectivity={0.9} // 🔹 Torna o material reflexivo
          envMap={DynamicEnvMap} // 🔹 O reflexo vem do background dinâmico
          envMapIntensity={0.3} // 🔹 Ajuste da intensidade do reflexo
          clearcoat={1} // 🔹 Dá brilho extra nas bordas
          clearcoatRoughness={0} // 🔹 Mantém um acabamento espelhado
          side={THREE.DoubleSide} // 🔹 Reflexo interno e externo
        />
      </mesh>

      {/* 🔹 Wireframe sutil para destacar as arestas */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshBasicMaterial 
          color="white"
          wireframe 
          transparent
          opacity={0.15} // 🔹 Mantém um wireframe sutil
        />
      </mesh>
    </>
  );
};

export default Glass;
