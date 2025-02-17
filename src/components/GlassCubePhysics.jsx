// src/components/GlassCubePhysics.jsx
import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import PropTypes from "prop-types";

const GlassCubePhysics = ({ transformRef }) => {
  const innerSize = 1.5;
  const thickness = 0.2;
  const halfSize = innerSize / 2;
  const offsetAdjustment = 0; // Zere os offsets para sincronização

  // Para sincronização, usamos identidade para localQuat em todas as paredes.
  const walls = {
    floor: {
      localOffset: new THREE.Vector3(0, -halfSize - offsetAdjustment, 0),
      localQuat: new THREE.Quaternion(), // identidade
    },
    ceiling: {
      localOffset: new THREE.Vector3(0, halfSize + offsetAdjustment, 0),
      localQuat: new THREE.Quaternion(),
    },
    left: {
      localOffset: new THREE.Vector3(-halfSize - offsetAdjustment, 0, 0),
      localQuat: new THREE.Quaternion(),
    },
    right: {
      localOffset: new THREE.Vector3(halfSize + offsetAdjustment, 0, 0),
      localQuat: new THREE.Quaternion(),
    },
    front: {
      localOffset: new THREE.Vector3(0, 0, -halfSize - offsetAdjustment),
      localQuat: new THREE.Quaternion(),
    },
    back: {
      localOffset: new THREE.Vector3(0, 0, halfSize + offsetAdjustment),
      localQuat: new THREE.Quaternion(), // Evita rotação extra (antes era Euler(0, Math.PI, 0))
    },
  };

  const [floorRef, floorApi] = useBox(() => ({
    args: [innerSize, thickness, innerSize],
    type: "Kinematic",
    position: [0, -halfSize, 0],
  }));

  const [ceilingRef, ceilingApi] = useBox(() => ({
    args: [innerSize, thickness, innerSize],
    type: "Kinematic",
    position: [0, halfSize, 0],
  }));

  const [leftRef, leftApi] = useBox(() => ({
    args: [thickness, innerSize, innerSize],
    type: "Kinematic",
    position: [-halfSize, 0, 0],
  }));

  const [rightRef, rightApi] = useBox(() => ({
    args: [thickness, innerSize, innerSize],
    type: "Kinematic",
    position: [halfSize, 0, 0],
  }));

  const [frontRef, frontApi] = useBox(() => ({
    args: [innerSize, innerSize, thickness],
    type: "Kinematic",
    position: [0, 0, -halfSize],
  }));

  const [backRef, backApi] = useBox(() => ({
    args: [innerSize, innerSize, thickness],
    type: "Kinematic",
    position: [0, 0, halfSize],
  }));

  const tempVector = new THREE.Vector3();

  useFrame(() => {
    if (transformRef?.current) {
      transformRef.current.updateMatrixWorld();
      const parentQuat = transformRef.current.getWorldQuaternion(new THREE.Quaternion());
      const parentPos = new THREE.Vector3().setFromMatrixPosition(transformRef.current.matrixWorld);

      const updateWall = (wall, api) => {
        tempVector.copy(wall.localOffset).applyQuaternion(parentQuat);
        const worldPos = parentPos.clone().add(tempVector);
        const worldQuat = parentQuat.clone().multiply(wall.localQuat);
        api.position.set(worldPos.x, worldPos.y, worldPos.z);
        api.quaternion.set(worldQuat.x, worldQuat.y, worldQuat.z, worldQuat.w);
      };

      updateWall(walls.floor, floorApi);
      updateWall(walls.ceiling, ceilingApi);
      updateWall(walls.left, leftApi);
      updateWall(walls.right, rightApi);
      updateWall(walls.front, frontApi);
      updateWall(walls.back, backApi);
    }
  });

  return (
    <>
      <mesh ref={floorRef}>
        <boxGeometry args={[innerSize, thickness, innerSize]} />
        <meshStandardMaterial transparent color="white" opacity={0.1} />
      </mesh>
      <mesh ref={ceilingRef}>
        <boxGeometry args={[innerSize, thickness, innerSize]} />
        <meshStandardMaterial transparent color="white" opacity={0.1} />
      </mesh>
      <mesh ref={leftRef}>
        <boxGeometry args={[thickness, innerSize, innerSize]} />
        <meshStandardMaterial transparent color="white" opacity={0.1} />
      </mesh>
      <mesh ref={rightRef}>
        <boxGeometry args={[thickness, innerSize, innerSize]} />
        <meshStandardMaterial transparent color="white" opacity={0.1} />
      </mesh>
      <mesh ref={frontRef}>
        <boxGeometry args={[innerSize, innerSize, thickness]} />
        <meshStandardMaterial transparent color="white" opacity={0.1} />
      </mesh>
      <mesh ref={backRef}>
        <boxGeometry args={[innerSize, innerSize, thickness]} />
        <meshStandardMaterial transparent color="white" opacity={0.1} />
      </mesh>
    </>
  );
};

GlassCubePhysics.propTypes = {
  transformRef: PropTypes.shape({ current: PropTypes.any }),
};

export default GlassCubePhysics;
