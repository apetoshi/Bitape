'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Bitcoin logo component with animation
function BitcoinLogo({ color = '#FFDD00' }: { color?: string }) {
  const logoRef = useRef<THREE.Group>(null);
  const coinRef = useRef<THREE.Mesh>(null);
  const symbolRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Animation loop
  useFrame(({ clock }) => {
    if (logoRef.current) {
      logoRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
    
    // Pulse effect for the symbol
    if (symbolRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 3) * 0.05 + 0.95;
      symbolRef.current.scale.set(pulse, pulse, 1);
    }
  });

  return (
    <Float
      speed={1.5} // Animation speed
      rotationIntensity={0.2} // XYZ rotation intensity
      floatIntensity={0.5} // Up/down float intensity
    >
      <group 
        ref={logoRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* The coin body */}
        <mesh ref={coinRef} position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[1, 1, 0.15, 32]} />
          <meshStandardMaterial
            color={color}
            metalness={0.9}
            roughness={0.1}
            emissive={hovered ? color : "#000000"}
            emissiveIntensity={hovered ? 0.2 : 0}
          />
        </mesh>
        
        {/* Bitcoin "B" symbol on front */}
        <group position={[0, 0, 0.08]}>
          {/* Main B shape */}
          <mesh ref={symbolRef}>
            <ringGeometry args={[0.3, 0.5, 32]} />
            <meshStandardMaterial color="#001420" metalness={0.7} roughness={0.2} />
          </mesh>
          
          {/* Vertical line of B */}
          <mesh position={[-0.3, 0, 0]}>
            <boxGeometry args={[0.1, 0.6, 0.02]} />
            <meshStandardMaterial color="#001420" metalness={0.7} roughness={0.2} />
          </mesh>
          
          {/* Top extension of B */}
          <mesh position={[-0.15, 0.2, 0]}>
            <boxGeometry args={[0.3, 0.1, 0.02]} />
            <meshStandardMaterial color="#001420" metalness={0.7} roughness={0.2} />
          </mesh>
          
          {/* Bottom extension of B */}
          <mesh position={[-0.15, -0.2, 0]}>
            <boxGeometry args={[0.3, 0.1, 0.02]} />
            <meshStandardMaterial color="#001420" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
        
        {/* Bitcoin "B" symbol on back (mirrored) */}
        <group position={[0, 0, -0.08]} rotation={[0, Math.PI, 0]}>
          {/* Main B shape */}
          <mesh>
            <ringGeometry args={[0.3, 0.5, 32]} />
            <meshStandardMaterial color="#001420" metalness={0.7} roughness={0.2} />
          </mesh>
          
          {/* Vertical line of B */}
          <mesh position={[-0.3, 0, 0]}>
            <boxGeometry args={[0.1, 0.6, 0.02]} />
            <meshStandardMaterial color="#001420" metalness={0.7} roughness={0.2} />
          </mesh>
          
          {/* Top extension of B */}
          <mesh position={[-0.15, 0.2, 0]}>
            <boxGeometry args={[0.3, 0.1, 0.02]} />
            <meshStandardMaterial color="#001420" metalness={0.7} roughness={0.2} />
          </mesh>
          
          {/* Bottom extension of B */}
          <mesh position={[-0.15, -0.2, 0]}>
            <boxGeometry args={[0.3, 0.1, 0.02]} />
            <meshStandardMaterial color="#001420" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

// Creates a particle effect around the logo
function ParticleEffect() {
  const particleRef = useRef<THREE.Points>(null);
  
  // Use useFrame to animate the particles
  useFrame(({ clock }) => {
    if (particleRef.current) {
      particleRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });
  
  // Create a sphere of particles
  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // Create a sphere distribution
    const radius = 1.5 + Math.random() * 0.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
  }
  
  return (
    <points ref={particleRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.03} 
        color="#FFDD00" 
        transparent 
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Main component that puts everything together
const ThreeJSBitcoin = ({ width = 200, height = 200 }: { width?: number; height?: number }) => {
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
        
        {/* Add a spotlight for additional dramatic effect */}
        <spotLight
          position={[0, 5, 5]}
          angle={0.3}
          penumbra={0.8}
          intensity={1.5}
          castShadow
        />
        
        {/* Add background stars */}
        <Stars
          radius={50}
          depth={50}
          count={3000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        
        {/* Particle effect around the logo */}
        <ParticleEffect />
        
        {/* Bitcoin logo */}
        <BitcoinLogo />
        
        {/* Controls for interaction */}
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

export default ThreeJSBitcoin; 