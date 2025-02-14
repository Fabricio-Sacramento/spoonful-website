// App.jsx
import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/cannon";
import DynamicBackground from "./components/DynamicBackground";
import GlassCubePhysics from "./components/GlassCubePhysics";
import FluidParticles from "./components/FluidParticles";
import Glass from "./components/Glass";
import CubeController from "./components/CubeController"; // Nosso controlador visual

const App = () => {
  // Ref compartilhado para a transformação do cubo
  const cubeTransformRef = useRef();

  return (
    <Canvas camera={{ position: [0, 1, 5], fov: 50 }} shadows>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={1} />

      {/* Elementos visuais */}
      <DynamicBackground />

      {/* Passamos o ref para o CubeController */}
      <CubeController transformRef={cubeTransformRef} />

      <Glass />

      <Physics gravity={[0, -9.81, 0]} debug={true}>
        {/* Passamos o mesmo ref para sincronizar o cubo físico */}
        <GlassCubePhysics transformRef={cubeTransformRef} />
        <FluidParticles />
      </Physics>

      <OrbitControls />
    </Canvas>
  );
};

export default App;
