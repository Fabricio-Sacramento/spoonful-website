// src/utils/contact-interactivity.js
// Função para gerenciar interatividade da seção Contact
// Baseada na documentação técnica fornecida

/**
 * Habilita ou desabilita interatividade da seção Contact
 * Gerencia: pointer-events, aria-hidden, tabindex
 * 
 * @param {boolean} enabled - true para habilitar, false para desabilitar
 */
export function setContactInteractivity(enabled) {
  const contactEl = document.querySelector('.contact-layer');
  
  if (!contactEl) {
    console.warn('⚠️ Contact layer não encontrado');
    return;
  }
  
  // Seleciona todos os elementos interativos
  const interactive = contactEl.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]'
  );
  
  interactive.forEach(el => {
    if (!enabled) {
      // DESABILITAR: salva tabindex original e bloqueia
      const currentTabIndex = el.getAttribute('tabindex');
      el.dataset.prevTab = currentTabIndex ?? 'none';
      el.setAttribute('tabindex', '-1');
    } else {
      // HABILITAR: restaura tabindex original
      const prev = el.dataset.prevTab;
      
      if (prev === 'none') {
        el.removeAttribute('tabindex');
      } else {
        el.setAttribute('tabindex', prev);
      }
      
      delete el.dataset.prevTab;
    }
  });
  
  // Gerencia ARIA e pointer-events
  contactEl.setAttribute('aria-hidden', String(!enabled));
  contactEl.style.pointerEvents = enabled ? 'auto' : 'none';
  
  console.log(
    enabled 
      ? '✅ Contact interativo (habilitado)' 
      : '🚫 Contact não-interativo (bloqueado)'
  );
}

/**
 * Foca no primeiro elemento interativo do Contact
 * Usado após habilitar interatividade
 */
export function focusFirstContactElement() {
  const contactEl = document.querySelector('.contact-layer');
  
  if (!contactEl) return;
  
  const firstInteractive = contactEl.querySelector(
    'a:not([tabindex="-1"]), button:not([tabindex="-1"]), input:not([tabindex="-1"]), textarea:not([tabindex="-1"])'
  );
  
  if (firstInteractive) {
    setTimeout(() => {
      try {
        firstInteractive.focus({ preventScroll: true });
        console.log('🎯 Focus definido no primeiro elemento:', firstInteractive);
      } catch (err) {
        console.warn('⚠️ Erro ao definir focus:', err);
      }
    }, 100);
  }
}

/**
 * Adiciona classe de revelação aos elementos [data-reveal]
 * Opcional: para micro-animações de entrada
 */
export function revealContactElements() {
  const contactEl = document.querySelector('.contact-layer');
  
  if (!contactEl) return;
  
  // Adiciona classe que ativa animações CSS
  contactEl.classList.add('contact-layer--revealed');
  
  console.log('✨ Contact elements revealed');
}