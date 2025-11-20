// src/scripts/projects.js
// Imports das imagens - estrutura real do projeto

// cryptobeer
import cryptobeerSlide01 from '../assets/images/cryptobeer/slide-01.jpg';
import cryptobeerSlide02 from '../assets/images/cryptobeer/slide-02.jpg';
import cryptobeerSlide03 from '../assets/images/cryptobeer/slide-03.jpg';
import cryptobeerSlide04 from '../assets/images/cryptobeer/slide-04.jpg';
import cryptobeerSlide05 from '../assets/images/cryptobeer/slide-05.jpg';

// hb
import hbSlide01 from '../assets/images/hb/slide-01.jpg';
import hbSlide02 from '../assets/images/hb/slide-02.jpg';
import hbSlide03 from '../assets/images/hb/slide-03.jpg';
import hbSlide04 from '../assets/images/hb/slide-04.jpg';
import hbSlide05 from '../assets/images/hb/slide-05.jpg';

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
//import hysteriaSlide04 from '../assets/images/hysteria/slide-04.jpg';
import hysteriaSlide05 from '../assets/images/hysteria/slide-05.jpg';

// itaway
import itawaySlide01 from '../assets/images/itaway/slide-01.jpg';
import itawaySlide02 from '../assets/images/itaway/slide-02.jpg';
import itawaySlide03 from '../assets/images/itaway/slide-03.jpg';
import itawaySlide04 from '../assets/images/itaway/slide-04.jpg';
import itawaySlide05 from '../assets/images/itaway/slide-05.jpg';

// myhabitat
import myhabitatSlide01 from '../assets/images/myhabitat/slide-01.jpg';
import myhabitatSlide02 from '../assets/images/myhabitat/slide-02.jpg';
import myhabitatSlide03 from '../assets/images/myhabitat/slide-03.jpg';
import myhabitatSlide04 from '../assets/images/myhabitat/slide-04.jpg';
import myhabitatSlide05 from '../assets/images/myhabitat/slide-05.jpg';

// tangente
import tangenteSlide01 from '../assets/images/tangente/slide-01.jpg';
import tangenteSlide02 from '../assets/images/tangente/slide-02.jpg';
import tangenteSlide03 from '../assets/images/tangente/slide-03.jpg';
import tangenteSlide04 from '../assets/images/tangente/slide-04.jpg';
import tangenteSlide05 from '../assets/images/tangente/slide-05.jpg';

// tropiview
import tropiviewSlide01 from '../assets/images/tropiview/slide-01.jpg';
import tropiviewSlide02 from '../assets/images/tropiview/slide-02.jpg';
import tropiviewSlide03 from '../assets/images/tropiview/slide-03.jpg';
import tropiviewSlide04 from '../assets/images/tropiview/slide-04.jpg';
import tropiviewSlide05 from '../assets/images/tropiview/slide-05.jpg';

// urban-woof
import urbanwoofSlide01 from '../assets/images/urban-woof/slide-01.jpg';
import urbanwoofSlide02 from '../assets/images/urban-woof/slide-02.jpg';
import urbanwoofSlide03 from '../assets/images/urban-woof/slide-03.jpg';
import urbanwoofSlide04 from '../assets/images/urban-woof/slide-04.jpg';
import urbanwoofSlide05 from '../assets/images/urban-woof/slide-05.jpg';

// vale
import valeSlide01 from '../assets/images/vale/slide-01.jpg';
import valeSlide02 from '../assets/images/vale/slide-02.jpg';
import valeSlide03 from '../assets/images/vale/slide-03.jpg';
import valeSlide04 from '../assets/images/vale/slide-04.jpg';
import valeSlide05 from '../assets/images/vale/slide-05.jpg';

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
    galleryImages: [itawaySlide01, itawaySlide02, itawaySlide03, itawaySlide04, itawaySlide05],
    projectUrl: "https://itaway-ecotours.vercel.app",
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
    projectUrl: "https://tropiview-portfolio.vercel.app",
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
    projectUrl: "https://humaita-digital.netlify.app",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 4,
    title: "Hysteria Gallery",
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
      "https://player.vimeo.com/video/76979871", // Slide 4: Vimeo  
      hysteriaSlide05 // Slide 5: imagem
    ],
    projectUrl: "https://hysteria-gallery.vercel.app",
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
    projectUrl: "https://myhabitat-iot.com",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 6,
    title: "Vale EnvironPact",
    subtitle: "Environmental Impact Documentation System",
    description: "Environmental impact documentation and design",
    fullDescription: "Comprehensive documentation system for environmental impact assessments and sustainability reporting. Features automated report generation, stakeholder collaboration tools, and compliance tracking for large-scale mining operations.",
    designStack: "Information Design, Report Templates, Data Visualization, Print Design",
    techStack: "Adobe Creative Suite, Figma, D3.js, Python",
    tags: ["EDITORIAL DESIGN", "GRAPHIC DESIGN", "PRINT", "DATA VIZ"],
    image: valeSlide01,
    galleryImages: [valeSlide01, valeSlide02, valeSlide03, valeSlide04, valeSlide05],
    projectUrl: "https://vale-environpact-docs.vercel.app",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 7,
    title: "HB Architecture",
    subtitle: "3D Visualization & Architectural Branding",
    description: "Art direction and 3D visualization project",
    fullDescription: "Complete visual identity and 3D visualization services for boutique architecture firm. Includes brand development, architectural renderings, virtual walkthroughs, and marketing materials that showcase innovative residential and commercial projects.",
    designStack: "Brand Identity, 3D Visualization, Art Direction, Motion Graphics",
    techStack: "Blender, After Effects, Cinema 4D, Octane Render",
    tags: ["BRANDING", "3D VISUALIZATION", "MOTION", "ARCHITECTURE"],
    image: hbSlide01,
    galleryImages: [hbSlide01, hbSlide02, hbSlide03, hbSlide04, hbSlide05],
    projectUrl: "https://hb-architecture.portfolio.com",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 8,
    title: "Crypto Beerfest",
    subtitle: "Blockchain Event Visual Identity & Experience",
    description: "Visual identity for blockchain-themed event",
    fullDescription: "Complete event branding and digital experience for innovative blockchain conference combining technology and craft beer culture. Features NFT ticketing system, interactive displays, and immersive brand activations.",
    designStack: "Event Branding, Motion Graphics, Digital Experience, Illustration",
    techStack: "After Effects, Three.js, Ethereum, IPFS, React",
    tags: ["BRANDING", "MOTION GRAPHICS", "3D", "BLOCKCHAIN", "EVENT DESIGN"],
    image: cryptobeerSlide01,
    galleryImages: [cryptobeerSlide01, cryptobeerSlide02, cryptobeerSlide03, cryptobeerSlide04, cryptobeerSlide05],
    projectUrl: "https://crypto-beerfest.xyz",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 9,
    title: "Urban Woof NYC",
    subtitle: "Pet Services Booking Platform & Brand",
    description: "Branding and booking platform for dog services",
    fullDescription: "Complete brand identity and booking platform for premium dog services in New York City. Features real-time booking, GPS tracking for dog walkers, payment processing, and community features for pet owners.",
    designStack: "Brand Strategy, UI/UX Design, Mobile Design, Service Design",
    techStack: "React Native, Node.js, Stripe, Google Maps API, Firebase",
    tags: ["BRANDING", "MOBILE APP", "BOOKING SYSTEM", "UIUX", "DEVELOPMENT"],
    image: urbanwoofSlide01,
    galleryImages: [urbanwoofSlide01, urbanwoofSlide02, urbanwoofSlide03, urbanwoofSlide04, urbanwoofSlide05],
    projectUrl: "https://urbanwoof.nyc",
    backgroundColor: "var(--primary-red)"
  },
  {
    id: 10,
    title: "Tangente DIY Skateparks",
    subtitle: "Custom Skatepark Brand Identity",
    description: "Brand identity for custom skatepark construction",
    fullDescription: "Rebellious brand identity for custom skatepark construction company specializing in DIY concrete bowls and street obstacles. The identity captures the raw energy of skate culture while maintaining professional credibility for municipal projects.",
    designStack: "Brand Identity, Logo Design, Packaging, Apparel Design, Signage",
    techStack: "Adobe Creative Suite, Figma",
    tags: ["BRANDING", "VISUAL IDENTITY", "APPAREL", "SIGNAGE"],
    image: tangenteSlide01,
    galleryImages: [tangenteSlide01, tangenteSlide02, tangenteSlide03, tangenteSlide04, tangenteSlide05],
    projectUrl: "https://tangente-skateparks.com",
    backgroundColor: "var(--primary-red)"
  }
];

export default projects;