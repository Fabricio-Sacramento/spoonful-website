// src/components/GlassCube.jsx
import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import DynamicEnvMap from "./DynamicEnvMap";

const GlassCube = () => {
  const [envMap, setEnvMap] = useState(null);
  const meshRef = useRef();
  const hasStarted = useRef(false);
  const { invalidate } = useThree();
  const cubeSize = 2.5;

  useEffect(() => {
    // React StrictMode monta o componente duas vezes em dev — este guard
    // garante que o tween de intro só dispara uma vez por instância real.
    if (hasStarted.current) return;
    hasStarted.current = true;

    const runIntro = () => {
      if (!meshRef.current) return;
      const mesh = meshRef.current;
      const tick = () => invalidate();

      // Eixo Y — rotação principal 360° com desaceleração longa
      gsap.to(mesh.rotation, {
        y: Math.PI * 2,
        duration: 5.5,
        ease: "power4.out",
        onUpdate: tick,
        onComplete: () => {
          if (mesh.rotation) mesh.rotation.y = 0;
        }
      });

      // Eixo X — inclinação e retorno com ritmo próprio
      gsap.to(mesh.rotation, {
        x: 0.18,
        duration: 1.6,
        ease: "power3.out",
        onUpdate: tick,
        yoyo: true,
        repeat: 1
      });

      // Eixo Z — microdesvio lateral com ritmo diferente de X
      gsap.to(mesh.rotation, {
        z: -0.08,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: tick,
        yoyo: true,
        repeat: 1
      });
    };

    // Fallback para hot-reload em dev: preloader pode já estar hidden
    const preloader = document.getElementById('preloader');
    if (!preloader || preloader.classList.contains('preloader--hidden')) {
      runIntro();
      return;
    }

    // Aguarda o preloader terminar de sair antes de animar
    window.addEventListener('preloader:complete', runIntro, { once: true });
    return () => window.removeEventListener('preloader:complete', runIntro);
  }, [invalidate]);

  return (
    <>
      <DynamicEnvMap setEnvMap={setEnvMap} />

      <mesh ref={meshRef}>
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
        <meshPhysicalMaterial
          color="white"
          roughness={0.0}
          metalness={0.1}
          transmission={1}
          ior={1.5}
          thickness={0.5}
          clearcoat={1}
          envMap={envMap}
          envMapIntensity={1.0}
          reflectivity={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
};

export default GlassCube;
