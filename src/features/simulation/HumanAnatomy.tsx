import React from 'react';
import * as THREE from 'three';

export type AnatomyLayer = 'skin' | 'subcutaneous' | 'bone';

interface HumanAnatomyProps {
  layer: AnatomyLayer;
}

/**
 * 3D Human Lower Limb, Ankle & Talus Bone Anatomical Model
 * Complete with sterile surgical drapes, Betadine skin prep zone,
 * and multi-layer anatomical exploration.
 */
export const HumanAnatomy: React.FC<HumanAnatomyProps> = ({ layer }) => {
  return (
    <group position={[0, -0.15, 0]}>
      {/* 1. Operating Room Table & Surgical Bed Base */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[11, 0.4, 7.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Sterile Patient Mattress / Gel Positioner Pad */}
      <mesh position={[0, -0.38, 0]}>
        <boxGeometry args={[10.2, 0.08, 6.8]} />
        <meshStandardMaterial color="#0284c7" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* 2. Sterile Surgical Drapes (Medical Cyan/Blue Field) */}
      {/* Large Perimeter Drape */}
      <mesh position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9.5, 6.2]} />
        <meshStandardMaterial
          color="#0369a1" // Medical cyan-blue drape
          roughness={0.9}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Surgical Drape Towel Clips (Metallic Clamps on Aperture Corners) */}
      {[
        [-2.7, 0.02, -1.5],
        [2.7, 0.02, -1.5],
        [-2.7, 0.02, 1.5],
        [2.7, 0.02, 1.5],
      ].map(([cx, cy, cz], idx) => (
        <group key={idx} position={[cx, cy, cz]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.09, 0.025, 8, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* 3. Human Lower Limb & Ankle Anatomy */}
      <group position={[0, 0, 0]}>
        {/* --- A. SKIN LAYER --- */}
        {layer === 'skin' && (
          <group>
            {/* Lower Leg / Distal Calf (Tibia/Fibula segment) */}
            <mesh position={[-2.2, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.9, 1.15, 3.8, 32]} />
              <meshStandardMaterial
                color="#e0a98b" // Warm human skin tone
                roughness={0.65}
                metalness={0.05}
              />
            </mesh>

            {/* Ankle Joint Transition Zone */}
            <mesh position={[0.2, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.82, 0.9, 1.4, 32]} />
              <meshStandardMaterial color="#deb095" roughness={0.65} />
            </mesh>

            {/* Lateral Malleolus Anatomical Landmark (Fibular Prominence - Outer Ankle) */}
            <mesh position={[-0.4, 0.22, -0.65]}>
              <sphereGeometry args={[0.32, 16, 16]} />
              <meshStandardMaterial color="#d49b7d" roughness={0.6} />
            </mesh>

            {/* Medial Malleolus Anatomical Landmark (Inner Ankle) */}
            <mesh position={[-0.3, 0.22, 0.72]}>
              <sphereGeometry args={[0.36, 16, 16]} />
              <meshStandardMaterial color="#d49b7d" roughness={0.6} />
            </mesh>

            {/* Foot / Hindfoot & Midfoot Segment (Talus & Calcaneus contour) */}
            <mesh position={[1.4, 0.08, 0]} rotation={[0, 0, -0.15]}>
              <boxGeometry args={[1.8, 0.75, 1.25]} />
              <meshStandardMaterial color="#deb095" roughness={0.65} />
            </mesh>

            {/* Forefoot & Metatarsal Base */}
            <mesh position={[2.4, 0.02, 0]} rotation={[0, 0, -0.2]}>
              <boxGeometry args={[1.3, 0.55, 1.15]} />
              <meshStandardMaterial color="#e0a98b" roughness={0.65} />
            </mesh>

            {/* Antiseptic Povidone-Iodine (Betadine) Surgical Skin Prep Stain */}
            {/* Real surgical skin is prepped with circular amber-brown iodine solution */}
            <mesh position={[0.0, 0.25, 0.0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.2, 1.6, 32]} />
              <meshBasicMaterial
                color="#92400e" // Warm amber/brown Betadine prep
                transparent
                opacity={0.35}
              />
            </mesh>
            <mesh position={[0.0, 0.255, 0.0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.1, 32]} />
              <meshBasicMaterial
                color="#b45309"
                transparent
                opacity={0.25}
              />
            </mesh>
          </group>
        )}

        {/* --- B. SUBCUTANEOUS & RETINACULUM LAYER --- */}
        {layer === 'subcutaneous' && (
          <group>
            {/* Subcutaneous Adipose Tissue (Golden Yellow surgical layer) */}
            <mesh position={[-0.2, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.76, 0.84, 4.0, 32]} />
              <meshStandardMaterial
                color="#facc15" // Adipose yellow
                roughness={0.8}
                metalness={0.0}
              />
            </mesh>

            {/* Extensor Retinaculum Band (Dense Fibrous Fascia) */}
            <mesh position={[0.2, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.78, 0.78, 0.65, 32]} />
              <meshStandardMaterial
                color="#f8fafc" // White fibrous fascia band
                roughness={0.4}
                metalness={0.1}
                transparent
                opacity={0.85}
              />
            </mesh>

            {/* Tibialis Anterior & Extensor Digitorum Tendon Bundles */}
            <mesh position={[0.1, 0.22, 0.15]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 3.2, 16]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
            </mesh>
            <mesh position={[0.1, 0.21, -0.15]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 3.2, 16]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
            </mesh>
          </group>
        )}

        {/* --- C. BONE & SKELETAL LAYER (TALUS BONE FOCUS) --- */}
        {layer === 'bone' && (
          <group>
            {/* Distal Tibia (Shin Bone) */}
            <mesh position={[-1.5, 0.05, 0.18]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.42, 0.58, 2.8, 16]} />
              <meshStandardMaterial
                color="#fef08a" // Bone ivory
                roughness={0.45}
                metalness={0.1}
              />
            </mesh>

            {/* Distal Fibula (Outer Ankle Bone) */}
            <mesh position={[-1.4, 0.05, -0.42]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.22, 0.28, 2.7, 16]} />
              <meshStandardMaterial color="#fef08a" roughness={0.45} />
            </mesh>

            {/* THE TALUS BONE (Key Ankle Joint Articular Bone) */}
            <group position={[0.3, 0.08, 0]}>
              {/* Talar Trochlea / Dome (Articular Cartilage - Smooth Bluish Ivory) */}
              <mesh position={[0, 0.12, 0]}>
                <sphereGeometry args={[0.48, 24, 24]} />
                <meshStandardMaterial
                  color="#e2e8f0"
                  roughness={0.2}
                  metalness={0.2}
                />
              </mesh>

              {/* Talar Neck & Head */}
              <mesh position={[0.45, 0.05, 0]} rotation={[0, 0, -0.2]}>
                <boxGeometry args={[0.55, 0.45, 0.65]} />
                <meshStandardMaterial color="#fef08a" roughness={0.45} />
              </mesh>

              {/* Articular Joint Space Indicator Ring */}
              <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.46, 0.52, 32]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
              </mesh>
            </group>

            {/* Calcaneus (Heel Bone) */}
            <mesh position={[-0.2, -0.25, 0]}>
              <boxGeometry args={[1.5, 0.7, 0.9]} />
              <meshStandardMaterial color="#fef08a" roughness={0.5} />
            </mesh>

            {/* Navicular & Metatarsal Bases */}
            <mesh position={[1.2, 0.02, 0]}>
              <boxGeometry args={[0.8, 0.4, 0.8]} />
              <meshStandardMaterial color="#fef08a" roughness={0.5} />
            </mesh>
          </group>
        )}
      </group>

      {/* Sterile Fenestrated Surgical Drape Aperture Rim */}
      <mesh position={[0.0, 0.01, 0.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 4.4, 32]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
