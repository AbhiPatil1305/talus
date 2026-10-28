# TALUS — Team Contribution & Collaboration Guide

Welcome to the TALUS Hackathon Team! This document outlines our branch conventions, file boundaries, collaborator onboarding checklist, and review procedures to keep `main` stable and runnable at all times.

---

## 👥 Team Workstreams & Ownership

| Member | Role | Domain Files / Folders | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Member 1** | Frontend & Integration Lead | `src/app/`, `src/components/`, `src/features/dashboard/`, `src/shared/types.ts` | Owns app shell, navigation, design tokens, overall integration, and shared type contracts. |
| **Member 2** | 3D Simulation Engineer | `src/features/simulation/` | Owns 3D scene, instrument model, target markers, camera, and simulation event emissions. |
| **Member 3** | Computer Vision / Input Engineer | `src/features/hand-tracking/` | Owns MediaPipe integration, pinch heuristics, coordinate normalization, and mouse fallback. |
| **Member 4** | Procedure Logic & Assessment Engineer | `src/features/assessment/` | Owns checkpoints, pure scoring functions, event validation, unit tests, and session storage. |

> **Rule on Shared Types (`src/shared/types.ts`):**
> Only the Integration Lead (Member 1) may commit modifications to `src/shared/types.ts`. If you need a new event type or payload field, agree with Member 1 first.

---

## 🌿 Git Branching Convention

All work happens on short-lived feature branches branched from `main`:

- `feat/dashboard` — Dashboard, module selection, UI polish (Member 1)
- `feat/simulation` — 3D scene, instruments, targeting interaction (Member 2)
- `feat/hand-tracking` — MediaPipe hand landmarker & pinch input (Member 3)
- `feat/assessment` — Procedure config, deterministic scoring & tests (Member 4)
- `fix/<issue-name>` — Quick targeted bug fixes

---

## 📋 Teammate Onboarding Checklist (Steps 1–7)

Follow these exact steps to get set up:

### Step 1: Accept GitHub Repository Invitation
1. Check your email or visit: [https://github.com/AbhiPatil1305/talus/invitations](https://github.com/AbhiPatil1305/talus/invitations)
2. Click **Accept invitation** to join the repository as a collaborator.

### Step 2: Clone the Repository
Open PowerShell / Windows Terminal or macOS Terminal:
```bash
git clone https://github.com/AbhiPatil1305/talus.git
cd talus
```

### Step 3: Install Node.js Dependencies
```bash
npm install
```

### Step 4: Create Your Workstream Branch
```bash
# Example for Member 2 (3D Simulation)
git checkout -b feat/simulation

# Example for Member 3 (Hand Tracking)
git checkout -b feat/hand-tracking

# Example for Member 4 (Assessment)
git checkout -b feat/assessment
```

### Step 5: Run the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. Verify the dashboard and 3D simulation load cleanly.

### Step 6: Verify Tests & Build Before Committing
Before pushing code, make sure all tests, linter, and build checks pass:
```bash
npm test
npm run lint
npm run build
```

### Step 7: Push & Open a Pull Request
```bash
git add .
git commit -m "feat(simulation): improve instrument target collision tolerance"
git push origin feat/simulation
```
Then visit GitHub and open a Pull Request into `main`. Tag the Integration Lead (Member 1) for review.

---

## ⚠️ Key Engineering Guidelines

1. **Keep `main` Runnable**: Never push untested or broken code to `main`.
2. **Deterministic Assessment**: Never put an LLM or non-deterministic algorithm in the scoring loop. Scoring must be 100% reproducible based on recorded events.
3. **Mouse Fallback is King**: Mouse interaction must always work. Camera errors or permission denials must never break or block the user experience.
4. **No Secrets or Keys**: Do not commit API keys, `.env` files, or passwords to Git.
