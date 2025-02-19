import { Canvas } from '@react-three/fiber';
import Glass from './components/Glass';
import DynamicBackground from './components/DynamicBackground';
import GlassCube from './components/GlassCube';
import { OrbitControls } from '@react-three/drei';


const App = () => {

  return (
    <Canvas camera={{ position: [0, 1, 5], fov: 50 }} shadows>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
      <DynamicBackground />
      <Glass />
      <GlassCube />
      <OrbitControls />
    </Canvas>
  );
};

export default App;
