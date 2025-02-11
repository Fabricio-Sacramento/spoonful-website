import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

const WaterParticles = () => {
  const particlesRef = useRef();
  const numParticles = 1000; // 🔹 Aumentamos o número de partículas para um efeito mais denso

  // 🔹 Carregamos a textura para suavizar as partículas
  const particleTexture = useLoader(THREE.TextureLoader, "/textures/water-texture-01.jpg");

  // 🔹 Criamos as posições iniciais das partículas dentro do cubo
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(numParticles * 3);
    for (let i = 0; i < numParticles; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.3; // X
      positions[i * 3 + 1] = (Math.random() * 0.6) - 0.8; // 🔹 Mantendo as partículas na parte inferior do cubo (Y)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.3; // Z
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < numParticles; i++) {
        const idx = i * 3;
        
        // 🔹 Simulação de oscilação suave, como pequenas ondas
        positions[idx + 1] += Math.sin(time * 2 + i * 0.01) * 0.002; // Movimento vertical suave
        
        // 🔹 Movimento em X e Z para criar um efeito mais natural
        positions[idx] += (Math.random() - 0.5) * 0.0015;
        positions[idx + 2] += (Math.random() - 0.5) * 0.0015;

        // 🔹 Limita as partículas para que não escapem do cubo
        positions[idx] = Math.max(-1.3, Math.min(1.3, positions[idx]));
        positions[idx + 1] = Math.max(-0.8, Math.min(0.2, positions[idx + 1])); // Mantém a água dentro da metade inferior
        positions[idx + 2] = Math.max(-1.3, Math.min(1.3, positions[idx + 2]));
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={particlePositions}
          itemSize={3}
          count={numParticles}
        />
      </bufferGeometry>
      <pointsMaterial
        map={particleTexture} // 🔹 Aplica a textura para suavizar as partículas
        color="#00aaff"
        size={0.05}
        transparent
        opacity={0.8}
        depthWrite={false} // 🔹 Evita que as partículas tenham sombras estranhas
        alphaTest={0.5} // 🔹 Suaviza bordas
        sizeAttenuation={true} // 🔹 Faz as partículas parecerem mais naturais
      />
    </points>
  );
};

export default WaterParticles;
