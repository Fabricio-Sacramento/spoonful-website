import WorldCanvas from './WorldCanvas'
import '../styles/style.css'
import '../styles/HeroSection.module.css'

export default function HeroSection() {
  return (
    <section className='flex-left' id="hero">

      <div className='text-column'>
        <h2 className='heading-small'>DESIGNING</h2>
        <h2 className='heading-large'>BRANDS</h2>
        <h2 className='heading-large'>PRODUCTS</h2>
        <h2 className='heading-large'>EXPERIENCES</h2>
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <WorldCanvas />
      </div>
    </section>
  )
}
