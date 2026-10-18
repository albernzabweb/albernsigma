"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, ContactShadows } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { Group, MathUtils } from "three";
function Camera({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);
  const scroll = useRef(0);
  useEffect(() => {
    const fn = () => {
      scroll.current = Math.min(window.scrollY / 1000, 1);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useFrame(({ clock, pointer }, delta) => {
    if (!group.current || reduced) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      -0.32 +
        pointer.x * 0.2 +
        Math.sin(t * 0.25) * 0.055 +
        scroll.current * 0.3,
      4,
      delta,
    );
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      0.08 - pointer.y * 0.1,
      4,
      delta,
    );
    group.current.position.y = Math.sin(t * 0.7) * 0.055;
  });
  return (
    <group ref={group} rotation={[0.1, -0.32, -0.06]} scale={1.15}>
      <RoundedBox args={[2.35, 1.5, 0.77]} radius={0.16} smoothness={5}>
        <meshStandardMaterial
          color="#20262e"
          roughness={0.55}
          metalness={0.58}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.57, 1.6, 0.96]}
        radius={0.18}
        position={[0.98, -0.015, 0.06]}
      >
        <meshStandardMaterial color="#151b22" roughness={0.9} />
      </RoundedBox>
      <RoundedBox
        args={[0.8, 0.3, 0.65]}
        radius={0.09}
        position={[-0.13, 0.82, -0.03]}
      >
        <meshStandardMaterial
          color="#303741"
          metalness={0.65}
          roughness={0.4}
        />
      </RoundedBox>
      <mesh position={[0.73, 0.85, 0.03]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
        <meshStandardMaterial color="#323b49" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[-0.11, 0.02, 0.47]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.62, 0.64, 0.24, 64]} />
        <meshStandardMaterial
          color="#0d131c"
          metalness={0.85}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[-0.11, 0.02, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.57, 0.61, 0.46, 64]} />
        <meshStandardMaterial
          color="#292f37"
          metalness={0.7}
          roughness={0.35}
        />
      </mesh>
      {[0.59, 0.66, 0.73, 0.8, 0.87].map((z) => (
        <mesh key={z} position={[-0.11, 0.02, z]}>
          <torusGeometry args={[0.576, 0.014, 8, 64]} />
          <meshStandardMaterial color="#060b12" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[-0.11, 0.02, 1.01]}>
        <torusGeometry args={[0.52, 0.055, 16, 64]} />
        <meshStandardMaterial
          color="#555c64"
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[-0.11, 0.02, 1.025]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.475, 0.475, 0.025, 64]} />
        <meshStandardMaterial
          color="#0b2450"
          metalness={0.96}
          roughness={0.12}
        />
      </mesh>
      <mesh position={[-0.11, 0.02, 1.045]}>
        <torusGeometry args={[0.33, 0.02, 12, 64]} />
        <meshStandardMaterial
          color="#184f74"
          metalness={0.95}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[-0.11, 0.02, 1.06]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.018, 48]} />
        <meshStandardMaterial
          color="#090e22"
          metalness={0.8}
          roughness={0.08}
        />
      </mesh>
      <mesh position={[-0.24, 0.2, 1.08]}>
        <circleGeometry args={[0.09, 32]} />
        <meshBasicMaterial color="#6ca8d5" transparent opacity={0.45} />
      </mesh>
      <RoundedBox
        args={[0.26, 0.17, 0.06]}
        radius={0.03}
        position={[-0.88, 0.49, 0.41]}
      >
        <meshStandardMaterial color="#a4b3bb" metalness={0.7} />
      </RoundedBox>
      <mesh position={[0.69, 0.5, 0.55]}>
        <circleGeometry args={[0.055, 24]} />
        <meshBasicMaterial color="#519bdb" />
      </mesh>
      <RoundedBox
        args={[1.3, 0.8, 0.04]}
        radius={0.04}
        position={[-0.2, 0, -0.41]}
      >
        <meshStandardMaterial color="#07111f" roughness={0.16} />
      </RoundedBox>
    </group>
  );
}
export default function CameraScene({ active }: { active: boolean }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(q.matches);
    fn();
    q.addEventListener("change", fn);
    return () => q.removeEventListener("change", fn);
  }, []);
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active && !reduced ? "always" : "demand"}
      camera={{ position: [0, 0.5, 5.6], fov: 38 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
    >
      <ambientLight intensity={1.4} />
      <hemisphereLight args={["#d7edff", "#6c7ca3", 2]} />
      <directionalLight position={[3, 5, 4]} intensity={4} />
      <pointLight position={[-3, 1, 3]} intensity={22} color="#4ba5ff" />
      <pointLight position={[2, -1, 2]} intensity={8} color="#ffffff" />
      <Camera reduced={reduced} />
      <ContactShadows
        position={[0, -1.45, 0]}
        opacity={0.3}
        scale={8}
        blur={2.8}
        far={4}
        color="#2456a8"
        frames={reduced ? 1 : Infinity}
      />
    </Canvas>
  );
}
