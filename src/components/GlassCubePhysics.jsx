import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import PropTypes from "prop-types";
import * as THREE from "three";
import { useRef } from "react";

const GlassCubePhysics = ({ transformRef }) => {
  const innerSize = 1.5;  // Tamanho do cubo (igual ao GlassCube.jsx)
  const thickness = 0.2;  // Espessura das paredes
  const halfSize = innerSize / 2;  // 0.75
  const tempVector = new THREE.Vector3();
  const tempQuat = new THREE.Quaternion();

  /**
   * Definimos um array com a configuração de cada parede:
   * - size: dimensões do corpo (useBox args)
   * - localPos: posição local (em relação ao centro do cubo)
   */
  const wallsConfig = [
    {
      name: "floor",
      size: [innerSize, thickness, innerSize],
      localPos: [0, -halfSize, 0],
    },
    {
      name: "ceiling",
      size: [innerSize, thickness, innerSize],
      localPos: [0, halfSize, 0],
    },
    {
      name: "left",
      size: [thickness, innerSize, innerSize],
      localPos: [-halfSize, 0, 0],
    },
    {
      name: "right",
      size: [thickness, innerSize, innerSize],
      localPos: [halfSize, 0, 0],
    },
    {
      name: "front",
      size: [innerSize, innerSize, thickness],
      localPos: [0, 0, -halfSize],
    },
    {
      name: "back",
      size: [innerSize, innerSize, thickness],
      localPos: [0, 0, halfSize],
    },
  ];

  /**
   * Para cada parede, chamamos useBox, definindo a posição inicial = localPos.
   * Retemos [ref, api] para cada.
   */
  const walls = wallsConfig.map((conf) => {
    const [ref, api] = useBox(() => ({
      type: "Kinematic",
      mass: 0,
      args: conf.size,
      // A posição inicial é conf.localPos, mas esse valor é só “placeholder”.
      // A cada frame, vamos recalcular e setar a posição real (global).
      position: conf.localPos,
    }));
    return { ...conf, ref, api };
  });

  // A cada frame, aplicamos a rotação/posição global do transformRef + o offset local
  useFrame(() => {
    if (!transformRef?.current) return;

    // Força atualização da matriz
    transformRef.current.updateMatrixWorld(true);

    // Pega posição e rotação globais do cubo
    const parentPos = transformRef.current.getWorldPosition(new THREE.Vector3());
    const parentQuat = transformRef.current.getWorldQuaternion(new THREE.Quaternion());

    // Para cada parede, calculamos a posição final = parentPos + (localPos rotacionado)
    walls.forEach(({ localPos, api }) => {
      // Rotaciona o offset local
      tempVector.set(localPos[0], localPos[1], localPos[2]);
      tempVector.applyQuaternion(parentQuat);

      // Soma ao parentPos
      const worldPos = parentPos.clone().add(tempVector);

      // Ajusta no Cannon
      api.position.set(worldPos.x, worldPos.y, worldPos.z);
      api.quaternion.set(parentQuat.x, parentQuat.y, parentQuat.z, parentQuat.w);
    });
  });

  // Renderizamos cada parede em wireframe para debug
  return (
    <group>
      {walls.map(({ name, ref, size }, i) => (
        <mesh key={name} ref={ref}>
          <boxGeometry args={size} />
          <meshBasicMaterial color="red" wireframe />
        </mesh>
      ))}
    </group>
  );
};

GlassCubePhysics.propTypes = {
  transformRef: PropTypes.shape({ current: PropTypes.any }),
};

export default GlassCubePhysics;
