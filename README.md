# PrepPilot AI 🚀
### *Study Smarter. Identify Gaps. Never Miss Revision.*

**Hack2Skill PromptWars 2026 — 24-Hour Online AI Hackathon**  
**Repository**: [github.com/jeevimelodies-123/promptwars-hackathon-2026](https://github.com/jeevimelodies-123/promptwars-hackathon-2026)

---

## 1. Project Overview

**PrepPilot AI** is an innovative, educational web application engineered specifically for college and university students facing impending examinations. 

Unlike generic chatbots or static dashboards, PrepPilot AI implements a **unified, closed-loop learning engine** that addresses the three fundamental psychological and structural obstacles students face during exam preparation:

1. **Overwhelm & Indecision**: Students don't know what to study first when time is limited.
2. **Concept Blind Spots**: Students cannot pinpoint the exact subtopic misconceptions causing repeated exam errors.
3. **The Forgetting Curve**: Students forget previously learned concepts because they do not revise at scientifically optimal intervals.

All three modules interact in real time: a diagnostic test score instantly updates weakness detection, which re-tunes study priority in the daily timetable, and schedules an aggressive spaced-repetition revision interval.

---

## 2. The Core Innovation: Connected Closed-Loop Feedback Engine

The heart of PrepPilot AI is its **six-stage feedback loop**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      THE PREPPILOT FEEDBACK CYCLE                      │
 └────────────────────────────────────────────────────────────────────────┘

    [1. Diagnostic Assessment]
                 │  (Interactive MCQ + Conceptual Short-Answer)
                 ▼
    [2. AI Weakness Detection]
                 │  (Pinpoints exact misconceptions, e.g. Peterson's turn variable)
                 ▼
    [3. Deterministic Priority Escalation]
                 │  (Urgency, Weightage, Mastery Deficit & Overdue Factors)
                 ▼
    [4. Targeted Learning & Timetable Generation]
                 │  (Minutes budgeted by available study hours)
                 ▼
    [5. Adaptive Spaced Revision (SM-2 Lite)]
                 │  (24h interval for failures; 3d, 7d, 14d for mastery)
                 ▼
    [6. Remedial Reassessment & Graduation]
                 │  (Score improves 35% ➔ 85%+, priority drops, interval expands)
                 └────────────── (Cycles continuously until Exam Day) ───────┘
```

### Real-World Example (Operating Systems Exam in 5 Days):
1. **Scenario**: A student has an Operating Systems final exam in 5 days with 3.5 available study hours per day.
2. **Diagnostic Result**: 
   - *Process Synchronization*: **35%** (Critical Weakness)
   - *Deadlocks*: **80%** (Good Understanding)
   - *Memory Management*: **55%** (Needs Practice)
   - *CPU Scheduling*: **90%** (Mastered)
3. **System Reaction**:
   - **Feature B (Analyzer)** detects specific failures: Peterson's Algorithm tie-breaking semantics and Semaphore wait-queue blocking.
   - **Feature A (Planner)** escalates *Process Synchronization* priority to **81/100**, placing it as Task #1 in today's timetable with **60 minutes** allocated.
   - **Feature C (Revision)** resets its SM-2 interval to **1 day** (due today/tomorrow), generating targeted flashcards.
   - **Reassessment**: Upon scoring >85% on the remedial drill, the topic graduates to lower urgency, its next revision moves to 3 days, and overall exam readiness rises.

---

## 3. The Three Core Features

### 📅 FEATURE A: Intelligent Study Planner (Solving Problem 1)
- **Course & Chapter Management**: Input course name, chapters, subtopics, exam date, and daily study budget.
- **Deterministic Priority Algorithm**: Computes priority $P \in [1, 100]$ using mathematical weights:
  $$P = 0.35 \cdot E_{\text{urgency}} + 0.25 \cdot W_{\text{weightage}} + 0.30 \cdot (100 - M_{\text{mastery}}) + 0.10 \cdot R_{\text{overdue}}$$
- **Time-Budgeted Timetable**: Converts available hours (e.g. 3.5 hours) into exact minute-by-minute study blocks.
- **AI Syllabus Parser**: Paste course outlines or syllabus text to auto-generate structured chapters and topics.

### 🧠 FEATURE B: AI Weakness Analyzer (Solving Problem 2)
- **Rigorous Diagnostic Quizzes**: Tests both Multiple-Choice Questions (MCQs) and Conceptual Short-Answer Questions (SAQs).
- **Subtopic Misconception Breakdown**: Connects mistakes to specific concepts rather than outputting a generic score.
- **Deep Explanations**: Details *why* the student's answer is incorrect, what mental model failed, and what the correct mechanism is.
- **Targeted Remedial Drills**: 1-click generation of follow-up practice questions focused strictly on missed concepts.

### 🔄 FEATURE C: Adaptive Revision Scheduler (Solving Problem 3)
- **Modified SuperMemo SM-2 Engine**: Spaced repetition algorithm that adapts intervals based on performance.
- **Dynamic Revision Queue**: Separates "Due Today" from "Upcoming Spaced Intervals".
- **Interactive 3D Flip Flashcards**: High-yield conceptual cards with self-grading (Again: 1d, Hard: 1-2d, Good: 3-5d, Easy: 7-14d).
- **Memory Consolidation**: One-click completion marking that syncs back to mastery and study schedules.

---

## 4. Technology Stack & Architecture

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + Glassmorphism accents + Lucide React Icons
- **Data Visualization**: Recharts (Topic Mastery vs Priority BarChart, Score Progression LineChart)
- **AI Engine**: Google Gemini API (`@google/generative-ai` with `/api/ai/*` server endpoints)
- **Algorithmic Validation**: Pure deterministic mathematical engines for priority and SM-2 scheduling
- **Transparency Mode**: Automatic high-fidelity demo fallback with explicit badges if no API key is supplied (never hallucinates that AI is active when running simulated data)
- **Persistence**: Instant browser LocalStorage synchronization + JSON Export & Restore functionality

---

## 5. Algorithmic Verification & Test Suite

The mathematical prioritization and revision scheduling logic is verified via an automated test suite (`scripts/test-algorithms.js`).

```bash
npm test
```

### Verified Test Results (13/13 Passing - 100%):
- ✅ Exam today yields maximum urgency (100)
- ✅ Exam in 5 days yields critical urgency (>80)
- ✅ Exam in 30 days yields low baseline urgency
- ✅ Operating Systems scenario: Process Sync (35% mastery) priority (81) > Deadlocks (55) > CPU Scheduling (48)
- ✅ Failed quiz (<40%) resets SM-2 revision interval to 1 day
- ✅ Failed quiz resets repetition streak to 0
- ✅ Successful quiz (>85%) expands interval beyond 3 days

---

## 6. Getting Started & Local Development

### Prerequisites
- Node.js 18+ (tested on Node.js v24.22.0)
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/jeevimelodies-123/promptwars-hackathon-2026.git
cd promptwars-hackathon-2026
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your free Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note**: If `GEMINI_API_KEY` is omitted, PrepPilot AI automatically runs in **Interactive Demo Mode** with realistic, pre-loaded exam data.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 7. Application Screen Walkthrough

1. **Landing Page (`/`)**: Value proposition, 3 problem/solution cards, live feedback loop visualizer, 1-click Operating Systems demo loader.
2. **Student Dashboard (`/dashboard`)**: Exam countdown timer, exam readiness index gauge, today's study task checklist with allocated minutes, weakest concepts alert, and due revisions list.
3. **Study Planner (`/planner`)**: Subject & chapter manager, priority-ranked syllabus table, daily study timetable breakdown, and AI syllabus parser.
4. **Weakness Analyzer (`/assessment`)**: Interactive diagnostic quiz runner (MCQ + Short Answer), AI evaluation, mistake diagnosis cards, and targeted remedial drill generator.
5. **Revision Centre (`/revision`)**: Spaced repetition queue, 3D flip flashcards with SM-2 grading, and interval tracker.
6. **Progress Analytics (`/analytics`)**: Mastery vs priority bar chart, score progression line chart, curriculum audit table, and snapshot export/restore.

---

## 8. Deployment on Vercel

PrepPilot AI is fully optimized for one-click deployment on Vercel:

1. Push code to the GitHub repository: `https://github.com/jeevimelodies-123/promptwars-hackathon-2026`
2. In the [Vercel Dashboard](https://vercel.com/), select **Add New Project** and import `promptwars-hackathon-2026`.
3. In **Environment Variables**, add:
   - Key: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key_here`
4. Click **Deploy**. Vercel will automatically build the Next.js App Router application.

---

## 9. Security & Code Quality Adherence

- **No Exposed Credentials**: Secrets are strictly read via server-side Next.js route handlers (`/api/ai/*`). Zero client leakage.
- **Input Sanitization**: Defensive parsing and fallback handling on all external AI responses.
- **Deterministic Guarantees**: AI generates conceptual explanations, but mathematical calculations (SM-2, priority scores, time allocations) are 100% deterministic.
- **Transparency**: Clear UI badges differentiate between Live Gemini AI and Interactive Demo mode.

---

## 10. Hackathon Credits

- **Event**: Hack2Skill PromptWars 2026 (24-Hour AI Hackathon)
- **Author**: jeevimelodies-123
- **License**: MIT
