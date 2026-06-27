import * as THREE from "three";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";

export default function Scene() {
  const [, getKeys] = useKeyboardControls();
  const boxRef = useRef();

  useFrame((state, delta) => {
    if (!boxRef.current) return;

    // Get real-time key states
    const { forward, backward, left, right } = getKeys();
    const speed = 15 * delta;
    const turnSpeed = 7.5 * delta;

    // Get current rotation
    const pos = boxRef.current.translation();
    const rotation = boxRef.current.rotation();
    // 1. Rapier uses "Quaternions" (4D math: x,y,z,w) to handle 3D rotation without glitches.
    // 2. We convert that 4D rotation into an "Euler" angle (simple X, Y, Z degrees) so it's easier to use.
    const euler = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w),
    );

    // 1. Create a 3D arrow pointing forward on the Z-axis (0, 0, -1 in Three.js).
    // 2. .applyEuler(euler) tilts that arrow to match the exact direction the box is facing.
    const forwardVector = new THREE.Vector3(0, 0, -1).applyEuler(euler);

    // .multiplyScalar(speed) stretches the direction arrow to match your speed value.
    // .applyImpulse(..., true) gives the box a physics push along that stretched arrow.
    if (forward)
      boxRef.current.applyImpulse(forwardVector.multiplyScalar(speed), true);
    if (backward)
      boxRef.current.applyImpulse(forwardVector.multiplyScalar(-speed), true);

    // .applyTorqueImpulse(..., true) applies a rotational twisting force (like twisting a jar lid).
    // Twisting around the Y-axis (up/down axis) makes the front of the box spin left or right.
    if (left)
      boxRef.current.applyTorqueImpulse({ x: 0, y: turnSpeed, z: 0 }, true);
    if (right)
      boxRef.current.applyTorqueImpulse({ x: 0, y: -turnSpeed, z: 0 }, true);

    // Follow cam logic
    // Create a vector pointing behind and above the box
    const offset = new THREE.Vector3(0, 4, 8);

    // Rotate that offset vector to match the box's current rotation
    const quaternion = new THREE.Quaternion(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w,
    );
    offset.applyQuaternion(quaternion);

    // Add the rotated offset to the box position to find the final camera coordinates
    const targetCameraPos = new THREE.Vector3(pos.x, pos.y, pos.z).add(offset);

    // 5. Smoothly ease the camera into that position (lerp) so it feels fluid
    state.camera.position.lerp(targetCameraPos, 0.1);

    // 6. Keep the lens locked right onto the target
    state.camera.lookAt(pos.x, pos.y, pos.z);
  });

  return (
    <>
      {/* Box component */}
      <RigidBody
        ref={boxRef}
        position={[0, 5, 0]}
        colliders="cuboid"
        linearDamping={0.5} // Air resistance
        angularDamping={0.8} // Prevent infinite spinning
      >
        <mesh castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="coral" />
        </mesh>
      </RigidBody>

      {/* Static Ground Floor */}
      <RigidBody type="fixed" colliders="cuboid" friction={1.5}>
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[20, 1, 20]} />
          <meshStandardMaterial color="#EDECEB" />
        </mesh>
      </RigidBody>
    </>
  );
}
