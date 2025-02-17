// src/components/CubeController.jsx
import { useRef } from "react";
import PropTypes from "prop-types";
import GlassCube from "./GlassCube";

const CubeController = ({ transformRef }) => {
  // Use o ref recebido (ou crie um fallback)
  const localRef = useRef();
  const groupRef = transformRef || localRef;

  // Removemos a rotação autônoma; esse componente apenas renderiza o GlassCube
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
