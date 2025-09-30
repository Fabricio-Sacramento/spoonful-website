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
    if (isPlayingRef.current) return;

    isPlayingRef.current = true;
    phraseIndexRef.current = 0;

    console.log('🎬 Statement: Iniciando loop contínuo');

    await playNextPhrase();
  };

  /**
   * Para ciclo em progresso
   */
  const stopCycle = () => {
    console.log('⏹️ Statement: Parando loop');
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
      // Promise cancelada é esperado durante cleanup
      if (err.message !== 'TextScramble cancelled') {
        console.warn('⚠️ Statement: Erro no scramble', err);
      }
      isPlayingRef.current = false;
    }
  };

  // Setup inicial: TextScramble + Event Listeners GSAP
  useEffect(() => {
    // Guard: reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      console.log('ℹ️ Statement: Scramble desabilitado (reduced motion)');
      if (textRef.current) {
        textRef.current.innerText = PHRASES.join(' / ');
      }
      return;
    }

    if (!textRef.current) return;

    // Cria instância TextScramble
    scrambleRef.current = new TextScramble(textRef.current);
    console.log('🎯 Statement: TextScramble criado');

    // Event Listeners para comunicação com GSAP ScrollTrigger
    const handleStart = () => {
      console.log('📍 Statement: GSAP event received - starting loop');
      startCycle();
    };

    const handleStop = () => {
      console.log('📍 Statement: GSAP event received - stopping loop');
      stopCycle();
    };

    window.addEventListener('statement:start', handleStart);
    window.addEventListener('statement:stop', handleStop);
    console.log('📍 Statement: Event listeners registrados');

    // Cleanup
    return () => {
      console.log('🧹 Statement: Cleanup iniciado');
      isMountedRef.current = false;

      window.removeEventListener('statement:start', handleStart);
      window.removeEventListener('statement:stop', handleStop);

      stopCycle();

      if (scrambleRef.current) {
        scrambleRef.current.destroy();
        scrambleRef.current = null;
      }

      console.log('✅ Statement: Cleanup completo');
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
    <section
      id="statement"
      style={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--neutral-normal)',
        contain: 'layout',
        contentVisibility: 'auto'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.625rem',
          flex: '1 0 0',
          alignSelf: 'stretch'
        }}
      >
        <h1
          ref={textRef}
          className="statement-text"
          style={{
            color: 'var(--primary-red)',
            textAlign: 'center',
            fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
            fontSize: '15.4375rem',
            fontStyle: 'normal',
            fontWeight: '900',
            lineHeight: '11.25rem',
            letterSpacing: '0.15438rem',
            textTransform: 'uppercase',
            margin: 0,
            minHeight: '11.25rem',
            willChange: 'contents'
          }}
        >
          {/* Texto inicial vazio - será preenchido pelo scramble */}
        </h1>
      </div>
    </section>
  );
});

StatementSection.displayName = 'StatementSection';

export default StatementSection;