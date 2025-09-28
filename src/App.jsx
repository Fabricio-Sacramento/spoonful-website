// src/App.jsx
import { Canvas } from '@react-three/fiber';
import Glass from './components/Glass';
import DynamicBackground from './components/DynamicBackground';
import GlassCube from './components/GlassCube';
import AppCanvasCleanupRegistrar from './components/AppCanvasCleanupRegistrar';
//import ConceptualCore from './components/ConceptualCore';
import { OrbitControls } from '@react-three/drei';

const App = () => {
  return (
    <Canvas frameloop="demand" camera={{ position: [0, 0, 5], fov: 50 }} shadows>
      {/* Registrador de cleanup - deve estar dentro do Canvas para acessar useThree */}
      <AppCanvasCleanupRegistrar />
      
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />

      {/* Fundo dinâmico */}
      <DynamicBackground />

      {/* Elementos de vidro já existentes */}
      <Glass />
      {/* Glass Cube */}
      <GlassCube />  

      {/* Novo objeto 3D conceitual 
      <ConceptualCore /> */}

      <OrbitControls
        enableZoom={false}        // Desabilita zoom com scroll
        enablePan={false}         // Desabilita pan (opcional)
        enableRotate={true}       // Mantém rotação com drag
        enableDamping={true}      // Suaviza movimentos
        dampingFactor={0.05}      // Controla a suavidade
      />
    </Canvas>
  );
};

export default App;