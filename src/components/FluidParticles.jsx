import { useSphere } from "@react-three/cannon";
import PropTypes from "prop-types";

const FluidParticles = ({ numParticles = 300 }) => {
  const particleRadius = 0.07;
  const spawnRange = 1.0;

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
