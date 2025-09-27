import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);

const Modal = ({ isOpen, onClose, project, projects = [] }) => {
  const modalRef = useRef(null);
  const firstImageRef = useRef(null);
  const rafRef = useRef(null);
  const prevFocusRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animation control refs
  const animRef = useRef({ isAnimating: false, suppressScroll: false });
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  // Current project from projects array (fallback to single project)
  const currentProject = projects?.[currentIndex] ?? project;

  // Navigation functions
  const goToPrevious = useCallback(() => {
    if (animRef.current.isAnimating) return;
    setCurrentIndex(prev => (projects.length ? (prev === 0 ? projects.length - 1 : prev - 1) : 0));
  }, [projects.length]);

  const goToNext = useCallback(() => {
    if (animRef.current.isAnimating) return;
    setCurrentIndex(prev => (projects.length ? (prev === projects.length - 1 ? 0 : prev + 1) : 0));
  }, [projects.length]);

  // ===== Handlers declared before effects that reference them =====
  const handleClose = useCallback(() => {
    if (prevFocusRef.current) {
      try {
        prevFocusRef.current.focus();
      } catch (err) {
        console.warn('Error restoring focus', err);
      }
      prevFocusRef.current = null;
    }
    onClose();
  }, [onClose]);

  const handleOverlayClick = useCallback((e) => {
    // close only when clicking overlay itself
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Open animation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const prefersMotion = !prefersReducedMotion.current;

    // capture previous focus
    prevFocusRef.current = document.activeElement;

    // copie a referência para um valor local
    const currentAnim = animRef.current;
    currentAnim.isAnimating = true;
    currentAnim.suppressScroll = true;

    const overlayDuration = prefersMotion ? 450 : 120;
    const staggerDelays = prefersMotion ? [0, 90, 160] : [0, 20, 40];
    const revealDelay = Math.round(overlayDuration * 0.7);

    const heroSection = modal.querySelector('[data-reveal="hero"]');
    const gallerySection = modal.querySelector('[data-reveal="gallery"]');
    const navigationSection = modal.querySelector('[data-reveal="navigation"]');
    const revealElements = [heroSection, gallerySection, navigationSection].filter(Boolean);

    modal.classList.add('modal-opening');
    revealElements.forEach(el => el && el.classList.add('modal-element-hidden'));

    // store raf id so we can cancel on cleanup
    rafRef.current = requestAnimationFrame(() => {
      modal.style.clipPath = 'inset(0 0 0 0)';
    });
    modal.style.clipPath = 'inset(100% 0 0 0)';
    modal.style.transition = `clip-path ${overlayDuration}ms cubic-bezier(0.16,1,0.3,1)`;

    const revealTimeout = setTimeout(() => {
      revealElements.forEach((el, i) => {
        if (!el) return;
        setTimeout(() => {
          el.classList.remove('modal-element-hidden');
          el.classList.add('modal-element-visible');
        }, staggerDelays[i] ?? 0);
      });
    }, revealDelay);

    const totalDuration = overlayDuration + Math.max(...staggerDelays) + (prefersMotion ? 380 : 80);
    const scrollReleaseDelay = Math.round(totalDuration * 0.7);

    const scrollTimeout = setTimeout(() => {
      currentAnim.suppressScroll = false;
    }, scrollReleaseDelay);

    const completeTimeout = setTimeout(() => {
      currentAnim.isAnimating = false;
      modal.classList.remove('modal-opening');
      const focusTarget = modal.querySelector('h1') || modal;
      if (focusTarget) {
        try { focusTarget.focus(); } catch (err) { console.warn('Focus failed', err); }
      }
    }, totalDuration);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      clearTimeout(revealTimeout);
      clearTimeout(scrollTimeout);
      clearTimeout(completeTimeout);
      // cleanup classes & styles to keep DOM tidy
      modal.classList.remove('modal-opening');
      modal.style.clipPath = '';
      modal.style.transition = '';
      revealElements.forEach(el => {
        if (!el) return;
        el.classList.remove('modal-element-hidden', 'modal-element-visible');
      });
      // garante reset das flags usando a cópia local
      currentAnim.isAnimating = false;
      currentAnim.suppressScroll = false;
    };
  }, [isOpen]);

  // Scroll-driven animation for first image (uses rafRef as throttle)
  useEffect(() => {
    if (!isOpen || !firstImageRef.current) return;
    const target = firstImageRef.current;
    const scroller = modalRef.current;
    if (!scroller) return;

    let ticking = false;

    const computeAndApply = () => {
      ticking = false;
      if (animRef.current.suppressScroll || animRef.current.isAnimating) return;
      const targetRect = target.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      const rootHalf = scroller.clientHeight / 2 || window.innerHeight / 2;
      const elemTop = targetRect.top - scrollerRect.top;
      const progress = clamp((rootHalf - elemTop) / rootHalf, 0, 1);
      const scale = 0.9 + 0.12 * progress;
      const radius = 25 * (1 - progress);
      target.style.setProperty('--expand-scale', String(scale));
      target.style.setProperty('--expand-radius', `${radius}px`);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      rafRef.current = requestAnimationFrame(computeAndApply);
    };

    // initial apply
    computeAndApply();
    scroller.addEventListener('scroll', onScroll, { passive: true });

    // re-run on resize / image load
    const onResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(computeAndApply);
    };
    window.addEventListener('resize', onResize);

    const img = target.querySelector('img');
    const onImgLoad = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(computeAndApply);
    };
    if (img && !img.complete) img.addEventListener('load', onImgLoad, { once: true });

    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (img) {
        try { img.removeEventListener('load', onImgLoad); } catch (err) { 
          console.warn('Error removing image load listener', err); 
        }
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isOpen, currentIndex]);

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

  // Keyboard navigation (safe: handleClose declared earlier)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (animRef.current.isAnimating) return;
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        default:
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToPrevious, goToNext, handleClose]);

  // Focus capture
  useEffect(() => {
    if (isOpen) prevFocusRef.current = document.activeElement;
  }, [isOpen]);

  // Update current index when project prop changes
  useEffect(() => {
    if (project && projects.length > 0) {
      const index = projects.findIndex(p => p.id === project.id);
      if (index !== -1) setCurrentIndex(index);
    }
  }, [project, projects]);

  if (!isOpen || !currentProject) return null;

  // Gallery fallback: ensure 5 images
  const gallery = currentProject.galleryImages ?? [];
  const gallerySlice = gallery.slice(0, 5);
  const galleryToRender = gallerySlice.length >= 5
    ? gallerySlice
    : [...gallerySlice, ...new Array(5 - gallerySlice.length).fill(currentProject.image)];

  // Navigation neighbors
  const prevIndex = projects.length ? (currentIndex === 0 ? projects.length - 1 : currentIndex - 1) : null;
  const nextIndex = projects.length ? (currentIndex === projects.length - 1 ? 0 : currentIndex + 1) : null;
  const prevProject = prevIndex != null ? projects[prevIndex] : null;
  const nextProject = nextIndex != null ? projects[nextIndex] : null;

  return createPortal(
    <div
      ref={modalRef}
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
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
      {/* Close Button */}
      <button
        onClick={handleClose}
        aria-label="Close modal"
        style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          zIndex: 10001,
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'var(--neutral-light)',
          fontSize: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s ease'
        }}
      >
        ×
      </button>

      {/* HERO */}
      <section data-reveal="hero" style={{ display: 'flex', height: '60vh', backgroundColor: 'var(--neutral-normal)' }}>
        <div style={{
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: currentProject.backgroundColor || 'var(--primary-cyan)',
          padding: '2rem'
        }}>
          <img src={currentProject.image} alt={currentProject.title} loading="eager" style={{
            width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1.5625rem'
          }} />
        </div>

        <div style={{ flex: '1', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'var(--neutral-light)' }}>
          <div style={{ marginBottom: '2rem' }}>
            {currentProject.tags?.map((tag, i) => (
              <span key={i} style={{
                display: 'inline-block',
                backgroundColor: 'var(--primary-green)',
                color: 'var(--neutral-dark)',
                padding: '0.5rem 1rem',
                marginRight: '0.5rem',
                marginBottom: '0.5rem',
                borderRadius: '1.25rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{tag}</span>
            ))}
          </div>

          <div style={{ flex: '1', marginBottom: '2rem' }}>
            <h1 id="modal-title" style={{ fontSize: '3rem', fontWeight: '900', lineHeight: 1.1, marginBottom: '1rem', fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif' }}>
              {currentProject.title}
            </h1>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 300, lineHeight: 1.3, marginBottom: '1.5rem' }}>{currentProject.subtitle}</h2>

            <p style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>{currentProject.fullDescription}</p>

            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Design & Strategy</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{currentProject.designStack}</p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Technology</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{currentProject.techStack}</p>
            </div>
          </div>

          <div>
            {currentProject.projectUrl && (
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Go Live</h3>
                <a href={currentProject.projectUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--primary-green)', color: 'var(--neutral-dark)', textDecoration: 'none',
                  borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 600, transition: 'transform 0.2s ease'
                }}>
                  Visit Website →
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section data-reveal="gallery" style={{ display: 'flex', gap: '2rem', padding: '2rem', backgroundColor: 'var(--neutral-normal)' }}>
        {galleryToRender.map((src, i) => (
          <div key={i} ref={i === 0 ? firstImageRef : null} style={{
            flexShrink: 0,
            height: i === 0 ? 'calc(100vh - 1rem)' : '100vh',
            width: 'auto',
            aspectRatio: '16/9',
            transform: i === 0 ? 'scale(var(--expand-scale, 0.9))' : 'none',
            borderRadius: i === 0 ? 'var(--expand-radius, 25px)' : '1.5625rem',
            overflow: 'hidden',
            transformOrigin: 'center bottom',
            transition: i === 0 ? 'none' : 'transform 0.3s ease',
            backgroundColor: currentProject.backgroundColor || 'var(--primary-cyan)'
          }}>
            <img src={src} alt={`${currentProject.title} - ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} decoding={i === 0 ? 'sync' : 'async'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </section>

      {/* NAVIGATION */}
      <section data-reveal="navigation" style={{ height: '100vh', display: 'grid', gridTemplateRows: '1fr 1fr', backgroundColor: 'var(--neutral-normal)' }}>
        {prevProject && (
          <button onClick={goToPrevious} className="modal-navigation-button" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: '3rem', border: 'none',
            backgroundColor: 'transparent', color: 'var(--neutral-light)', cursor: 'pointer', textAlign: 'left', overflow: 'hidden', position: 'relative'
          }}>
            <span style={{ color: 'var(--neutral-light)', fontSize: '2.8125rem', fontWeight: 100, lineHeight: 1.3, transition: 'transform 360ms ease' }}>Previous project</span>

            <h2 style={{ color: 'var(--neutral-light)', fontSize: '6.25rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>{prevProject.title}</h2>

            <span style={{ color: 'var(--neutral-light)', fontSize: '1.3125rem', fontWeight: 400 }}>{prevProject.tags?.join(' • ')}</span>

            <div style={{ width: '20rem', height: '12rem', borderRadius: '1.5625rem', overflow: 'hidden', backgroundColor: prevProject.backgroundColor || 'var(--primary-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={prevProject.image} alt={prevProject.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </button>
        )}

        {nextProject && (
          <button onClick={goToNext} className="modal-navigation-button" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: '3rem', border: 'none',
            backgroundColor: 'transparent', color: 'var(--neutral-light)', cursor: 'pointer', textAlign: 'right', overflow: 'hidden', position: 'relative'
          }}>
            <div style={{ width: '20rem', height: '12rem', borderRadius: '1.5625rem', overflow: 'hidden', backgroundColor: nextProject.backgroundColor || 'var(--primary-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={nextProject.image} alt={nextProject.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <span style={{ color: 'var(--neutral-light)', fontSize: '2.8125rem', fontWeight: 100, lineHeight: 1.3 }}>Next project</span>

            <h2 style={{ color: 'var(--neutral-light)', fontSize: '6.25rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>{nextProject.title}</h2>

            <span style={{ color: 'var(--neutral-light)', fontSize: '1.3125rem', fontWeight: 400 }}>{nextProject.tags?.join(' • ')}</span>
          </button>
        )}
      </section>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  project: PropTypes.object,
  projects: PropTypes.array
};

export default Modal;