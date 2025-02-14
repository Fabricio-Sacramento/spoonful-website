import { useSphere } from "@react-three/cannon";
import PropTypes from "prop-types";

const FluidParticles = ({ numParticles = 1000 }) => {
  // Defina o tamanho reduzido das partículas
  const particleRadius = 0.025;
  // Define a faixa de spawn (área em que as partículas serão criadas)
  const spawnRange = 1.0; // As partículas serão geradas entre -0.5 e 0.5 em cada eixo

  // Criando corpos físicos para as partículas com tamanho reduzido e área de spawn centralizada
  const [ref] = useSphere(() => ({
    mass: 0.1,
    args: [particleRadius],
    position: [
      (Math.random() * spawnRange) - (spawnRange / 2),
      (Math.random() * spawnRange) - (spawnRange / 2),
      (Math.random() * spawnRange) - (spawnRange / 2),
    ],
  }));

  return (
    <instancedMesh ref={ref} args={[null, null, numParticles]}>
      <sphereGeometry args={[particleRadius, 8, 8]} />
      <meshStandardMaterial color="blue" />
    </instancedMesh>
  );
};

FluidParticles.propTypes = {
  numParticles: PropTypes.number,
};

export default FluidParticles;
