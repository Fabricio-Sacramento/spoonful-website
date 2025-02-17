import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import PropTypes from "prop-types";
import * as THREE from "three";

const GlassCubePhysics = ({ transformRef }) => {
  const innerSize = 1.5; // mesmo tamanho do GlassCube
  const thickness = 0.2; // espessura das paredes
  const halfSize = innerSize / 2; // 0.75
  //const halfThickness = thickness / 2; // 0.1
  const tempVector = new THREE.Vector3(); // reusável a cada frame

  // Definimos offsets locais para cada parede (posição local em relação ao centro do cubo)
  const floorOffset   = new THREE.Vector3(0, -halfSize, 0);
  const ceilingOffset = new THREE.Vector3(0,  halfSize, 0);
  const leftOffset    = new THREE.Vector3(-halfSize, 0, 0);
  const rightOffset   = new THREE.Vector3( halfSize, 0, 0);
  const frontOffset   = new THREE.Vector3(0, 0, -halfSize);
  const backOffset    = new THREE.Vector3(0, 0,  halfSize);

  // PISO
  const [floorRef, floorApi] = useBox(() => ({
    type: "Kinematic",
    mass: 0,
    args: [innerSize, thickness, innerSize], // x=1.5, y=0.2, z=1.5
    position: [0, -halfSize, 0], // posição inicial, mas será sobrescrita no useFrame
  }));

  // TETO
  const [ceilingRef, ceilingApi] = useBox(() => ({
    type: "Kinematic",
    mass: 0,
    args: [innerSize, thickness, innerSize],
    position: [0, halfSize, 0],
  }));

  // PAREDE ESQUERDA
  const [leftRef, leftApi] = useBox(() => ({
    type: "Kinematic",
    mass: 0,
    args: [thickness, innerSize, innerSize],
    position: [-halfSize, 0, 0],
  }));

  // PAREDE DIREITA
  const [rightRef, rightApi] = useBox(() => ({
    type: "Kinematic",
    mass: 0,
    args: [thickness, innerSize, innerSize],
    position: [halfSize, 0, 0],
  }));

  // PAREDE FRONTAL
  const [frontRef, frontApi] = useBox(() => ({
    type: "Kinematic",
    mass: 0,
    args: [innerSize, innerSize, thickness],
    position: [0, 0, -halfSize],
  }));

  // PAREDE TRASEIRA
  const [backRef, backApi] = useBox(() => ({
    type: "Kinematic",
    mass: 0,
    args: [innerSize, innerSize, thickness],
    position: [0, 0, halfSize],
  }));

  // useFrame: a cada frame, rotacionamos o offset local de cada parede e somamos à posição global
  useFrame(() => {
    if (!transformRef?.current) return;

    // Força atualização do parent
    transformRef.current.updateMatrixWorld(true);

    // Pega posição e rotação globais
    const parentPos = transformRef.current.getWorldPosition(new THREE.Vector3());
    const parentQuat = transformRef.current.getWorldQuaternion(new THREE.Quaternion());

    // Função auxiliar para atualizar uma parede
    const updateWall = (offset, api) => {
      // offset local rotacionado
      tempVector.copy(offset).applyQuaternion(parentQuat);
      const worldPos = parentPos.clone().add(tempVector);

      api.position.set(worldPos.x, worldPos.y, worldPos.z);
      api.quaternion.set(parentQuat.x, parentQuat.y, parentQuat.z, parentQuat.w);
    };

    // Atualizamos cada parede
    updateWall(floorOffset,   floorApi);
    updateWall(ceilingOffset, ceilingApi);
    updateWall(leftOffset,    leftApi);
    updateWall(rightOffset,   rightApi);
    updateWall(frontOffset,   frontApi);
    updateWall(backOffset,    backApi);
  });

  return (
    <group>
      {/* Renderizamos cada parede em wireframe para debug */}
      <mesh ref={floorRef}>
        <boxGeometry args={[innerSize, thickness, innerSize]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>

      <mesh ref={ceilingRef}>
        <boxGeometry args={[innerSize, thickness, innerSize]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>

      <mesh ref={leftRef}>
        <boxGeometry args={[thickness, innerSize, innerSize]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>

      <mesh ref={rightRef}>
        <boxGeometry args={[thickness, innerSize, innerSize]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>

      <mesh ref={frontRef}>
        <boxGeometry args={[innerSize, innerSize, thickness]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>

      <mesh ref={backRef}>
        <boxGeometry args={[innerSize, innerSize, thickness]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>
    </group>
  );
};

GlassCubePhysics.propTypes = {
  transformRef: PropTypes.shape({
    current: PropTypes.any,
  }),
};

export default GlassCubePhysics;
