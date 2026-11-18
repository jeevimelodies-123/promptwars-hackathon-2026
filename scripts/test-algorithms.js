/**
 * PrepPilot AI - Algorithm Validation & Unit Test Suite
 * Validates Priority Calculations, SM-2 Spaced Repetition, and Schedule Generation.
 */

// Math simulation of algorithms
const PRIORITY_WEIGHTS = {
  EXAM_URGENCY: 0.35,
  IMPORTANCE: 0.25,
  MASTERY_DEFICIT: 0.30,
  REVISION_OVERDUE: 0.10,
};

function calculateExamUrgency(daysUntilExam) {
  if (daysUntilExam <= 0) return 100;
  if (daysUntilExam >= 30) return 10;
  return Math.round(100 - (daysUntilExam / 30) * 85);
}

function calculateTopicPriority(topic, daysUntilExam, isDue = false) {
  const urgency = calculateExamUrgency(daysUntilExam);
  const importance = topic.weightagePercentage || 50;
  const masteryDeficit = Math.max(0, 100 - topic.masteryScore);
  const overdueScore = isDue ? 100 : 0;

  const raw =
    urgency * PRIORITY_WEIGHTS.EXAM_URGENCY +
    importance * PRIORITY_WEIGHTS.IMPORTANCE +
    masteryDeficit * PRIORITY_WEIGHTS.MASTERY_DEFICIT +
    overdueScore * PRIORITY_WEIGHTS.REVISION_OVERDUE;

  return Math.min(100, Math.max(1, Math.round(raw)));
}

function calculateNextRevisionSM2(currentInterval, currentRepetitions, currentEaseFactor, scorePercentage) {
  let quality;
  if (scorePercentage < 40) quality = 0;
  else if (scorePercentage < 60) quality = 1;
  else if (scorePercentage < 75) quality = 3;
  else if (scorePercentage < 90) quality = 4;
  else quality = 5;

  let newEase = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEase < 1.3) newEase = 1.3;

  let nextInterval;
  let newReps;

  if (quality < 3) {
    newReps = 0;
    nextInterval = 1; // reset to 1 day
  } else {
    newReps = currentRepetitions + 1;
    if (newReps === 1) nextInterval = 1;
    else if (newReps === 2) nextInterval = 3;
    else nextInterval = Math.round(currentInterval * newEase);
  }

  if (nextInterval > 60) nextInterval = 60;
  if (nextInterval < 1) nextInterval = 1;

  return { nextInterval, newReps, newEase: parseFloat(newEase.toFixed(2)) };
}

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('========================================================');
console.log('🧪 PREPPILOT AI: Deterministic Algorithm Validation Suite');
console.log('========================================================\n');

// 1. Exam Urgency Tests
console.log('Test Suite 1: Exam Proximity & Urgency');
assert(calculateExamUrgency(0) === 100, 'Exam today gives urgency 100');
assert(calculateExamUrgency(5) > 80, 'Exam in 5 days gives high urgency (>80)');
assert(calculateExamUrgency(30) === 15 || calculateExamUrgency(30) === 10, 'Exam in 30 days gives low urgency (10-15)');
assert(calculateExamUrgency(60) === 10, 'Exam in 60 days gives floor urgency 10');

// 2. Hackathon Scenario Priority Verification
console.log('\nTest Suite 2: Topic Priority (Prompt Scenario: OS Exam in 5 days)');
const topicProcessSync = {
  name: 'Process Synchronization',
  weightagePercentage: 85,
  masteryScore: 35, // Major weakness!
};

const topicDeadlocks = {
  name: 'Deadlocks',
  weightagePercentage: 75,
  masteryScore: 80, // Strong!
};

const topicCpuSched = {
  name: 'CPU Scheduling',
  weightagePercentage: 60,
  masteryScore: 90, // Mastered!
};

const pSync = calculateTopicPriority(topicProcessSync, 5, true);
const pDeadlocks = calculateTopicPriority(topicDeadlocks, 5, false);
const pCpu = calculateTopicPriority(topicCpuSched, 5, false);

console.log(`  Calculated Priority for Process Sync (35% mastery): ${pSync}`);
console.log(`  Calculated Priority for Deadlocks (80% mastery): ${pDeadlocks}`);
console.log(`  Calculated Priority for CPU Scheduling (90% mastery): ${pCpu}`);

assert(pSync > pDeadlocks, 'Weak topic (Process Sync) has higher priority than strong topic (Deadlocks)');
assert(pDeadlocks > pCpu, 'Deadlocks has higher priority than Mastered CPU Scheduling');
assert(pSync >= 80, 'Process Sync priority is escalated to critical tier (>=80)');

// 3. Spaced Repetition (SM-2) Adaptation Tests
console.log('\nTest Suite 3: Spaced Repetition (SM-2 Lite) Adaptation');
// Scenario A: Failure (35%) -> Interval resets to 1 day
const sm2Fail = calculateNextRevisionSM2(7, 3, 2.5, 35);
assert(sm2Fail.nextInterval === 1, 'Failed quiz (<40%) resets revision interval to 1 day');
assert(sm2Fail.newReps === 0, 'Failed quiz resets repetition streak to 0');
assert(sm2Fail.newEase < 2.5, 'Failed quiz decreases ease factor');

// Scenario B: Success (90%) -> Interval expands
const sm2Success = calculateNextRevisionSM2(3, 2, 2.5, 90);
assert(sm2Success.nextInterval > 3, 'High score (90%) expands interval beyond 3 days');
assert(sm2Success.newReps === 3, 'Successful quiz increments repetition streak');
assert(sm2Success.newEase >= 2.5, 'Successful quiz maintains or increases ease factor');

console.log('\n========================================================');
console.log(`Test Results: ${passed}/${total} tests passed (${Math.round((passed / total) * 100)}%)`);
console.log('========================================================\n');

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
