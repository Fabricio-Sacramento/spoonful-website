import { Canvas } from '@react-three/fiber';
import Glass from './components/Glass';
import DynamicBackground from './components/DynamicBackground';
import GlassCube from './components/GlassCube';
//import ConceptualCore from './components/ConceptualCore';
import { OrbitControls } from '@react-three/drei';

const App = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} shadows>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />

      {/* Fundo dinâmico */}
      <DynamicBackground />

      {/* Elementos de vidro já existentes */}
      <Glass />
      <GlassCube />

      {/* Novo objeto 3D conceitual 
      <ConceptualCore /> */}

      <OrbitControls />
    </Canvas>
  );
};

export default App;