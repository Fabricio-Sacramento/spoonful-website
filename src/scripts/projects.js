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

// myhabitat
import myhabitatSlide01 from '../assets/images/myhabitat/slide-01.jpg';
import myhabitatSlide02 from '../assets/images/myhabitat/slide-02.jpg';
import myhabitatSlide03 from '../assets/images/myhabitat/slide-03.jpg';
import myhabitatSlide04 from '../assets/images/myhabitat/slide-04.jpg';
import myhabitatSlide05 from '../assets/images/myhabitat/slide-05.jpg';

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
    subtitle: "Sustainable Travel E-commerce Platform",
    description: "E-commerce platform for sustainable travel experiences",
    fullDescription: "Complete platform for sustainable tourism experiences, featuring booking systems, integrated payments, and dashboard for local operators. The project focused on creating an intuitive user experience that guides travelers through eco-friendly options while supporting local communities.",
    designStack: "Brand Strategy, UI/UX Design, Graphic Design, User Research, Prototyping",
    techStack: "React, Node.js, Stripe API, MongoDB, AWS",
    tags: ["WEBSITE", "E-COMMERCE", "UIUX", "DEVELOPMENT"],
    image: itawaySlide01,
    galleryImages: [itawaySlide01, itawaySlide02, itawaySlide03, itawaySlide04,itawaySlide05,itawaySlide06,itawaySlide07],
    projectUrl: "https://itawayecotours.com",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 2,
    title: "TropiView",
    subtitle: "Visual Identity for Tropical Research Institute",
    description: "Visual identity and editorial design for tropical research",
    fullDescription: "Comprehensive visual identity system for a leading tropical research institute, including logo design, editorial layouts, scientific publication templates, and digital assets. The design reflects the intersection of rigorous science and natural beauty.",
    designStack: "Brand Identity, Logo Design, Editorial Design, Typography, Print Design",
    techStack: "Adobe Creative Suite, Figma, InDesign",
    tags: ["VISUAL IDENTITY", "EDITORIAL DESIGN", "GRAPHIC DESIGN", "PRINT"],
    image: tropiviewSlide01,
    galleryImages: [tropiviewSlide01, tropiviewSlide02, tropiviewSlide03, tropiviewSlide04, tropiviewSlide05],
    projectUrl: "https://tropiview.com.br",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 3,
    title: "Humaita Digital",
    subtitle: "Urban Development Digital Platform",
    description: "Digital platform for urban development initiatives",
    fullDescription: "Digital transformation platform for urban development projects in Humaitá district. Features community engagement tools, project tracking dashboards, and citizen feedback systems to promote transparent and inclusive urban planning.",
    designStack: "Service Design, UI/UX Design, Information Architecture, Data Visualization",
    techStack: "React, D3.js, PostgreSQL, Express.js",
    tags: ["WEBSITE", "UIUX", "DEVELOPMENT", "DATA VIZ"],
    image: humaitaSlide01,
    galleryImages: [humaitaSlide01, humaitaSlide02, humaitaSlide03, humaitaSlide04, humaitaSlide05],
    projectUrl: "https://www.humaitadigital.com.br",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 4,
    title: "Hysteria",
    subtitle: "Contemporary Art Gallery Digital Experience",
    description: "Contemporary art gallery digital presence",
    fullDescription: "Immersive digital experience for contemporary art gallery, featuring virtual exhibitions, artist portfolios, and interactive artwork presentations. The platform bridges physical and digital art consumption through innovative web technologies.",
    designStack: "Digital Experience Design, Art Direction, UI/UX, Motion Design",
    techStack: "Three.js, React, GSAP, WebGL, Sanity CMS",
    tags: ["WEBSITE", "UIUX", "DEVELOPMENT", "3D", "MOTION"],
    image: hysteriaSlide01,
    galleryImages: [
      hysteriaSlide01, // Slide 1: imagem (com expansão)
      "https://www.youtube.com/embed/dQw4w9WgXcQ", // Slide 2: YouTube
      hysteriaSlide03, // Slide 3: imagem
      hysteriaSlide04, // Slide 4: imagem 
      hysteriaSlide05 // Slide 5: imagem
    ],
    projectUrl: "https://hysteria.etc.br",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 5,
    title: "myHABITAT",
    subtitle: "IoT Environmental Monitoring Platform",
    description: "IoT-driven environmental monitoring platform",
    fullDescription: "Advanced IoT platform for real-time environmental monitoring and data visualization. Enables researchers and environmental agencies to track air quality, water parameters, and biodiversity metrics through connected sensors and predictive analytics.",
    designStack: "Product Design, Data Visualization, Dashboard Design, Mobile UX",
    techStack: "React Native, Node.js, InfluxDB, Grafana, Arduino IoT",
    tags: ["WEBSITE", "MOBILE APP", "IOT", "DATA VIZ", "DEVELOPMENT"],
    image: myhabitatSlide01,
    galleryImages: [myhabitatSlide01, myhabitatSlide02, myhabitatSlide03, myhabitatSlide04, myhabitatSlide05],
    projectUrl: "hhttps://myhabitatapp.com/",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 6,
    title: "Urban Woof NYC",
    subtitle: "Pet Services Booking Platform & Brand",
    description: "Branding and booking platform for dog services",
    fullDescription: "Complete brand identity and booking platform for premium dog services in New York City. Features real-time booking, GPS tracking for dog walkers, payment processing, and community features for pet owners.",
    designStack: "Brand Strategy, UI/UX Design, Mobile Design, Service Design",
    techStack: "React Native, Node.js, Stripe, Google Maps API, Firebase",
    tags: ["BRANDING", "MOBILE APP", "BOOKING SYSTEM", "UIUX", "DEVELOPMENT"],
    image: urbanwoofSlide01,
    galleryImages: [urbanwoofSlide01, urbanwoofSlide02, urbanwoofSlide03, urbanwoofSlide04, urbanwoofSlide05],
    projectUrl: "https://urbanwoofnyc.com/",
    backgroundColor: "var(--primary-red)"
  }
];

export default projects;