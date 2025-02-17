// src/components/CubeController.jsx
import { useRef } from "react";
import PropTypes from "prop-types";
import GlassCube from "./GlassCube";

const CubeController = ({ transformRef }) => {
  // Usa o ref recebido (ou cria um fallback, se necessário)
  const localRef = useRef();
  const groupRef = transformRef || localRef;

  return (
    <group ref={groupRef}>
      <GlassCube />
    </group>
  );
};

CubeController.propTypes = {
  transformRef: PropTypes.shape({
    current: PropTypes.any,
  }),
};

export default CubeController;
