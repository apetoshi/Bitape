'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Sphere, OrbitControls, Stars, Trail, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Ape-themed particle effect that orbits around the globe
function ApeParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const orbitRef = useRef<THREE.Group>(null);
  
  // Create particles in an orbital pattern
  const particleCount = 150;
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.3 + Math.random() * 0.3;
      const height = (Math.random() - 0.5) * 0.3;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;
    }
    
    return positions;
  }, []);
  
  // Animation for particles
  useFrame(({ clock }) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
    
    if (particlesRef.current && particlesRef.current.material) {
      // Pulsing opacity for particles
      const material = particlesRef.current.material as THREE.PointsMaterial;
      material.opacity = 0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    }
  });
  
  return (
    <group ref={orbitRef}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.03} 
          color="#b280ff" 
          transparent 
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

// Small orbiting "satellites" that represent APE tokens
function ApeSatellites() {
  const group1Ref = useRef<THREE.Group>(null);
  const group2Ref = useRef<THREE.Group>(null);
  const sphere1Ref = useRef<THREE.Mesh>(null);
  const sphere2Ref = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    if (group1Ref.current) {
      group1Ref.current.rotation.y = t * 0.2;
      group1Ref.current.rotation.x = Math.sin(t * 0.2) * 0.2;
    }
    
    if (group2Ref.current) {
      group2Ref.current.rotation.y = -t * 0.15;
      group2Ref.current.rotation.x = Math.cos(t * 0.25) * 0.3;
    }
    
    if (sphere1Ref.current) {
      // Pulse effect
      const scale = 1 + Math.sin(t * 2) * 0.1;
      sphere1Ref.current.scale.set(scale, scale, scale);
    }
  });
  
  return (
    <>
      {/* First orbiting satellite */}
      <group ref={group1Ref}>
        <mesh ref={sphere1Ref} position={[0, 0, 2]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial 
            color="#ffcc00" 
            emissive="#ff9900"
            emissiveIntensity={0.5}
            metalness={0.7}
            roughness={0.3}
          />
          <Trail 
            width={0.05}
            length={5}
            color="#ffcc00"
            attenuation={(width) => width}
          />
        </mesh>
      </group>
      
      {/* Second orbiting satellite */}
      <group ref={group2Ref}>
        <mesh ref={sphere2Ref} position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial 
            color="#ffcc00" 
            emissive="#ff9900"
            emissiveIntensity={0.5}
            metalness={0.7}
            roughness={0.3}
          />
          <Trail 
            width={0.03}
            length={4}
            color="#ffcc00"
            attenuation={(width) => width}
          />
        </mesh>
      </group>
    </>
  );
}

// Main globe component with ApeChain-themed design
function ApeGlobe() {
  const globeRef = useRef<THREE.Mesh>(null);
  const overlayRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.LineSegments>(null);
  
  // Load textures with error handling
  const [apeTexture, apeIcon] = useLoader(THREE.TextureLoader, [
    '/ApeChain/gradient.png',
    '/ApeChain/Mask group.png'
  ]);
  
  // Create grid lines effect
  useEffect(() => {
    if (!gridRef.current) return;
    
    // Material for longitude/latitude lines
    const material = new THREE.LineBasicMaterial({
      color: 0x6144e0,
      transparent: true,
      opacity: 0.3,
    });
    
    const radius = 1.01;
    const latSegments = 18;
    const lonSegments = 36;
    
    // Create latitude lines
    for (let i = 0; i <= latSegments; i++) {
      const phi = (Math.PI * i) / latSegments;
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      
      for (let j = 0; j <= 100; j++) {
        const theta = (2 * Math.PI * j) / 100;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        vertices.push(x, y, z);
      }
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      const line = new THREE.Line(geometry, material);
      gridRef.current.add(line);
    }
    
    // Create longitude lines
    for (let i = 0; i < lonSegments; i++) {
      const theta = (2 * Math.PI * i) / lonSegments;
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      
      for (let j = 0; j <= 100; j++) {
        const phi = (Math.PI * j) / 100;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        vertices.push(x, y, z);
      }
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      const line = new THREE.Line(geometry, material);
      gridRef.current.add(line);
    }
  }, []);
  
  // Animate the globe and atmosphere
  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
    
    if (overlayRef.current) {
      overlayRef.current.rotation.y = clock.getElapsedTime() * 0.07;
    }
    
    if (atmosphereRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 0.5) * 0.03 + 1.02;
      atmosphereRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <>
      {/* Main globe sphere */}
      <Sphere ref={globeRef} args={[1, 64, 64]} position={[0, 0, 0]}>
        <meshPhongMaterial
          map={apeTexture}
          bumpMap={apeIcon}
          bumpScale={0.02}
          specular={new THREE.Color('#6144e0')}
          shininess={20}
          emissive="#6144e0"
          emissiveIntensity={0.1}
        />
      </Sphere>
      
      {/* Overlay pattern layer */}
      <Sphere ref={overlayRef} args={[1.01, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          alphaMap={apeIcon}
          color="#b280ff"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </Sphere>
      
      {/* Inner atmosphere glow */}
      <Sphere ref={atmosphereRef} args={[1.15, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#6144e0"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Outer atmosphere glow */}
      <Sphere args={[1.25, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#8975ff"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Grid lines */}
      <lineSegments ref={gridRef} />
      
      {/* Additional visual elements */}
      <ApeParticles />
      <ApeSatellites />
    </>
  );
}

// Enhanced space background
function EnhancedSpace() {
  const starsRef1 = useRef<THREE.Points>(null);
  const starsRef2 = useRef<THREE.Points>(null);
  
  // Create geometry for star layers
  const starPositions1 = useMemo(() => {
    const arr = new Float32Array(300);
    for (let i = 0; i < 300; i += 3) {
      const r = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      arr[i] = r * Math.sin(phi) * Math.cos(theta);
      arr[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  
  const starPositions2 = useMemo(() => {
    const arr = new Float32Array(150);
    for (let i = 0; i < 150; i += 3) {
      const r = 25 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      arr[i] = r * Math.sin(phi) * Math.cos(theta);
      arr[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  
  // Animate the stars
  useFrame(({ clock }) => {
    if (starsRef1.current) {
      starsRef1.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
    if (starsRef2.current) {
      starsRef2.current.rotation.y = -clock.getElapsedTime() * 0.005;
      starsRef2.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.01;
    }
  });
  
  return (
    <>
      {/* Distant stars layer */}
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0.1}
        fade
        speed={0.5}
      />
      
      {/* Medium distance stars */}
      <points ref={starsRef1}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={starPositions1}
            count={100}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.2} color="#ffffff" sizeAttenuation />
      </points>
      
      {/* Close, bright stars */}
      <points ref={starsRef2}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={starPositions2}
            count={50}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.3} color="#aaccff" sizeAttenuation />
      </points>
    </>
  );
}

// Handles loading state and error boundaries
function GlobeWithLoadingState() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    // Handle loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#6144e0" />
      </Sphere>
    );
  }
  
  return (
    <React.Suspense fallback={
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#6144e0" />
      </Sphere>
    }>
      <ApeGlobe />
    </React.Suspense>
  );
}

// Main component
const ThreeJSGlobe = ({ width = 200, height = 200 }: { width?: number; height?: number }) => {
  return (
    <div
      style={{
        width: width,
        height: height,
        margin: '0 auto',
        position: 'relative',
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: '0 0 20px rgba(97, 68, 224, 0.35)'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ background: 'radial-gradient(circle at center, #0c1429 0%, #020918 100%)' }}
        dpr={[1, 2]} // Better rendering on high DPI devices
        performance={{ min: 0.5 }} // Performance optimization
      >
        {/* Enhanced lighting */}
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 2, 5]} intensity={1.5} />
        <directionalLight position={[-5, -2, -5]} intensity={0.2} color="#8975ff" />
        <pointLight position={[3, 0, 0]} intensity={0.3} color="#ffffff" />
        
        {/* Space background */}
        <EnhancedSpace />
        
        {/* Globe with loading state handling */}
        <GlobeWithLoadingState />
        
        {/* Improved controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.4}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI * 0.3}
          maxPolarAngle={Math.PI * 0.7}
        />
      </Canvas>
    </div>
  );
};

export default ThreeJSGlobe; 