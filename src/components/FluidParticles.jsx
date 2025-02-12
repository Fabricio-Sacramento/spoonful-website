import { useSphere } from "@react-three/cannon";
import PropTypes from "prop-types"; // 🔥 Importação correta para validação de props

const FluidParticles = ({ numParticles = 1000 }) => {
  // Criando corpos físicos para as partículas
  const [ref] = useSphere(() => ({
    mass: 0.1,
    args: [0.05], // 🔥 Mantemos o tamanho pequeno
    position: [
      (Math.random() * 1.6) - 0.8, // 🔥 X (mantém dentro do cubo)
      (Math.random() * 1.6) - 0.8, // 🔥 Y (mantém dentro do cubo)
      (Math.random() * 1.6) - 0.8, // 🔥 Z (mantém dentro do cubo)
    ],
  }));
  
  
  return (
    <instancedMesh ref={ref} args={[null, null, numParticles]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color="red" />
    </instancedMesh>
  );
};

// 🔥 Adicionando validação de props para evitar erro no ESLint
FluidParticles.propTypes = {
  numParticles: PropTypes.number, // `numParticles` deve ser um número
};

export default FluidParticles;
