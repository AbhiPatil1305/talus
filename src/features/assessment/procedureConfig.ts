import { ProcedureConfig } from '../../shared/types';

/**
 * Module 1: Anterolateral Arthrotomy & Talus Joint Exposure
 * 
 * An authentic surgical training procedure focusing on landmark registration,
 * respectful skin incision trajectory, retinaculum identification,
 * and direct exposure of the talar dome articular cartilage.
 */
export const TALUS_ARTHROTOMY_PROCEDURE: ProcedureConfig = {
  id: 'proc_talus_arthrotomy_01',
  version: '2.0.0',
  title: 'Anterolateral Arthrotomy & Talus Joint Exposure',
  category: 'Orthopedic & Podiatric Surgery',
  difficulty: 'Beginner',
  estimatedMinutes: 3,
  learningObjective: 'Master anatomical landmark registration of the lateral malleolus, maintain safe clearance from the superficial peroneal nerve, and execute a controlled linear arthrotomy exposing the talar dome.',
  clinicalContext: 'The anterolateral approach is a cornerstone incision for ankle fracture fixation, talar osteochondral lesion debridement, and anterior ankle arthroscopy.',
  rubric: {
    version: '2026.2',
    maxScore: 100,
    passingScore: 70,
    baseCheckpointPoints: 25, // 4 checkpoints * 25 = 100
    invalidActionPenalty: 15,
    outOfOrderPenalty: 20,
    timeBonusThresholdMs: 60000,
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
 * Module 2: Abdominal McBurney's Point Incision (General Surgery)
 */
export const MCBURNEY_APPENDECTOMY_PROCEDURE: ProcedureConfig = {
  id: 'proc_mcburney_appendectomy_02',
  version: '2.0.0',
  title: "Abdominal McBurney's Point Incision",
  category: 'General Surgery',
  difficulty: 'Intermediate',
  estimatedMinutes: 4,
  learningObjective: 'Identify the junction of the lateral third and medial two-thirds of the line joining the anterior superior iliac spine (ASIS) to the umbilicus, and plan an oblique abdominal incision.',
  clinicalContext: 'Classic open surgical access for acute appendectomy, preserving abdominal wall neurovascular bundles.',
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
      id: 'CP_01_ASIS',
      order: 1,
      title: 'Palpate Anterior Superior Iliac Spine (ASIS)',
      description: 'Locate the bony pelvis landmark at the right ASIS.',
      targetPosition: [-1.8, 0.05, -0.3],
      toleranceRadius: 0.65,
      requiredAction: 'position',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_02_MCBURNEY',
      order: 2,
      title: "Target McBurney's Landmark",
      description: 'Place scalpel entry at one-third distance from ASIS to umbilicus.',
      targetPosition: [-0.9, 0.05, -0.1],
      toleranceRadius: 0.65,
      requiredAction: 'select',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_03_OBLIQUE',
      order: 3,
      title: "Incision Along Langer's Lines",
      description: 'Execute oblique incision parallel to external oblique aponeurosis fibers.',
      targetPosition: [0.3, 0.05, 0.0],
      toleranceRadius: 0.7,
      requiredAction: 'traverse',
      penaltyOnSkip: 25,
    },
    {
      id: 'CP_04_FASCIA',
      order: 4,
      title: 'Expose External Oblique Aponeurosis',
      description: 'Clear subcutaneous fat to reveal glistening fascia fibers and release.',
      targetPosition: [1.8, 0.05, 0.1],
      toleranceRadius: 0.65,
      requiredAction: 'release',
      penaltyOnSkip: 25,
    },
  ],
};

// Default flagship procedure
export const BASIC_INCISION_PROCEDURE = TALUS_ARTHROTOMY_PROCEDURE;
