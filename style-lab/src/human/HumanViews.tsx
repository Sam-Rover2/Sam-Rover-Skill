import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { buildHuman, poseHuman, setFace, type Face, type HumanPose, type HumanSpec } from './Human';

type V3 = [number, number, number];

const Cam: React.FC<{ pos: V3; target: V3; fov: number }> = ({ pos, target, fov }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...target);
    if ('fov' in camera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
};

export interface Actor {
  spec: HumanSpec;
  pos: V3;
  rotY?: number;
  pose?: HumanPose;
  face?: Face;
  wire?: boolean; // show skeleton + wireframe
}

const ActorView: React.FC<Actor> = ({ spec, pos, rotY = 0, pose, face, wire }) => {
  const h = useMemo(() => buildHuman(spec), [spec]);
  poseHuman(h, pose);
  setFace(h, face ?? {});
  const helper = useMemo(() => {
    if (!wire) return null;
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: '#ffcc33', depthTest: false });
    const jm = new THREE.MeshBasicMaterial({ color: '#ff5533', depthTest: false });
    for (const bone of Object.values(h.bones)) {
      const j = new THREE.Mesh(new THREE.SphereGeometry(0.035 * h.S, 8, 6), jm);
      j.renderOrder = 10;
      bone.add(j);
      for (const child of bone.children) {
        if (!(child instanceof THREE.Bone)) continue;
        const len = child.position.length();
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012 * h.S, 0.012 * h.S, len, 6), mat);
        stick.renderOrder = 9;
        stick.position.copy(child.position).multiplyScalar(0.5);
        stick.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), child.position.clone().normalize());
        bone.add(stick);
      }
    }
    (h.mesh.material as THREE.MeshStandardMaterial).transparent = true;
    (h.mesh.material as THREE.MeshStandardMaterial).opacity = 0.55;
    return g;
  }, [h, wire]);
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <primitive object={h.root} />
      {helper && <primitive object={helper} />}
    </group>
  );
};

/** Dark studio like a 3D viewer: soft key light with shadows, grey floor. */
export const HumanStage: React.FC<{ actors: Actor[]; cam: { pos: V3; target: V3; fov?: number }; bg?: string; floor?: string }> = ({
  actors,
  cam,
  bg = 'radial-gradient(ellipse at 50% 35%, #4a4b4f, #2a2b2e)',
  floor = '#3b3c40',
}) => (
  <AbsoluteFill style={{ background: bg }}>
    <ThreeCanvas width={1920} height={1080} shadows linear={false}>
      <Cam pos={cam.pos} target={cam.target} fov={cam.fov ?? 30} />
      <hemisphereLight args={['#f4f1ea', '#5a5b60', 1.5]} />
      <directionalLight position={[2, 4, 14]} intensity={0.7} />
      <directionalLight
        position={[-8, 16, 12]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[10, 6, -8]} intensity={0.6} color="#cfe0ff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={floor} roughness={1} />
      </mesh>
      {actors.map((a, i) => (
        <ActorView key={i} {...a} />
      ))}
    </ThreeCanvas>
  </AbsoluteFill>
);
