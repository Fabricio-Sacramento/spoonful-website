// src/components/GlassCubePhysics.jsx
import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import PropTypes from "prop-types";
import * as THREE from "three";

const GlassCubePhysics = ({ transformRef }) => {
  const innerSize = 1.5; // mesmo tamanho do GlassCube
  const thickness = 0.2; // espessura das paredes
  const halfSize = innerSize / 2; // 0.75
  const tempVector = new THREE.Vector3(); // reusável a cada frame

  // Offsets locais para cada parede
  const floorOffset   = new THREE.Vector3(0, -halfSize, 0);
  const ceilingOffset = new THREE.Vector3(0,  halfSize, 0);
  const leftOffset    = new THREE.Vector3(-halfSize, 0, 0);
  const rightOffset   = new THREE.Vector3( halfSize, 0, 0);
  const frontOffset   = new THREE.Vector3(0, 0, -halfSize);
  const backOffset    = new THREE.Vector3(0, 0,  halfSize);

  // Em vez de [ref, api], ignoramos o ref usando [ , api]
  const [, floorApi] = useBox(() => ({
    type: "Kinematic",
    mass: 0,
    args: [innerSize, thickness, innerSize],
    position: [0, -halfSize, 0],
  }));

  const [, ceilingApi] = useBox(() => ({
    type: "Kinematic",
    mass: 0,
    args: [innerSize, thickness, innerSize],
    position: [0, halfSize, 0],
  }));

  const [, leftApi] = useBox(() => ({
    type: "Kinematic",
    mass: 0,
    args: [thickness, innerSize, innerSize],
    position: [-halfSize, 0, 0],
  }));

  const [, rightApi] = useBox(() => ({
    type: "Kinematic",
    mass: 0,
    args: [thickness, innerSize, innerSize],
    position: [halfSize, 0, 0],
  }));

  const [, frontApi] = useBox(() => ({
    type: "Kinematic",
    mass: 0,
    args: [innerSize, innerSize, thickness],
    position: [0, 0, -halfSize],
  }));

  const [, backApi] = useBox(() => ({
    type: "Kinematic",
    mass: 0,
    args: [innerSize, innerSize, thickness],
    position: [0, 0, halfSize],
  }));

  // useFrame: a cada frame, aplicamos o offset local rotacionado para cada parede
  useFrame(() => {
    if (!transformRef?.current) return;

    transformRef.current.updateMatrixWorld(true);

    const parentPos = transformRef.current.getWorldPosition(new THREE.Vector3());
    const parentQuat = transformRef.current.getWorldQuaternion(new THREE.Quaternion());

    const updateWall = (offset, api) => {
      tempVector.copy(offset).applyQuaternion(parentQuat);
      const worldPos = parentPos.clone().add(tempVector);
      api.position.set(worldPos.x, worldPos.y, worldPos.z);
      api.quaternion.set(parentQuat.x, parentQuat.y, parentQuat.z, parentQuat.w);
    };

    updateWall(floorOffset,   floorApi);
    updateWall(ceilingOffset, ceilingApi);
    updateWall(leftOffset,    leftApi);
    updateWall(rightOffset,   rightApi);
    updateWall(frontOffset,   frontApi);
    updateWall(backOffset,    backApi);
  });

  // Retornamos um <group /> vazio, pois não renderizamos nada
  return <group />;
};

GlassCubePhysics.propTypes = {
  transformRef: PropTypes.shape({
    current: PropTypes.any,
  }),
};

export default GlassCubePhysics;
