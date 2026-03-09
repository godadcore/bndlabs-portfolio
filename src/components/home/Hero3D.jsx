import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/**
 * =========================
 * CONTROL PANEL
 * =========================
 */
const CFG = {
  scene: { scale: 1.18, position: [0.25, 0.05, 0] },

  camera: { position: [6, 6, 6], zoom: 78 },

  colors: {
    platform: "#4B43D6",
    gridBase: "#F6F7FF",
    gridLine: "rgba(120,130,255,0.18)",
  },

  platform: {
    pos: [0, -0.55, 0],
    size: [6.4, 1.0, 8.1],
  },

  grid: { y: -1.05, size: 40 },
};

function Floaty({ children, speed = 1, height = 0.12, rot = 0.12, phase = 0 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + phase;
    ref.current.position.y = Math.sin(t) * height;
    ref.current.rotation.y = Math.sin(t * 0.6) * rot;
    ref.current.rotation.x = Math.cos(t * 0.5) * (rot * 0.35);
  });
  return <group ref={ref}>{children}</group>;
}

/**
 * Makes an object sit ON TOP of the platform (so it doesn’t sink inside).
 * Platform top Y = platform.posY + platform.height/2
 * Object center Y = topY + object.height/2 + extraLift
 */
function sitOnPlatform(objHeight, extraLift = 0.02) {
  const topY = CFG.platform.pos[1] + CFG.platform.size[1] / 2;
  return topY + objHeight / 2 + extraLift;
}

/**
 * =========================
 * EDITABLE OBJECT LIST
 * =========================
 * Change pos / size to move + resize each shape.
 */
const OBJECTS = {
  // L-shape (two blocks)
  blocks: [
    {
      id: "L_long",
      size: [2.35, 0.75, 1.25],
      pos: [-1.55, sitOnPlatform(0.75), 0.05],
      color: "#BFE9FF",
      float: { speed: 1.05, height: 0.12, rot: 0.12, phase: 0.4 },
    },
    {
      id: "L_leg",
      size: [0.75, 0.75, 2.05],
      pos: [-2.25, sitOnPlatform(0.75), 0.95],
      color: "#BFE9FF",
      float: { speed: 0.95, height: 0.10, rot: 0.10, phase: 1.1 },
    },

    // Yellow big block
    {
      id: "yellow",
      size: [3.2, 1.95, 1.75],
      pos: [-5.95, -5.95, 0.35],
      color: "#F5E44C",
      float: { speed: 1.05, height: 0.10, rot: 0.10, phase: 2.6 },
    },

    // Top cluster cubes (3 + pink floating)
    {
      id: "cube_left",
      size: [2.05, 1.9, 2.05],
      pos: [-3.4, 1.9 + 0.45, -1.75],
      color: "#C9D5FF",
      float: { speed: 0.9, height: 0.06, rot: 0.06, phase: 0.0 },
    },
    {
      id: "cube_right",
      size: [2.05, 1.9, 2.05],
      pos: [2.5, 1.9 + 0.45, -1.75],
      color: "#C9D5FF",
      float: { speed: 0.9, height: 0.06, rot: 0.06, phase: 0.7 },
    },
    {
      id: "cube_front",
      size: [2.05, 1.9, 2.05],
      pos: [-.5, 1.5 + 0.45, -6.1],
      color: "#C9D5FF",
      float: { speed: 0.9, height: 0.06, rot: 0.06, phase: 1.4 },
    },
    {
      id: "pink_floating",
      size: [0.95, 0.95, 0.95],
      pos: [0.35, sitOnPlatform(0.95) + 1.1, -1.4],
      color: "#F3A9C8",
      float: { speed: 1.05, height: 0.22, rot: 0.14, phase: 0.4 },
    },

    // Scattered small cubes
    {
      id: "small_white_1",
      size: [0.8, 0.8, 0.8],
      pos: [6.7, 0.8 + 0.35, -0.9],
      color: "#FFFFFF",
      float: { speed: 1.1, height: 0.07, rot: 0.06, phase: 2.2 },
    },
    {
      id: "small_white_2",
      size: [0.55, 0.55, 0.55],
      pos: [-6.85, -2.55 + 0.2, -0.55],
      color: "#FFFFFF",
      float: { speed: 1.0, height: 0.06, rot: 0.06, phase: 3.1 },
    },
    {
      id: "small_pink",
      size: [0.9, 0.9, 2.5],
      pos: [-6.3, 0.5 - 0.55, 2.1],
      color: "#F3A9C8",
      float: { speed: 1.15, height: 0.06, rot: 0.06, phase: 1.8 },
    },
  ],

  spheres: [
    {
      id: "white_ball_1",
      r: 1.3,
      pos: [-2.55, -9.6 + 0.05, -10.25],
      color: "#FFFFFF",
      float: { speed: 1.3, height: 0.10, rot: 0.0, phase: 0.8 },
    },
    {
      id: "orange_ball",
      r: 0.63,
      pos: [-6.65, -1.66 + 0.18, 2.05],
      color: "#FF7A00",
      float: { speed: 1.05, height: 0.09, rot: 0.0, phase: 1.7 },
    },
    {
      id: "white_ball_2",
      r: 0.23,
      pos: [2.35, sitOnPlatform(0.46) - 0.65, 1.55],
      color: "#FFFFFF",
      float: { speed: 1.0, height: 0.07, rot: 0.0, phase: 3.5 },
    },
  ],

  link: {
    id: "link_ring",
    pos: [-2.35, sitOnPlatform(0.3) - 0.75, 2.05],
    rot: [0.15, 0.25, 0.0],
    scale: 1.0,
    float: { speed: 0.95, height: 0.06, rot: 0.04, phase: 1.1 },
  },
};

function Block({ size, color }) {
  return (
    <mesh castShadow receiveShadow>
      <RoundedBox args={size} radius={0.18} smoothness={6}>
        <meshStandardMaterial color={color} roughness={0.33} />
      </RoundedBox>
    </mesh>
  );
}

function Sphere({ r, color }) {
  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[r, 48, 48]} />
      <meshStandardMaterial color={color} roughness={0.25} />
    </mesh>
  );
}

function LinkRing({ color = "#9BA7FF" }) {
  return (
    <mesh castShadow receiveShadow>
      <torusGeometry args={[0.22, 0.06, 18, 64]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
}

function Platform() {
  return (
    <mesh position={CFG.platform.pos} castShadow receiveShadow>
      <boxGeometry args={CFG.platform.size} />
      <meshStandardMaterial color={CFG.colors.platform} roughness={0.42} />
    </mesh>
  );
}

function Scene() {
  const isCoarse = useMemo(() => window.matchMedia?.("(pointer: coarse)")?.matches ?? false, []);

  
  return (
    <>
      <OrthographicCamera makeDefault position={CFG.camera.position} zoom={CFG.camera.zoom} near={0.1} far={120} />

      <OrbitControls
        enablePan
        enableZoom={false}
        enableRotate
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={isCoarse ? 1.0 : 0.8}
        touches={isCoarse ? { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE } : undefined}
        maxPolarAngle={Math.PI / 2.15}
        minPolarAngle={Math.PI / 3.2}
      />

      <ambientLight intensity={0.65} />
      <directionalLight
        position={[7, 12, 7]}
        intensity={1.25}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-6, 4, -6]} intensity={0.35} />

      <group scale={CFG.scene.scale} position={CFG.scene.position}>
        <Platform />

        {/* BLOCKS */}
        {OBJECTS.blocks.map((b) => (
          <Floaty key={b.id} {...b.float}>
            <group position={b.pos}>
              <Block size={b.size} color={b.color} />
            </group>
          </Floaty>
        ))}

        {/* SPHERES */}
        {OBJECTS.spheres.map((s) => (
          <Floaty key={s.id} {...s.float}>
            <group position={s.pos}>
              <Sphere r={s.r} color={s.color} />
            </group>
          </Floaty>
        ))}

        {/* LINK */}
        <Floaty {...OBJECTS.link.float}>
          <group position={OBJECTS.link.pos} rotation={OBJECTS.link.rot} scale={OBJECTS.link.scale}>
            <LinkRing color={"#9BA7FF"} />
          </group>
        </Floaty>
      </group>
    </>
  );
}

export default function Hero3D() {
  return (
    <Canvas shadows dpr={[1, 2]} style={{ width: "100%", height: "100%", touchAction: "none" }}>
      <Scene />
    </Canvas>
  );
}
