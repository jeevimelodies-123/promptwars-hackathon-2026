import { Topic, TopicImportance, DailyScheduleTask, Subject, RevisionQueueItem } from '@/types';

/**
 * Weights for Topic Priority Calculation
 * Priority = w1 * Urgency + w2 * Importance + w3 * (100 - Mastery) + w4 * Overdue
 */
export const PRIORITY_WEIGHTS = {
  EXAM_URGENCY: 0.35,
  IMPORTANCE: 0.25,
  MASTERY_DEFICIT: 0.30,
  REVISION_OVERDUE: 0.10,
};

const IMPORTANCE_SCORES: Record<TopicImportance, number> = {
  low: 25,
  medium: 50,
  high: 75,
  critical: 100,
};

/**
 * Computes days remaining until the target examination date.
 */
export function calculateDaysUntilExam(examDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDateStr);
  exam.setHours(0, 0, 0, 0);
  const diffTime = exam.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculates Exam Urgency Score (0 - 100).
 * Closer exams scale closer to 100.
 */
export function calculateExamUrgency(daysUntilExam: number): number {
  if (daysUntilExam <= 0) return 100;
  if (daysUntilExam >= 30) return 10;
  // Scaled linearly between 10 and 100 for exams within 30 days
  return Math.round(100 - (daysUntilExam / 30) * 85);
}

/**
 * Checks if a topic revision is due or overdue based on today's date.
 */
export function isRevisionDue(nextRevisionDate?: string): boolean {
  if (!nextRevisionDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const revDate = new Date(nextRevisionDate);
  revDate.setHours(0, 0, 0, 0);
  return revDate.getTime() <= today.getTime();
}

/**
 * Calculates the holistic Priority Score for a Topic (0 - 100).
 * Connects exam countdown, syllabus weightage, student weakness, and revision status.
 */
export function calculateTopicPriority(
  topic: Topic,
  daysUntilExam: number
): number {
  const urgencyScore = calculateExamUrgency(daysUntilExam);
  const importanceScore = topic.weightagePercentage > 0 
    ? topic.weightagePercentage 
    : IMPORTANCE_SCORES[topic.importance] || 50;
  
  // Weakness factor: Lower mastery = higher priority
  const masteryDeficit = Math.max(0, 100 - topic.masteryScore);
  
  // Revision status
  const overdueScore = isRevisionDue(topic.nextRevisionDate) ? 100 : 0;

  const rawPriority =
    urgencyScore * PRIORITY_WEIGHTS.EXAM_URGENCY +
    importanceScore * PRIORITY_WEIGHTS.IMPORTANCE +
    masteryDeficit * PRIORITY_WEIGHTS.MASTERY_DEFICIT +
    overdueScore * PRIORITY_WEIGHTS.REVISION_OVERDUE;

  return Math.min(100, Math.max(1, Math.round(rawPriority)));
}

/**
 * Modified SuperMemo SM-2 Spaced Repetition Algorithm.
 * Adapts next revision interval based on quiz/retest performance.
 *
 * @param currentInterval Current interval in days
 * @param currentRepetitions Number of successful repetitions so far
 * @param currentEaseFactor Current SM-2 ease factor (defaults to 2.5, min 1.3)
 * @param scorePercentage Quiz score (0 - 100)
 */
export function calculateNextRevisionSM2(
  currentInterval: number,
  currentRepetitions: number,
  currentEaseFactor: number,
  scorePercentage: number
): {
  nextIntervalDays: number;
  newRepetitions: number;
  newEaseFactor: number;
  nextDate: string;
} {
  // Map score (0-100) to quality grade (0-5)
  // <50%: 1, 50-65%: 2, 65-75%: 3, 75-85%: 4, >85%: 5
  let quality: number;
  if (scorePercentage < 40) quality = 0;
  else if (scorePercentage < 60) quality = 1;
  else if (scorePercentage < 75) quality = 3;
  else if (scorePercentage < 90) quality = 4;
  else quality = 5;

  let newEase = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEase < 1.3) newEase = 1.3;

  let nextInterval: number;
  let newReps: number;

  if (quality < 3) {
    // Concept failed! Immediate revision reset
    newReps = 0;
    nextInterval = 1; // Revise tomorrow
  } else {
    // Concept retained
    newReps = currentRepetitions + 1;
    if (newReps === 1) {
      nextInterval = 1;
    } else if (newReps === 2) {
      nextInterval = 3;
    } else {
      nextInterval = Math.round(currentInterval * newEase);
    }
  }

  // Safety caps
  if (nextInterval > 60) nextInterval = 60;
  if (nextInterval < 1) nextInterval = 1;

  const nextDateObj = new Date();
  nextDateObj.setDate(nextDateObj.getDate() + nextInterval);
  const nextDate = nextDateObj.toISOString().split('T')[0];

  return {
    nextIntervalDays: nextInterval,
    newRepetitions: newReps,
    newEaseFactor: parseFloat(newEase.toFixed(2)),
    nextDate,
  };
}

/**
 * Classifies mastery score into descriptive bands.
 */
export function categorizeMastery(score: number): {
  level: 'critical_weakness' | 'needs_practice' | 'moderate' | 'mastered';
  label: string;
  badgeColor: string;
  textColor: string;
} {
  if (score < 40) {
    return {
      level: 'critical_weakness',
      label: 'Critical Weakness',
      badgeColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
      textColor: 'text-rose-600 dark:text-rose-400',
    };
  }
  if (score < 65) {
    return {
      level: 'needs_practice',
      label: 'Needs Practice',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      textColor: 'text-amber-600 dark:text-amber-400',
    };
  }
  if (score < 85) {
    return {
      level: 'moderate',
      label: 'Good Understanding',
      badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-600 dark:text-blue-400',
    };
  }
  return {
    level: 'mastered',
    label: 'Mastered',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  };
}

/**
 * Generates an optimized daily study schedule.
 * Takes available daily hours and distributes time proportional to priority scores.
 */
export function generateDailySchedule(
  subjects: Subject[],
  totalAvailableHours: number
): DailyScheduleTask[] {
  const allTopicsWithContext: {
    topic: Topic;
    subjectName: string;
    daysUntilExam: number;
    priority: number;
    isDue: boolean;
  }[] = [];

  for (const sub of subjects) {
    const daysUntilExam = calculateDaysUntilExam(sub.examDate);
    for (const chap of sub.chapters) {
      for (const top of chap.topics) {
        const priority = calculateTopicPriority(top, daysUntilExam);
        const isDue = isRevisionDue(top.nextRevisionDate);
        allTopicsWithContext.push({
          topic: top,
          subjectName: sub.name,
          daysUntilExam,
          priority,
          isDue,
        });
      }
    }
  }

  // Sort topics by priority descending
  allTopicsWithContext.sort((a, b) => b.priority - a.priority);

  // Take top 4-6 topics to fit daily study budget
  const targetTopics = allTopicsWithContext.slice(0, 5);
  if (targetTopics.length === 0) return [];

  const totalPriority = targetTopics.reduce((sum, item) => sum + item.priority, 0);
  const totalAvailableMinutes = Math.max(60, Math.round(totalAvailableHours * 60));

  const tasks: DailyScheduleTask[] = [];

  for (const item of targetTopics) {
    // Time proportional to priority, rounded to 5-minute increments (min 20m, max 90m)
    const rawMinutes = (item.priority / totalPriority) * totalAvailableMinutes;
    const roundedMinutes = Math.min(90, Math.max(20, Math.round(rawMinutes / 5) * 5));

    let type: DailyScheduleTask['type'] = 'initial_study';
    let reason = `High priority (Score: ${item.priority}) based on weightage and exam proximity`;

    if (item.topic.masteryScore < 50) {
      type = 'weakness_remedy';
      reason = `Critical weakness detected (${item.topic.masteryScore}% mastery). Remedial study required.`;
    } else if (item.isDue) {
      type = 'scheduled_revision';
      reason = `Spaced repetition interval due today. Reinforce memory before decay.`;
    }

    tasks.push({
      id: `task-${item.topic.id}`,
      topicId: item.topic.id,
      topicName: item.topic.name,
      subjectName: item.subjectName,
      allocatedMinutes: roundedMinutes,
      priorityScore: item.priority,
      reason,
      completed: false,
      type,
    });
  }

  return tasks;
}

/**
 * Computes overall Exam Readiness Index (0 - 100)
 * Weighted average of topic mastery, coverage, and revision currency.
 */
export function calculateExamReadiness(subjects: Subject[]): {
  overallScore: number;
  totalTopics: number;
  masteredCount: number;
  weakCount: number;
  averageMastery: number;
} {
  let totalTopics = 0;
  let totalMastery = 0;
  let masteredCount = 0;
  let weakCount = 0;

  for (const sub of subjects) {
    for (const chap of sub.chapters) {
      for (const top of chap.topics) {
        totalTopics++;
        totalMastery += top.masteryScore;
        if (top.masteryScore >= 80) masteredCount++;
        if (top.masteryScore < 60) weakCount++;
      }
    }
  }

  if (totalTopics === 0) {
    return {
      overallScore: 0,
      totalTopics: 0,
      masteredCount: 0,
      weakCount: 0,
      averageMastery: 0,
    };
  }

  const averageMastery = Math.round(totalMastery / totalTopics);
  // Readiness index balances average score with proportion of non-weak topics
  const nonWeakRatio = (totalTopics - weakCount) / totalTopics;
  const overallScore = Math.round(averageMastery * 0.7 + nonWeakRatio * 100 * 0.3);

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    totalTopics,
    masteredCount,
    weakCount,
    averageMastery,
  };
}

/**
 * Filters and compiles topics due for spaced revision.
 */
export function getRevisionQueue(subjects: Subject[]): RevisionQueueItem[] {
  const queue: RevisionQueueItem[] = [];

  for (const sub of subjects) {
    for (const chap of sub.chapters) {
      for (const top of chap.topics) {
        if (top.nextRevisionDate) {
          const isOverdue = isRevisionDue(top.nextRevisionDate);
          queue.push({
            topicId: top.id,
            topicName: top.name,
            subjectName: sub.name,
            subjectColor: sub.colorTheme,
            dueDate: top.nextRevisionDate,
            isOverdue,
            currentMastery: top.masteryScore,
            intervalDays: top.revisionIntervalDays,
            repetitions: top.revisionRepetitions,
            flashcardsCount: 4, // standard set per topic
          });
        }
      }
    }
  }

  // Sort: Overdue first, then by earliest due date, then lowest mastery
  return queue.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    return a.dueDate.localeCompare(b.dueDate) || a.currentMastery - b.currentMastery;
  });
}
