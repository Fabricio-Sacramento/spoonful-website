import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

const DynamicEnvMap = () => {
  const { scene, gl } = useThree();
  const cubeRenderTarget = useRef(new THREE.WebGLCubeRenderTarget(256));
  const cubeCamera = useRef(new THREE.CubeCamera(0.1, 20, cubeRenderTarget.current));

  useFrame(() => {
    cubeCamera.current.update(gl, scene);
  });

  return <primitive object={cubeCamera.current} />;
};

export { DynamicEnvMap };
