import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const Modal = ({ isOpen, onClose, project }) => {
  const modalRef = useRef(null);

  // Fecha modal com ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Previne scroll quando modal aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Clique fora do modal fecha
  const handleOverlayClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className={`modal-overlay ${isOpen ? 'modal-overlay--active' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="modal-content">
        <button 
          className="modal-close"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          ×
        </button>
        
        {/* Conteúdo temporário vazio - será expandido futuramente */}
        <div className="modal-body">
          <h2 style={{ color: 'var(--neutral-light)', margin: 0 }}>
            {project?.title || 'Projeto'}
          </h2>
          <p style={{ color: 'var(--neutral-light)', marginTop: '1rem' }}>
            Modal vazio - aguardando implementação do conteúdo
          </p>
          {project && (
            <div style={{ marginTop: '2rem' }}>
              <p style={{ color: 'var(--neutral-light)', fontSize: '0.9rem' }}>
                Debug: {project.description}
              </p>
              <p style={{ color: 'var(--neutral-light)', fontSize: '0.8rem' }}>
                Tags: {project.tags?.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  project: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string)
  })
};

export default Modal;