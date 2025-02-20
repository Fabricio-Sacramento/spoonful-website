import { useRef, useEffect } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const ConceptualCore = () => {
  // Carrega o modelo 3D (substitua o caminho pelo do seu modelo)
  const gltf = useLoader(GLTFLoader, 'https://spoonful.com.br/models/scene.gltf');
  const coreRef = useRef();
  const { scene } = useThree();

  // Recupera o envMap da cena (supondo que ele já esteja configurado)
  const envMap = scene.environment; 

  useEffect(() => {
    // Percorre o modelo e aplica o material físico com o envMap para reflexões realistas
    gltf.scene.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0xffffff),
          metalness: 0.1,
          roughness: 0.05,
          transmission: 1,            // Permite a transmissão de luz (efeito de vidro/plástico)
          transparent: true,
          opacity: 0.9,
          ior: 1.5,                   // Índice de refração para vidro
          thickness: 0.5,             // Espessura do objeto para efeitos de distorção
          clearcoat: 1,
          clearcoatRoughness: 0,
          envMap: envMap,             // Utiliza o envMap já configurado na cena
        });
        child.material.needsUpdate = true;
      }
    });
  }, [gltf, envMap]);

  useFrame(() => {
    // Rotaciona lentamente o objeto para evidenciar o efeito do material
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.005;
    }
  });

  return <primitive ref={coreRef} object={gltf.scene} />;
};

export default ConceptualCore;
