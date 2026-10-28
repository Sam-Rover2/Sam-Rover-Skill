import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';

type V3 = [number, number, number];

/** Places the camera and aims it every frame (driven by Remotion's frame, not a clock). */
export const CameraRig: React.FC<{ position: V3; target: V3; fov?: number }> = ({ position, target, fov }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(...position);
    camera.lookAt(...target);
    if (fov && 'fov' in camera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, position, target, fov]);
  return null;
};
