// src/hooks/useCursorFSM.js
// Finite State Machine para gerenciar estados do cursor com transições explícitas

import { useState, useCallback, useRef } from 'react';

// Definição dos estados possíveis
export const CURSOR_STATES = {
  DRAG_ME: 'drag-me',
  GREEN_DOT: 'green-dot',
  VIEW: 'view'
};

// Configuração da FSM com transições permitidas e prioridades
const FSM_CONFIG = {
  [CURSOR_STATES.DRAG_ME]: {
    allowedNext: [CURSOR_STATES.GREEN_DOT, CURSOR_STATES.VIEW],
    priority: 1,
    scale: 1,
    showText: true,
    text: 'drag me'
  },
  [CURSOR_STATES.GREEN_DOT]: {
    allowedNext: [CURSOR_STATES.DRAG_ME, CURSOR_STATES.VIEW],
    priority: 1,
    scale: 0.14, // 17px / 120px base
    showText: false,
    text: ''
  },
  [CURSOR_STATES.VIEW]: {
    allowedNext: [CURSOR_STATES.GREEN_DOT],
    priority: 2, // Prioridade alta - bloqueia transições de seção
    scale: 1,
    showText: true,
    text: 'view'
  }
};

/**
 * Hook para gerenciar state machine do cursor
 * Previne transições inválidas e race conditions
 */
export const useCursorFSM = (initialState = CURSOR_STATES.DRAG_ME) => {
  const [currentState, setCurrentState] = useState(initialState);
  const stateRef = useRef(initialState);

  /**
   * Transição de estado com validação FSM
   * @param {string} targetState - Estado desejado
   * @param {boolean} force - Força transição ignorando validações (emergency exit)
   * @returns {boolean} - true se transição foi executada
   */
  const transition = useCallback((targetState, force = false) => {
    const current = stateRef.current;
    
    // Early return: já está no estado desejado
    if (current === targetState) {
      return false;
    }

    // Emergency exit: força transição (usado em cleanup)
    if (force) {
      stateRef.current = targetState;
      setCurrentState(targetState);
      console.log(`🔴 FSM: Forced transition ${current} → ${targetState}`);
      return true;
    }

    const currentConfig = FSM_CONFIG[current];
    const targetConfig = FSM_CONFIG[targetState];

    // Validação: estado target existe?
    if (!targetConfig) {
      console.warn(`⚠️ FSM: Invalid target state "${targetState}"`);
      return false;
    }

    // Validação: transição permitida?
    if (!currentConfig.allowedNext.includes(targetState)) {
      console.warn(
        `🚫 FSM: Transition blocked - ${current} → ${targetState} not allowed`
      );
      return false;
    }

    // Prioridade: VIEW bloqueia transições de seção
    if (current === CURSOR_STATES.VIEW && targetState !== CURSOR_STATES.GREEN_DOT) {
      console.log(`🔒 FSM: VIEW priority - blocking transition to ${targetState}`);
      return false;
    }

    // Executa transição
    stateRef.current = targetState;
    setCurrentState(targetState);
    console.log(`✅ FSM: ${current} → ${targetState}`);
    
    return true;
  }, []);

  /**
   * Retorna configuração visual do estado atual
   */
  const getStateConfig = useCallback(() => {
    return FSM_CONFIG[stateRef.current];
  }, []);

  /**
   * Checa se transição é válida sem executar
   */
  const canTransitionTo = useCallback((targetState) => {
    const current = stateRef.current;
    const currentConfig = FSM_CONFIG[current];
    
    return currentConfig?.allowedNext.includes(targetState) ?? false;
  }, []);

  /**
   * Retorna estado atual (sempre sincronizado via ref)
   */
  const getCurrentState = useCallback(() => {
    return stateRef.current;
  }, []);

  return {
    currentState,
    transition,
    getStateConfig,
    canTransitionTo,
    getCurrentState
  };
};

export default useCursorFSM;