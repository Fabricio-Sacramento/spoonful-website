// src/components/StatementSection.jsx
// Statement section com text scramble effect e safeguards de produção

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import TextScramble from '../utils/text-scramble.js';

const PHRASES = [
  'DESIGN',
  'MADE WITH',
  'PASSION',
  'AND',
  'KNOWLEDGE'
];

const REPLAY_COOLDOWN = 500; // ms entre replays
const PHRASE_DELAY = 800; // ms entre frases
const FONT_TIMEOUT = 3000; // timeout para font loading

const StatementSection = forwardRef(({ disabled = false }, ref) => {
  const textRef = useRef(null);
  const scrambleRef = useRef(null);
  const observerRef = useRef(null);
  const isMountedRef = useRef(true);
  const isPlayingRef = useRef(false);
  const lastPlayTimeRef = useRef(0);
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
   * Inicia ciclo de frases
   */
  const startCycle = async () => {
    if (!isMountedRef.current) return;
    if (isPlayingRef.current) return;
    
    // Debounce: previne replays rápidos
    const now = Date.now();
    if (now - lastPlayTimeRef.current < REPLAY_COOLDOWN) {
      console.log('🔒 Statement: Replay bloqueado (cooldown)');
      return;
    }

    isPlayingRef.current = true;
    lastPlayTimeRef.current = now;
    phraseIndexRef.current = 0;

    console.log('🎬 Statement: Iniciando ciclo');

    await playNextPhrase();
  };

  /**
   * Para ciclo em progresso
   */
  const stopCycle = () => {
    console.log('⏹️ Statement: Parando ciclo');
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
   * Toca próxima frase no ciclo
   */
  const playNextPhrase = async () => {
    if (!isMountedRef.current || !isPlayingRef.current) return;

    const phrase = PHRASES[phraseIndexRef.current];
    
    try {
      await scrambleRef.current.setText(phrase);
      
      if (!isMountedRef.current || !isPlayingRef.current) return;

      phraseIndexRef.current++;

      // Se ainda há frases, agenda próxima
      if (phraseIndexRef.current < PHRASES.length) {
        cycleTimeoutRef.current = setTimeout(() => {
          playNextPhrase();
        }, PHRASE_DELAY);
      } else {
        // Ciclo completo
        console.log('✅ Statement: Ciclo completo');
        isPlayingRef.current = false;
      }
    } catch (err) {
      // Promise cancelada é esperado durante cleanup
      if (err.message !== 'TextScramble cancelled') {
        console.warn('⚠️ Statement: Erro no scramble', err);
      }
      isPlayingRef.current = false;
    }
  };

  // Setup inicial
  useEffect(() => {
    // Guard: disabled ou reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (disabled || prefersReducedMotion) {
      console.log('ℹ️ Statement: Scramble desabilitado');
      if (textRef.current) {
        textRef.current.innerText = PHRASES.join(' / ');
      }
      return;
    }

    if (!textRef.current) return;

    // Cria instância TextScramble
    scrambleRef.current = new TextScramble(textRef.current);
    console.log('🎯 Statement: TextScramble criado');

    // Setup Intersection Observer
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log('👁️ Statement: Entrou na viewport');
          
          // Aguarda fonts antes do primeiro play
          let fontReady = false;
          const fontTimeoutId = setTimeout(() => {
            if (!fontReady && isMountedRef.current) {
              console.warn('⏰ Statement: Font timeout - iniciando mesmo assim');
              startCycle();
            }
          }, FONT_TIMEOUT);

          document.fonts.ready.then(() => {
            fontReady = true;
            clearTimeout(fontTimeoutId);
            if (isMountedRef.current) {
              console.log('✅ Statement: Fonts prontas');
              startCycle();
            }
          });
        } else {
          console.log('👁️ Statement: Saiu da viewport');
          stopCycle();
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px 0px -20% 0px',
      threshold: 0
    });

    observerRef.current.observe(textRef.current);
    console.log('👁️ Statement: Observer ativo');

    // Cleanup
    return () => {
      console.log('🧹 Statement: Cleanup iniciado');
      isMountedRef.current = false;
      
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      stopCycle();

      if (scrambleRef.current) {
        scrambleRef.current.destroy();
        scrambleRef.current = null;
      }

      console.log('✅ Statement: Cleanup completo');
    };
  }, [disabled]);

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

StatementSection.propTypes = {
  disabled: PropTypes.bool
};

export default StatementSection;