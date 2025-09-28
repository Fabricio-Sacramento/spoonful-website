// src/components/AppCanvasCleanupRegistrar.jsx
// Registra função de cleanup para o Canvas Performance Controller

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import canvasController from '../utils/canvas-performance-controller.js';
import { disposeScene, disposeRenderer, disposeComposer } from '../utils/three-dispose.js';

function AppCanvasCleanupRegistrar() {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    const cleanup = async () => {
      console.log('[r3f] Running scene cleanup...');

      try {
        // 1) dispose scene children
        disposeScene(scene);

        // 2) If you stored a composer on scene.userData or window, dispose it
        try {
          const composer = scene.userData?.composer || window.__r3fComposer;
          if (composer) {
            disposeComposer(composer);
            // also null it
            if (scene.userData) scene.userData.composer = null;
            if (window.__r3fComposer) window.__r3fComposer = null;
          }
        } catch(e){ console.warn('[r3f] composer dispose failed', e); }

        // 3) kill GSAP tweens (already present)
        try {
          if (gsap) {
            gsap.killTweensOf(scene);
            gsap.killTweensOf(camera);
          }
        } catch(e) { console.warn('Failed to kill GSAP tweens:', e); }

        // 4) dispose renderer resources (this is crítico)
        try {
          disposeRenderer(gl);
        } catch(e) { console.warn('[r3f] disposeRenderer failed', e); }

        // 5) clear THREE cache (loaders)
        try {
          if (window.THREE && window.THREE.Cache) {
            window.THREE.Cache.clear();
          }
        } catch(e){ console.warn('Failed to clear THREE Cache', e); }

        // 6) cancel any RAFs registered on window
        try {
          if (window.__r3fRAFIds && Array.isArray(window.__r3fRAFIds)) {
            window.__r3fRAFIds.forEach(id => cancelAnimationFrame(id));
            window.__r3fRAFIds = [];
          }
        } catch{
          // ignore RAF cleanup errors
        }

        // 7) small pause to let GPU/driver catch up
        await new Promise(res => setTimeout(res, 80));

        console.log('[r3f] Scene cleanup finished successfully');
      } catch (error) {
        console.error('[r3f] Error during cleanup:', error);
      }
    };

    // Registra cleanup no controller
    if (canvasController && typeof canvasController.registerCleanup === 'function') {
      canvasController.registerCleanup(cleanup);
      console.log('[r3f] Cleanup registered to canvas controller');
    } else {
      // Fallback: anexa ao window para segurança
      window.__r3fCleanup = cleanup;
      console.warn('[r3f] Canvas controller not available, cleanup attached to window');
    }

    // Cleanup local ao desmontar este componente (redundante, mas seguro)
    return () => {
      // O controller já vai chamar cleanup, então não fazemos nada aqui
      // para evitar double-cleanup
    };
  }, [gl, scene, camera]);

  // Este componente não renderiza nada - apenas registra cleanup
  return null;
}

export default AppCanvasCleanupRegistrar;