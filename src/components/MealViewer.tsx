
import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

// Mock meal data with 3D model configurations
const mealModels = [
  {
    id: 1,
    name: 'Quantum Protein Bowl',
    geometry: 'cylinder',
    scale: [1.5, 0.5, 1.5] as [number, number, number],
    position: [0, 0, 0] as [number, number, number],
    mainColor: '#00F5D4',
    secondaryColor: '#6C5CE7',
  },
  {
    id: 2, 
    name: 'Neon Sushi Platter',
    geometry: 'box',
    scale: [2, 0.3, 1.5] as [number, number, number],
    position: [0, 0, 0] as [number, number, number],
    mainColor: '#6C5CE7',
    secondaryColor: '#00F5D4',
  },
  {
    id: 3,
    name: 'Cyber Salad',
    geometry: 'sphere',
    scale: [1.2, 1.2, 1.2] as [number, number, number],
    position: [0, 0, 0] as [number, number, number],
    mainColor: '#38ef7d',
    secondaryColor: '#6C5CE7',
  }
];

interface MealProps {
  mealId: number;
}

const Meal = ({ mealId }: MealProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const mealData = mealModels.find(m => m.id === mealId) || mealModels[0];

  // Rotate the meal
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  // Create material with holographic effect
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(mealData.mainColor),
    metalness: 0.9,
    roughness: 0.1,
    envMapIntensity: 1,
  });

  // Create geometry based on meal type
  let geometry;
  switch (mealData.geometry) {
    case 'box':
      geometry = <boxGeometry args={[1, 1, 1]} />;
      break;
    case 'sphere':
      geometry = <sphereGeometry args={[1, 32, 32]} />;
      break;
    case 'cylinder':
      geometry = <cylinderGeometry args={[1, 1, 1, 32]} />;
      break;
    default:
      geometry = <boxGeometry args={[1, 1, 1]} />;
  }

  return (
    <group position={[0, 0, 0]}>
      <mesh
        ref={meshRef}
        scale={mealData.scale}
        position={mealData.position}
        castShadow
        receiveShadow
      >
        {geometry}
        <meshStandardMaterial
          color={mealData.mainColor}
          metalness={0.7}
          roughness={0.2}
          envMapIntensity={1}
        />
      </mesh>
      
      {/* Food items on top of the base */}
      <group position={[0, mealData.scale[1], 0]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(i / 5 * Math.PI * 2) * 0.7,
              0.2 + Math.random() * 0.2,
              Math.sin(i / 5 * Math.PI * 2) * 0.7
            ]}
            scale={[0.3, 0.3, 0.3]}
            rotation={[Math.random(), Math.random(), Math.random()]}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial
              color={mealData.secondaryColor}
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

interface MealViewerProps {
  className?: string;
  selectedMealId?: number;
}

const MealViewer = ({ className, selectedMealId = 1 }: MealViewerProps) => {
  return (
    <div className={cn('relative w-full h-64 md:h-80', className)}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={50} />
        <ambientLight intensity={0.5} />
        <spotLight
          position={[5, 5, 5]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        
        {/* The 3D meal model */}
        <Meal mealId={selectedMealId} />
        
        {/* Environment and controls */}
        <Environment preset="city" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
        
        {/* Floor reflection */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial
            color="#0F0F1E"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </Canvas>
      
      {/* Overlay gradient for better integration with the page */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 50%, #0F0F1E 100%)'
      }} />
    </div>
  );
};

export default MealViewer;
