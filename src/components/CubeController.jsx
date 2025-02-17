// src/components/CubeController.jsx
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import PropTypes from "prop-types";
import GlassCube from "./GlassCube";
import * as THREE from "three";

const CubeController = ({ transformRef, compensationFactor }) => {
  // Ref para o grupo compensador que vai aplicar o fator
  const compensatorRef = useRef();

  useFrame(() => {
    if (transformRef?.current && compensatorRef.current) {
      // Obtém a rotação global (quaternion) do grupo pai
      const parentQuat = transformRef.current.getWorldQuaternion(new THREE.Quaternion());
      // Converte para Euler para poder manipular os ângulos
      const parentEuler = new THREE.Euler().setFromQuaternion(parentQuat, "XYZ");
      // Aplica o fator de compensação aos ângulos
      const compensatedEuler = new THREE.Euler(
        parentEuler.x * compensationFactor,
        parentEuler.y * compensationFactor,
        parentEuler.z * compensationFactor,
        "XYZ"
      );
      // Atualiza o quaternion do grupo compensador com os ângulos compensados
      compensatorRef.current.quaternion.setFromEuler(compensatedEuler);
    }
  });

  return (
    <group ref={compensatorRef}>
      <GlassCube />
    </group>
  );
};

CubeController.propTypes = {
  transformRef: PropTypes.shape({
    current: PropTypes.any,
  }),
  compensationFactor: PropTypes.number,
};

CubeController.defaultProps = {
  compensationFactor: 1, // Valor padrão; ajuste conforme necessário para alinhar o GlassCube
};

export default CubeController;
