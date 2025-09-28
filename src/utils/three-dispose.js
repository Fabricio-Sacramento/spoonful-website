// src/utils/three-dispose.js
// Helpers robustos para dispose correto de recursos Three.js

/**
 * Dispose completo de material Three.js
 */
export function disposeMaterial(material) {
  if (!material) return;
  
  const textureProps = [
    'map','alphaMap','aoMap','bumpMap','normalMap',
    'roughnessMap','metalnessMap','emissiveMap',
    'displacementMap','lightMap','specularMap','envMap'
  ];

  try {
    textureProps.forEach(prop => {
      const tex = material[prop];
      if (tex && typeof tex.dispose === 'function') {
        try { tex.dispose(); } catch(e) { console.warn('dispose texture failed', e); }
      }
    });
  } catch(e) {
    console.warn('Error iterating textureProps', e);
  }

  try {
    if (Array.isArray(material)) {
      material.forEach(m => { if (m && m.dispose) try { m.dispose(); } catch(e){console.warn('material dispose failed',e);} });
    } else if (material.dispose) {
      material.dispose();
    }
  } catch(e) {
    console.warn('Failed to dispose material:', e);
  }
}

/**
 * Dispose de node Three.js (mesh, geometry, material)
 */
export function disposeNode(node) {
  if (!node) return;
  try {
    if (node.geometry) {
      try { node.geometry.dispose(); } catch(e) { console.warn('dispose geometry failed', e); }
    }
    if (node.material) {
      if (Array.isArray(node.material)) {
        node.material.forEach(disposeMaterial);
      } else {
        disposeMaterial(node.material);
      }
    }
    if (node.skeleton && typeof node.skeleton.dispose === 'function') {
      try { node.skeleton.dispose(); } catch(e) { console.warn('skeleton dispose failed', e); }
    }
  } catch(e) {
    console.warn('Error disposing node', e);
  }
}

/**
 * Dispose completo de uma scene Three.js
 */
export function disposeScene(scene) {
  if (!scene) return;
  try {
    console.log('[three-dispose] Disposing scene with', scene.children.length, 'children');
    scene.traverse((child) => {
      disposeNode(child);
    });
    // remove all children
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    console.log('[three-dispose] Scene disposed');
  } catch(e) {
    console.warn('[three-dispose] Error disposing scene', e);
  }
}

/**
 * Cleanup completo de composer de pós-processamento
 */
export function disposeComposer(composer) {
  if (!composer) return;
  try {
    if (composer.passes) {
      composer.passes.forEach(pass => {
        if (pass && typeof pass.dispose === 'function') {
          try { pass.dispose(); } catch(e){ console.warn('pass.dispose failed', e); }
        }
        // some passes store renderTargets
        if (pass.renderTarget) {
          pass.renderTarget.dispose();
        }
      });
    }
    if (composer._readBuffer && composer._readBuffer.dispose) composer._readBuffer.dispose();
    if (composer._writeBuffer && composer._writeBuffer.dispose) composer._writeBuffer.dispose();
    if (typeof composer.dispose === 'function') composer.dispose();
    console.log('[three-dispose] Composer disposed');
  } catch (e) {
    console.warn('Failed to dispose composer', e);
  }
}

/**
 * Dispose robusto de renderer e recursos relacionados
 */
export function disposeRenderer(renderer) {
  if (!renderer) return;
  try {
    const isGlobalLost = typeof window !== 'undefined' && !!window.__R3F_CONTEXT_LOST;
    const gl = renderer.getContext && renderer.getContext();
    const contextLost = gl && typeof gl.isContextLost === 'function' && gl.isContextLost();

    if (isGlobalLost || contextLost) {
      console.log('[three-dispose] Skipping loseContext: already marked/lost');
    } else {
      // Try renderer.forceContextLoss wrapped
      try {
        if (typeof renderer.forceContextLoss === 'function') {
          renderer.forceContextLoss();
          if (typeof window !== 'undefined') window.__R3F_CONTEXT_LOST = true;
        } else if (gl) {
          const ext = gl.getExtension && (gl.getExtension('WEBGL_lose_context') || gl.getExtension('MOZ_WEBGL_lose_context') || gl.getExtension('WEBKIT_WEBGL_lose_context'));
          if (ext && typeof ext.loseContext === 'function') {
            ext.loseContext();
            if (typeof window !== 'undefined') window.__R3F_CONTEXT_LOST = true;
          }
        }
      } catch (e) {
        console.warn('[three-dispose] loseContext/forceContextLoss failed', e);
      }
    }

    // dispose renderLists if present
    if (renderer.renderLists && typeof renderer.renderLists.dispose === 'function') {
      try { renderer.renderLists.dispose(); } catch(e){ console.warn('renderLists.dispose failed', e); }
    }

    // final renderer.dispose
    if (typeof renderer.dispose === 'function') {
      try { renderer.dispose(); } catch(e) { console.warn('renderer.dispose failed', e); }
    }

    // try to remove canvas from DOM to help GC
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }

    console.log('[three-dispose] Renderer disposed (best-effort)');
  } catch (e) {
    console.warn('[three-dispose] disposeRenderer error', e);
  }
}