import { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types"; // 🔹 Importa PropTypes
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";

const DynamicEnvMap = ({ setEnvMap }) => {
  const { scene, gl } = useThree();
  const [cubeRenderTarget] = useState(() => new THREE.WebGLCubeRenderTarget(256));
  const cubeCamera = useRef(new THREE.CubeCamera(0.1, 100, cubeRenderTarget));

  useEffect(() => {
    if (setEnvMap) {
      setEnvMap(cubeRenderTarget.texture);
    }
  }, [cubeRenderTarget, setEnvMap]);

  useFrame(() => {
    if (cubeCamera.current) {
      cubeCamera.current.update(gl, scene); // 🔹 Atualiza o environment map em tempo real
    }
  });

  return <primitive object={cubeCamera.current} />;
};

// 🔹 Adiciona validação de props
DynamicEnvMap.propTypes = {
  setEnvMap: PropTypes.func.isRequired, // 🔹 Garante que é uma função obrigatória
};

export default DynamicEnvMap;
