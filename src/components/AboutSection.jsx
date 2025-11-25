// src/components/AboutSection.jsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Temporary placeholder images - replace with your actual assets
const profileImage = new URL('../assets/images/Me-4.jpg', import.meta.url).href;
const brandLogos = [
  new URL('../assets/images/clientes/nike.png', import.meta.url).href,
  new URL('../assets/images/clientes/disney.png', import.meta.url).href,
  new URL('../assets/images/clientes/ray-ban.png', import.meta.url).href,
  new URL('../assets/images/clientes/N1-Logo_Brahma.png', import.meta.url).href,
  new URL('../assets/images/clientes/multishow.png', import.meta.url).href,
  new URL('../assets/images/clientes/hb-munchen.png', import.meta.url).href,
  new URL('../assets/images/clientes/festival-do-rio.png', import.meta.url).href,
  new URL('../assets/images/clientes/art-rio.png', import.meta.url).href,
  new URL('../assets/images/clientes/colortil.png', import.meta.url).href,
  new URL('../assets/images/clientes/woohoo.png', import.meta.url).href,
  new URL('../assets/images/clientes/pettrus-logo.png', import.meta.url).href,
  new URL('../assets/images/clientes/abmn.png', import.meta.url).href,
  new URL('../assets/images/clientes/beep.png', import.meta.url).href,
  new URL('../assets/images/clientes/vizcaya.png', import.meta.url).href,
  new URL('../assets/images/clientes/tvz-logo.png', import.meta.url).href,
  new URL('../assets/images/clientes/noo.png', import.meta.url).href,
  new URL('../assets/images/clientes/agir.png', import.meta.url).href,
];

const AboutSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Fade-in animation on scroll
    const fadeElements = section.querySelectorAll('[data-fade]');
    
    gsap.set(fadeElements, { 
      opacity: 0, 
      y: 30 
    });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(fadeElements, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out'
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section) st.kill();
      });
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className="about-section">
      <div className="about-wrapper">
        
        {/* Hero Top Section */}
        <div className="about-hero">
          <div className="about-photo-column">
            <div className="about-photo">
              <img 
                src={profileImage} 
                alt="Fabricio Sacramento" 
                className="about-photo-img"
              />
            </div>
          </div>

          <div className="about-intro" data-fade>
            <p className="about-label">About me</p>
            <h1 className="about-title">Fabricio Sacramento</h1>
          </div>
        </div>

        {/* Content Section */}
        <div className="about-content">
          <div className="about-content-column">
            {/* LinkedIn Link */}
            <div className="about-link-wrapper" data-fade>
              <a 
                href="https://www.linkedin.com/in/fabricio-sacramento-17508610/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="about-linkedin-link"
              >
                LinkedIn profile
              </a>
            </div>

            {/* Bio Text */}
            <div className="about-bio" data-fade>
              <p className="about-bio-text">
                Experienced Senior UX/UI Designer and Lead with over 15 years of expertise in branding, user-centered design, and digital product development. Known for leading cross-functional teams, improving user engagement through strategic design, and delivering data-driven solutions that meet both user and business goals. Proven success in fast-paced environments, particularly within startups, where I have led design initiatives and contributed to significant user growth and retention. Recognized for impactful work that optimizes UX/UI, boosts conversion rates, and elevates brand presence.
              </p>
            </div>

            {/* Brands Section */}
            <div className="about-brands" data-fade>
              <div className="about-brands-header">
                <h3 className="about-brands-title">Brands I have worked with</h3>
              </div>

              <div className="about-brands-grid">
                {brandLogos.map((logo, index) => (
                  <div key={index} className="about-brand-logo">
                    <img 
                      src={logo} 
                      alt={`Brand ${index + 1}`} 
                      className="about-brand-img"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;