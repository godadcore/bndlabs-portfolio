import { forwardRef, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import usePrefersDarkMode from "../../hooks/usePrefersDarkMode";

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const range = (v, a, b) => clamp01((v - a) / (b - a));

const PinkWhiteBox = forwardRef(function PinkWhiteBox({ prefersDark = false, ...props }, ref) {
  const pinkColor = prefersDark ? "#dfb4c8" : "#f2b3d6";
  const whiteColor = prefersDark ? "#eef2f8" : "#ffffff";

  return (
    <mesh ref={ref} castShadow receiveShadow {...props}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial attach="material-0" color={pinkColor} roughness={0.55} metalness={0.05} />
      <meshStandardMaterial attach="material-1" color={pinkColor} roughness={0.55} metalness={0.05} />
      <meshStandardMaterial attach="material-2" color={whiteColor} roughness={0.35} metalness={0.05} />
      <meshStandardMaterial attach="material-3" color={whiteColor} roughness={0.35} metalness={0.05} />
      <meshStandardMaterial attach="material-4" color={whiteColor} roughness={0.35} metalness={0.05} />
      <meshStandardMaterial attach="material-5" color={whiteColor} roughness={0.35} metalness={0.05} />
    </mesh>
  );
});

const GlossyWhiteBox = forwardRef(function GlossyWhiteBox({ prefersDark = false, ...props }, ref) {
  return (
    <mesh ref={ref} castShadow receiveShadow {...props}>
      <boxGeometry args={[0.55, 0.55, 0.55]} />
      <meshPhysicalMaterial
        color={prefersDark ? "#eef2f8" : "#ffffff"}
        roughness={0.15}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.2}
        reflectivity={0.6}
        envMapIntensity={prefersDark ? 0.7 : 0.9}
      />
    </mesh>
  );
});

function Scene({ progress = 0, prefersDark = false }) {
  const group = useRef(null);
  const pinkBox = useRef(null);
  const w1 = useRef(null);
  const w2 = useRef(null);
  const w3 = useRef(null);

  useFrame((state, delta) => {
    const t = clamp01(progress);
    const comeIn = range(t, 0.1, 0.45);
    const active = range(t, 0.45, 0.85);
    const pushBack = range(t, 0.85, 1.0);

    const zIn = THREE.MathUtils.lerp(3.5, 1.6, comeIn);
    const zOut = THREE.MathUtils.lerp(1.6, 3.8, pushBack);
    const z = pushBack > 0 ? zOut : zIn;

    if (group.current) {
      group.current.position.z = z;
      group.current.rotation.y += delta * (0.2 + active * 0.7);
    }

    if (pinkBox.current) {
      pinkBox.current.rotation.x = 0.35 + active * 1.2;
      pinkBox.current.rotation.y = 0.5 + active * 1.0;
      pinkBox.current.position.y = THREE.MathUtils.lerp(-0.25, 0.1, comeIn);
    }

    const wobble = state.clock.elapsedTime;
    const drift = active * 0.6;

    if (w1.current) {
      w1.current.position.x = -1.35 - drift * 0.25;
      w1.current.position.y = -0.75 + Math.sin(wobble * 1.2) * 0.08;
      w1.current.rotation.y += delta * 0.7;
    }
    if (w2.current) {
      w2.current.position.x = 1.15 + drift * 0.25;
      w2.current.position.y = -0.25 + Math.cos(wobble * 1.1) * 0.08;
      w2.current.rotation.x += delta * 0.6;
    }
    if (w3.current) {
      w3.current.position.x = -0.35;
      w3.current.position.y = 0.85 + Math.sin(wobble * 1.3) * 0.07;
      w3.current.rotation.z += delta * 0.45;
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[3, 4, 2]}
        intensity={1.25}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Environment preset="city" />

      <group ref={group} position={[0, 0, 3.5]}>
        <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.25}>
          <group>
            <PinkWhiteBox ref={pinkBox} position={[0.2, 0.0, 0]} prefersDark={prefersDark} />
            <GlossyWhiteBox ref={w1} position={[-1.35, -0.75, -0.35]} prefersDark={prefersDark} />
            <GlossyWhiteBox ref={w2} position={[1.15, -0.25, -0.15]} prefersDark={prefersDark} />
            <GlossyWhiteBox ref={w3} position={[-0.35, 0.85, -0.25]} prefersDark={prefersDark} />
          </group>
        </Float>
      </group>

      <ContactShadows position={[0, -1.2, 0]} opacity={prefersDark ? 0.52 : 0.4} blur={2.3} far={8} />
    </>
  );
}

export default function WhatIDo3D({ progress = 0 }) {
  const prefersDarkMode = usePrefersDarkMode();
  const backgroundColor = prefersDarkMode ? "#1B212C" : "#ffffff";

  return (
    <div className="whatido3d">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.2, 4.2], fov: 45 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        performance={{ min: 0.75 }}
      >
        <color attach="background" args={[backgroundColor]} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.75}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 2.05}
        />
        <Scene progress={progress} prefersDark={prefersDarkMode} />
      </Canvas>
    </div>
  );
}
