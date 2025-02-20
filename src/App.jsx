import HeroSection from './components/HeroSection'
import AboutUs from './components/AboutUs'
import WhatWeDo from './components/WhatWeDo'
import Work from './components/Work'
import Statement from './components/Statement'
import Clients from './components/Clients'
import Contact from './components/Contact'
export default function App() {
  return (
    <>
      {/* Hero Section (3D Background via Canvas + Texto) */}
      <section id="hero">
        <HeroSection />
      </section>

      <section id="about-us">
        <AboutUs />
      </section>

      <section id="what-we-do">
        <WhatWeDo />
      </section>

      <section id="work">
        <Work />
      </section>

      <section id="statement">
        <Statement />
      </section>

      <section id="clients">
        <Clients />
      </section>

      <section id="contact">
        <Contact />
      </section>
    </>
  )
}
