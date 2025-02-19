// src/components/SingleParticle.jsx
import { useSphere } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import PropTypes from "prop-types";

export default function SingleParticle({ initialPosition, globalTransformRef }) {
  const radius = 0.1;

  // Configuração: diminua um pouco o damping para permitir aceleração
  const [ref, api] = useSphere(() => ({
    mass: 1,
    args: [radius],
    position: initialPosition,
    linearDamping: 0.00001, // menor damping para que a partícula não perca tanta velocidade
    angularDamping: 0.00001,
  }));

  // Vetores temporários para o cálculo da força
  const tempVector = new THREE.Vector3();
  const tempQuat = new THREE.Quaternion();

  useFrame(() => {
    if (globalTransformRef?.current) {
      // Pega a rotação do objeto pai
      globalTransformRef.current.getWorldQuaternion(tempQuat);
      // Define o vetor "para baixo" e o transforma conforme a rotação do pai
      tempVector.set(0, -1, 0)
        .applyQuaternion(tempQuat)
        // Aumenta a força para compensar o damping
        .multiplyScalar(30);
    } else {
      tempVector.set(0, 0, 0);
    }
    // Aplica a força na partícula
    api.applyForce([tempVector.x, tempVector.y, tempVector.z], [0, -9.81, 0]);
  });

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

SingleParticle.propTypes = {
  initialPosition: PropTypes.arrayOf(PropTypes.number).isRequired,
  globalTransformRef: PropTypes.object,
};
