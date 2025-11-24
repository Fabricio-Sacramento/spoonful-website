// src/scripts/projects.js
// Imports das imagens - estrutura real do projeto

// itaway
import itawaySlide01 from '../assets/images/itaway/slide-01.jpg';
import itawaySlide02 from '../assets/images/itaway/slide-02.jpg';
import itawaySlide03 from '../assets/images/itaway/slide-03.jpg';
import itawaySlide04 from '../assets/images/itaway/slide-04.jpg';
import itawaySlide05 from '../assets/images/itaway/slide-05.jpg';
import itawaySlide06 from '../assets/images/itaway/slide-06.jpg';
import itawaySlide07 from '../assets/images/itaway/slide-07.jpg';

// tropiview
import tropiviewSlide01 from '../assets/images/tropiview/slide-01.jpg';
import tropiviewSlide02 from '../assets/images/tropiview/slide-02.jpg';
import tropiviewSlide03 from '../assets/images/tropiview/slide-03.jpg';
import tropiviewSlide04 from '../assets/images/tropiview/slide-04.jpg';
import tropiviewSlide05 from '../assets/images/tropiview/slide-05.jpg';

// humaita_digital
import humaitaSlide01 from '../assets/images/humaita_digital/slide-01.jpg';
import humaitaSlide02 from '../assets/images/humaita_digital/slide-02.jpg';
import humaitaSlide03 from '../assets/images/humaita_digital/slide-03.jpg';
import humaitaSlide04 from '../assets/images/humaita_digital/slide-04.jpg';
import humaitaSlide05 from '../assets/images/humaita_digital/slide-05.jpg';

// hysteria
import hysteriaSlide01 from '../assets/images/hysteria/slide-01.jpg';
//import hysteriaSlide02 from '../assets/images/hysteria/slide-02.jpg';
import hysteriaSlide03 from '../assets/images/hysteria/slide-03.jpg';
import hysteriaSlide04 from '../assets/images/hysteria/slide-04.jpg';
import hysteriaSlide05 from '../assets/images/hysteria/slide-05.jpg';
import hysteriaSlide06 from '../assets/images/hysteria/slide-06.jpg';

// myhabitat
import myhabitatSlide01 from '../assets/images/myhabitat/slide-01.jpg';
//import myhabitatSlide02 from '../assets/images/myhabitat/slide-02.jpg';
import myhabitatSlide03 from '../assets/images/myhabitat/slide-03.jpg';
import myhabitatSlide04 from '../assets/images/myhabitat/slide-04.jpg';
import myhabitatSlide05 from '../assets/images/myhabitat/slide-05.jpg';
import myhabitatSlide06 from '../assets/images/myhabitat/slide-06.jpg';
import myhabitatSlide07 from '../assets/images/myhabitat/slide-07.jpg';

// urban-woof
import urbanwoofSlide01 from '../assets/images/urban-woof/slide-01.jpg';
import urbanwoofSlide02 from '../assets/images/urban-woof/slide-02.jpg';
import urbanwoofSlide03 from '../assets/images/urban-woof/slide-03.jpg';
import urbanwoofSlide04 from '../assets/images/urban-woof/slide-04.jpg';
import urbanwoofSlide05 from '../assets/images/urban-woof/slide-05.jpg';

export const projects = [
  {
    id: 1,
    title: "Itaway Ecotours",
    subtitle: "Complete Brand & Digital Platform Redesign for Sustainable Tourism",
    description: "End-to-end rebranding and digital transformation for Rio's premier ecotourism operator",
    fullDescription: "Comprehensive brand overhaul that repositioned Itaway Ecotours as a contemporary, authentic sustainable tourism brand. The project encompassed strategic brand positioning, complete visual identity redesign, and full-stack digital platform development. From Figma to implementation, the solution included a robust design system, custom WordPress theme architecture, and a React-based booking widget for seamless tour reservations. The result is a cohesive digital experience that reflects Rio's authentic adventure spirit while supporting operational efficiency.",
    designStack: "Brand Strategy & Positioning, Visual Identity, UI/UX Design, Design System, Prototyping, User Research, Figma",
    techStack: "WordPress, Custom Theme Development, React, JavaScript, PHP, CSS3, Responsive Design",
    tags: ["BRANDING", "WEBSITE", "UIUX", "DEVELOPMENT", "DESIGN SYSTEM"],
    image: itawaySlide01,
    galleryImages: [itawaySlide01, itawaySlide02, itawaySlide03, itawaySlide04,itawaySlide05,itawaySlide06,itawaySlide07],
    projectUrl: "https://itawayecotours.com",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 2,
    title: "TropiView",
    subtitle: "Brand Creation & Art Print Product Launch from Zero",
    description: "Complete brand development for art print company focused on Design, Art & Memory",
    fullDescription: "Ground-up brand creation starting with market research and naming strategy for an art print company positioned around the tagline 'Design, Art & Memory'. The project evolved from strategic naming through complete visual identity development, creating a brand that bridges tradition and contemporary design. The typographic system combines modern sans-serif and serif fonts, while the chromatic palette captures Rio's tropical essence and Atlantic Forest colors. The brand launched with a multilingual wall calendar featuring curated photography from renowned photographers, published in Portuguese, English, French, and Spanish to reach international markets.",
    designStack: "Market Research, Naming Strategy, Brand Strategy, Visual Identity, Typography Design, Color Theory, Print Design, Editorial Design",
    techStack: "Adobe InDesign, Adobe Illustrator, Adobe Photoshop, Print Production",
    tags: ["BRANDING", "GRAPHIC DESIGN", "PRINT", "EDITORIAL"],
    image: tropiviewSlide01,
    galleryImages: [tropiviewSlide01, tropiviewSlide02, tropiviewSlide03, tropiviewSlide04, tropiviewSlide05],
    projectUrl: "https://tropiview.com.br",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 3,
    title: "Humaita Digital",
    subtitle: "Strategic Corporate Website Redesign for Professional Education Platform",
    description: "Data-driven institutional website redesign focused on conversion and strategic positioning",
    fullDescription: "Complete institutional website redesign grounded in usability diagnostics and competitive market analysis. The project began with comprehensive UX research to identify conversion barriers and strategic positioning opportunities in the professional education sector. From zero to launch, the solution was architected in Figma with a robust design system that ensures scalability and brand consistency. High-fidelity prototypes validated user flows and conversion paths before development, resulting in a strategic digital presence that clearly communicates Humaitá Digital's value proposition in transforming educational exclusion into productive inclusion for corporate clients.",
    designStack: "UX Research, Usability Analysis, Competitive Analysis, UI/UX Design, Design System, Prototyping, Conversion Optimization, Figma",
    techStack: "HTML5, CSS3, JavaScript, Responsive Design, Web Performance Optimization",
    tags: ["WEBSITE", "UIUX", "DESIGN SYSTEM", "DEVELOPMENT"],
    image: humaitaSlide01,
    galleryImages: [humaitaSlide01, humaitaSlide02, humaitaSlide03, humaitaSlide04, humaitaSlide05],
    projectUrl: "https://www.humaitadigital.com.br",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 4,
    title: "Hysteria",
    subtitle: "Premium Audiovisual Platform with Advanced Animation System",
    description: "Ultra-modern showcase platform for award-winning film production company",
    fullDescription: "High-end digital platform for Hysteria, a creation and production label powered by Conspiração Filmes—one of Brazil's most awarded audiovisual companies with international recognition. The project demanded a sophisticated web experience that reflects the brand's commitment to diverse narratives centered on women's perspectives. Built from Figma to full implementation, the platform features rich animations, fluid transitions, and cinematic interactions that showcase films, series, and content distributed across TV, cinema, streaming, and digital platforms. The solution includes a custom content management admin area, enabling the team to autonomously update projects and maintain the platform's dynamic storytelling.",
    designStack: "UI/UX Design, Motion Design, Animation System, Visual Storytelling, Prototyping, Figma",
    techStack: "Vue.js, JavaScript, Custom CMS, GSAP, CSS3 Animations, Responsive Design, Content Management System",
    tags: ["WEBSITE", "UIUX", "DEVELOPMENT", "ANIMATION"],
    image: hysteriaSlide01,
    galleryImages: [
      hysteriaSlide01, // Slide 1: imagem (com expansão)
      hysteriaSlide03, // Slide 3: imagem
      hysteriaSlide04, // Slide 4: imagem 
      hysteriaSlide05, // Slide 5: imagem
      hysteriaSlide06, // Slide 6: imagem
      "https://player.vimeo.com/video/1140169847?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
    ],
    projectUrl: "https://hysteria.etc.br",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 5,
    title: "myHABITAT",
    subtitle: "International E-commerce Platform for Health Tech IoT Products",
    description: "Dual-platform digital commerce solution for Canadian health monitoring technology company",
    fullDescription: "Complete digital commerce ecosystem for myHABITAT, a Canadian health tech company specializing in environmental monitoring solutions. The project encompassed two integrated platforms: a fully customized WordPress corporate website that educates consumers on indoor air quality and health impacts, and a Shopify e-commerce store configured for international operations across Canada and the United States. The solution balances informational content with conversion-optimized product flows, creating a seamless journey from health education to product purchase for customers concerned with respiratory health and environmental wellness.",
    designStack: "UI/UX Design, E-commerce Strategy, Information Architecture, Conversion Optimization, Multi-platform Design",
    techStack: "WordPress, Custom Theme Development, Shopify, E-commerce Integration, International Payment Systems, Responsive Design",
    tags: ["WEBSITE", "E-COMMERCE", "UIUX", "DEVELOPMENT"],
    image: myhabitatSlide01,
    galleryImages: [
      myhabitatSlide01, 
      myhabitatSlide03, 
      myhabitatSlide04, 
      myhabitatSlide05, 
      myhabitatSlide06, 
      myhabitatSlide07,
      "https://player.vimeo.com/video/1140175428?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
    ],
    projectUrl: "hhttps://myhabitatapp.com/",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 6,
    title: "Urban Woof NYC",
    subtitle: "Complete Brand Identity & Service Platform for Premium Pet Care",
    description: "End-to-end branding and digital platform with integrated online booking system",
    fullDescription: "Comprehensive brand development and digital platform for Urban Woof NYC, a premier dog care facility serving New York's Upper East Side for nearly 20 years. The project encompassed complete visual identity creation, custom illustration system that captures the brand's playful yet professional personality, and full website development. A key feature is the integrated online booking platform that enables seamless appointment scheduling across multiple services—dog walking, grooming, daycare, and 24-hour care. The solution streamlines operations for two physical locations while maintaining the personalized, high-touch service experience that defines the Urban Woof NYC brand.",
    designStack: "Brand Identity, Visual Design, Custom Illustration, UI/UX Design, Service Design, Information Architecture",
    techStack: "WordPress, Custom Theme Development, Online Booking System Integration, Responsive Design, CRM Integration",
    tags: ["BRANDING", "WEBSITE", "UIUX", "DEVELOPMENT", "ILLUSTRATION"],
    image: urbanwoofSlide01,
    galleryImages: [
      urbanwoofSlide01,
      urbanwoofSlide02,
      urbanwoofSlide03,
      urbanwoofSlide04,
      urbanwoofSlide05,
      "https://player.vimeo.com/video/1140177024?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
    ],
    projectUrl: "https://urbanwoofnyc.com/",
    backgroundColor: "var(--primary-red)"
  }
];

export default projects;