// CubeController.jsx
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import PropTypes from "prop-types";
import GlassCube from "./GlassCube";



const CubeController = ({ transformRef }) => {
  // Se o transformRef não for passado, crie um ref local (fallback)
  const localRef = useRef();
  const controllerRef = transformRef || localRef;

  // Rotação inicial (pode ser aleatória ou fixa)
  const rotationSpeed = useRef({
    x: (Math.random() * 0.02) - 0.01,
    y: (Math.random() * 0.02) - 0.01,
    z: (Math.random() * 0.02) - 0.01,
  });

  useFrame(() => {
    if (controllerRef.current) {
      controllerRef.current.rotation.x += rotationSpeed.current.x;
      controllerRef.current.rotation.y += rotationSpeed.current.y;
      controllerRef.current.rotation.z += rotationSpeed.current.z;
    }
  });

  return (
    <group ref={controllerRef}>
      <GlassCube />
    </group>
  );
};

CubeController.propTypes = {
  // Aqui, estamos dizendo que transformRef deve ser um objeto
  // Se quiser ser mais específico, podemos usar shape ou outra forma
  transformRef: PropTypes.shape({
    current: PropTypes.object,
  }),
};


export default CubeController;
