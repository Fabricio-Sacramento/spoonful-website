// src/hooks/useSectionDetection.js
// ✅ CORRIGIDO: Detecção precisa Hero → About com wrapper absolute

import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CURSOR_STATES } from './useCursorFSM';

const SECTION_STATE_MAP = {
  'hero': CURSOR_STATES.DRAG_ME,
  'about-us': CURSOR_STATES.GREEN_DOT,
  'what-we-do': CURSOR_STATES.GREEN_DOT,
  'work': CURSOR_STATES.GREEN_DOT,
  'statement': CURSOR_STATES.GREEN_DOT,
  'contact': CURSOR_STATES.GREEN_DOT
};

export const useSectionDetection = (onSectionChange, getCurrentCursorState) => {
  const observerRef = useRef(null);
  const activeSection = useRef('hero');
  const scrollTriggersRef = useRef([]);

  useEffect(() => {
    const isTouchDevice = 
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window;
    
    if (isTouchDevice) {
      console.log('📱 Section detection disabled');
      return;
    }

    const setupAnimatedSections = () => {
      const wrapper = document.querySelector('.intro-wrapper');
      
      if (!wrapper) {
        console.warn('⚠️ intro-wrapper not found');
        return false;
      }

      // ✅ CORRIGIDO: Hero termina quando o wrapper sai 50% da viewport
      // About começa quando Hero termina (sem gap)
      const heroTrigger = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: '50% top', // Hero visible nos primeiros 50% do wrapper
        onEnter: () => {
          if (activeSection.current === 'hero') return;
          console.log('📍 Hero ENTERED');
          activeSection.current = 'hero';
          onSectionChange('hero', CURSOR_STATES.DRAG_ME);
        },
        onEnterBack: () => {
          if (activeSection.current === 'hero') return;
          console.log('📍 Hero ENTERED BACK');
          activeSection.current = 'hero';
          onSectionChange('hero', CURSOR_STATES.DRAG_ME);
        },
        onLeave: () => {
          console.log('📍 Hero LEFT → Transitioning to About');
        }
      });

      const aboutTrigger = ScrollTrigger.create({
        trigger: wrapper,
        start: '50% top', // About começa exatamente quando Hero sai
        end: 'bottom top',
        onEnter: () => {
          // Bloqueia se VIEW (modal aberto)
          if (getCurrentCursorState() === CURSOR_STATES.VIEW) {
            console.log('🔒 About blocked - VIEW active');
            return;
          }
          if (activeSection.current === 'about-us') return;
          console.log('📍 About Us ENTERED');
          activeSection.current = 'about-us';
          onSectionChange('about-us', CURSOR_STATES.GREEN_DOT);
        },
        onEnterBack: () => {
          if (getCurrentCursorState() === CURSOR_STATES.VIEW) return;
          if (activeSection.current === 'about-us') return;
          console.log('📍 About Us ENTERED BACK');
          activeSection.current = 'about-us';
          onSectionChange('about-us', CURSOR_STATES.GREEN_DOT);
        }
      });

      scrollTriggersRef.current = [heroTrigger, aboutTrigger];
      console.log('✅ ScrollTrigger OK (Hero: 0-50%, About: 50-100%)');
      return true;
    };

    let retryCount = 0;
    const maxRetries = 10;
    
    const setupInterval = setInterval(() => {
      if (setupAnimatedSections() || retryCount >= maxRetries) {
        clearInterval(setupInterval);
      }
      retryCount++;
    }, 300);

    // IntersectionObserver para seções normais (What We Do, Work, etc)
    const sectionsForIO = [
      document.getElementById('what-we-do'),
      document.getElementById('work'),
      document.getElementById('statement'),
      document.querySelector('.contact-layer')
    ].filter(Boolean);

    if (sectionsForIO.length > 0) {
      console.log(`🎯 IO: Observing ${sectionsForIO.length} sections`);
    }

    const observerConfig = {
      threshold: [0, 0.5, 1],
      rootMargin: '-10% 0px -10% 0px'
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.id || 
          (entry.target.classList.contains('contact-layer') ? 'contact' : null);
        
        if (!sectionId) return;

        // Bloqueia se VIEW (modal/card hover)
        if (getCurrentCursorState() === CURSOR_STATES.VIEW) {
          console.log(`🔒 ${sectionId} blocked - VIEW active`);
          return;
        }

        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          if (activeSection.current === sectionId) return;

          activeSection.current = sectionId;
          const targetState = SECTION_STATE_MAP[sectionId];

          if (targetState) {
            console.log(`📍 ${sectionId} ENTERED (IO)`);
            onSectionChange(sectionId, targetState);
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(
      handleIntersection,
      observerConfig
    );

    sectionsForIO.forEach(section => {
      observerRef.current.observe(section);
    });

    console.log('✅ IntersectionObserver initialized');

    return () => {
      clearInterval(setupInterval);
      scrollTriggersRef.current.forEach(st => st.kill());
      scrollTriggersRef.current = [];
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      console.log('🧹 Section detection cleaned');
    };
  }, [onSectionChange, getCurrentCursorState]);

  return {
    activeSection: activeSection.current
  };
};

export default useSectionDetection;