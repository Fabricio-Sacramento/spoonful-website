// src/components/StatementSection.jsx
// Statement section com GSAP ScrollTrigger integration e loop contínuo

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import TextScramble from '../utils/text-scramble.js';

const PHRASES = [
  'DESIGN',
  'MADE WITH',
  'PASSION',
  'AND',
  'KNOWLEDGE'
];

const PHRASE_DELAY = 800; // ms entre frases

const StatementSection = forwardRef((props, ref) => {
  const textRef = useRef(null);
  const scrambleRef = useRef(null);
  const isMountedRef = useRef(true);
  const isPlayingRef = useRef(false);
  const phraseIndexRef = useRef(0);
  const cycleTimeoutRef = useRef(null);

  // Expõe API pública via ref
  useImperativeHandle(ref, () => ({
    start: () => {
      if (!isPlayingRef.current && scrambleRef.current) {
        startCycle();
      }
    },
    stop: () => {
      stopCycle();
    },
    isRunning: () => isPlayingRef.current
  }));

  /**
   * Inicia ciclo infinito de frases
   */
  const startCycle = async () => {
    if (!isMountedRef.current) return;

    // Para qualquer ciclo em andamento antes de reiniciar
    if (isPlayingRef.current) {
      stopCycle();
    }

    isPlayingRef.current = true;
    phraseIndexRef.current = 0;

    await playNextPhrase();
  };

  /**
   * Para ciclo em progresso
   */
  const stopCycle = () => {
    isPlayingRef.current = false;
    
    if (cycleTimeoutRef.current) {
      clearTimeout(cycleTimeoutRef.current);
      cycleTimeoutRef.current = null;
    }

    if (scrambleRef.current) {
      scrambleRef.current.cancel();
    }
  };

  /**
   * Toca próxima frase no ciclo (loop infinito)
   */
  const playNextPhrase = async () => {
    if (!isMountedRef.current || !isPlayingRef.current) return;

    const phrase = PHRASES[phraseIndexRef.current];
    
    try {
      await scrambleRef.current.setText(phrase);
      
      if (!isMountedRef.current || !isPlayingRef.current) return;

      phraseIndexRef.current++;

      // Loop infinito: reseta ao final das frases
      if (phraseIndexRef.current >= PHRASES.length) {
        phraseIndexRef.current = 0;
      }

      // Sempre agenda próxima frase (loop contínuo)
      cycleTimeoutRef.current = setTimeout(() => {
        playNextPhrase();
      }, PHRASE_DELAY);

    } catch (err) {
      if (err.message !== 'TextScramble cancelled') {
        console.warn('⚠️ Statement: Erro no scramble', err);
        isPlayingRef.current = false;
      }
      // cancelled: stopCycle já gerenciou o estado — não sobrescreve
    }
  };

  // Setup inicial: TextScramble + Event Listeners GSAP
  useEffect(() => {
    // Guard: reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      if (textRef.current) {
        textRef.current.innerText = PHRASES.join(' / ');
      }
      return;
    }

    if (!textRef.current) return;

    // Cria instância TextScramble
    scrambleRef.current = new TextScramble(textRef.current);

    // Event Listeners para comunicação com GSAP ScrollTrigger
    const handleStart = () => {
      startCycle();
    };

    const handleStop = () => {
      stopCycle();
    };

    window.addEventListener('statement:start', handleStart);
    window.addEventListener('statement:stop', handleStop);

    // Cleanup
    return () => {
      isMountedRef.current = false;

      window.removeEventListener('statement:start', handleStart);
      window.removeEventListener('statement:stop', handleStop);

      stopCycle();

      if (scrambleRef.current) {
        scrambleRef.current.destroy();
        scrambleRef.current = null;
      }

    };
  }, []);

  // Cleanup de timers no unmount
  useEffect(() => {
    return () => {
      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section id="statement">
      <div className="statement-container">
        <h1 ref={textRef} className="statement-text">
          {/* Texto inicial vazio - será preenchido pelo scramble */}
        </h1>
      </div>
    </section>
  );
});

StatementSection.displayName = 'StatementSection';

export default StatementSection;