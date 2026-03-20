import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';

// Preload the model as soon as this module is imported so it's ready when TVA theme activates
useGLTF.preload('/miss_minutes/scene.gltf');

// ── Mood light colours per expression ────────────────────────────────────────
const MOOD_COLORS = {
  idle:       '#FF6B00',
  happy:      '#FFD700',
  laugh:      '#FFEE44',
  angry:      '#FF2200',
  surprised:  '#FFFFFF',
  suspicious: '#FF8C00',
  excited:    '#FF9900',
};

// ── The actual 3D model + animation logic ────────────────────────────────────
function MissMinutesModel({ expression, isHovered }) {
  const { scene } = useGLTF('/miss_minutes/scene.gltf');

  // outerRef: shifted once to center the model at origin
  const outerRef   = useRef();
  // animRef: target for GSAP and useFrame animations
  const animRef    = useRef();
  const moodRef    = useRef();
  const gsapActive = useRef(false);
  const clock      = useRef({ t: 0 });
  const { camera } = useThree();

  // ── One-time: center model and fit camera after GLTF loads ────────────────
  useEffect(() => {
    if (!outerRef.current) return;

    // Compute actual bounding box of the loaded scene hierarchy
    const box    = new THREE.Box3().setFromObject(outerRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());

    // Shift outer group so the model is centred at origin
    outerRef.current.position.set(-center.x, -center.y, -center.z);

    // Position camera to fit the model snugly
    const maxDim = Math.max(size.x, size.y, size.z);
    const fovRad = (camera.fov * Math.PI) / 180;
    const dist   = (maxDim / 2) / Math.tan(fovRad / 2) * 1.5;
    camera.position.set(0, maxDim * 0.15, dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Idle: slow Y-rotation — paused while GSAP is animating ───────────────
  useFrame((_, delta) => {
    if (!animRef.current) return;
    clock.current.t += delta;

    if (!gsapActive.current) {
      // no idle spin
    }

    // Hover: subtle scale pulse
    const targetScale = isHovered ? 1.12 : 1.0;
    animRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.08
    );
  });

  // ── Expression-driven GSAP animations ────────────────────────────────────
  useEffect(() => {
    if (!animRef.current || !moodRef.current) return;
    const g     = animRef.current;
    const light = moodRef.current;

    gsap.killTweensOf(g.position);
    gsap.killTweensOf(g.rotation);
    gsap.killTweensOf(g.scale);

    const moodColor = new THREE.Color(MOOD_COLORS[expression] ?? MOOD_COLORS.idle);
    light.color.set(moodColor);

    if (expression === 'idle') {
      gsapActive.current = false;
      gsap.to(g.rotation, { z: 0, duration: 0.4, ease: 'power2.out' });
      return;
    }

    gsapActive.current = true;

    const done = () => {
      gsapActive.current = false;
      setTimeout(() => {
        light.color.set(new THREE.Color(MOOD_COLORS.idle));
      }, 1500);
    };

    if (expression === 'happy') {
      gsap.to(g.position, {
        y: 0.08, duration: 0.22, ease: 'power2.out',
        yoyo: true, repeat: 3,
        onComplete: () => { gsap.to(g.position, { y: 0, duration: 0.3 }); done(); },
      });

    } else if (expression === 'laugh') {
      const tl = gsap.timeline({ onComplete: done });
      tl.to(g.position, { y: 0.1, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 5 })
        .to(g.scale,    { x: 1.15, y: 1.15, z: 1.15, duration: 0.15, yoyo: true, repeat: 3 }, '<');

    } else if (expression === 'angry') {
      const tl = gsap.timeline({ onComplete: done });
      tl.to(g.rotation, { z: 0.12, duration: 0.07, ease: 'none', yoyo: true, repeat: 9 })
        .to(g.position,  { x: 0.03, duration: 0.07, ease: 'none', yoyo: true, repeat: 9 }, '<')
        .to(g.rotation,  { z: 0, duration: 0.2 });

    } else if (expression === 'surprised') {
      const tl = gsap.timeline({ onComplete: done });
      tl.to(g.scale,    { x: 1.45, y: 1.45, z: 1.45, duration: 0.14, ease: 'power3.out' })
        .to(g.position,  { y: 0.09, duration: 0.14 }, '<')
        .to(g.scale,     { x: 1.0, y: 1.0, z: 1.0, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' })
        .to(g.position,  { y: 0, duration: 0.4, ease: 'bounce.out' }, '<');

    } else if (expression === 'suspicious') {
      const tl = gsap.timeline({ onComplete: done });
      tl.to(g.rotation, { z: 0.28, duration: 0.5, ease: 'power2.inOut' })
        .to(g.rotation,  { z: 0, duration: 0.5, ease: 'power2.inOut', delay: 0.9 });

    } else if (expression === 'excited') {
      const tl = gsap.timeline({ onComplete: done });
      tl.to(g.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.2, yoyo: true, repeat: 3 });
    }
  }, [expression]);

  return (
    // outerRef: centering offset applied once on load
    <group ref={outerRef}>
      {/* animRef: all GSAP and useFrame animations target this group */}
      <group ref={animRef}>
        <pointLight
          ref={moodRef}
          position={[0.5, 1, 1.5]}
          intensity={2.0}
          color={MOOD_COLORS.idle}
        />
        <ambientLight intensity={0.8} />
        <primitive object={scene} />
      </group>
    </group>
  );
}

// ── Exported Canvas wrapper ───────────────────────────────────────────────────
export default function MissMinutes3D({ expression = 'idle', isHovered = false }) {
  return (
    <Canvas
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      camera={{ fov: 45, near: 0.01, far: 100 }}
    >
      <Suspense fallback={null}>
        <MissMinutesModel expression={expression} isHovered={isHovered} />
      </Suspense>
    </Canvas>
  );
}
