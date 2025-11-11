// src/utils/site-load-coordinator.js

// Estado global de carregamento
window.siteLoadState = {
  preloaderComplete: false,
  heroReady: false,
  navReady: false
};

// Eventos personalizados
export const EVENTS = {
  PRELOADER_DONE: 'preloader:done',
  HERO_READY: 'hero:ready',
  NAV_READY: 'nav:ready',
  START_ANIMATIONS: 'site:start-animations'
};

// Função para iniciar a sequência de saída coordenada
export function startExitSequence() {
  console.log('🚀 Iniciando sequência de saída coordenada');
  
  // Mostrar o conteúdo principal (que já deve estar renderizado)
  document.body.classList.add('content-loaded');
  
  // Após o preloader sair completamente, inicia animações de entrada
  setTimeout(() => {
    console.log('🎭 Disparando evento de início das animações');
    window.dispatchEvent(new CustomEvent(EVENTS.START_ANIMATIONS));
  }, 1200); // Tempo para o preloader sair completamente
}

// Exporta uma função helper para verificar o estado e iniciar a sequência se estiver tudo pronto
export function checkAndStart() {
  console.log('🔍 Verificando estado de carregamento:', window.siteLoadState);
  
  if (window.siteLoadState.preloaderComplete && window.siteLoadState.heroReady) {
    startExitSequence();
    return true;
  }
  return false;
}