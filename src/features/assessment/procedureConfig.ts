import { ProcedureConfig } from '../../shared/types';

/**
 * Procedure 1: Real Human Heart — Cardiovascular Cannulation & LAD Trajectory
 */
export const CARDIAC_CABG_PROCEDURE: ProcedureConfig = {
  id: 'proc_cardiac_cabg_03',
  version: '2.0.0',
  title: 'Real Human Heart — Cannulation & LAD Bypass',
  category: 'Cardiovascular Surgery',
  difficulty: 'Advanced',
  estimatedMinutes: 4,
  learningObjective: 'Identify the ascending aorta for arterial cannulation, locate the superior vena cava venous corridor, and trace the anterior interventricular groove along the Left Anterior Descending (LAD) coronary artery.',
  clinicalContext: 'Essential anatomical orientation for cardiopulmonary bypass initiation and coronary artery bypass graft (CABG) revascularization.',
  rubric: {
    version: '2026.2',
    maxScore: 100,
    passingScore: 75,
    baseCheckpointPoints: 25,
    invalidActionPenalty: 15,
    outOfOrderPenalty: 20,
  },
  checkpoints: [
    {
      id: 'CP_01_AORTA',
      order: 1,
      title: 'Identify Ascending Aorta Landmark',
      description: 'Align scalpel/probe over the root of the ascending aorta for arterial cannulation registration.',
      targetPosition: [-1.4, 0.15, -0.2],
      toleranceRadius: 0.65,
      requiredAction: 'position',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_02_SVC',
      order: 2,
      title: 'Superior Vena Cava (SVC) Corridor',
      description: 'Engage venous drainage landmark at the cavoatrial junction.',
      targetPosition: [-0.6, 0.15, -0.4],
      toleranceRadius: 0.65,
      requiredAction: 'select',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_03_LAD',
      order: 3,
      title: 'Trace LAD Coronary Artery Groove',
      description: 'Trace along the anterior interventricular sulcus containing the Left Anterior Descending artery.',
      targetPosition: [0.4, 0.15, 0.1],
      toleranceRadius: 0.7,
      requiredAction: 'traverse',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_04_APEX',
      order: 4,
      title: 'Left Ventricle Apex Release',
      description: 'Reach the apex of the left ventricle and release engagement.',
      targetPosition: [1.6, 0.15, 0.3],
      toleranceRadius: 0.65,
      requiredAction: 'release',
      penaltyOnSkip: 25,
    },
  ],
};

/**
 * Procedure 2: Real Human Ankle & Talus Bone Arthrotomy
 */
export const TALUS_ARTHROTOMY_PROCEDURE: ProcedureConfig = {
  id: 'proc_talus_arthrotomy_01',
  version: '2.0.0',
  title: 'Ankle & Talus Bone — Anterolateral Arthrotomy',
  category: 'Orthopedic Surgery',
  difficulty: 'Beginner',
  estimatedMinutes: 3,
  learningObjective: 'Master anatomical landmark registration of the lateral malleolus, maintain safe clearance from the superficial peroneal nerve, and execute a controlled linear arthrotomy exposing the talar dome.',
  clinicalContext: 'The anterolateral approach is a cornerstone incision for ankle fracture fixation, talar osteochondral lesion debridement, and anterior ankle arthroscopy.',
  rubric: {
    version: '2026.2',
    maxScore: 100,
    passingScore: 70,
    baseCheckpointPoints: 25,
    invalidActionPenalty: 15,
    outOfOrderPenalty: 20,
  },
  checkpoints: [
    {
      id: 'CP_01_PALPATE',
      order: 1,
      title: 'Palpate Distal Lateral Malleolus',
      description: 'Align the virtual instrument over the distal fibular tip landmark to register anatomical orientation.',
      targetPosition: [-1.8, 0.05, -0.3],
      toleranceRadius: 0.65,
      requiredAction: 'position',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_02_ENTRY',
      order: 2,
      title: 'Engage Joint Line Entry Point',
      description: 'Engage scalpel #10 at the surgical skin mark, 2 cm proximal to the ankle joint line in the safe corridor.',
      targetPosition: [-0.9, 0.05, -0.1],
      toleranceRadius: 0.65,
      requiredAction: 'select',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_03_TRAVERSE',
      order: 3,
      title: 'Incise Along Anterolateral Guideline',
      description: 'Maintain cutting depth through epidermis and dermis along the gentian-violet line toward the 4th metatarsal base.',
      targetPosition: [0.3, 0.05, 0.0],
      toleranceRadius: 0.7,
      requiredAction: 'traverse',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_04_CAPSULE',
      order: 4,
      title: 'Expose Talar Dome Articular Cartilage',
      description: 'Reach the distal terminal boundary over the extensor retinaculum to visualize the talus articular dome, then safely release.',
      targetPosition: [1.8, 0.05, 0.1],
      toleranceRadius: 0.65,
      requiredAction: 'release',
      penaltyOnSkip: 25,
    },
  ],
};

/**
 * Procedure 3: Real Human Kidney — Renal Hilum & Partial Nephrectomy
 */
export const KIDNEY_NEPHRECTOMY_PROCEDURE: ProcedureConfig = {
  id: 'proc_kidney_nephrectomy_04',
  version: '2.0.0',
  title: 'Real Human Kidney — Renal Hilum Exposure',
  category: 'Urological Surgery',
  difficulty: 'Intermediate',
  estimatedMinutes: 3,
  learningObjective: 'Identify the fibrous renal capsule, navigate the medial renal hilum containing the renal vein and renal artery, and define tumor excision margins on the renal cortex.',
  clinicalContext: 'Crucial vascular control steps in open and robotic partial nephrectomy for renal cell carcinoma.',
  rubric: {
    version: '2026.2',
    maxScore: 100,
    passingScore: 70,
    baseCheckpointPoints: 25,
    invalidActionPenalty: 15,
    outOfOrderPenalty: 20,
  },
  checkpoints: [
    {
      id: 'CP_01_CAPSULE',
      order: 1,
      title: 'Palpate Renal Capsule Superior Pole',
      description: 'Position instrument at the convex upper pole of the renal cortex.',
      targetPosition: [-1.4, 0.12, -0.2],
      toleranceRadius: 0.65,
      requiredAction: 'position',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_02_HILUM',
      order: 2,
      title: 'Medial Renal Hilum Landmark',
      description: 'Engage scalpel at the medial indentation leading to renal vessels.',
      targetPosition: [-0.6, 0.12, 0.2],
      toleranceRadius: 0.65,
      requiredAction: 'select',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_03_ARTERY',
      order: 3,
      title: 'Trace Renal Artery Sheath Plane',
      description: 'Trace along the main renal artery dissection corridor.',
      targetPosition: [0.4, 0.12, 0.1],
      toleranceRadius: 0.7,
      requiredAction: 'traverse',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_04_CORTEX',
      order: 4,
      title: 'Inferior Pole Margin & Release',
      description: 'Complete resection boundary around the lower pole parenchyma and release.',
      targetPosition: [1.6, 0.12, -0.2],
      toleranceRadius: 0.65,
      requiredAction: 'release',
      penaltyOnSkip: 25,
    },
  ],
};

/**
 * Procedure 4: Real Human Head 3D Scan — Craniofacial & Temporal Approach
 */
export const CRANIOFACIAL_PROCEDURE: ProcedureConfig = {
  id: 'proc_craniofacial_05',
  version: '2.0.0',
  title: 'Real Human Head Scan — Craniofacial Corridor',
  category: 'Neurosurgery & Craniofacial',
  difficulty: 'Intermediate',
  estimatedMinutes: 3,
  learningObjective: 'Utilize 3D laser-scanned human facial anatomy to plan a coronal/temporal incision respecting the frontal branch of the facial nerve and superficial temporal artery.',
  clinicalContext: 'Standard neurosurgical access for pterional craniotomy and anterior skull base surgery.',
  rubric: {
    version: '2026.2',
    maxScore: 100,
    passingScore: 70,
    baseCheckpointPoints: 25,
    invalidActionPenalty: 15,
    outOfOrderPenalty: 20,
  },
  checkpoints: [
    {
      id: 'CP_01_ZYGOMA',
      order: 1,
      title: 'Palpate Zygomatic Arch Landmark',
      description: 'Position instrument over the bony zygomatic prominence.',
      targetPosition: [-1.4, 0.15, -0.3],
      toleranceRadius: 0.65,
      requiredAction: 'position',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_02_TRAGUS',
      order: 2,
      title: 'Pre-auricular Tragus Entry Point',
      description: 'Engage scalpel 1 cm anterior to the tragus of the ear in the safe plane.',
      targetPosition: [-0.6, 0.15, -0.1],
      toleranceRadius: 0.65,
      requiredAction: 'select',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_03_TEMPORAL',
      order: 3,
      title: 'Trace Superior Temporal Line',
      description: 'Trace curvilinear incision behind the hairline toward the vertex.',
      targetPosition: [0.4, 0.15, 0.2],
      toleranceRadius: 0.7,
      requiredAction: 'traverse',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_04_PTERION',
      order: 4,
      title: 'Pterion Boundary Exposure & Release',
      description: 'Reach terminal boundary over the fronto-spheno-parietal junction and release.',
      targetPosition: [1.6, 0.15, 0.1],
      toleranceRadius: 0.65,
      requiredAction: 'release',
      penaltyOnSkip: 25,
    },
  ],
};

// Default flagship procedure
export const BASIC_INCISION_PROCEDURE = CARDIAC_CABG_PROCEDURE;
export const ALL_PROCEDURES = [
  CARDIAC_CABG_PROCEDURE,
  TALUS_ARTHROTOMY_PROCEDURE,
  KIDNEY_NEPHRECTOMY_PROCEDURE,
  CRANIOFACIAL_PROCEDURE,
];
