import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";


const WaterParticles = () => {
  const particlesRef = useRef();
  const numParticles = 500; // 🔹 Aumentamos o número de partículas para melhor efeito

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(numParticles * 3);
    for (let i = 0; i < numParticles; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5; // 🔹 Distribuição no eixo X
      positions[i * 3 + 1] = (Math.random() * 0.5) - 0.5; // 🔹 Mantendo dentro da metade inferior do cubo (Y)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5; // 🔹 Distribuição no eixo Z
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < numParticles; i++) {
        positions[i * 3 + 1] += Math.sin(time + i * 0.01) * 0.002; // 🔹 Suave ondulação vertical
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
        color="#00aaff"
        size={0.05} // 🔹 Ajuste de tamanho das partículas
        transparent
        opacity={0.8}
      />
    </points>
  );
};

export default WaterParticles;
