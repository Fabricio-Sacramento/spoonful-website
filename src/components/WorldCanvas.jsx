import { Canvas } from '@react-three/fiber';
import Glass from './Glass';
import DynamicBackground from './DynamicBackground';
import GlassCube from './GlassCube';
import ConceptualCore from './ConceptualCore';
import { OrbitControls, Environment } from '@react-three/drei';

const HeroSection = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} shadows>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />

      {/* Define o ambiente que será utilizado como envMap */}
      <Environment preset="studio" background />

      {/* Fundo dinâmico */}
      <DynamicBackground />

      {/* Elementos de vidro já existentes */}
      <Glass />
      <GlassCube />

      {/* Novo objeto 3D conceitual */}
      <ConceptualCore />

      <OrbitControls />
    </Canvas>
  );
};

export default HeroSection;