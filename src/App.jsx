import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Background from './components/Background';
import DynamicBackground from './components/DynamicBackground';
import Glass from './components/Glass';
import './styles/Background.css'; // Garante que o CSS do background está carregado

const App = () => {
  return (
    <>
      {/* O Background é renderizado fora do Canvas para que fique como camada de fundo */}
      <Background />
      
      <Canvas 
        camera={{ position: [0, 1, 5], fov: 50 }}
        shadows
        frameloop="demand"
        style={{ width: '100vw', height: '100vh' }}
      >
        {/* Luz ambiente para iluminar a cena */}
        <ambientLight intensity={1} />
        
        {/* Luz direcional para sombras e reflexos */}
        <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
        
        {/* Luz pontual para realçar brilhos */}
        <pointLight position={[-5, 5, 5]} intensity={1} />

        {/* Background 3D dentro do Canvas
        <EnvBackground /> */}

        {/* Background dinâmico dentro do Canvas */}
        <DynamicBackground />
        
        {/* Objeto 3D de vidro */}
        <Glass />
        
        {/* Controles de órbita para rotação interativa */}
        <OrbitControls />
      </Canvas>
    </>
  );
};

export default App;
