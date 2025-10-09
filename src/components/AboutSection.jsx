// src/components/AboutSection.jsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Temporary placeholder images - replace with your actual assets
const profileImage = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop";
const brandLogos = [
  "https://via.placeholder.com/113x70/333/fff?text=Nike",
  "https://via.placeholder.com/113x70/333/fff?text=Disney",
  "https://via.placeholder.com/113x70/333/fff?text=Brand+3",
  "https://via.placeholder.com/113x70/333/fff?text=Brand+4",
  "https://via.placeholder.com/113x70/333/fff?text=Brand+5",
  "https://via.placeholder.com/113x70/333/fff?text=Brand+6",
  "https://via.placeholder.com/113x70/333/fff?text=Brand+7",
  "https://via.placeholder.com/113x70/333/fff?text=Brand+8",
  "https://via.placeholder.com/113x70/333/fff?text=Brand+9",
  "https://via.placeholder.com/113x70/333/fff?text=Brand+10",
  "https://via.placeholder.com/113x70/333/fff?text=Brand+11",
  "https://via.placeholder.com/113x70/333/fff?text=Brand+12",
  "https://via.placeholder.com/113x70/333/fff?text=Brand+13",
  "https://via.placeholder.com/113x70/333/fff?text=Brand+14"
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
                href="https://linkedin.com/in/fabriciosacramento" 
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
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