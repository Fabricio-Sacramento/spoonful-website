// src/components/FluidParticlesNoInstancing.jsx
import PropTypes from "prop-types";
import SingleParticle from "./SingleParticle";

export default function FluidParticlesNoInstancing({ numParticles = 100, globalTransformRef }) {
  const spawnRange = 1.0;

  // Gera posições aleatórias para cada partícula dentro do volume definido
  const particlesPositions = Array.from({ length: numParticles }, () => [
    Math.random() * spawnRange - spawnRange / 2,
    Math.random() * spawnRange - spawnRange / 2,
    Math.random() * spawnRange - spawnRange / 2,
  ]);

  return (
    <>
      {particlesPositions.map((pos, i) => (
        <SingleParticle
          key={i}
          initialPosition={pos}
          globalTransformRef={globalTransformRef}
        />
      ))}
    </>
  );
}

FluidParticlesNoInstancing.propTypes = {
  numParticles: PropTypes.number,
  globalTransformRef: PropTypes.object,
};
