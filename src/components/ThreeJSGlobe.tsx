'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// The actual globe component with animation and interactivity
function Globe({ color = '#FFDD00' }: { color?: string }) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Animation loop
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.005;
      
      // Add a subtle floating motion
      sphereRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <>
      {/* The globe mesh with distortion material for an organic look */}
      <Sphere
        ref={sphereRef}
        args={[1, 64, 64]}
        onClick={() => setClicked(!clicked)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={hovered ? 0.6 : 0.4}
          speed={hovered ? 3 : 1.5}
          roughness={0.4}
          metalness={0.5}
        />
      </Sphere>
      
      {/* Add a subtle glow effect */}
      <Sphere args={[1.05, 32, 32]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
    </>
  );
}

// Background stars component
function SpaceBackground() {
  return (
    <Stars
      radius={100}
      depth={50}
      count={5000}
      factor={4}
      saturation={0}
      fade
      speed={1}
    />
  );
}

// Main component that puts everything together
const ThreeJSGlobe = ({ width = 200, height = 200 }: { width?: number; height?: number }) => {
  return (
    <div
      style={{
        width: width,
        height: height,
        margin: '0 auto',
        position: 'relative'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{
          background: 'transparent',
          borderRadius: '50%',
          overflow: 'hidden'
        }}
      >
        {/* Create ambient light for base illumination */}
        <ambientLight intensity={0.3} />
        
        {/* Add a directional light to create highlights */}
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, 3]} intensity={0.5} color="#FFDD88" />
        
        {/* Add the background stars */}
        <SpaceBackground />
        
        {/* Add the globe with orbital controls for user interaction */}
        <Globe />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default ThreeJSGlobe; 