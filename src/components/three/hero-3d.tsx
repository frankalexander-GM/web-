'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Points, PointMaterial, Environment } from '@react-three/drei'
import { useMemo, useRef, Suspense } from 'react'
import * as THREE from 'three'

function Particles({ count = 1200 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count])

  const ref = useRef<THREE.Points>(null)
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.04
      ref.current.rotation.x += delta * 0.01
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#c084fc"
        size={0.045}
        sizeAttenuation
        depthWrite={false}
        opacity={0.9}
      />
    </Points>
  )
}

function CoreOrb() {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.3
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.15
      const x = state.pointer.x * 0.3
      const y = state.pointer.y * 0.3
      mesh.current.position.x += (x - mesh.current.position.x) * 0.05
      mesh.current.position.y += (y - mesh.current.position.y) * 0.05
    }
  })
  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <icosahedronGeometry args={[1.35, 12]} />
      <MeshDistortMaterial
        color="#a855f7"
        emissive="#7c3aed"
        emissiveIntensity={0.5}
        roughness={0.15}
        metalness={0.8}
        distort={0.45}
        speed={2.2}
      />
    </mesh>
  )
}

function FloatingShape({ position, geometry, color, speed = 1 }: { position: [number, number, number]; geometry: 'torus' | 'octa' | 'dodeca' | 'box'; color: string; speed?: number }) {
  const geom = () => {
    switch (geometry) {
      case 'torus': return <torusGeometry args={[0.5, 0.18, 16, 48]} />
      case 'octa': return <octahedronGeometry args={[0.6, 0]} />
      case 'dodeca': return <dodecahedronGeometry args={[0.55, 0]} />
      case 'box': return <boxGeometry args={[0.7, 0.7, 0.7]} />
    }
  }
  return (
    <Float speed={2 * speed} rotationIntensity={1.5} floatIntensity={1.2}>
      <mesh position={position}>
        {geom()}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          roughness={0.2}
          metalness={0.7}
          wireframe={geometry === 'dodeca'}
        />
      </mesh>
    </Float>
  )
}

function Rig() {
  useFrame((state) => {
    state.camera.position.x += (state.pointer.x * 1.5 - state.camera.position.x) * 0.03
    state.camera.position.y += (state.pointer.y * 1.0 - state.camera.position.y) * 0.03
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={2.2} color="#a855f7" />
        <pointLight position={[-5, -3, 3]} intensity={1.8} color="#ec4899" />
        <pointLight position={[0, 4, -5]} intensity={1.4} color="#06b6d4" />
        <CoreOrb />
        <FloatingShape position={[2.6, 1.2, -1]} geometry="torus" color="#ec4899" speed={1.1} />
        <FloatingShape position={[-2.8, 0.6, -0.5]} geometry="octa" color="#06b6d4" speed={0.9} />
        <FloatingShape position={[2.1, -1.6, 0.5]} geometry="dodeca" color="#8b5cf6" speed={1.3} />
        <FloatingShape position={[-2.3, -1.3, 0.8]} geometry="box" color="#10b981" speed={1.0} />
        <FloatingShape position={[0.5, 2.3, -1.5]} geometry="octa" color="#f59e0b" speed={1.2} />
        <Particles count={1400} />
        <Environment preset="night" />
        <Rig />
      </Suspense>
    </Canvas>
  )
}
