export type PreparationLevel = 'beginner' | 'intermediate' | 'advanced';
export type TopicImportance = 'low' | 'medium' | 'high' | 'critical';
export type MasteryLevel = 'critical_weakness' | 'needs_practice' | 'moderate' | 'mastered';

export interface Subtopic {
  id: string;
  name: string;
  masteryScore: number; // 0 - 100
  notes?: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  chapterId: string;
  name: string;
  importance: TopicImportance; // syllabus weightage (1-4)
  weightagePercentage: number; // 0 - 100
  estimatedMinutes: number; // estimated time to study
  masteryScore: number; // 0 - 100
  lastStudiedDate?: string; // ISO date
  nextRevisionDate?: string; // ISO date
  revisionIntervalDays: number; // SM-2 interval
  easeFactor: number; // SM-2 ease factor (default 2.5)
  revisionRepetitions: number; // number of successful reviews
  subtopics: Subtopic[];
  calculatedPriority: number; // 0 - 100
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  examDate: string; // ISO date string (YYYY-MM-DD)
  availableHoursPerDay: number;
  preparationLevel: PreparationLevel;
  chapters: Chapter[];
  colorTheme: string;
}

export type QuestionType = 'mcq' | 'short_answer';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface AssessmentQuestion {
  id: string;
  topicId: string;
  topicName: string;
  subtopicName?: string;
  type: QuestionType;
  prompt: string;
  options?: QuestionOption[]; // for MCQ
  correctAnswer: string; // ID for MCQ, or ideal answer string for SAQ
  explanation: string;
  conceptTested: string;
}

export interface StudentAnswer {
  questionId: string;
  studentResponse: string;
  isCorrect: boolean;
  score: number; // 0 to 1
  aiFeedback?: string;
  conceptMissed?: string;
}

export interface MistakeDetail {
  questionId: string;
  prompt: string;
  studentResponse: string;
  correctAnswer: string;
  explanation: string;
  conceptMissed: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AssessmentResult {
  id: string;
  subjectId: string;
  topicId: string;
  topicName: string;
  date: string;
  totalQuestions: number;
  correctCount: number;
  percentageScore: number;
  topicScores: Record<string, number>; // topicId -> score
  weakConcepts: string[];
  mistakes: MistakeDetail[];
  remedialRecommendations: string[];
  aiAnalysisSummary: string;
}

export interface DailyScheduleTask {
  id: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  allocatedMinutes: number;
  priorityScore: number;
  reason: string;
  completed: boolean;
  type: 'initial_study' | 'weakness_remedy' | 'scheduled_revision';
}

export interface Flashcard {
  id: string;
  topicId: string;
  topicName: string;
  front: string;
  back: string;
  hint?: string;
  concept: string;
  masteryScore: number;
  lastReviewed?: string;
}

export interface RevisionQueueItem {
  topicId: string;
  topicName: string;
  subjectName: string;
  subjectColor: string;
  dueDate: string;
  isOverdue: boolean;
  currentMastery: number;
  intervalDays: number;
  repetitions: number;
  flashcardsCount: number;
}

export interface StudyMetrics {
  totalTopics: number;
  masteredTopics: number;
  weakTopics: number;
  overallReadiness: number; // 0 - 100
  studyStreakDays: number;
  hoursSpent: number;
  quizzesTaken: number;
  averageQuizScore: number;
  revisionsCompleted: number;
}
