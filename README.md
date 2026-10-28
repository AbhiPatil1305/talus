# TALUS — Practice virtually. Prepare confidently.

> **Browser-based educational surgical-skills practice platform with interactive 3D simulation, sequential checkpoints, deterministic assessment, and optional webcam hand tracking.**

---

## ⚠️ Clinical Boundary & Educational Disclaimer

**TALUS is an educational prototype and academic demonstration created for a hackathon.**
- It is **not** a clinically validated simulator.
- It is **not** a substitute for accredited, supervised surgical training or medical residency programs.
- Performance metrics represent exercise rules adherence, not real-world clinical competence.

---

## 🎯 MVP Architecture & Team Ownership

The project enforces strict separation of concerns across 4 modular workstreams:

| Member | Role | Domain / Directory | Core Deliverables |
| :--- | :--- | :--- | :--- |
| **Member 1** | Frontend & Integration Lead | `src/app/`, `src/components/`, `src/features/dashboard/` | App shell, navigation, dashboard, design system tokens, end-to-end integration, demo script. |
| **Member 2** | 3D Simulation Engineer | `src/features/simulation/` | Three.js / React Three Fiber scene, virtual instrument cursor, practice silicone pad, target markers, event emitters. |
| **Member 3** | Computer Vision / Input Engineer | `src/features/hand-tracking/` | MediaPipe Hand Landmarker POC, pinch heuristic, normalized coordinate adapter, mouse fallback contract. |
| **Member 4** | Procedure Logic & Assessment Engineer | `src/features/assessment/` | Sequential checkpoints, deterministic rubric scoring, pure validation functions, unit test suites, `localStorage` persistence. |

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Server**: [Vite](https://vitejs.dev/)
- **3D Engine**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Computer Vision**: [@mediapipe/tasks-vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) (client-side only; zero server video streaming)
- **Styling & UI**: Tailwind CSS v4 + [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) (fast deterministic rules tests)

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js LTS (v20+ recommended)
- npm (v10+ recommended)
- Git

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/AbhiPatil1305/talus.git
cd talus

# Install dependencies
npm install
```

### 2. Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the local Vite development server at `http://localhost:5173` |
| `npm test` | Runs the deterministic assessment logic test suite via Vitest |
| `npm run lint` | Runs ESLint over all TypeScript and React components |
| `npm run build` | Compiles TypeScript and builds the production bundle in `dist/` |

---

## 📋 Shared Technical Contract (`src/shared/types.ts`)

All components communicate through strictly typed contracts:

- **Simulation Events**: `SIMULATION_STARTED`, `TARGET_SELECTED`, `CHECKPOINT_COMPLETED`, `INVALID_ACTION`, `SIMULATION_RESET`.
  *Simulation components emit events only; they never assign scores directly.*
- **Input Adapter**: Emits normalized coordinates `[-1, 1]` with `isSelecting` flag.
  *Mouse controls remain primary and active at all times. Hand tracking is an optional enhancement.*
- **Deterministic Rubric**: Scores are calculated via pure functions in `src/features/assessment/assessment.ts`.
  *An LLM is never placed in the scoring loop.*

---

## ⏱️ 2-Minute Demo Script

1. **Introduction (15s)**: Introduce TALUS as an accessible browser-first surgical skills practice concept requiring zero hardware or cloud installs.
2. **Dashboard (20s)**: Show the learning objectives for Module 1 (*Basic Instrument Targeting & Incision Line Guidance*), rubric thresholds, and previous attempt history.
3. **Launch Simulation (30s)**:
   - Demonstrate 3D practice scene with silicone pad and virtual instrument.
   - Use mouse interaction to complete Step 1 (align tip) and Step 2 (engage entry marker).
4. **Demonstrate Deterministic Penalty (20s)**:
   - Click "Demo Invalid Action" or drift outside bounds to demonstrate rules-based penalty (-15 pts) and real-time educational feedback.
5. **Complete Checkpoints (20s)**:
   - Trace through midpoint (Step 3) to terminal release marker (Step 4).
6. **Assessment Summary (15s)**:
   - Open completion report showing deterministic percentage score, error tally, verified steps, and retry options.
   - (Optional): Briefly demonstrate local MediaPipe pinch tracking if webcam is permitted.

---

## 🔒 Privacy & Clinical Boundaries

- **Webcam Privacy**: Video frames are processed entirely inside browser memory using WebAssembly / WebGL. No video, images, or biometric data are transmitted over the network.
- **Persistence**: Session scores and attempt timestamps are stored locally in the browser's `localStorage`.
