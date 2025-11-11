// src/App.jsx
import { useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import Glass from './components/Glass';
import DynamicBackground from './components/DynamicBackground';
import GlassCube from './components/GlassCube';
import AppCanvasCleanupRegistrar from './components/AppCanvasCleanupRegistrar';
import { OrbitControls } from '@react-three/drei';

/**
 * Instrumenta THREE.DefaultLoadingManager para emitir eventos que o Preloader consome:
 *  - 'preloader:progress'  -> CustomEvent detail: { pct, url, itemsLoaded, itemsTotal }
 *  - 'preloader:assetsLoaded' -> Event when DefaultLoadingManager onLoad fires
 *  - 'preloader:assetError' -> CustomEvent detail: { url } on load errors
 *
 * A instrumentação é feita no mount do App (useEffect) e só aplica uma vez (guard __preloaderInstrumented).
 * Isso evita tocar diretamente nos seus loaders e mantém compatibilidade com loaders que usam o DefaultLoadingManager.
 */

function setupThreeLoadingManagerInstrumentation() {
  if (typeof window === 'undefined' || typeof THREE === 'undefined') return;
  const manager = THREE.DefaultLoadingManager;
  if (!manager) return;

  if (!manager.__preloaderInstrumented) {
    manager.__preloaderInstrumented = true;

    manager.onStart = function (url, itemsLoaded, itemsTotal) {
      try {
        window.dispatchEvent(
          new CustomEvent('preloader:assetsStart', {
            detail: { url, itemsLoaded, itemsTotal },
          })
        );
      } catch {
        // noop
      }
    };

    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      const pct = itemsTotal ? Math.round((itemsLoaded / itemsTotal) * 100) : 0;
      try {
        window.dispatchEvent(
          new CustomEvent('preloader:progress', {
            detail: { pct, url, itemsLoaded, itemsTotal },
          })
        );
      } catch {
        // noop
      }
    };

    manager.onLoad = function () {
      try {
        window.dispatchEvent(new Event('preloader:assetsLoaded'));
      } catch {
        // noop
      }
    };

    manager.onError = function (url) {
      try {
        window.dispatchEvent(
          new CustomEvent('preloader:assetError', {
            detail: { url },
          })
        );
      } catch {
        // noop
      }
      console.warn('[LoadingManager] asset error:', url);
    };

    console.debug('[App] THREE.DefaultLoadingManager instrumented for preloader events.');
  }
}

// ===================================================
// CanvasReadySignal → Emite evento "canvas:ready"
// ===================================================
function CanvasReadySignal() {
  const { gl } = useThree();

  useEffect(() => {
    // garante que o frame inicial foi renderizado
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('canvas:ready'));
      console.log('📡 Evento "canvas:ready" emitido');
    });
  }, [gl]);

  return null;
}

const App = () => {
  useEffect(() => {
    // instrumenta o DefaultLoadingManager apenas no cliente (uma vez)
    setupThreeLoadingManagerInstrumentation();

    // Se você quiser forçar a instrumentação em loaders que usam managers customizados,
    // você pode criar e passar THREE.DefaultLoadingManager para esses loaders ao carregá-los.
    //
    // Exemplo rápido (não aplicado aqui):
    // const loader = new GLTFLoader(THREE.DefaultLoadingManager);
  }, []);

  return (
    <Canvas frameloop="demand" camera={{ position: [0, 0, 5], fov: 50 }} shadows>
      <AppCanvasCleanupRegistrar />

      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />

      <DynamicBackground />
      <Glass />
      <GlassCube />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
      />

      {/* Adiciona o emissor do evento de readiness */}
      <CanvasReadySignal />
    </Canvas>
  );
};

export default App;
