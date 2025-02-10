import { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";

const DynamicEnvMap = ({ setEnvMap }) => {
  const { scene, gl } = useThree();

  const [cubeRenderTarget] = useState(() => {
    const rt = new THREE.WebGLCubeRenderTarget(256);
    rt.texture.encoding = THREE.sRGBEncoding;
    return rt;
  });

  const cubeCamera = useRef(new THREE.CubeCamera(0.1, 100, cubeRenderTarget));

  useEffect(() => {
    if (setEnvMap) {
      setEnvMap(cubeRenderTarget.texture);
    }
  }, [cubeRenderTarget, setEnvMap]);

  useFrame(() => {
    if (cubeCamera.current) {
      cubeCamera.current.update(gl, scene);
    }
  });

  return <primitive object={cubeCamera.current} />;
};

DynamicEnvMap.propTypes = {
  setEnvMap: PropTypes.func.isRequired,
};

export default DynamicEnvMap;
