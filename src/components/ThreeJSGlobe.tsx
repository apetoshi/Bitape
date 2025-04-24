'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Sphere, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Earth component with ApeChain-themed textures
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.LineSegments>(null);
  
  // Load ApeChain textures
  const [apeGradient, apeIcon] = useLoader(THREE.TextureLoader, [
    '/ApeChain/gradient1.png',
    '/ApeChain/ApeChain Icon Outlined - White.png'
  ]);
  
  // Create latitude/longitude grid
  useEffect(() => {
    if (!gridRef.current) return;
    
    // Material for longitude/latitude lines
    const material = new THREE.LineBasicMaterial({
      color: 0x3a4385,
      transparent: true,
      opacity: 0.4,
    });
    
    const radius = 1.01; // Slightly larger than earth
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
  
  // Animation loop
  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
    
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.07;
    }
    
    if (atmosphereRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 0.5) * 0.03 + 1.02;
      atmosphereRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <>
      {/* Globe sphere with ApeChain-themed textures */}
      <Sphere ref={earthRef} args={[1, 64, 64]} position={[0, 0, 0]}>
        <meshPhongMaterial
          map={apeGradient}
          bumpMap={apeIcon}
          bumpScale={0.02}
          specular={new THREE.Color('#6144e0')}
          shininess={15}
        />
      </Sphere>
      
      {/* Overlay pattern layer */}
      <Sphere ref={cloudsRef} args={[1.01, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          alphaMap={apeIcon}
          color="#b280ff"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </Sphere>
      
      {/* Atmosphere glow effect (ape-themed blue/purple) */}
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
    </>
  );
}

// Background stars component with improved appearance
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
      {/* Layer 1: Distant stars */}
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0.1}
        fade
        speed={0.5}
      />
      
      {/* Layer 2: Custom brighter stars */}
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
      
      {/* Layer 3: Closer, brighter stars */}
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

// Handle texture loading state
function EarthWithLoadingState() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    // Simulate texture loading
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
  
  // Use error boundary pattern
  return (
    <React.Suspense fallback={
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#6144e0" />
      </Sphere>
    }>
      <Earth />
    </React.Suspense>
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
      >
        {/* Enhanced lighting setup with ape-themed colors */}
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 2, 5]} intensity={1.5} />
        <directionalLight position={[-5, -2, -5]} intensity={0.2} color="#8975ff" />
        <pointLight position={[3, 0, 0]} intensity={0.3} color="#ffffff" />
        
        {/* Improved background */}
        <EnhancedSpace />
        
        {/* Earth with error handling */}
        <EarthWithLoadingState />
        
        {/* Improved orbital controls */}
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