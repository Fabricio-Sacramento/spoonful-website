// src/components/GlobalRotationController.jsx
import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Controlador que faz o grupo "olhar" para o mouse.
 * Usa as dimensões do canvas para normalizar as coordenadas do mouse e interpola a rotação atual para a orientação alvo.
 */
const GlobalRotationController = ({ children, sensitivity, transformRef, maxAngleX, maxAngleY }) => {
  const internalRef = useRef();
  const groupRef = transformRef || internalRef;
  const { size } = useThree();

  const [targetQuaternion] = useState(() => new THREE.Quaternion());

  const onPointerMove = (event) => {
    const normX = (event.clientX / size.width) * 2 - 1;  // -1 à direita, +1 à esquerda
    const normY = (event.clientY / size.height) * 2 - 1; // -1 no topo, +1 na base

    const targetAngleY = THREE.MathUtils.clamp(normX * maxAngleY, -maxAngleY, maxAngleY);
    const targetAngleX = THREE.MathUtils.clamp(normY * maxAngleX, -maxAngleX, maxAngleX);

    const euler = new THREE.Euler(targetAngleX, targetAngleY, 0, 'XYZ');
    targetQuaternion.setFromEuler(euler);
  };

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.quaternion.slerp(targetQuaternion, sensitivity);
  });

  return (
    <group ref={groupRef} onPointerMove={onPointerMove}>
      {children}
    </group>
  );
};

GlobalRotationController.propTypes = {
  children: PropTypes.node,
  sensitivity: PropTypes.number,
  transformRef: PropTypes.shape({ current: PropTypes.any }),
  maxAngleX: PropTypes.number,
  maxAngleY: PropTypes.number,
};

GlobalRotationController.defaultProps = {
  sensitivity: 0.1,
  maxAngleX: Math.PI / 8,
  maxAngleY: Math.PI / 4,
};

export default GlobalRotationController;
