import { Canvas } from "@react-three/fiber";
import { KeyboardControls, OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import Scene from "./Scene";
import { Suspense } from "react";

// Define the keymap
const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "KeyS", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "KeyA", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "KeyD", "d", "D"] }, // Adds fallback for Zen/Firefox
];

export default function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <div style={{ width: "100vw", height: "100vh", background: "#D2D2CF" }}>
        <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          <axesHelper args={[5]} />
          <Physics debug>
            <Scene />
          </Physics>
        </Canvas>
      </div>
    </KeyboardControls>
  );
}
