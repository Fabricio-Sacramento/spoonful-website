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
// 🆕 RENDER SLIDE - Suporte a iFrames
// ================================

/**
 * Renderiza um slide do gallery (imagem ou iframe)
 * Suporta backward compatibility com strings (formato legacy)
 */
const renderSlide = (slide, index, projectTitle) => {
  // Backward compatibility: se for string, é imagem legacy
  if (typeof slide === 'string') {
    return (
      <div key={index} className="modal-gallery-image">
        <img
          src={slide}
          alt={`${projectTitle} - Gallery ${index + 1}`}
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
    );
  }

  // Novo formato: iframe
  if (slide.type === 'iframe') {
    const aspectRatio = slide.aspectRatio || '16/9';
    
    return (
      <div 
        key={index} 
        className="modal-gallery-iframe-container"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: aspectRatio,
          backgroundColor: 'var(--neutral-normal, #1a1a1a)',
          overflow: 'hidden'
        }}
      >
        {/* Loading skeleton */}
        <div 
          className="modal-gallery-iframe-loading"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />
        
        <iframe
          src={slide.url}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={false}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            zIndex: 2
          }}
          onLoad={(e) => {
            // Remove loading skeleton ao carregar
            const container = e.target.closest('.modal-gallery-iframe-container');
            const loader = container?.querySelector('.modal-gallery-iframe-loading');
            if (loader) loader.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Novo formato: imagem como objeto
  if (slide.type === 'image') {
    return (
      <div key={index} className="modal-gallery-image">
        <img
          src={slide.src}
          alt={`${projectTitle} - Gallery ${index + 1}`}
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
    );
  }

  // Fallback: tipo desconhecido
  console.warn(`⚠️ Unknown slide type at index ${index}:`, slide);
  return null;
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
    window.dispatchEvent(new CustomEvent('modal:open'));
    } else {
      // ✅ NOVO: Re-detecta posição do mouse ao fechar
      window.dispatchEvent(new CustomEvent('modal:close'));
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
      
      // 🆕 Preload apenas se for imagem (string ou objeto com type='image')
      const firstSlide = targetProject.galleryImages?.[0];
      let heroSrc = null;
      
      if (typeof firstSlide === 'string') {
        heroSrc = firstSlide;
      } else if (firstSlide?.type === 'image') {
        heroSrc = firstSlide.src;
      }
      
      if (heroSrc) {
        await preloadImage(heroSrc);
      }

      if (preferReduced) {
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

      if (!isMountedRef.current) return;
      setFadingState('fading');
      await nextPaint();

      const contentEl = modal.querySelector(`.${styles.modalContent}`);
      if (!contentEl) {
        console.warn('⚠️ Content element not found');
        if (isMountedRef.current) setCurrentIndex(targetIndex);
        return;
      }

      await waitForTransition(contentEl, 700, 'opacity');

      await Promise.race([
        smoothScrollToTop(modal, 0, true),
        new Promise(r => setTimeout(r, 20))
      ]);

      if (!isMountedRef.current) return;
      setCurrentIndex(targetIndex);
      setFadingState('visible');
      await nextPaint();

      await waitForTransition(contentEl, 700, 'opacity');

      clearTimeout(safety);

      setTimeout(() => {
        const title = modal.querySelector('h1') || modal.querySelector('[data-focus-target]');
        safeFocus(title);
      }, 50);

    } catch (err) {
      console.error('❌ navigateTo error:', err);
    } finally {
      setAnimating(false);
      animRef.current.suppressScroll = false;
    }
  }, [currentIndex, projects, preloadImage, smoothScrollToTop, setAnimating]);

  const goToNext = useCallback(() => navigateTo('next'), [navigateTo]);
  const goToPrevious = useCallback(() => navigateTo('prev'), [navigateTo]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    prevFocusRef.current = document.activeElement;

    const modal = modalRef.current;
    if (!modal) return;

    const handleKeyDown = (e) => {
      if (animRef.current.isAnimating) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    // 🆕 Força o foco no overlay (evita que iframe roube o foco do teclado)
    setTimeout(() => {
      if (modal) {
        modal.setAttribute('tabindex', '-1');
        safeFocus(modal);
      }
    }, 100);

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, goToPrevious, goToNext]);

  useEffect(() => {
    if (project) {
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx !== -1 && idx !== currentIndex) {
        setCurrentIndex(idx);
      }
    }
  }, [project, projects, currentIndex]);

  useEffect(() => {
    const modalEl = modalRef.current;
    if (!modalEl || animRef.current.suppressScroll) return;

    const handleWheel = (e) => {
      if (animRef.current.suppressScroll) {
        e.preventDefault();
        return;
      }

      const scrollTop = modalEl.scrollTop;
      const scrollHeight = modalEl.scrollHeight;
      const clientHeight = modalEl.clientHeight;
      const atTop = scrollTop <= 1;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
        e.preventDefault();
      }
    };

    modalEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => modalEl.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const firstImageEl = firstImageRef.current;
    if (!firstImageEl) return;

    let scrollSub = null;
    let rafId = null;

    const calculateExpansion = (scrollTop, scrollHeight, clientHeight) => {
      const heroBottomRange = scrollHeight * 0.5;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 2;

      if (atBottom) return { scale: 1, radius: 0 };

      const t = clamp(scrollTop / heroBottomRange, 0, 1);
      const scale = 1 + t * 0.04;
      const radius = 25 * (1 - t);
      return { scale, radius };
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = rafRef.current = requestAnimationFrame(() => {
        rafId = null;
        const modal = modalRef.current;
        if (!modal) return;

        const { scrollTop, scrollHeight, clientHeight } = modal;
        const { scale, radius } = calculateExpansion(scrollTop, scrollHeight, clientHeight);

        firstImageEl.style.setProperty('--expand-scale', scale.toFixed(4));
        firstImageEl.style.setProperty('--expand-radius', `${radius.toFixed(2)}px`);
      });
    };

    const modal = modalRef.current;
    if (modal) {
      scrollSub = onScroll;
      modal.addEventListener('scroll', scrollSub, { passive: true });
      onScroll();
    }

    return () => {
      if (scrollSub && modal) {
        modal.removeEventListener('scroll', scrollSub);
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafRef.current = null;
      }
    };
  }, [isOpen, currentIndex]);

  useEffect(() => {
    if (!isOpen) {
      const timers = closeTimersRef.current;
      [timers.hide, timers.overlay, timers.raf].forEach(t => {
        if (t != null) clearTimeout(t);
      });
      timers.hide = timers.overlay = timers.raf = null;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const currentProject = useMemo(
    () => projects[currentIndex] || project,
    [projects, currentIndex, project]
  );

  const prevIndex = useMemo(() => {
    if (projects.length === 0) return 0;
    return currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
  }, [currentIndex, projects.length]);

  const nextIndex = useMemo(() => {
    if (projects.length === 0) return 0;
    return currentIndex === projects.length - 1 ? 0 : currentIndex + 1;
  }, [currentIndex, projects.length]);

  const prevProject = useMemo(() => projects[prevIndex] || project, [projects, prevIndex, project]);
  const nextProject = useMemo(() => projects[nextIndex] || project, [projects, nextIndex, project]);

  const galleryImages = useMemo(
    () => currentProject?.galleryImages || [currentProject?.image],
    [currentProject]
  );

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={modalRef}
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--neutral-normal)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`${styles.modalContent} ${fadingState === 'fading' ? styles.fading : ''}`}>
        <div style={{
          backgroundColor: 'var(--neutral-normal)',
          width: '100%',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--modal-header-padding-y, clamp(1.5rem, 4vw, 3rem)) var(--modal-header-padding-x, clamp(1.5rem, 4vw, 3rem))',
            gap: 'var(--modal-header-gap, 1rem)',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            <div style={{ minWidth: 0, flex: '1 1 auto' }}>
              <h1
                data-focus-target
                tabIndex="-1"
                style={{
                  fontSize: 'var(--modal-title-size, clamp(2rem, 6vw, 5rem))',
                  fontWeight: 700,
                  color: 'var(--neutral-light)',
                  margin: 0,
                  lineHeight: 0.95,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  outline: 'none'
                }}
              >
                {currentProject.title}
              </h1>

              <p style={{
                fontSize: 'var(--modal-subtitle-size, clamp(0.875rem, 2vw, 1.125rem))',
                color: 'var(--neutral-medium)',
                margin: 'var(--modal-subtitle-margin, clamp(0.5rem, 1.5vw, 1rem)) 0 0',
                fontWeight: 400,
                lineHeight: 1.4,
                maxWidth: '60ch',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'normal'
              }}>
                {currentProject.subtitle}
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={isAnimatingState}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--neutral-light)',
                fontSize: 'var(--modal-close-size, clamp(2rem, 4vw, 3rem))',
                cursor: isAnimatingState ? 'wait' : 'pointer',
                lineHeight: 1,
                padding: 0,
                width: 'var(--modal-close-size, clamp(2rem, 4vw, 3rem))',
                height: 'var(--modal-close-size, clamp(2rem, 4vw, 3rem))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: isAnimatingState ? 0.5 : 1,
                pointerEvents: isAnimatingState ? 'none' : 'auto',
                transition: 'color 200ms ease, opacity 200ms ease'
              }}
              onMouseEnter={(e) => {
                if (!isAnimatingState) e.currentTarget.style.color = 'var(--primary-red)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--neutral-light)';
              }}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--neutral-normal)',
          width: '100%',
          position: 'relative',
          zIndex: 1,
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--modal-content-gap, clamp(2rem, 5vw, 4rem))',
            padding: '0 var(--modal-content-padding-x, clamp(1.5rem, 4vw, 3rem)) var(--modal-content-padding-bottom, clamp(3rem, 6vw, 5rem))',
            boxSizing: 'border-box',
            maxWidth: '100%'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 'var(--modal-info-grid-gap, clamp(1.5rem, 3vw, 2rem))',
              width: '100%'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--modal-info-section-gap, 0.75rem)'
              }}>
                <h3 style={{
                  fontSize: 'var(--modal-section-title-size, clamp(0.75rem, 2vw, 0.875rem))',
                  fontWeight: 600,
                  color: 'var(--neutral-medium)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0
                }}>
                  About
                </h3>
                <p style={{
                  fontSize: 'var(--modal-body-size, clamp(0.875rem, 2vw, 1rem))',
                  color: 'var(--neutral-light)',
                  lineHeight: 1.6,
                  margin: 0,
                  maxWidth: '65ch'
                }}>
                  {currentProject.fullDescription || currentProject.description}
                </p>
              </div>

              {currentProject.designStack && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--modal-info-section-gap, 0.75rem)'
                }}>
                  <h3 style={{
                    fontSize: 'var(--modal-section-title-size, clamp(0.75rem, 2vw, 0.875rem))',
                    fontWeight: 600,
                    color: 'var(--neutral-medium)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: 0
                  }}>
                    Design Stack
                  </h3>
                  <p style={{
                    fontSize: 'var(--modal-body-size, clamp(0.875rem, 2vw, 1rem))',
                    color: 'var(--neutral-light)',
                    lineHeight: 1.6,
                    margin: 0,
                    maxWidth: '65ch'
                  }}>
                    {currentProject.designStack}
                  </p>
                </div>
              )}

              {currentProject.techStack && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--modal-info-section-gap, 0.75rem)'
                }}>
                  <h3 style={{
                    fontSize: 'var(--modal-section-title-size, clamp(0.75rem, 2vw, 0.875rem))',
                    fontWeight: 600,
                    color: 'var(--neutral-medium)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: 0
                  }}>
                    Tech Stack
                  </h3>
                  <p style={{
                    fontSize: 'var(--modal-body-size, clamp(0.875rem, 2vw, 1rem))',
                    color: 'var(--neutral-light)',
                    lineHeight: 1.6,
                    margin: 0,
                    maxWidth: '65ch'
                  }}>
                    {currentProject.techStack}
                  </p>
                </div>
              )}
            </div>

            {currentProject.projectUrl && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--modal-cta-gap, 1rem)'
              }}>
                <a
                  href={currentProject.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--modal-button-padding, clamp(0.75rem, 2vw, 1rem)) var(--modal-button-padding-x, clamp(1.5rem, 3vw, 2rem))',
                    backgroundColor: 'var(--primary-red)',
                    color: 'var(--neutral-light)',
                    fontSize: 'var(--modal-button-size, clamp(0.875rem, 2vw, 1rem))',
                    fontWeight: 600,
                    textDecoration: 'none',
                    borderRadius: 'var(--modal-button-radius, 0.5rem)',
                    transition: 'transform 200ms ease, background-color 200ms ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.backgroundColor = 'var(--primary-red-dark, #c41e3a)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = 'var(--primary-red)';
                  }}
                >
                  Visit Website
                </a>
              </div>
            )}
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
            {/* 🆕 Primeiro slide com lógica especial de expansão */}
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
                {typeof galleryImages[0] === 'string' ? (
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
                ) : galleryImages[0]?.type === 'image' ? (
                  <img
                    src={galleryImages[0].src}
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
                ) : galleryImages[0]?.type === 'iframe' ? (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--neutral-normal, #1a1a1a)'
                  }}>
                    <iframe
                      src={galleryImages[0].url}
                      loading="lazy"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {/* 🆕 Demais slides com renderSlide() */}
            {galleryImages.slice(1).map((slide, i) => 
              renderSlide(slide, i + 1, currentProject.title)
            )}
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
    galleryImages: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          type: PropTypes.oneOf(['image', 'iframe']).isRequired,
          src: PropTypes.string,
          url: PropTypes.string,
          aspectRatio: PropTypes.string
        })
      ])
    ),
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
    galleryImages: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          type: PropTypes.oneOf(['image', 'iframe']).isRequired,
          src: PropTypes.string,
          url: PropTypes.string,
          aspectRatio: PropTypes.string
        })
      ])
    ),
    projectUrl: PropTypes.string
  }))
};

export default Modal;