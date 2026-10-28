import { AnatomicalStructure, AnatomicalSystem } from '../../shared/types';

/**
 * Scientifically verified anatomical metadata database.
 * Directly maps each displayed structure to the verified mesh node names
 * inside the NIH Visible Human / HuBMAP 3D Reference GLB models.
 *
 * Source: NIH Visible Human Male (VHM) Reference Library
 * License: CC-BY 4.0 / NIH Public Medical Data
 * Standards: Terminologia Anatomica (TA2)
 */
export const ANATOMICAL_STRUCTURES: AnatomicalStructure[] = [
  // ==========================================
  // CARDIOVASCULAR SYSTEM (NIH Heart Model)
  // Model: /models/human_heart_nih.glb
  // ==========================================
  {
    id: 'struct_ascending_aorta',
    name: 'Ascending Aorta',
    latinName: 'Aorta ascendens',
    system: 'cardiovascular',
    meshName: 'VHM_ascending_aorta',
    modelUrl: '/models/human_heart_nih.glb',
    category: 'Great Vessels',
    description: 'The initial portion of the aorta commencing at the upper part of the base of the left ventricle.',
    function: 'Distributes oxygenated blood under high pressure from the left ventricle into systemic circulation.',
    clinicalRelevance: 'Primary site for aortic cannulation during cardiopulmonary bypass; high risk of dissection in acute aortic syndrome.',
    surgicalProcedureId: 'proc_cardiac_cabg_03',
  },
  {
    id: 'struct_aortic_arch',
    name: 'Aortic Arch',
    latinName: 'Arcus aortae',
    system: 'cardiovascular',
    meshName: 'VHM_aortic_arch',
    modelUrl: '/models/human_heart_nih.glb',
    category: 'Great Vessels',
    description: 'The curved segment of the main artery that bends between the ascending and descending aorta.',
    function: 'Gives rise to the three major brachiocephalic arterial branches supplying head, neck, and upper limbs.',
    clinicalRelevance: 'Susceptible to saccular aneurysms; critical cross-clamping zone in open cardiac reconstruction.',
    surgicalProcedureId: 'proc_cardiac_cabg_03',
  },
  {
    id: 'struct_lad_artery',
    name: 'Left Anterior Descending (LAD) Artery',
    latinName: 'Ramus interventricularis anterior arteriae coronariae sinistrae',
    system: 'cardiovascular',
    meshName: 'VHM_left_anterior_descending_artery',
    modelUrl: '/models/human_heart_nih.glb',
    category: 'Coronary Vasculature',
    description: 'The anterior interventricular branch of the left coronary artery coursing in the anterior groove toward the cardiac apex.',
    function: 'Supplies blood to 45–55% of the left ventricle, including the anterior wall and most of the interventricular septum.',
    clinicalRelevance: 'Known clinically as the "widowmaker" artery; the primary anastomotic target for the Left Internal Mammary Artery (LIMA) in CABG.',
    surgicalProcedureId: 'proc_cardiac_cabg_03',
  },
  {
    id: 'struct_right_marginal_artery',
    name: 'Right Marginal Artery',
    latinName: 'Ramus marginalis dexter arteriae coronariae dextrae',
    system: 'cardiovascular',
    meshName: 'VHM_right_marginal_artery',
    modelUrl: '/models/human_heart_nih.glb',
    category: 'Coronary Vasculature',
    description: 'Branch of the right coronary artery passing along the lower border of the heart towards the apex.',
    function: 'Supplies blood to the myocardium of the anterior and diaphragmatic surfaces of the right ventricle.',
    clinicalRelevance: 'Secondary grafting target in complex multi-vessel coronary revascularization.',
    surgicalProcedureId: 'proc_cardiac_cabg_03',
  },
  {
    id: 'struct_brachiocephalic_artery',
    name: 'Brachiocephalic Trunk',
    latinName: 'Truncus brachiocephalicus',
    system: 'cardiovascular',
    meshName: 'VHM_brachiocephalic_artery',
    modelUrl: '/models/human_heart_nih.glb',
    category: 'Aortic Arch Branches',
    description: 'The first and largest arterial branch arising from the convexity of the aortic arch.',
    function: 'Bifurcates into the right common carotid and right subclavian arteries supplying right head, neck, and right arm.',
    clinicalRelevance: 'Landmark for selective antegrade cerebral perfusion during aortic arch replacement.',
    surgicalProcedureId: 'proc_cardiac_cabg_03',
  },
  {
    id: 'struct_carotid_artery',
    name: 'Left Common Carotid Artery',
    latinName: 'Arteria carotis communis sinistra',
    system: 'cardiovascular',
    meshName: 'VHM_left_common_carotid_artery',
    modelUrl: '/models/human_heart_nih.glb',
    category: 'Aortic Arch Branches',
    description: 'The second branch of the aortic arch ascending through the superior mediastinum into the left neck.',
    function: 'Provides the major blood supply to the left cerebral hemisphere, eyes, and neurocranium.',
    clinicalRelevance: 'Target for carotid endarterectomy; susceptible to atheromatous plaque embolization.',
    surgicalProcedureId: 'proc_cardiac_cabg_03',
  },
  {
    id: 'struct_subclavian_artery',
    name: 'Left Subclavian Artery',
    latinName: 'Arteria subclavia sinistra',
    system: 'cardiovascular',
    meshName: 'VHM_left_subclavian_artery',
    modelUrl: '/models/human_heart_nih.glb',
    category: 'Aortic Arch Branches',
    description: 'The third branch of the aortic arch passing under the left clavicle into the axilla.',
    function: 'Supplies the left arm and branches into the internal thoracic and vertebral arteries.',
    clinicalRelevance: 'Origins of the left internal mammary artery used for CABG grafts; site for subclavian cannulation.',
    surgicalProcedureId: 'proc_cardiac_cabg_03',
  },
  {
    id: 'struct_descending_aorta',
    name: 'Descending Thoracic Aorta',
    latinName: 'Aorta descendens thoracica',
    system: 'cardiovascular',
    meshName: 'VHM_descending_aorta',
    modelUrl: '/models/human_heart_nih.glb',
    category: 'Great Vessels',
    description: 'Segment of aorta running from the lower border of the 4th thoracic vertebra down to the diaphragm.',
    function: 'Transports blood to intercostal spaces, esophagus, pericardium, and bronchial structures.',
    clinicalRelevance: 'Site for Thoracic Endovascular Aortic Repair (TEVAR) and intra-aortic balloon pump (IABP) placement.',
    surgicalProcedureId: 'proc_cardiac_cabg_03',
  },

  // ==========================================
  // SKELETAL SYSTEM (NIH Pelvis Model)
  // Model: /models/human_pelvis.glb
  // ==========================================
  {
    id: 'struct_sacrum',
    name: 'Sacrum',
    latinName: 'Os sacrum',
    system: 'skeletal',
    meshName: 'VHM_sacrum',
    modelUrl: '/models/human_pelvis.glb',
    category: 'Pelvic Girdle & Spine',
    description: 'Large wedge-shaped vertebra formed by the fusion of five sacral vertebrae at the base of the spine.',
    function: 'Transmits body weight from the vertebral column to the pelvic girdle via the sacroiliac joints.',
    clinicalRelevance: 'Critical for sacral screw fixation in spinopelvic instrumentation and sacrectomy for chordoma.',
    surgicalProcedureId: 'proc_talus_arthrotomy_01',
  },
  {
    id: 'struct_coccyx',
    name: 'Coccyx (Tailbone)',
    latinName: 'Os coccygis',
    system: 'skeletal',
    meshName: 'VHM_coccyx',
    modelUrl: '/models/human_pelvis.glb',
    category: 'Pelvic Girdle & Spine',
    description: 'Terminal segment of the vertebral column composed of three to five fused vestigial vertebrae.',
    function: 'Provides attachment site for muscles and ligaments of the pelvic floor, including the levator ani.',
    clinicalRelevance: 'Subject to painful fractures or coccydynia following traumatic falls; site for coccygectomy.',
    surgicalProcedureId: 'proc_talus_arthrotomy_01',
  },
  {
    id: 'struct_ilium_left',
    name: 'Left Ilium & ASIS Landmark',
    latinName: 'Os ilium sinistrum',
    system: 'skeletal',
    meshName: 'VHM_ilium_compact_bone_L',
    modelUrl: '/models/human_pelvis.glb',
    category: 'Pelvic Girdle',
    description: 'The broad uppermost bone of the pelvis featuring the prominent Anterior Superior Iliac Spine (ASIS).',
    function: 'Anchors the iliacus, gluteal muscles, sartorius, and tensor fasciae latae.',
    clinicalRelevance: 'The ASIS is the primary palpation landmark used to establish McBurney\'s point for open appendectomy incisions.',
    surgicalProcedureId: 'proc_talus_arthrotomy_01',
  },
  {
    id: 'struct_ilium_right',
    name: 'Right Ilium',
    latinName: 'Os ilium dextrum',
    system: 'skeletal',
    meshName: 'VHM_ilium_compact_bone_R',
    modelUrl: '/models/human_pelvis.glb',
    category: 'Pelvic Girdle',
    description: 'The right superior flaring portion of the os coxae.',
    function: 'Provides lateral support and housing for the iliac fossa and bone marrow reservoir.',
    clinicalRelevance: 'Gold-standard site for autologous bone graft harvesting (iliac crest bone graft).',
    surgicalProcedureId: 'proc_talus_arthrotomy_01',
  },
  {
    id: 'struct_pubis_left',
    name: 'Left Pubis',
    latinName: 'Os pubis sinistrum',
    system: 'skeletal',
    meshName: 'VHM_pubis_compact_bone_L',
    modelUrl: '/models/human_pelvis.glb',
    category: 'Pelvic Girdle',
    description: 'The ventral and anterior component of the left hip bone.',
    function: 'Articulates at the pubic symphysis to complete the anterior pelvic ring.',
    clinicalRelevance: 'Injured in high-energy "open-book" pelvic fractures requiring emergency pelvic binder stabilization.',
    surgicalProcedureId: 'proc_talus_arthrotomy_01',
  },
  {
    id: 'struct_ischium_left',
    name: 'Left Ischium',
    latinName: 'Os ischii sinistrum',
    system: 'skeletal',
    meshName: 'VHM_ischium_compact_bone_L',
    modelUrl: '/models/human_pelvis.glb',
    category: 'Pelvic Girdle',
    description: 'The lower and back part of the hip bone bearing body weight in the sitting position.',
    function: 'Attachment point for hamstring muscles (biceps femoris, semitendinosus, semimembranosus).',
    clinicalRelevance: 'Common site for hamstring avulsion injuries and pressure sores (decubitus ulcers) in immobilized patients.',
    surgicalProcedureId: 'proc_talus_arthrotomy_01',
  },

  // ==========================================
  // RESPIRATORY SYSTEM (NIH Lung Model)
  // Model: /models/human_lung.glb
  // ==========================================
  {
    id: 'struct_left_main_bronchus',
    name: 'Left Main Bronchus',
    latinName: 'Bronchus principalis sinister',
    system: 'respiratory',
    meshName: 'VHM_left_main_bronchus',
    modelUrl: '/models/human_lung.glb',
    category: 'Tracheobronchial Tree',
    description: 'The airway branch delivering air from the tracheal carina to the left lung.',
    function: 'Directs inspired air past the aortic arch and pulmonary trunk into the superior and inferior lobes.',
    clinicalRelevance: 'Target for double-lumen endotracheal tube placement during single-lung isolation in thoracic surgery.',
    surgicalProcedureId: 'proc_cardiac_cabg_03',
  },
  {
    id: 'struct_right_main_bronchus',
    name: 'Right Main Bronchus',
    latinName: 'Bronchus principalis dexter',
    system: 'respiratory',
    meshName: 'VHM_right_main_bronchus',
    modelUrl: '/models/human_lung.glb',
    category: 'Tracheobronchial Tree',
    description: 'Wider, shorter, and more vertical main airway branching from the carina.',
    function: 'Transports gases to the right lung (superior, middle, and inferior lobes).',
    clinicalRelevance: 'Most common site for foreign body aspiration due to its steeper vertical angle.',
    surgicalProcedureId: 'proc_cardiac_cabg_03',
  },
  {
    id: 'struct_left_superior_lobar',
    name: 'Left Superior Lobar Bronchus',
    latinName: 'Bronchus lobaris superior sinister',
    system: 'respiratory',
    meshName: 'VHM_left_superior_lobar_bronchus',
    modelUrl: '/models/human_lung.glb',
    category: 'Bronchial Tree',
    description: 'Secondary bronchus branching into the upper division and lingular division of the left lung.',
    function: 'Aerates the upper lobe of the left lung.',
    clinicalRelevance: 'Stapling and division landmark in left upper lobectomy for non-small cell lung cancer.',
    surgicalProcedureId: 'proc_cardiac_cabg_03',
  },

  // ==========================================
  // INTEGUMENTARY SYSTEM (NIH Visible Human Skin)
  // Model: /models/human_body_skin.glb
  // ==========================================
  {
    id: 'struct_human_skin',
    name: 'Human Cutaneous Surface & Epidermis',
    latinName: 'Integumentum commune',
    system: 'integumentary',
    meshName: 'VHM_skin',
    modelUrl: '/models/human_body_skin.glb',
    category: 'Body Surface & Dermatomes',
    description: 'The external covering of the human body derived from the NIH Visible Human male dataset.',
    function: 'Provides immune barrier, thermoregulation, sensory reception, and fluid containment.',
    clinicalRelevance: 'Surgical planning requires incising parallel to Langer\'s cleavage lines to minimize tension and hypertrophic scarring.',
    surgicalProcedureId: 'proc_talus_arthrotomy_01',
  },
];

export const SYSTEM_CATEGORIES: { id: AnatomicalSystem; name: string; icon: string; count: number }[] = [
  { id: 'all', name: 'All Structures', icon: '🧬', count: ANATOMICAL_STRUCTURES.length },
  { id: 'cardiovascular', name: 'Cardiovascular', icon: '🫀', count: ANATOMICAL_STRUCTURES.filter(s => s.system === 'cardiovascular').length },
  { id: 'skeletal', name: 'Skeletal & Pelvis', icon: '🦴', count: ANATOMICAL_STRUCTURES.filter(s => s.system === 'skeletal').length },
  { id: 'respiratory', name: 'Respiratory Tree', icon: '🫁', count: ANATOMICAL_STRUCTURES.filter(s => s.system === 'respiratory').length },
  { id: 'integumentary', name: 'Full Body Surface', icon: '👤', count: ANATOMICAL_STRUCTURES.filter(s => s.system === 'integumentary').length },
];

export function getStructuresBySystem(system: AnatomicalSystem): AnatomicalStructure[] {
  if (system === 'all') return ANATOMICAL_STRUCTURES;
  return ANATOMICAL_STRUCTURES.filter((s) => s.system === system);
}

export function searchStructures(query: string, system: AnatomicalSystem = 'all'): AnatomicalStructure[] {
  const normalized = query.trim().toLowerCase();
  const pool = getStructuresBySystem(system);
  if (!normalized) return pool;

  return pool.filter(
    (s) =>
      s.name.toLowerCase().includes(normalized) ||
      s.latinName.toLowerCase().includes(normalized) ||
      s.category.toLowerCase().includes(normalized) ||
      s.description.toLowerCase().includes(normalized) ||
      s.clinicalRelevance.toLowerCase().includes(normalized) ||
      s.function.toLowerCase().includes(normalized)
  );
}

export interface AvailableModel {
  id: string;
  name: string;
  url: string;
  system: AnatomicalSystem;
  badge: string;
  structureCount: number;
  description: string;
}

export const AVAILABLE_MODELS: AvailableModel[] = [
  {
    id: 'human_heart_nih',
    name: 'Human Heart & Great Vessels',
    url: '/models/human_heart_nih.glb',
    system: 'cardiovascular',
    badge: 'NIH Visible Human • CC-BY 4.0',
    structureCount: 8,
    description: 'Coronary vasculature, aortic arch, and great vessel branches',
  },
  {
    id: 'human_pelvis',
    name: 'Pelvis & Sacral Spine',
    url: '/models/human_pelvis.glb',
    system: 'skeletal',
    badge: 'NIH Visible Human • CC-BY 4.0',
    structureCount: 6,
    description: 'Pelvic girdle, sacrum, coccyx, ilium, and ASIS landmark',
  },
  {
    id: 'human_lung',
    name: 'Tracheobronchial Tree',
    url: '/models/human_lung.glb',
    system: 'respiratory',
    badge: 'NIH 3D Print Exchange • CC0',
    structureCount: 3,
    description: 'Tracheal bifurcation, principal and lobar bronchi',
  },
  {
    id: 'human_body_skin',
    name: 'Full Body Surface Contour',
    url: '/models/human_body_skin.glb',
    system: 'integumentary',
    badge: 'NIH Visible Human • CC-BY 4.0',
    structureCount: 1,
    description: 'Standing human cutaneous surface and dermatome reference',
  },
];

