/**
 * TALUS Verified Anatomical 3D Asset Manifest
 *
 * Provides transparent provenance, license compliance, polygon metrics,
 * and mesh hierarchy details for all 3D anatomical models integrated into TALUS.
 */

export interface ModelAssetInfo {
  id: string;
  name: string;
  filename: string;
  filePath: string;
  fileSizeBytes: number;
  source: string;
  license: string;
  attribution: string;
  format: 'GLB' | 'glTF';
  isScientificallyVerified: boolean;
  structureSeparation: 'fully-segmented' | 'partially-segmented' | 'single-mesh';
  totalNamedNodes: number;
  totalMeshes: number;
  nativeDimensionsMeters?: [number, number, number]; // [width, height, depth]
  verifiedMeshIdentifiers: string[];
  notes: string;
  recommendations?: string;
}

export const ANATOMICAL_ASSET_MANIFEST: Record<string, ModelAssetInfo> = {
  'human_heart_nih': {
    id: 'human_heart_nih',
    name: 'NIH Visible Human Male — Heart & Great Vessels',
    filename: 'human_heart_nih.glb',
    filePath: '/models/human_heart_nih.glb',
    fileSizeBytes: 1730000,
    source: 'NIH HuBMAP 3D Reference Object Library / Visible Human Project',
    license: 'Creative Commons Attribution 4.0 International (CC-BY 4.0)',
    attribution: 'National Institutes of Health (NIH) HuBMAP Consortium & CCF 3D Reference Library',
    format: 'GLB',
    isScientificallyVerified: true,
    structureSeparation: 'fully-segmented',
    totalNamedNodes: 67,
    totalMeshes: 49,
    nativeDimensionsMeters: [0.124, 0.514, 0.129],
    verifiedMeshIdentifiers: [
      'VHM_ascending_aorta',
      'VHM_aortic_arch',
      'VHM_left_anterior_descending_artery',
      'VHM_right_marginal_artery',
      'VHM_brachiocephalic_artery',
      'VHM_left_common_carotid_artery',
      'VHM_left_subclavian_artery',
      'VHM_descending_aorta',
      'VHM_cardiac_artery',
      'VHM_right_coronary_artery',
      'VHM_right_posterior_descending_artery',
      'VHM_vasculature',
    ],
    notes: 'Primary scientific asset for cardiovascular surgical practice and cannulation training.',
  },
  'human_pelvis': {
    id: 'human_pelvis',
    name: 'NIH Visible Human Male — Pelvis & Sacrum',
    filename: 'human_pelvis.glb',
    filePath: '/models/human_pelvis.glb',
    fileSizeBytes: 2120000,
    source: 'NIH HuBMAP 3D Reference Object Library / Visible Human Project',
    license: 'Creative Commons Attribution 4.0 International (CC-BY 4.0)',
    attribution: 'National Institutes of Health (NIH) HuBMAP Consortium',
    format: 'GLB',
    isScientificallyVerified: true,
    structureSeparation: 'fully-segmented',
    totalNamedNodes: 24,
    totalMeshes: 14,
    nativeDimensionsMeters: [0.284, 0.218, 0.173],
    verifiedMeshIdentifiers: [
      'VHM_sacrum',
      'VHM_coccyx',
      'VHM_pubis_compact_bone_L',
      'VHM_pubis_compact_bone_R',
      'VHM_pubis_spongy_bone_L',
      'VHM_pubis_spongy_bone_R',
      'VHM_ilium_compact_bone_L',
      'VHM_ilium_compact_bone_R',
      'VHM_ilium_spongy_bone_L',
      'VHM_ilium_spongy_bone_R',
      'VHM_ischium_compact_bone_L',
      'VHM_ischium_compact_bone_R',
      'VHM_ischium_spongy_bone_L',
      'VHM_ischium_spongy_bone_R',
    ],
    notes: 'Accurate human pelvic girdle and sacral spine; contains palpable Anterior Superior Iliac Spine (ASIS) landmark.',
  },
  'human_lung': {
    id: 'human_lung',
    name: 'NIH Visible Human Male — Tracheobronchial Tree',
    filename: 'human_lung.glb',
    filePath: '/models/human_lung.glb',
    fileSizeBytes: 3410000,
    source: 'NIH 3D Print Exchange / Human-Organ3D Dataset',
    license: 'Public Domain / Creative Commons Zero (CC0) / MIT',
    attribution: 'National Institutes of Health (NIH) 3D Print Exchange',
    format: 'GLB',
    isScientificallyVerified: true,
    structureSeparation: 'fully-segmented',
    totalNamedNodes: 104,
    totalMeshes: 79,
    nativeDimensionsMeters: [0.259, 0.315, 0.190],
    verifiedMeshIdentifiers: [
      'VHM_left_main_bronchus',
      'VHM_right_main_bronchus',
      'VHM_left_superior_lobar_bronchus',
      'VHM_left_inferior_lobar_bronchus',
      'VHM_right_middle_lobar_bronchus',
      'VHM_right_superior_lobar_bronchus',
      'VHM_left_superior_bronchus',
      'VHM_left_anterior_bronchus',
    ],
    notes: 'Exquisite bifurcation of tracheal carina and secondary/tertiary lobar bronchial divisions.',
  },
  'human_body_skin': {
    id: 'human_body_skin',
    name: 'NIH Visible Human Male — Epidermal Skin Contour',
    filename: 'human_body_skin.glb',
    filePath: '/models/human_body_skin.glb',
    fileSizeBytes: 820000,
    source: 'NIH Visible Human Project 3D Reconstruction',
    license: 'Creative Commons Attribution 4.0 International (CC-BY 4.0)',
    attribution: 'National Library of Medicine (NLM) / NIH Visible Human Project',
    format: 'GLB',
    isScientificallyVerified: true,
    structureSeparation: 'single-mesh',
    totalNamedNodes: 1,
    totalMeshes: 1,
    nativeDimensionsMeters: [1.048, 1.807, 0.345],
    verifiedMeshIdentifiers: ['VHM_skin'],
    notes: 'Full standing human body surface morphology for global anatomical spatial orientation and dermatome reference.',
  },
  'lee_perry_smith': {
    id: 'lee_perry_smith',
    name: 'Real Human Head 3D Scan (Lee Perry-Smith)',
    filename: 'lee_perry_smith.glb',
    filePath: '/models/lee_perry_smith.glb',
    fileSizeBytes: 1200000,
    source: 'Three.js Medical Reference / Infinite-Realities (Lee Perry-Smith)',
    license: 'Creative Commons Attribution 3.0 (CC-BY 3.0)',
    attribution: 'Lee Perry-Smith / Infinite-Realities Ltd',
    format: 'GLB',
    isScientificallyVerified: true,
    structureSeparation: 'single-mesh',
    totalNamedNodes: 3,
    totalMeshes: 1,
    nativeDimensionsMeters: [8.55, 7.94, 5.18],
    verifiedMeshIdentifiers: ['LeePerrySmith'],
    notes: 'Direct 3D photogrammetric/laser scan of real living human craniofacial anatomy.',
  },
  'heart_sketchfab': {
    id: 'heart_sketchfab',
    name: 'Preliminary Heart Model (Combined Mesh)',
    filename: 'heart.glb',
    filePath: '/models/heart.glb',
    fileSizeBytes: 1800000,
    source: 'Human-Organ3D Repository (Sketchfab)',
    license: 'Creative Commons Attribution (CC-BY 4.0)',
    attribution: 'Human-Organ3D / Sketchfab',
    format: 'GLB',
    isScientificallyVerified: false,
    structureSeparation: 'single-mesh',
    totalNamedNodes: 5,
    totalMeshes: 1,
    verifiedMeshIdentifiers: ['hart:ZBrush_defualt_group_Heart Tex_0'],
    notes: 'Single fused mesh without separately selectable coronary arteries or cardiac chambers.',
    recommendations: 'Asset preparation needed: Open in Blender, separate vertices into discrete anatomical objects (LAD, aorta, ventricles), rename to Terminologia Anatomica, and re-export.',
  },
  'kidney_sketchfab': {
    id: 'kidney_sketchfab',
    name: 'Preliminary Kidney Model (Unsegmented Meshes)',
    filename: 'kidney.glb',
    filePath: '/models/kidney.glb',
    fileSizeBytes: 1500000,
    source: 'Human-Organ3D Repository (Sketchfab)',
    license: 'Creative Commons Attribution (CC-BY 4.0)',
    attribution: 'Human-Organ3D / Sketchfab',
    format: 'GLB',
    isScientificallyVerified: false,
    structureSeparation: 'partially-segmented',
    totalNamedNodes: 14,
    totalMeshes: 12,
    verifiedMeshIdentifiers: ['Object_2', 'Object_3', 'Object_4'],
    notes: 'Meshes have generic identifiers (Object_2..Object_13) without verified anatomical nomenclature.',
    recommendations: 'Asset preparation needed: Map each mesh node to renal cortex, medulla, renal pelvis, renal artery, and renal vein using clinical anatomical references.',
  },
};
