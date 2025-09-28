import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import styles from './Modal.module.css'; // Import CSS Module

const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);

const Modal = ({ isOpen, onClose, project, projects = [] }) => {
  const modalRef = useRef(null);
  const firstImageRef = useRef(null);
  const rafRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Animation control refs
  const animRef = useRef({ isAnimating: false, suppressScroll: false });
  const closeTimersRef = useRef({ hide: null, overlay: null, raf: null });
  const prevFocusRef = useRef(null);

  // ================================
  // NAVIGATION HELPERS
  // ================================
  
  /**
   * Smooth scroll to top with Promise
   */
  const smoothScrollToTop = useCallback((el, duration = 650, preferReduced = false) => {
    return new Promise((resolve) => {
      if (!el || preferReduced) {
        // Instant scroll for reduced motion
        el.scrollTop = 0;
        return resolve();
      }

      const start = el.scrollTop;
      if (start === 0) return resolve();

      const startTime = performance.now();
      let animId = null;

      const animate = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        // easeInOutQuad
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        el.scrollTop = Math.round(start * (1 - eased));
        
        if (t < 1) {
          animId = requestAnimationFrame(animate);
        } else {
          animId = null;
          resolve();
        }
      };
      
      animId = requestAnimationFrame(animate);

      // Safety timeout
      setTimeout(() => {
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
        el.scrollTop = 0;
        resolve();
      }, duration + 120);
    });
  }, []);

  /**
   * Wait for CSS transition end with fallback timer - IMPROVED */
  // waitForTransition tolerante (aceita 'all' como wildcard)
  const waitForTransition = useCallback((el, timeout = 800, property = 'opacity') => {
    return new Promise((resolve) => {
      if (!el) return resolve();

      const cs = window.getComputedStyle(el);
      const durations = (cs.transitionDuration || '0s').split(',').map(s => parseFloat(s) || 0);
      const maxDuration = durations.length ? Math.max(...durations) * 1000 : 0;
      if (maxDuration <= 0) return resolve();

      let done = false;
      const onEnd = (e) => {
        if (!e || e.target !== el) return;
        if (property && property !== 'all' && e.propertyName !== property) return;
        if (done) return;
        done = true;
        el.removeEventListener('transitionend', onEnd);
        clearTimeout(timer);
        resolve();
      };

      el.addEventListener('transitionend', onEnd);
      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        el.removeEventListener('transitionend', onEnd);
        resolve();
      }, Math.max(timeout, Math.round(maxDuration + 80)));
    });
  }, []);

  /**
   * Preload image Promise - WITH MEMORY CLEANUP
   */
  const preloadImage = useCallback((src) => {
    return new Promise((resolve) => {
      if (!src) {
        console.log('📸 No image to preload');
        return resolve();
      }
      
      const img = new Image();
      let loaded = false;
      
      const cleanup = () => {
        if (loaded) return;
        loaded = true;
        img.onload = null;
        img.onerror = null;
        img.src = ''; // Clear src to potentially free memory
      };
      
      img.onload = () => {
        console.log('📸 Image preloaded successfully:', src);
        cleanup();
        resolve();
      };
      
      img.onerror = () => {
        console.warn('📸 Image preload failed:', src);
        cleanup();
        resolve(); // Don't fail on image errors
      };
      
      // Safety timeout for image loading
      setTimeout(() => {
        if (!loaded) {
          console.warn('📸 Image preload timeout:', src);
          cleanup();
          resolve();
        }
      }, 3000); // 3 second timeout for image loading
      
      img.src = src;
    });
  }, []);

  /**
   * Main navigation orchestrator - WITH SAFETY MECHANISMS */
  // navigateTo simplificado - apenas fade, sem slides laterais
  const navigateTo = useCallback(async (direction) => {
    if (animRef.current.isAnimating) {
      console.warn('🚫 Navigation blocked - animation in progress');
      return;
    }
    
    const modal = modalRef.current;
    if (!modal) return;

    const preferReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    animRef.current.isAnimating = true;
    animRef.current.suppressScroll = true;
    
    const safety = setTimeout(() => {
      animRef.current.isAnimating = false;
      animRef.current.suppressScroll = false;
    }, 5000);

    const total = projects.length;
    const targetIndex = direction === 'next' ? 
      (currentIndex === total - 1 ? 0 : currentIndex + 1) :
      (currentIndex === 0 ? total - 1 : currentIndex - 1);

    try {
      // Preload hero
      const targetProject = projects[targetIndex];
      const heroSrc = (targetProject.galleryImages && targetProject.galleryImages[0]) || targetProject.image;
      console.log('📸 Preloading image:', heroSrc);
      await preloadImage(heroSrc);

      if (preferReduced) {
        console.log('⚡ Reduced motion - direct swap');
        setCurrentIndex(targetIndex);
        setTimeout(() => {
          const title = modal.querySelector('h1') || modal.querySelector('[data-focus-target]');
          if (title && typeof title.focus === 'function') title.focus();
        }, 20);
        return;
      }

      // 1) Scroll to top
      console.log('⬆️ Scrolling to top');
      await Promise.race([
        smoothScrollToTop(modal, 650, false), 
        new Promise(r => setTimeout(r, 1000))
      ]);

      // 2) Fade out current content
      const contentEl = modal.querySelector(`.${styles.modalContent}`);
      if (!contentEl) {
        console.warn('⚠️ Content element not found, direct swap');
        setCurrentIndex(targetIndex);
        return;
      }

      console.log('🌫️ Fading out current content');
      contentEl.classList.add(styles.fading);

      // Wait for fade-out transition
      await Promise.race([
        waitForTransition(contentEl, 700, 'opacity'),
        new Promise(r => setTimeout(r, 900))
      ]);

      // 3) Swap content
      console.log('🔄 Swapping content to index:', targetIndex);
      setCurrentIndex(targetIndex);

      // → espera o React atualizar o DOM (duplo rAF) e re-seleciona o elemento
      await new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
      
      let newContentEl = modal.querySelector(`.${styles.modalContent}`);
      if (!newContentEl) {
        console.warn('⚠️ new content element not found after setCurrentIndex, giving up swap');
        return;
      }

      // small reflow to ensure class state applied
      newContentEl.offsetHeight;
      await new Promise(res => setTimeout(res, 10));

      // 4) Fade in new content (remover classe no novo elemento)
      console.log('✨ Fading in new content');
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          console.log('DEBUG removing fading class from NEW element...');
          newContentEl.classList.remove(styles.fading);
          console.log('DEBUG new classList after remove:', newContentEl.classList.toString());
        });
      });

      // aguarda transição no novo elemento (use 'all' para ser mais permissivo)
      await Promise.race([
        waitForTransition(newContentEl, 900, 'all'),
        new Promise(r => setTimeout(r, 1100))
      ]);

      // 5) Reveal hero
      console.log('🎭 Revealing hero');
      const hero = modal.querySelector('.modal-hero');
      if (hero) {
        hero.classList.remove('modal-hero--visible');
        setTimeout(() => hero.classList.add('modal-hero--visible'), 80);
      }

      console.log('✅ Navigation completed successfully');

      // Focus management
      console.log('🎯 Focus set on title');
      setTimeout(() => {
        const title = modal.querySelector('h1') || modal.querySelector('[data-focus-target]');
        if (title && typeof title.focus === 'function') title.focus();
      }, 320);

    } catch (err) {
      console.error('❌ navigateTo error:', err);
      setCurrentIndex(targetIndex); // fallback
    } finally {
      clearTimeout(safety);
      animRef.current.isAnimating = false;
      animRef.current.suppressScroll = false;
      console.log('🏁 Animation flags reset');
    }
  }, [currentIndex, projects, preloadImage, smoothScrollToTop, waitForTransition]);

  // ================================
  // EXISTING MODAL LOGIC (PRESERVED)
  // ================================

  // Handle close animation - Phase 3 Refinada (staggered + fluida)
  const handleClose = useCallback(() => {
    if (animRef.current.isAnimating) return; // Guard contra múltiplos handleClose

    // Limpar timers antigos por segurança
    if (closeTimersRef.current.overlay) clearTimeout(closeTimersRef.current.overlay);
    if (closeTimersRef.current.hide) clearTimeout(closeTimersRef.current.hide);
    if (closeTimersRef.current.raf) cancelAnimationFrame(closeTimersRef.current.raf);
    closeTimersRef.current = { hide: null, overlay: null, raf: null };

    const modal = modalRef.current;
    if (!modal) {
      onClose();
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const overlayDuration = prefersReducedMotion ? 120 : 420; // Meio termo: 420ms
    const staggerDelays = prefersReducedMotion ? [0, 15, 30] : [0, 60, 120]; // Reverse order delays

    // Lock interactions and set flags
    animRef.current.isAnimating = true;
    animRef.current.suppressScroll = true;

    const hero = modal.querySelector('.modal-hero');
    
    if (hero) {
      // Start with hero staggered hide (reverse order)
      const items = Array.from(hero.querySelectorAll('[data-reveal]'));
      
      // Apply reverse stagger delays
      items.forEach((el, i) => {
        const reverseIndex = items.length - 1 - i; // Reverse order
        const delay = staggerDelays[reverseIndex] ?? (staggerDelays[staggerDelays.length - 1] + (reverseIndex - staggerDelays.length + 1) * 40);
        el.style.transitionDelay = `${delay}ms`;
      });

      // Add hiding class to trigger staggered hide
      hero.classList.add('modal-hero--hiding');
      hero.classList.remove('modal-hero--visible');

      // Start overlay exit when hero hiding is 60% complete
      const maxStaggerDelay = Math.max(...staggerDelays.slice(0, Math.min(items.length, staggerDelays.length)));
      const heroHideDuration = Math.round(320 + maxStaggerDelay); // 320ms transition + stagger
      const overlayStartTime = Math.round(heroHideDuration * 0.6);

      closeTimersRef.current.overlay = window.setTimeout(() => {
        // Start overlay exit animation
        modal.classList.add('modal-overlay--exiting');
        modal.classList.remove('modal-overlay--visible');
      }, overlayStartTime);

      // Call parent close after everything completes
      const totalDuration = Math.max(overlayStartTime + overlayDuration, heroHideDuration);
      
      closeTimersRef.current.hide = window.setTimeout(() => {
        // Clean up stagger delays
        items.forEach(el => {
          el.style.transitionDelay = '';
        });

        // Clear flags so cleanup effect can run clean
        animRef.current.isAnimating = false;
        animRef.current.suppressScroll = false;

        // Restore focus before calling onClose
        if (prevFocusRef.current && typeof prevFocusRef.current.focus === 'function') {
          prevFocusRef.current.focus();
        }

        // Reset closeTimersRef após finalizar
        closeTimersRef.current = { hide: null, overlay: null, raf: null };

        // Call external onClose to actually unmount / hide modal
        onClose();
      }, totalDuration);

    } else {
      // No hero -> just do overlay exit
      modal.classList.add('modal-overlay--exiting');
      modal.classList.remove('modal-overlay--visible');

      closeTimersRef.current.hide = window.setTimeout(() => {
        animRef.current.isAnimating = false;
        animRef.current.suppressScroll = false;
        
        // Restore focus
        if (prevFocusRef.current && typeof prevFocusRef.current.focus === 'function') {
          prevFocusRef.current.focus();
        }

        // Reset closeTimersRef após finalizar
        closeTimersRef.current = { hide: null, overlay: null, raf: null };
        
        onClose();
      }, overlayDuration);
    }
  }, [onClose]);

  // Focus management and cleanup
  useEffect(() => {
    if (isOpen) {
      // Capture focus before opening
      prevFocusRef.current = document.activeElement;
    } else {
      // Optional: restore focus on close (if component still mounted)
      if (prevFocusRef.current && typeof prevFocusRef.current.focus === 'function') {
        prevFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Cleanup close timers on unmount or when modal closes
  useEffect(() => {
    return () => {
      if (closeTimersRef.current.raf != null) cancelAnimationFrame(closeTimersRef.current.raf);
      if (closeTimersRef.current.overlay != null) clearTimeout(closeTimersRef.current.overlay);
      if (closeTimersRef.current.hide != null) clearTimeout(closeTimersRef.current.hide);
      // Reset
      closeTimersRef.current = { hide: null, overlay: null, raf: null };
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const currentAnimRef = animRef.current; // Capture ref value at effect start
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Timings
    const overlayDuration = prefersReducedMotion ? 120 : 450;
    const staggerDelays = prefersReducedMotion ? [0, 20, 40] : [0, 90, 160];

    // Guard refs para cleanup
    const rafIdRef = { id: null };
    const revealTimeoutRef = { id: null };
    const releaseTimeoutRef = { id: null };
    const focusTimeoutRef = { id: null };

    currentAnimRef.isAnimating = true;
    currentAnimRef.suppressScroll = true;

    modal.classList.add('modal-overlay--entering');

    // Vamos usar requestAnimationFrame mas guardar o id no rafIdRef
    rafIdRef.id = requestAnimationFrame(() => {
      modal.classList.remove('modal-overlay--entering');
      modal.classList.add('modal-overlay--visible');

      const hero = modal.querySelector('.modal-hero');

      if (hero) {
        const items = Array.from(hero.querySelectorAll('[data-reveal]'));
        items.forEach((el, i) => {
          const delay = staggerDelays[i] ?? (staggerDelays[staggerDelays.length - 1] + (i - staggerDelays.length + 1) * 70);
          el.style.transitionDelay = `${delay}ms`;
        });

        // Start reveal when overlay is 70% complete
        const revealStartTime = Math.round(overlayDuration * 0.7);

        revealTimeoutRef.id = window.setTimeout(() => {
          hero.classList.add('modal-hero--visible');

          // Release scroll after overlay completes + small buffer
          releaseTimeoutRef.id = window.setTimeout(() => {
            currentAnimRef.isAnimating = false;
            currentAnimRef.suppressScroll = false;
          }, Math.round(overlayDuration * 0.3));
        }, revealStartTime);

        // Focus management: focus close button after overlay fully done (safe)
        const closeButton = modal.querySelector('button[aria-label="Fechar modal"]');
        if (closeButton) {
          focusTimeoutRef.id = window.setTimeout(() => closeButton.focus(), overlayDuration + 150);
        }
      } else {
        // No hero -> just release after overlayDuration
        releaseTimeoutRef.id = window.setTimeout(() => {
          currentAnimRef.isAnimating = false;
          currentAnimRef.suppressScroll = false;
        }, overlayDuration);
      }
      closeTimersRef.current.raf = rafIdRef.id; // ← NOVA LINHA
    });

    return () => {
      // cleanup tudo
      if (rafIdRef.id != null) cancelAnimationFrame(rafIdRef.id);
      if (revealTimeoutRef.id != null) clearTimeout(revealTimeoutRef.id);
      if (releaseTimeoutRef.id != null) clearTimeout(releaseTimeoutRef.id);
      if (focusTimeoutRef.id != null) clearTimeout(focusTimeoutRef.id);

      modal.classList.remove('modal-overlay--entering', 'modal-overlay--visible');

      const hero = modal.querySelector('.modal-hero');
      if (hero) {
        hero.classList.remove('modal-hero--visible');
        hero.querySelectorAll('[data-reveal]').forEach(el => {
          el.style.transitionDelay = '';
        });
      }

      // garante reset das flags (importante se fechar no meio) - usa captured ref
      currentAnimRef.isAnimating = false;
      currentAnimRef.suppressScroll = false;

      closeTimersRef.current.raf = null; // ← NOVA LINHA
    };
  }, [isOpen]);

  // Scroll-driven animation for first image
  useEffect(() => {
    if (!isOpen || !firstImageRef.current || !modalRef.current) return;

    const scroller = modalRef.current;
    const target = firstImageRef.current;
    const currentAnimRef = animRef.current;
    let running = true;
    let rootHalf = scroller.clientHeight / 2;

    target.style.setProperty('--expand-radius', '25px');
    target.style.setProperty('--expand-scale', '0.9');

    const computeAndApply = () => {
      if (!running) return;
      if (currentAnimRef.suppressScroll || currentAnimRef.isAnimating) {
        return;
      }
      const targetRect = target.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      const elemTop = targetRect.top - scrollerRect.top;
      const progress = clamp((rootHalf - elemTop) / rootHalf, 0, 1);
      const scale = 0.9 + 0.12 * progress;
      const radius = 25 * (1 - progress);

      target.style.setProperty('--expand-scale', String(scale));
      target.style.setProperty('--expand-radius', `${radius}px`);
      rafRef.current = null;
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        computeAndApply();
      });
    };

    const onResize = () => {
      rootHalf = scroller.clientHeight / 2;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => computeAndApply());
    };

    computeAndApply();

    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const innerImg = target.querySelector('img');
    const onImgLoad = () => {
      rootHalf = scroller.clientHeight / 2;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => computeAndApply());
    };
    if (innerImg && !innerImg.complete) {
      innerImg.addEventListener('load', onImgLoad, { once: true });
    }

    return () => {
      running = false;
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      
      target.style.removeProperty('--expand-scale');
      target.style.removeProperty('--expand-radius');
      
      currentAnimRef.isAnimating = false;
      currentAnimRef.suppressScroll = false;
      
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (innerImg && onImgLoad) {
        try {
          innerImg.removeEventListener('load', onImgLoad);
        } catch (err) {
          console.warn('Error removing image load listener', err);
        }
      }
    };
  }, [isOpen, currentIndex]);

  // Find current project index
  useEffect(() => {
    if (project && projects.length > 0) {
      const index = projects.findIndex(p => p.id === project.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [project, projects]);

  // UPDATED: Navigation functions now use navigateTo
  const goToPrevious = useCallback(() => {
    navigateTo('prev');
  }, [navigateTo]);

  const goToNext = useCallback(() => {
    navigateTo('next');
  }, [navigateTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, goToPrevious, goToNext]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || projects.length === 0) return null;

  const currentProject = projects[currentIndex];
  const prevProject = projects[currentIndex === 0 ? projects.length - 1 : currentIndex - 1];
  const nextProject = projects[currentIndex === projects.length - 1 ? 0 : currentIndex + 1];

  // NOVA LÓGICA: Preparar imagens da galeria com fallbacks seguros
  const getGalleryImages = (project) => {
    if (project.galleryImages && project.galleryImages.length >= 5) {
      return project.galleryImages.slice(0, 5);
    }
    // Fallback: usar imagem principal para todas as 5 posições
    return Array(5).fill(project.image);
  };

  const galleryImages = getGalleryImages(currentProject);

  const modalContent = (
    <div 
      ref={modalRef}
      className={`modal-overlay ${styles.modalOverlay}`}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--neutral-normal)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Close Button - OUTSIDE MODAL CONTENT for stability */}
      <button 
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          width: '48px',
          height: '48px',
          background: 'rgba(235, 235, 235, 0.1)',
          border: 'none',
          borderRadius: '50%',
          color: 'var(--neutral-light)',
          fontSize: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(235, 235, 235, 0.2)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(235, 235, 235, 0.1)'}
        aria-label="Fechar modal"
      >
        ×
      </button>

      {/* MODAL CONTENT WRAPPER - For transitions */}
      <div className={styles.modalContent}>
        {/* HERO SECTION - AGORA COM DADOS DINÂMICOS */}
        <div className="modal-hero" style={{
          width: '100%',
          height: '50vh',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          backgroundColor: 'var(--neutral-normal)',
          padding: '2.25rem',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '0.5rem',
          overflow: 'hidden'
        }}>
          {/* Tags - DINAMIZADAS */}
          <div data-reveal style={{
            color: 'var(--primary-green)',
            fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
            fontSize: '1.125rem',
            fontWeight: '600',
            letterSpacing: '0.045rem',
            textTransform: 'capitalize'
          }}>
            {currentProject.tags?.join(' • ') || 'PROJECT'}
          </div>

          {/* Title - JÁ DINÂMICO with focus target */}
          <h1 
            data-reveal 
            data-focus-target
            tabIndex="-1"
            style={{
              color: 'var(--neutral-light)',
              fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
              fontSize: '7.75rem',
              fontWeight: '900',
              letterSpacing: '0.155rem',
              margin: 0,
              outline: 'none'
            }}
          >
            {currentProject.title}
          </h1>

          {/* Description Row - DINAMIZADA */}
          <div data-reveal style={{ display: 'flex', width: '100%', gap: '2rem' }}>
            {/* Left Column - Title & Description (50%) */}
            <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{
                color: 'var(--neutral-light)',
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontSize: '1.375rem',
                fontWeight: '600',
                letterSpacing: '0.055rem',
                margin: 0
              }}>
                {currentProject.subtitle || currentProject.description}
              </h2>
              
              <p style={{
                color: 'var(--neutral-light)',
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontSize: '1.25rem',
                fontWeight: '200',
                letterSpacing: '0.0625rem',
                margin: 0
              }}>
                {currentProject.fullDescription || currentProject.description}
              </p>
            </div>

            {/* Middle Column - Stacks (25%) - DINAMIZADAS */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{
                  color: 'var(--neutral-light)',
                  fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                  fontSize: '1.0625rem',
                  fontWeight: '600',
                  letterSpacing: '0.0425rem',
                  textTransform: 'capitalize',
                  margin: '0 0 0.5rem 0'
                }}>
                  Design Stack
                </h3>
                <p style={{
                  color: 'var(--neutral-light)',
                  fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                  fontSize: '1.25rem',
                  fontWeight: '200',
                  letterSpacing: '0.0625rem',
                  textTransform: 'capitalize',
                  margin: 0
                }}>
                  {currentProject.designStack || 'Brand Strategy, UI/UX, Development'}
                </p>
              </div>

              <div>
                <h3 style={{
                  color: 'var(--neutral-light)',
                  fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                  fontSize: '1.0625rem',
                  fontWeight: '600',
                  letterSpacing: '0.0425rem',
                  textTransform: 'capitalize',
                  margin: '0 0 0.5rem 0'
                }}>
                  Tech Stack
                </h3>
                <p style={{
                  color: 'var(--neutral-light)',
                  fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                  fontSize: '1.25rem',
                  fontWeight: '200',
                  letterSpacing: '0.0625rem',
                  textTransform: 'capitalize',
                  margin: 0
                }}>
                  {currentProject.techStack || 'React • Node.js • MongoDB'}
                </p>
              </div>
            </div>

            {/* Right Column - Go Live (25%) */}
            <div style={{ flex: '1' }}>
              {currentProject.projectUrl && (
                <div>
                  <h3 style={{
                    color: 'var(--neutral-light)',
                    fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                    fontSize: '1.0625rem',
                    fontWeight: '600',
                    letterSpacing: '0.0425rem',
                    textTransform: 'capitalize',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Go Live
                  </h3>
                  <a 
                    href={currentProject.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--primary-green)',
                      fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                      fontSize: '1.25rem',
                      fontWeight: '400',
                      letterSpacing: '0.0625rem',
                      textTransform: 'capitalize',
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GALLERY SECTION - AGORA COM IMAGENS DINÂMICAS */}
        <div style={{
          backgroundColor: 'var(--neutral-normal)',
          padding: 0,
          width: '100%',
          position: 'relative',
          zIndex: 1,
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* PRIMEIRA IMAGEM - Com animação expansiva */}
            <div 
              ref={firstImageRef}
              style={{
                width: '100%',
                height: 'calc(100vh - 1rem)',
                padding: 0,
                overflow: 'hidden',
                position: 'relative',
                transformOrigin: 'center bottom',
                boxSizing: 'border-box'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'var(--expand-radius, 25px)',
                overflow: 'hidden',
                backgroundColor: 'var(--neutral-normal)',
                transform: 'scale(var(--expand-scale, 1))',
                transformOrigin: 'center bottom',
                willChange: 'transform, border-radius',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
              }}>
                <img 
                  src={galleryImages[0]}
                  alt={`${currentProject.title} - Gallery 1`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            </div>

            {/* IMAGENS 2-5 - Já no estado expandido COM IMAGENS DINÂMICAS */}
            {galleryImages.slice(1).map((imageSrc, i) => (
              <div key={i + 1} style={{
                width: '100%',
                height: '100vh',
                marginLeft: 0,
                marginRight: 0,
                padding: 0,
                borderRadius: '0',
                overflow: 'hidden',
                position: 'relative',
                boxSizing: 'border-box'
              }}>
                <img 
                  src={imageSrc}
                  alt={`${currentProject.title} - Gallery ${i + 2}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* NAVIGATION SECTION - Layout 2x2 com refinamentos */}
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--primary-red)',
          width: '100%',
          position: 'relative',
          zIndex: 2
        }}>
          {/* ROW 1 - Previous Project */}
          <div style={{
            height: '50vh',
            display: 'flex',
            width: '100%'
          }}>
            {/* Previous Project Info - LEFT */}
            <button
              className="modal-navigation-button"
              onClick={goToPrevious}
              disabled={animRef.current.isAnimating}
              style={{
                width: '50%',
                height: '100%',
                backgroundColor: 'var(--primary-red)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: '0.5rem',
                textAlign: 'right',
                border: 'none',
                cursor: animRef.current.isAnimating ? 'wait' : 'pointer',
                overflow: 'hidden',
                transition: 'all 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                opacity: animRef.current.isAnimating ? 0.6 : 1,
                pointerEvents: animRef.current.isAnimating ? 'none' : 'auto'
              }}
              onMouseEnter={(e) => {
                if (animRef.current.isAnimating) return;
                const button = e.currentTarget;
                const title = button.querySelector('h2');
                const label = button.querySelector('span:first-child');
                const tags = button.querySelector('span:last-child');
                
                if (title) title.style.transform = 'scale(1.2)';
                if (label) label.style.transform = 'translateY(-0.5rem)';
                if (tags) tags.style.transform = 'translateY(0.5rem)';
              }}
              onMouseLeave={(e) => {
                const button = e.currentTarget;
                const title = button.querySelector('h2');
                const label = button.querySelector('span:first-child');
                const tags = button.querySelector('span:last-child');
                
                if (title) title.style.transform = 'scale(1)';
                if (label) label.style.transform = 'translateY(0)';
                if (tags) tags.style.transform = 'translateY(0)';
              }}
            >
              <span style={{
                color: 'var(--neutral-light)',
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontSize: '2.8125rem',
                fontWeight: '100',
                letterSpacing: '0.9px',
                lineHeight: '1.3',
                transition: 'transform 360ms cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                Previous project
              </span>
              
              <h2 style={{
                color: 'var(--neutral-light)',
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontSize: '6.25rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                lineHeight: '0.8',
                margin: 0,
                transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)',
                transformOrigin: 'right center'
              }}>
                {prevProject.title}
              </h2>
              
              <span style={{
                color: 'var(--neutral-light)',
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontSize: '1.3125rem',
                fontWeight: '400',
                letterSpacing: '0.84px',
                textTransform: 'uppercase',
                transition: 'transform 360ms cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                {prevProject.tags?.join(' • ') || 'PROJECT'}
              </span>
            </button>

            {/* Previous Project Image - RIGHT */}
            <div style={{
              width: '50%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img 
                src={prevProject.image}
                alt={prevProject.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
            </div>
          </div>

          {/* ROW 2 - Next Project */}
          <div style={{
            height: '50vh',
            display: 'flex',
            width: '100%'
          }}>
            {/* Next Project Image - LEFT */}
            <div style={{
              width: '50%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img 
                src={nextProject.image}
                alt={nextProject.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
            </div>

            {/* Next Project Info - RIGHT */}
            <button
              className="modal-navigation-button"
              onClick={goToNext}
              disabled={animRef.current.isAnimating}
              style={{
                width: '50%',
                height: '100%',
                backgroundColor: 'var(--primary-red)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: '0.5rem',
                textAlign: 'left',
                border: 'none',
                cursor: animRef.current.isAnimating ? 'wait' : 'pointer',
                overflow: 'hidden',
                transition: 'all 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                opacity: animRef.current.isAnimating ? 0.6 : 1,
                pointerEvents: animRef.current.isAnimating ? 'none' : 'auto'
              }}
              onMouseEnter={(e) => {
                if (animRef.current.isAnimating) return;
                const button = e.currentTarget;
                const title = button.querySelector('h2');
                const label = button.querySelector('span:first-child');
                const tags = button.querySelector('span:last-child');
                
                if (title) title.style.transform = 'scale(1.2)';
                if (label) label.style.transform = 'translateY(-0.5rem)';
                if (tags) tags.style.transform = 'translateY(0.5rem)';
              }}
              onMouseLeave={(e) => {
                const button = e.currentTarget;
                const title = button.querySelector('h2');
                const label = button.querySelector('span:first-child');
                const tags = button.querySelector('span:last-child');
                
                if (title) title.style.transform = 'scale(1)';
                if (label) label.style.transform = 'translateY(0)';
                if (tags) tags.style.transform = 'translateY(0)';
              }}
            >
              <span style={{
                color: 'var(--neutral-light)',
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontSize: '2.8125rem',
                fontWeight: '100',
                letterSpacing: '0.9px',
                lineHeight: '1.3',
                transition: 'transform 360ms cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                Next project
              </span>
              
              <h2 style={{
                color: 'var(--neutral-light)',
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontSize: '6.25rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                lineHeight: '0.8',
                margin: 0,
                transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)',
                transformOrigin: 'left center'
              }}>
                {nextProject.title}
              </h2>
              
              <span style={{
                color: 'var(--neutral-light)',
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
                fontSize: '1.3125rem',
                fontWeight: '400',
                letterSpacing: '0.84px',
                textTransform: 'uppercase',
                transition: 'transform 360ms cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                {nextProject.tags?.join(' • ') || 'PROJECT'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  project: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    description: PropTypes.string,
    fullDescription: PropTypes.string,
    designStack: PropTypes.string,
    techStack: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string,
    galleryImages: PropTypes.arrayOf(PropTypes.string),
    projectUrl: PropTypes.string
  }),
  projects: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    description: PropTypes.string,
    fullDescription: PropTypes.string,
    designStack: PropTypes.string,
    techStack: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string,
    galleryImages: PropTypes.arrayOf(PropTypes.string),
    projectUrl: PropTypes.string
  }))
};

export default Modal;