// src/components/GlobalRotationController.jsx
import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const GlobalRotationController = ({
  children,
  sensitivity,
  transformRef,
  maxAngleX,
  maxAngleY,
  dragSensitivity,
  dampingFactor,
  inertialThreshold,
}) => {
  const internalRef = useRef();
  const groupRef = transformRef || internalRef;
  const { size } = useThree();

  const [targetQuaternion] = useState(() => new THREE.Quaternion());
  const [mode, setMode] = useState("follow");
  const lastMousePos = useRef({ x: 0, y: 0 });
  const inertialVelocity = useRef(new THREE.Vector2(0, 0));

  const onPointerDown = (event) => {
    setMode("drag");
    lastMousePos.current = { x: event.clientX, y: event.clientY };
    inertialVelocity.current.set(0, 0);
  };

  const onPointerMove = (event) => {
    if (mode === "drag") {
      const deltaX = event.clientX - lastMousePos.current.x;
      const deltaY = event.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: event.clientX, y: event.clientY };

      // Ajuste na sensibilidade do eixo X para reduzir giros verticais exagerados
      const angleY = deltaX * dragSensitivity;
      const angleX = deltaY * dragSensitivity * 0.8; // Menor impacto no eixo vertical

      // Criar quaternion para rotação incremental
      const incrementalEuler = new THREE.Euler(angleX, angleY, 0, 'XYZ');
      const incrementalQuat = new THREE.Quaternion().setFromEuler(incrementalEuler);

      // Aplica a rotação incremental respeitando a ordem global
      groupRef.current.quaternion.multiplyQuaternions(groupRef.current.quaternion, incrementalQuat);

      // Atualiza a velocidade inercial
      inertialVelocity.current.set(angleX, angleY);
    } else if (mode === "follow") {
      const normX = (event.clientX / size.width) * 2 - 1;
      const normY = (event.clientY / size.height) * 2 - 1;
      const targetAngleY = THREE.MathUtils.clamp(normX * maxAngleY, -maxAngleY, maxAngleY);
      const targetAngleX = THREE.MathUtils.clamp(normY * maxAngleX, -maxAngleX, maxAngleX);
      const euler = new THREE.Euler(targetAngleX, targetAngleY, 0, 'XYZ');
      targetQuaternion.setFromEuler(euler);
    }
  };

  const onPointerUp = () => {
    if (mode === "drag") {
      setMode("inertia");
      targetQuaternion.copy(groupRef.current.quaternion);
    }
  };

  useFrame(() => {
    if (!groupRef.current) return;

    if (mode === "inertia") {
      const incrementalEuler = new THREE.Euler(inertialVelocity.current.x, inertialVelocity.current.y, 0, 'XYZ');
      const incrementalQuat = new THREE.Quaternion().setFromEuler(incrementalEuler);
      groupRef.current.quaternion.multiplyQuaternions(groupRef.current.quaternion, incrementalQuat);

      inertialVelocity.current.multiplyScalar(dampingFactor);

      if (
        Math.abs(inertialVelocity.current.x) < inertialThreshold &&
        Math.abs(inertialVelocity.current.y) < inertialThreshold
      ) {
        setMode("follow");
        targetQuaternion.copy(groupRef.current.quaternion);
      }
    } else if (mode === "follow") {
      groupRef.current.quaternion.slerp(targetQuaternion, sensitivity);
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
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
  dragSensitivity: PropTypes.number,
  dampingFactor: PropTypes.number,
  inertialThreshold: PropTypes.number,
};

GlobalRotationController.defaultProps = {
  sensitivity: 0.1,
  maxAngleX: Math.PI / 8,
  maxAngleY: Math.PI / 32,
  dragSensitivity: 0.005,
  dampingFactor: 0.95,
  inertialThreshold: 0.0001,
};

export default GlobalRotationController;
