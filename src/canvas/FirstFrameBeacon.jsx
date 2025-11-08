// src/canvas/FirstFrameBeacon.jsx
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';

export default function FirstFrameBeacon() {
  const armed = useRef(false);
  const phase = useRef(0); // 0=idle, 1=compiled+invalidate1, 2=after first frame, 3=emit
  const { gl: renderer, scene, camera, invalidate } = useThree();

  useEffect(() => {
    const onHeroEntry = () => {
      // 1) garante que toda a cena/material/shaders está compilada
      try {
        // three.js: prepara shaders/pipelines antes do primeiro draw real
        renderer.compile?.(scene, camera);
      } catch { /* ok se não existir */ }

      // 2) arma a sequência de dois frames reais
      armed.current = true;
      phase.current = 1;

      // Em frameloop="demand", obriga render imediatamente
      invalidate();                 // frame #1
      requestAnimationFrame(() => invalidate()); // agenda mais um draw em sequência
    };

    window.addEventListener('hero:animate-entry', onHeroEntry);
    return () => window.removeEventListener('hero:animate-entry', onHeroEntry);
  }, [renderer, scene, camera, invalidate]);

  useFrame(() => {
    if (!armed.current) return;

    // Cada entrada aqui significa que um frame aconteceu.
    if (phase.current === 1) {
      // Acabou de acontecer o frame #1 completo
      phase.current = 2;
      return;
    }

    if (phase.current === 2) {
      // Acabou de acontecer o frame #2 completo → agora é seguro emitir
      phase.current = 3;
      armed.current = false;

      // dispara após a apresentação do frame (sai do pipeline do render)
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('hero:first-frame'));
      });
    }
  });

  return null;
}
