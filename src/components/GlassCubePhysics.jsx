import { useBox } from "@react-three/cannon";

const GlassCubePhysics = () => {
  const size = 2; // 🔥 Tamanho do cubo (ajustável)
  const thickness = 0.1; // 🔥 Espessura das paredes

  // Criando as paredes individualmente
  const [floorRef] = useBox(() => ({
    args: [size, thickness, size],
    type: "Static",
    position: [0, -size / 2, 0],
  }));

  const [ceilingRef] = useBox(() => ({
    args: [size, thickness, size],
    type: "Static",
    position: [0, size / 2, 0],
  }));

  const [wallLeftRef] = useBox(() => ({
    args: [thickness, size, size],
    type: "Static",
    position: [-size / 2, 0, 0],
  }));

  const [wallRightRef] = useBox(() => ({
    args: [thickness, size, size],
    type: "Static",
    position: [size / 2, 0, 0],
  }));

  const [wallFrontRef] = useBox(() => ({
    args: [size, size, thickness],
    type: "Static",
    position: [0, 0, -size / 2],
  }));

  const [wallBackRef] = useBox(() => ({
    args: [size, size, thickness],
    type: "Static",
    position: [0, 0, size / 2],
  }));

  return (
    <>
      <mesh ref={floorRef}>
        <boxGeometry args={[size, thickness, size]} />
        <meshStandardMaterial wireframe color="white" />
      </mesh>

      <mesh ref={ceilingRef}>
        <boxGeometry args={[size, thickness, size]} />
        <meshStandardMaterial wireframe color="white" />
      </mesh>

      <mesh ref={wallLeftRef}>
        <boxGeometry args={[thickness, size, size]} />
        <meshStandardMaterial wireframe color="white" />
      </mesh>

      <mesh ref={wallRightRef}>
        <boxGeometry args={[thickness, size, size]} />
        <meshStandardMaterial wireframe color="white" />
      </mesh>

      <mesh ref={wallFrontRef}>
        <boxGeometry args={[size, size, thickness]} />
        <meshStandardMaterial wireframe color="white" />
      </mesh>

      <mesh ref={wallBackRef}>
        <boxGeometry args={[size, size, thickness]} />
        <meshStandardMaterial wireframe color="white" />
      </mesh>
    </>
  );
};

export default GlassCubePhysics;
