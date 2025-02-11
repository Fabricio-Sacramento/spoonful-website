import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import DynamicBackground from './components/DynamicBackground';
import Glass from './components/Glass';
import GlassCube from "./components/GlassCube";

const App = () => {
  return (
    <>
      <Canvas 
        camera={{ position: [0, 1, 5], fov: 50 }}
        shadows
        frameloop="always"
        style={{ width: '100vw', height: '100vh' }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
        <pointLight position={[-5, 5, 5]} intensity={1} />
        <DynamicBackground />
        <GlassCube /> 
        <Glass />
        <OrbitControls />
      </Canvas>
    </>
  );
};

export default App;
