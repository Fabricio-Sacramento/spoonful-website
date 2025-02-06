import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

const Glass = () => {
  const glassRef = useRef();
  const wireframeRef = useRef();
  const { scene } = useThree();

  // 🔹 Carregar um HDRI para melhorar os reflexos SEM substituir o fundo
  const envMap = useLoader(RGBELoader, "/hdri/studio_small_08_4k.hdr");
  envMap.mapping = THREE.EquirectangularReflectionMapping;

  useEffect(() => {
    scene.environment = envMap; // 🔹 HDRI afeta apenas reflexos, não o fundo
    scene.background = null; // 🔹 Mantém o fundo dinâmico visível
  }, [scene, envMap]);

  return (
    <>
      {/* 🔹 Vidro Icosaédrico */}
      <mesh ref={glassRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshPhysicalMaterial 
          color="white"
          transparent
          opacity={0.7}
          roughness={0.1} // 🔹 Mantém alguma rugosidade para não parecer "plástico"
          metalness={0.1} // 🔹 Leve toque metálico para mais brilho
          transmission={1.5} // 🔹 Mantém a transparência realista
          ior={5} // 🔹 Índice de refração para um efeito realista de vidro
          reflectivity={1} // 🔹 Reduz um pouco a reflexão para equilibrar
          envMap={envMap} // 🔹 HDRI agora afeta apenas os reflexos do vidro
          envMapIntensity={0.9} // 🔹 Reduz a intensidade do HDRI nos reflexos
          clearcoat={1} // 🔹 Garante brilho extra no vidro
          side={THREE.DoubleSide} // 🔹 Permite visualizar os reflexos de ambos os lados
        />
      </mesh>

      {/* 🔹 Wireframe sobreposto para destacar as arestas */}
      <mesh ref={wireframeRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.6, 2]} />
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
