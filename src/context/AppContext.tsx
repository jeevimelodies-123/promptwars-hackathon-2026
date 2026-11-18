'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Subject,
  Topic,
  Flashcard,
  AssessmentResult,
  AssessmentQuestion,
  DailyScheduleTask,
  RevisionQueueItem,
  StudyMetrics,
} from '@/types';
import {
  INITIAL_SUBJECTS,
  INITIAL_FLASHCARDS,
  INITIAL_ASSESSMENT_RESULTS,
  INITIAL_DIAGNOSTIC_QUESTIONS,
} from '@/lib/initial-data';
import {
  calculateDaysUntilExam,
  calculateTopicPriority,
  calculateNextRevisionSM2,
  generateDailySchedule,
  calculateExamReadiness,
  getRevisionQueue,
} from '@/lib/algorithms';

interface AppContextType {
  subjects: Subject[];
  activeSubject: Subject | null;
  setActiveSubjectId: (id: string) => void;
  dailySchedule: DailyScheduleTask[];
  flashcards: Flashcard[];
  assessmentResults: AssessmentResult[];
  diagnosticQuestions: Record<string, AssessmentQuestion[]>;
  revisionQueue: RevisionQueueItem[];
  metrics: StudyMetrics;
  isAiLive: boolean;
  toggleTaskCompletion: (taskId: string) => void;
  submitAssessmentResult: (
    subjectId: string,
    topicId: string,
    percentage: number,
    correctCount: number,
    totalQuestions: number,
    weakConcepts: string[],
    mistakes: AssessmentResult['mistakes'],
    summary: string,
    recommendations: string[]
  ) => AssessmentResult;
  completeRevision: (topicId: string, scorePercentage: number) => void;
  addSubject: (newSub: Omit<Subject, 'id'>) => void;
  updateTopic: (subjectId: string, chapterId: string, topicId: string, updates: Partial<Topic>) => void;
  addTopic: (subjectId: string, chapterId: string, topic: Omit<Topic, 'id' | 'calculatedPriority'>) => void;
  resetToDemoData: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
}

const STORAGE_KEY = 'preppilot_ai_state_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [activeSubjectId, setActiveSubjectId] = useState<string>(INITIAL_SUBJECTS[0].id);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(INITIAL_FLASHCARDS);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>(INITIAL_ASSESSMENT_RESULTS);
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<Record<string, AssessmentQuestion[]>>(
    INITIAL_DIAGNOSTIC_QUESTIONS
  );
  const [dailySchedule, setDailySchedule] = useState<DailyScheduleTask[]>([]);
  const [isAiLive, setIsAiLive] = useState<boolean>(false);
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  // Check if AI API key is configured on server
  useEffect(() => {
    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data) => {
        setIsAiLive(!!data.live);
      })
      .catch(() => {
        setIsAiLive(false);
      });
  }, []);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.subjects && Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
          setSubjects(parsed.subjects);
          setActiveSubjectId(parsed.activeSubjectId || parsed.subjects[0].id);
        }
        if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
          setFlashcards(parsed.flashcards);
        }
        if (parsed.assessmentResults && Array.isArray(parsed.assessmentResults)) {
          setAssessmentResults(parsed.assessmentResults);
        }
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      const stateToSave = {
        subjects,
        activeSubjectId,
        flashcards,
        assessmentResults,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }, [subjects, activeSubjectId, flashcards, assessmentResults, hasHydrated]);

  // Recalculate daily schedule dynamically whenever subjects update
  useEffect(() => {
    const activeSub = subjects.find((s) => s.id === activeSubjectId) || subjects[0];
    const totalHours = activeSub?.availableHoursPerDay || 3.5;
    const schedule = generateDailySchedule(subjects, totalHours);
    setDailySchedule(schedule);
  }, [subjects, activeSubjectId]);

  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || subjects[0] || null;

  const revisionQueue = getRevisionQueue(subjects);
  const readiness = calculateExamReadiness(subjects);

  const metrics: StudyMetrics = {
    totalTopics: readiness.totalTopics,
    masteredTopics: readiness.masteredCount,
    weakTopics: readiness.weakCount,
    overallReadiness: readiness.overallScore,
    studyStreakDays: 4,
    hoursSpent: 14.5,
    quizzesTaken: assessmentResults.length,
    averageQuizScore:
      assessmentResults.length > 0
        ? Math.round(
            assessmentResults.reduce((sum, r) => sum + r.percentageScore, 0) / assessmentResults.length
          )
        : 0,
    revisionsCompleted: subjects.reduce(
      (sum, s) =>
        sum +
        s.chapters.reduce(
          (cSum, c) => cSum + c.topics.reduce((tSum, t) => tSum + t.revisionRepetitions, 0),
          0
        ),
      0
    ),
  };

  const toggleTaskCompletion = (taskId: string) => {
    setDailySchedule((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    );
  };

  /**
   * The Central Closed-Loop Engine:
   * Quiz Result -> Weakness Score -> Recalculate SM-2 & Next Revision -> Recalculate Priority -> Update Schedule
   */
  const submitAssessmentResult = (
    subjectId: string,
    topicId: string,
    percentage: number,
    correctCount: number,
    totalQuestions: number,
    weakConcepts: string[],
    mistakes: AssessmentResult['mistakes'],
    summary: string,
    recommendations: string[]
  ): AssessmentResult => {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Find topic and subject
    let targetTopicName = 'Unknown Topic';

    const updatedSubjects = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      const daysUntilExam = calculateDaysUntilExam(sub.examDate);

      const updatedChapters = sub.chapters.map((chap) => {
        const updatedTopics = chap.topics.map((top) => {
          if (top.id !== topicId) return top;
          targetTopicName = top.name;

          // SM-2 Spaced Repetition calculation
          const sm2 = calculateNextRevisionSM2(
            top.revisionIntervalDays,
            top.revisionRepetitions,
            top.easeFactor,
            percentage
          );

          // Update topic mastery and next revision
          const newTopic: Topic = {
            ...top,
            masteryScore: percentage,
            lastStudiedDate: todayStr,
            nextRevisionDate: sm2.nextDate,
            revisionIntervalDays: sm2.nextIntervalDays,
            revisionRepetitions: sm2.newRepetitions,
            easeFactor: sm2.newEaseFactor,
            calculatedPriority: 0, // will compute below
          };

          newTopic.calculatedPriority = calculateTopicPriority(newTopic, daysUntilExam);
          return newTopic;
        });

        return { ...chap, topics: updatedTopics };
      });

      return { ...sub, chapters: updatedChapters };
    });

    setSubjects(updatedSubjects);

    // 2. Record Assessment Result
    const newResult: AssessmentResult = {
      id: `res-${Date.now()}`,
      subjectId,
      topicId,
      topicName: targetTopicName,
      date: todayStr,
      totalQuestions,
      correctCount,
      percentageScore: percentage,
      topicScores: { [topicId]: percentage },
      weakConcepts,
      mistakes,
      remedialRecommendations: recommendations,
      aiAnalysisSummary: summary,
    };

    setAssessmentResults((prev) => [newResult, ...prev]);

    return newResult;
  };

  /**
   * Revision Completion Flow:
   * Increases interval using SM-2, updates mastery, updates next revision date.
   */
  const completeRevision = (topicId: string, scorePercentage: number) => {
    const todayStr = new Date().toISOString().split('T')[0];

    setSubjects((prev) =>
      prev.map((sub) => {
        const daysUntilExam = calculateDaysUntilExam(sub.examDate);
        return {
          ...sub,
          chapters: sub.chapters.map((chap) => ({
            ...chap,
            topics: chap.topics.map((top) => {
              if (top.id !== topicId) return top;

              const sm2 = calculateNextRevisionSM2(
                top.revisionIntervalDays,
                top.revisionRepetitions,
                top.easeFactor,
                scorePercentage
              );

              // Improve mastery gently based on revision success
              const newMastery = Math.min(100, Math.round(top.masteryScore * 0.4 + scorePercentage * 0.6));

              const updatedTopic: Topic = {
                ...top,
                masteryScore: newMastery,
                lastStudiedDate: todayStr,
                nextRevisionDate: sm2.nextDate,
                revisionIntervalDays: sm2.nextIntervalDays,
                revisionRepetitions: sm2.newRepetitions,
                easeFactor: sm2.newEaseFactor,
                calculatedPriority: 0,
              };

              updatedTopic.calculatedPriority = calculateTopicPriority(updatedTopic, daysUntilExam);
              return updatedTopic;
            }),
          })),
        };
      })
    );
  };

  const addSubject = (newSub: Omit<Subject, 'id'>) => {
    const id = `sub-${Date.now()}`;
    const subject: Subject = { ...newSub, id };
    setSubjects((prev) => [...prev, subject]);
    setActiveSubjectId(id);
  };

  const updateTopic = (
    subjectId: string,
    chapterId: string,
    topicId: string,
    updates: Partial<Topic>
  ) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        const daysUntilExam = calculateDaysUntilExam(sub.examDate);
        return {
          ...sub,
          chapters: sub.chapters.map((chap) => {
            if (chap.id !== chapterId) return chap;
            return {
              ...chap,
              topics: chap.topics.map((top) => {
                if (top.id !== topicId) return top;
                const merged = { ...top, ...updates };
                merged.calculatedPriority = calculateTopicPriority(merged, daysUntilExam);
                return merged;
              }),
            };
          }),
        };
      })
    );
  };

  const addTopic = (
    subjectId: string,
    chapterId: string,
    topicData: Omit<Topic, 'id' | 'calculatedPriority'>
  ) => {
    const id = `top-${Date.now()}`;
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== subjectId) return sub;
        const daysUntilExam = calculateDaysUntilExam(sub.examDate);
        return {
          ...sub,
          chapters: sub.chapters.map((chap) => {
            if (chap.id !== chapterId) return chap;
            const newTopic: Topic = {
              ...topicData,
              id,
              calculatedPriority: 0,
            };
            newTopic.calculatedPriority = calculateTopicPriority(newTopic, daysUntilExam);
            return {
              ...chap,
              topics: [...chap.topics, newTopic],
            };
          }),
        };
      })
    );
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSubjects(INITIAL_SUBJECTS);
    setActiveSubjectId(INITIAL_SUBJECTS[0].id);
    setFlashcards(INITIAL_FLASHCARDS);
    setAssessmentResults(INITIAL_ASSESSMENT_RESULTS);
    setDiagnosticQuestions(INITIAL_DIAGNOSTIC_QUESTIONS);
  };

  const exportDataJson = () => {
    return JSON.stringify({ subjects, flashcards, assessmentResults }, null, 2);
  };

  const importDataJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.subjects && Array.isArray(parsed.subjects)) {
        setSubjects(parsed.subjects);
        if (parsed.flashcards) setFlashcards(parsed.flashcards);
        if (parsed.assessmentResults) setAssessmentResults(parsed.assessmentResults);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        subjects,
        activeSubject,
        setActiveSubjectId,
        dailySchedule,
        flashcards,
        assessmentResults,
        diagnosticQuestions,
        revisionQueue,
        metrics,
        isAiLive,
        toggleTaskCompletion,
        submitAssessmentResult,
        completeRevision,
        addSubject,
        updateTopic,
        addTopic,
        resetToDemoData,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
