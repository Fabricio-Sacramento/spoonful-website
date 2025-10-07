import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import styles from './Modal.module.css';

const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);

// ================================
// HELPERS
// ================================

const nextPaint = () =>
  new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));

const ensureScrollTop = async (el, attempts = 6) => {
  if (!el) return;
  for (let i = 0; i < attempts; i++) {
    el.scrollTop = 0;
    await nextPaint();
    if (el.scrollTop === 0) return;
  }
  el.scrollTop = 0;
};

const safeFocus = (el) => {
  if (!el || typeof el.focus !== 'function') return;
  try {
    el.focus({ preventScroll: true });
  } catch (err) {
    console.error('❌ navigateTo error:', err);
    el.focus();
  }
};

const waitForTransition = (el, timeout = 800, property = 'opacity') => {
  return new Promise((resolve) => {
    if (!el) return resolve({ via: 'no-element' });

    const cs = window.getComputedStyle(el);
    const durations = (cs.transitionDuration || '0').split(',').map(s => parseFloat(s) || 0);
    const maxDuration = Math.max(...durations) * 1000;

    if (maxDuration <= 0) return resolve({ via: 'no-transition' });

    let done = false;

    const onEnd = (e) => {
      if (property !== 'all' && e.propertyName !== property) return;
      if (e.target !== el) return;
      if (done) return;

      done = true;
      el.removeEventListener('transitionend', onEnd);
      clearTimeout(timer);
      resolve({ via: 'event', property: e.propertyName });
    };

    el.addEventListener('transitionend', onEnd, { passive: true });

    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      el.removeEventListener('transitionend', onEnd);
      resolve({ via: 'timeout' });
    }, Math.max(timeout, maxDuration + 80));
  });
};

// ================================
// MODAL COMPONENT
// ================================

const Modal = ({ isOpen, onClose, project, projects = [] }) => {
  const modalRef = useRef(null);
  const firstImageRef = useRef(null);
  const rafRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [fadingState, setFadingState] = useState('visible');

  useEffect(() => {
  if (isOpen) {
    // Força cursor VIEW quando modal abre
    console.log('🎬 Modal opened - forcing cursor VIEW');
    window.dispatchEvent(new CustomEvent('modal:open'));
    } else {
      // ✅ NOVO: Re-detecta posição do mouse ao fechar
      console.log('🎬 Modal closed - re-detecting mouse position');
      window.dispatchEvent(new CustomEvent('modal:close'));
      
      // Aguarda um frame para garantir que o DOM está estável
      requestAnimationFrame(() => {
        // Dispara evento customizado para forçar re-detecção
        window.dispatchEvent(new CustomEvent('modal:redetect-hover'));
      });
    }
  }, [isOpen]);

  const animRef = useRef({ isAnimating: false, suppressScroll: false });
  const [isAnimatingState, setIsAnimatingState] = useState(false);
  const setAnimating = useCallback((val) => {
    animRef.current.isAnimating = !!val;
    setIsAnimatingState(prev => (prev === !!val ? prev : !!val));
  }, []);

  const closeTimersRef = useRef({ hide: null, overlay: null, raf: null });
  const prevFocusRef = useRef(null);
  const isMountedRef = useRef(true);

  const smoothScrollToTop = useCallback((el, duration = 650, preferReduced = false) => {
    return new Promise((resolve) => {
      if (!el || preferReduced) {
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
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        el.scrollTop = Math.round(start * (1 - eased));

        if (t < 1) {
          animId = requestAnimationFrame(animate);
        } else {
          animId = null;
          clearTimeout(safetyId);
          resolve();
        }
      };

      animId = requestAnimationFrame(animate);

      const safetyId = setTimeout(() => {
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
        el.scrollTop = 0;
        resolve();
      }, duration + 120);
    });
  }, []);

  const preloadImage = useCallback((src) => {
    return new Promise((resolve) => {
      if (!src) {
        console.log('📸 No image to preload');
        return resolve();
      }

      const img = new Image();
      let loaded = false;
      let timerId = null;

      const cleanup = () => {
        if (loaded) return;
        loaded = true;
        if (timerId) clearTimeout(timerId);
        img.onload = null;
        img.onerror = null;
        img.src = '';
      };

      img.onload = () => {
        console.log('📸 Image preloaded successfully:', src);
        cleanup();
        resolve();
      };

      img.onerror = () => {
        console.warn('📸 Image preload failed:', src);
        cleanup();
        resolve();
      };

      timerId = setTimeout(() => {
        if (!loaded) {
          console.warn('📸 Image preload timeout:', src);
          cleanup();
          resolve();
        }
      }, 3000);

      img.src = src;
    });
  }, []);

  const navigateTo = useCallback(async (direction) => {
    if (!['next', 'prev'].includes(direction)) {
      console.warn('🚫 Invalid direction:', direction);
      return;
    }

    if (animRef.current.isAnimating) {
      console.warn('🚫 Navigation blocked - animation in progress');
      return;
    }

    const modal = modalRef.current;
    if (!modal) return;

    const preferReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setAnimating(true);
    animRef.current.suppressScroll = true;

    const safety = setTimeout(() => {
      setAnimating(false);
      animRef.current.suppressScroll = false;
      if (!isMountedRef.current) return;
      setFadingState('visible');
    }, 5000);

    const total = projects.length;
    const targetIndex = direction === 'next' ?
      (currentIndex === total - 1 ? 0 : currentIndex + 1) :
      (currentIndex === 0 ? total - 1 : currentIndex - 1);

    try {
      const targetProject = projects[targetIndex];
      const heroSrc = (targetProject.galleryImages && targetProject.galleryImages[0]) || targetProject.image;
      console.log('📸 Preloading image:', heroSrc);
      await preloadImage(heroSrc);

      if (preferReduced) {
        console.log('⚡ Reduced motion - direct swap');
        clearTimeout(safety);
        if (isMountedRef.current) {
          setCurrentIndex(targetIndex);
        }
        setTimeout(() => {
          const title = modal.querySelector('h1') || modal.querySelector('[data-focus-target]');
          safeFocus(title);
        }, 20);
        setAnimating(false);
        animRef.current.suppressScroll = false;
        return;
      }

      console.log('🌫️ Fading out');
      if (!isMountedRef.current) return;
      setFadingState('fading');
      await nextPaint();

      const contentEl = modal.querySelector(`.${styles.modalContent}`);
      if (!contentEl) {
        console.warn('⚠️ Content element not found');
        if (isMountedRef.current) setCurrentIndex(targetIndex);
        return;
      }

      const fadeOutResult = await waitForTransition(contentEl, 700, 'opacity');
      console.log('Fade-out result:', fadeOutResult);

      console.log('⬆️ Scrolling to top');
      await Promise.race([
        smoothScrollToTop(modal, 650, false),
        new Promise(r => setTimeout(r, 1000))
      ]);

      if (!isMountedRef.current) return;
      setCurrentIndex(targetIndex);
      await nextPaint();

      console.log('✨ Fading in');
      if (!isMountedRef.current) return;
      setFadingState('visible');
      await nextPaint();

      await ensureScrollTop(modal);

      if (!modalRef.current) {
        console.warn('⚠️ Modal ref lost after swap');
        return;
      }

      const newContentEl = modal.querySelector(`.${styles.modalContent}`);
      if (!newContentEl) {
        console.warn('⚠️ New content element not found');
        return;
      }

      const fadeInResult = await waitForTransition(newContentEl, 700, 'opacity');
      console.log('Fade-in result:', fadeInResult);

      const hero = modal.querySelector('.modal-hero');
      if (hero) {
        hero.classList.remove('modal-hero--visible');
        setTimeout(() => hero.classList.add('modal-hero--visible'), 80);
      }

      setTimeout(() => {
        const title = modal.querySelector('h1') || modal.querySelector('[data-focus-target]');
        safeFocus(title);
      }, 320);

    } catch (err) {
      console.error('❌ navigateTo error:', err);
      if (isMountedRef.current) {
        setCurrentIndex(targetIndex);
      }
    } finally {
      clearTimeout(safety);
      setAnimating(false);
      animRef.current.suppressScroll = false;
      if (isMountedRef.current) {
        setFadingState('visible');
      }
      console.log('🏁 Animation flags reset');
    }
  }, [currentIndex, projects, preloadImage, smoothScrollToTop, setAnimating]);

  const handleClose = useCallback(() => {
    if (animRef.current.isAnimating) return;

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
    const overlayDuration = prefersReducedMotion ? 120 : 420;
    const staggerDelays = prefersReducedMotion ? [0, 15, 30] : [0, 60, 120];

    setAnimating(true);
    animRef.current.suppressScroll = true;

    const hero = modal.querySelector('.modal-hero');

    if (hero) {
      const items = Array.from(hero.querySelectorAll('[data-reveal]'));

      items.forEach((el, i) => {
        const reverseIndex = items.length - 1 - i;
        const delay = staggerDelays[reverseIndex] ?? (staggerDelays[staggerDelays.length - 1] + (reverseIndex - staggerDelays.length + 1) * 40);
        el.style.transitionDelay = `${delay}ms`;
      });

      hero.classList.add('modal-hero--hiding');
      hero.classList.remove('modal-hero--visible');

      const maxStaggerDelay = Math.max(...staggerDelays.slice(0, Math.min(items.length, staggerDelays.length)));
      const heroHideDuration = Math.round(320 + maxStaggerDelay);
      const overlayStartTime = Math.round(heroHideDuration * 0.6);

      closeTimersRef.current.overlay = window.setTimeout(() => {
        modal.classList.add('modal-overlay--exiting');
        modal.classList.remove('modal-overlay--visible');
      }, overlayStartTime);

      const totalDuration = Math.max(overlayStartTime + overlayDuration, heroHideDuration);

      closeTimersRef.current.hide = window.setTimeout(() => {
        items.forEach(el => {
          el.style.transitionDelay = '';
        });

        setAnimating(false);
        animRef.current.suppressScroll = false;

        if (prevFocusRef.current) {
          safeFocus(prevFocusRef.current);
        }

        closeTimersRef.current = { hide: null, overlay: null, raf: null };
        onClose();
      }, totalDuration);

    } else {
      modal.classList.add('modal-overlay--exiting');
      modal.classList.remove('modal-overlay--visible');

      closeTimersRef.current.hide = window.setTimeout(() => {
        const hero = modal.querySelector('.modal-hero');
        if (hero) {
          hero.classList.remove('modal-hero--visible', 'modal-hero--hiding');
          hero.querySelectorAll('[data-reveal]').forEach(el => {
            el.style.transitionDelay = '';
          });
        }

        setAnimating(false);
        animRef.current.suppressScroll = false;

        if (prevFocusRef.current) {
          safeFocus(prevFocusRef.current);
        }

        closeTimersRef.current = { hide: null, overlay: null, raf: null };
        onClose();
      }, overlayDuration);
    }
  }, [onClose, setAnimating]);

  useEffect(() => {
    if (isOpen) {
      prevFocusRef.current = document.activeElement;
    } else {
      if (prevFocusRef.current) {
        safeFocus(prevFocusRef.current);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      console.log('🧹 Modal closed - resetting all state');
      if (isMountedRef.current) {
        setFadingState('visible');
      }
      setAnimating(false);
      animRef.current.suppressScroll = false;
    }
  }, [isOpen, setAnimating]);

  useEffect(() => {
    return () => {
      if (closeTimersRef.current.raf != null) cancelAnimationFrame(closeTimersRef.current.raf);
      if (closeTimersRef.current.overlay != null) clearTimeout(closeTimersRef.current.overlay);
      if (closeTimersRef.current.hide != null) clearTimeout(closeTimersRef.current.hide);
      closeTimersRef.current = { hide: null, overlay: null, raf: null };
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const overlayDuration = prefersReducedMotion ? 120 : 450;
    const staggerDelays = prefersReducedMotion ? [0, 20, 40] : [0, 90, 160];

    const rafIdRef = { id: null };
    const revealTimeoutRef = { id: null };
    const releaseTimeoutRef = { id: null };
    const focusTimeoutRef = { id: null };

    setAnimating(true);
    animRef.current.suppressScroll = true;

    modal.classList.add('modal-overlay--entering');

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

        const revealStartTime = Math.round(overlayDuration * 0.7);

        revealTimeoutRef.id = window.setTimeout(() => {
          hero.classList.add('modal-hero--visible');

          releaseTimeoutRef.id = window.setTimeout(() => {
            setAnimating(false);
            animRef.current.suppressScroll = false;
          }, Math.round(overlayDuration * 0.3));
        }, revealStartTime);

        const closeButton = modal.querySelector('button[aria-label="Fechar modal"]');
        if (closeButton) {
          focusTimeoutRef.id = window.setTimeout(() => safeFocus(closeButton), overlayDuration + 150);
        }
      } else {
        releaseTimeoutRef.id = window.setTimeout(() => {
          setAnimating(false);
          animRef.current.suppressScroll = false;
        }, overlayDuration);
      }
      closeTimersRef.current.raf = rafIdRef.id;
    });

    return () => {
      if (rafIdRef.id != null) cancelAnimationFrame(rafIdRef.id);
      if (revealTimeoutRef.id != null) clearTimeout(revealTimeoutRef.id);
      if (releaseTimeoutRef.id != null) clearTimeout(releaseTimeoutRef.id);
      if (focusTimeoutRef.id != null) clearTimeout(focusTimeoutRef.id);

      modal.classList.remove('modal-overlay--entering', 'modal-overlay--visible');

      const hero = modal.querySelector('.modal-hero');
      if (hero) {
        hero.classList.remove('modal-hero--visible', 'modal-hero--hiding');
        hero.querySelectorAll('[data-reveal]').forEach(el => {
          el.style.transitionDelay = '';
          el.style.opacity = '';
          el.style.transform = '';
        });
      }

      setAnimating(false);
      animRef.current.suppressScroll = false;
      closeTimersRef.current.raf = null;
    };
  }, [isOpen, setAnimating]);

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

      setAnimating(false);
      animRef.current.suppressScroll = false;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (innerImg && onImgLoad) {
        try {
          innerImg.removeEventListener('load', onImgLoad);
        } catch (err) {
          console.warn('Error removing image load listener', err);
        }
      }
    };
  }, [isOpen, currentIndex, setAnimating]);

  useEffect(() => {
    if (project && projects.length > 0) {
      const index = projects.findIndex(p => p.id === project.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [project, projects]);

  const goToPrevious = useCallback(() => {
    navigateTo('prev');
  }, [navigateTo]);

  const goToNext = useCallback(() => {
    navigateTo('next');
  }, [navigateTo]);

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

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const { currentProject, prevProject, nextProject } = useMemo(() => {
    const current = projects[currentIndex] || projects[0];
    const prevIdx = currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
    const nextIdx = currentIndex === projects.length - 1 ? 0 : currentIndex + 1;

    return {
      currentProject: current,
      prevProject: projects[prevIdx],
      nextProject: projects[nextIdx]
    };
  }, [currentIndex, projects]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  console.log('🔍 RENDER STATE:', {
    currentIndex,
    currentProject: currentProject?.title,
    prevProject: prevProject?.title,
    nextProject: nextProject?.title,
    fadingState,
    isAnimatingState
  });

  if (!isOpen || projects.length === 0) return null;

  const getGalleryImages = (project) => {
    if (project.galleryImages && project.galleryImages.length >= 5) {
      return project.galleryImages.slice(0, 5);
    }
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
      <button
        onClick={handleClose}
        className="modal-close-button"
        aria-label="Fechar modal"
      >
        ×
      </button>

      <div className={`${styles.modalContent} ${fadingState === 'fading' ? styles.fading : ''}`}>
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
          <div data-reveal className="modal-hero-tags">
            {currentProject.tags?.join(' • ') || 'PROJECT'}
          </div>

          <h1
            data-reveal
            data-focus-target
            tabIndex="-1"
            className="modal-hero-title"
          >
            {currentProject.title}
          </h1>

          <div data-reveal className="modal-hero-content-wrapper">
            <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 className="modal-hero-subtitle">
                {currentProject.subtitle || currentProject.description}
              </h2>

              <p className="modal-hero-description">
                {currentProject.fullDescription || currentProject.description}
              </p>
            </div>

            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 className="modal-stack-label">
                  Design Stack
                </h3>
                <p className="modal-stack-value">
                  {currentProject.designStack || 'Brand Strategy, UI/UX, Development'}
                </p>
              </div>

              <div>
                <h3 className="modal-stack-label">
                  Tech Stack
                </h3>
                <p className="modal-stack-value">
                  {currentProject.techStack || 'React • Node.js • MongoDB'}
                </p>
              </div>
            </div>

            <div style={{ flex: '1' }}>
              {currentProject.projectUrl && (
                <div>
                  <h3 className="modal-stack-label">
                    Go Live
                  </h3>
                  <a
                    href={currentProject.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-link"
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

        <div style={{
          backgroundColor: 'var(--neutral-normal)',
          padding: 0,
          width: '100%',
          position: 'relative',
          zIndex: 1,
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div
              ref={firstImageRef}
              className="modal-gallery-image-first"
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

            {galleryImages.slice(1).map((imageSrc, i) => (
              <div key={i + 1} className="modal-gallery-image">
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

        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--primary-red)',
          width: '100%',
          position: 'relative',
          zIndex: 2
        }}>
          <div className="modal-nav-row">
            <button
              className="modal-nav-button-wrapper"
              onClick={goToPrevious}
              disabled={isAnimatingState}
              style={{
                alignItems: 'flex-end',
                textAlign: 'right',
                cursor: isAnimatingState ? 'wait' : 'pointer',
                opacity: isAnimatingState ? 0.6 : 1,
                pointerEvents: isAnimatingState ? 'none' : 'auto'
              }}
              onMouseEnter={(e) => {
                if (isAnimatingState) return;
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
              <span className="modal-nav-label">
                Previous project
              </span>

              <h2 className="modal-nav-title" style={{
                transformOrigin: 'right center'
              }}>
                {prevProject.title}
              </h2>

              <span className="modal-nav-tags">
                {prevProject.tags?.join(' • ') || 'PROJECT'}
              </span>
            </button>

            <div className="modal-nav-image-wrapper">
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

          <div className="modal-nav-row">
            <div className="modal-nav-image-wrapper">
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

            <button
              className="modal-nav-button-wrapper"
              onClick={goToNext}
              disabled={isAnimatingState}
              style={{
                alignItems: 'flex-start',
                textAlign: 'left',
                cursor: isAnimatingState ? 'wait' : 'pointer',
                opacity: isAnimatingState ? 0.6 : 1,
                pointerEvents: isAnimatingState ? 'none' : 'auto'
              }}
              onMouseEnter={(e) => {
                if (isAnimatingState) return;
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
              <span className="modal-nav-label">
                Next project
              </span>

              <h2 className="modal-nav-title" style={{
                transformOrigin: 'left center'
              }}>
                {nextProject.title}
              </h2>

              <span className="modal-nav-tags">
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