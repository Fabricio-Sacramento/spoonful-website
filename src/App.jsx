import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/cannon";

import DynamicBackground from "./components/DynamicBackground";
import GlassCubePhysics from "./components/GlassCubePhysics";
import FluidParticles from "./components/FluidParticles";
import Glass from "./components/Glass";
import GlassCube from "./components/GlassCube";

const App = () => {
  return (
    <Canvas camera={{ position: [0, 1, 5], fov: 50 }} shadows>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={1} />

      {/* 🔥 Adicionando de volta os elementos visuais */}
      <DynamicBackground />
      <GlassCube />
      <Glass />

      <Physics gravity={[0, -9.81, 0]} debug={true}>
        <GlassCubePhysics />
        <FluidParticles />
      </Physics>

      <OrbitControls />
    </Canvas>
  );
};

export default App;
