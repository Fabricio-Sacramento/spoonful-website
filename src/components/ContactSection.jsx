// src/components/ContactSection.jsx
// Contact section - estrutura mínima com gerenciamento de interatividade centralizado

import { useEffect, useRef } from 'react';

const ContactSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    console.log('📧 Contact section mounted');

    // Estado inicial: apenas marca aria-hidden
    // setContactInteractivity() controla tabindex centralizadamente
    section.setAttribute('aria-hidden', 'true');

    return () => {
      console.log('🧹 Contact section unmounted');
    };
  }, []);

  return (
    <div ref={sectionRef} className="contact-content">
      <h2 className="contact-heading">Contact</h2>
    </div>
  );
};

export default ContactSection;