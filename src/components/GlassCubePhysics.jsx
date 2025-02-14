import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import PropTypes from "prop-types";

const GlassCubePhysics = ({ transformRef }) => {
  // Tamanho interno do cubo
  const innerSize = 1.5;
  const thickness = 0.2;
  const halfSize = innerSize / 2;

  // Defina um pequeno ajuste para fechar os gaps (valor em unidades; ajuste conforme necessário)
const offsetAdjustment = 0.01;

const walls = {
  floor: {
    // Empurra levemente para baixo para fechar eventuais brechas
    localOffset: new THREE.Vector3(0, -halfSize - offsetAdjustment, 0),
    localRotation: new THREE.Euler(0, 0, 0),
  },
  ceiling: {
    // Empurra levemente para cima
    localOffset: new THREE.Vector3(0, halfSize + offsetAdjustment, 0),
    localRotation: new THREE.Euler(0, 0, 0),
  },
  left: {
    // Empurra para a esquerda (mais negativo) para garantir o fechamento na lateral
    localOffset: new THREE.Vector3(-halfSize - offsetAdjustment, 0, 0),
    localRotation: new THREE.Euler(0, 0, 0),
  },
  right: {
    // Empurra para a direita (mais positivo)
    localOffset: new THREE.Vector3(halfSize + offsetAdjustment, 0, 0),
    localRotation: new THREE.Euler(0, 0, 0),
  },
  front: {
    // Empurra para frente (mais negativo no eixo Z)
    localOffset: new THREE.Vector3(0, 0, -halfSize - offsetAdjustment),
    localRotation: new THREE.Euler(0, 0, 0),
  },
  back: {
    // Empurra para trás (mais positivo no eixo Z)
    localOffset: new THREE.Vector3(0, 0, halfSize + offsetAdjustment),
    localRotation: new THREE.Euler(0, Math.PI, 0),
  },
};

  

  // useBox para cada parede
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

  // Vetores auxiliares
  const tempVector = new THREE.Vector3();

  useFrame(() => {
    if (transformRef?.current) {
      transformRef.current.updateMatrixWorld();
      const parentMatrix = transformRef.current.matrixWorld;
      const parentQuat = transformRef.current.getWorldQuaternion(new THREE.Quaternion());
      const parentPos = new THREE.Vector3().setFromMatrixPosition(parentMatrix);

      const updateWall = (wall, api) => {
        // Offset local + rotação do pai
        tempVector.copy(wall.localOffset).applyQuaternion(parentQuat);
        const worldPos = parentPos.clone().add(tempVector);

        // Rotação global = rotPai * rotLocal
        const localQuat = new THREE.Quaternion().setFromEuler(wall.localRotation);
        const worldQuat = parentQuat.clone().multiply(localQuat);

        // Atualizar posição
        api.position.set(worldPos.x, worldPos.y, worldPos.z);

        // Converter quaternion em Euler para API do Cannon
        const euler = new THREE.Euler().setFromQuaternion(worldQuat);
        api.rotation.set(euler.x, euler.y, euler.z);
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
        <meshStandardMaterial transparent color="white" opacity={0.1}/>
      </mesh>
      <mesh ref={ceilingRef}>
        <boxGeometry args={[innerSize, thickness, innerSize]} />
        <meshStandardMaterial transparent color="white" opacity={0.1}/>
      </mesh>
      <mesh ref={leftRef}>
        <boxGeometry args={[thickness, innerSize, innerSize]} />
        <meshStandardMaterial transparent color="white" opacity={0.1}/>
      </mesh>
      <mesh ref={rightRef}>
        <boxGeometry args={[thickness, innerSize, innerSize]} />
        <meshStandardMaterial transparent color="white" opacity={0.1}/>
      </mesh>
      <mesh ref={frontRef}>
        <boxGeometry args={[innerSize, innerSize, thickness]} />
        <meshStandardMaterial transparent color="white" opacity={0.1}/>
      </mesh>
      <mesh ref={backRef}>
        <boxGeometry args={[innerSize, innerSize, thickness]} />
        <meshStandardMaterial transparent color="white" opacity={0.1}/>
      </mesh>
    </>
  );
};

// 🔥 Validando as props para satisfazer o ESLint
GlassCubePhysics.propTypes = {
  transformRef: PropTypes.shape({
    current: PropTypes.object,
  }),
};

export default GlassCubePhysics;
