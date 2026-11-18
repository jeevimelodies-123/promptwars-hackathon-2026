'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  FileQuestion,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AssessmentQuestion, AssessmentResult, StudentAnswer } from '@/types';
import { categorizeMastery } from '@/lib/algorithms';

function AssessmentContent() {
  const searchParams = useSearchParams();
  const urlTopicId = searchParams.get('topicId');

  const {
    subjects,
    activeSubject,
    submitAssessmentResult,
    assessmentResults,
    diagnosticQuestions,
  } = useApp();

  // Find all available topics
  const allTopics: { id: string; name: string; subjectId: string; subjectName: string; mastery: number }[] = [];
  subjects.forEach((sub) => {
    sub.chapters.forEach((chap) => {
      chap.topics.forEach((top) => {
        allTopics.push({
          id: top.id,
          name: top.name,
          subjectId: sub.id,
          subjectName: sub.name,
          mastery: top.masteryScore,
        });
      });
    });
  });

  // Default selected topic (prefer urlTopicId, or Process Sync, or lowest mastery)
  const defaultTopic =
    allTopics.find((t) => t.id === urlTopicId) ||
    allTopics.find((t) => t.id === 'top-proc-sync') ||
    allTopics[0];

  const [selectedTopicId, setSelectedTopicId] = useState<string>(defaultTopic ? defaultTopic.id : '');
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [currentQuestions, setCurrentQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<AssessmentResult | null>(null);
  const [isGeneratingRemedial, setIsGeneratingRemedial] = useState<boolean>(false);
  const [remedialQuestions, setRemedialQuestions] = useState<AssessmentQuestion[] | null>(null);

  // Update selected topic if URL param changes
  useEffect(() => {
    if (urlTopicId) {
      setSelectedTopicId(urlTopicId);
    }
  }, [urlTopicId]);

  const currentTopic = allTopics.find((t) => t.id === selectedTopicId) || defaultTopic;

  // Recent results for this topic
  const topicPastResults = assessmentResults.filter((r) => r.topicId === selectedTopicId);

  const startQuiz = async (useRemedial = false) => {
    setEvaluationResult(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);

    if (useRemedial && remedialQuestions && remedialQuestions.length > 0) {
      setCurrentQuestions(remedialQuestions);
      setRemedialQuestions(null);
      setIsQuizActive(true);
      return;
    }

    // Try fetching questions from AI or fallback
    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicName: currentTopic.name,
          topicId: currentTopic.id,
          subjectName: currentTopic.subjectName,
        }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setCurrentQuestions(data.questions);
        setIsQuizActive(true);
        return;
      }
    } catch {
      // fallback
    }

    // Fallback to pre-loaded questions if available
    const fallback = diagnosticQuestions[currentTopic.id] || diagnosticQuestions['top-proc-sync'] || [];
    setCurrentQuestions(fallback);
    setIsQuizActive(true);
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleNextOrSubmit = async () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Submit assessment!
      setIsEvaluating(true);

      const submissions = currentQuestions.map((q) => ({
        question: q,
        studentResponse: userAnswers[q.id] || '',
      }));

      try {
        const res = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topicName: currentTopic.name,
            answers: submissions,
          }),
        });

        const data = await res.json();

        // Save into AppContext (Central Feedback Loop!)
        const savedResult = submitAssessmentResult(
          currentTopic.subjectId,
          currentTopic.id,
          data.percentageScore,
          data.correctCount,
          data.totalQuestions,
          data.weakConcepts || [],
          data.mistakes || [],
          data.aiAnalysisSummary || '',
          data.remedialRecommendations || []
        );

        setEvaluationResult(savedResult);
        setIsQuizActive(false);

        // Confetti for solid scores!
        if (data.percentageScore >= 70) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (err) {
        console.error('Failed to analyze quiz:', err);
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const generateRemedialDrill = async () => {
    if (!evaluationResult) return;
    setIsGeneratingRemedial(true);

    try {
      const res = await fetch('/api/ai/remedial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicName: currentTopic.name,
          weakConcepts: evaluationResult.weakConcepts,
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setRemedialQuestions(data.questions);
      }
    } catch (err) {
      console.error('Error generating remedial drill:', err);
    } finally {
      setIsGeneratingRemedial(false);
    }
  };

  const currentQ = currentQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).filter((k) => userAnswers[k]?.trim()).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              AI Weakness Analyzer
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
              Feature B
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Diagnostic quizzes with deep conceptual mistake analysis and targeted remedial drills.
          </p>
        </div>

        {/* Topic Selector */}
        {!isQuizActive && (
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-500">Target Topic:</label>
            <select
              value={selectedTopicId}
              onChange={(e) => {
                setSelectedTopicId(e.target.value);
                setEvaluationResult(null);
                setRemedialQuestions(null);
              }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              {allTopics.map((top) => (
                <option key={top.id} value={top.id}>
                  {top.name} ({top.mastery}% Mastery)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* QUIZ ACTIVE VIEW */}
      {isQuizActive && currentQ && (
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Question <strong>{currentQuestionIndex + 1}</strong> of {currentQuestions.length}
              </span>
              <span>
                {answeredCount} of {currentQuestions.length} answered
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                {currentQ.type === 'mcq' ? 'Multiple Choice' : 'Conceptual Short Answer'}
              </span>
              <span className="text-xs text-slate-400">
                Testing: {currentQ.conceptTested}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.prompt}
            </h3>
          </div>

          {/* Options for MCQ */}
          {currentQ.type === 'mcq' && currentQ.options && (
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt) => {
                const isSelected = userAnswers[currentQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-900 dark:text-brand-100 ring-2 ring-brand-500/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold uppercase flex-shrink-0 ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="pt-0.5">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Text Area for Short Answer */}
          {currentQ.type === 'short_answer' && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Provide your concise conceptual explanation:
              </label>
              <textarea
                rows={4}
                value={userAnswers[currentQ.id] || ''}
                onChange={(e) => handleTextAnswerChange(currentQ.id, e.target.value)}
                placeholder="Explain the mechanism, conditions, or reason..."
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm leading-relaxed"
              />
              <p className="text-[11px] text-slate-400">
                Our AI evaluator analyzes your conceptual reasoning, not just exact keywords.
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold disabled:opacity-40"
            >
              Previous
            </button>

            <button
              onClick={handleNextOrSubmit}
              disabled={isEvaluating}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all shadow-md shadow-brand-500/20 flex items-center space-x-1.5"
            >
              <span>
                {currentQuestionIndex === currentQuestions.length - 1
                  ? isEvaluating
                    ? 'AI Evaluating...'
                    : 'Submit & Diagnose'
                  : 'Next Question'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* EVALUATION REPORT VIEW (FEATURE B CORE) */}
      {!isQuizActive && evaluationResult && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Diagnostic Assessment Report
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {evaluationResult.topicName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                {evaluationResult.aiAnalysisSummary}
              </p>
            </div>

            <div className="text-center sm:text-right flex-shrink-0">
              <div className="text-4xl font-black text-slate-900 dark:text-white">
                {evaluationResult.percentageScore}%
              </div>
              <span className="text-xs text-slate-400">
                {evaluationResult.correctCount} of {evaluationResult.totalQuestions} correct
              </span>
              <div className="mt-1">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${categorizeMastery(evaluationResult.percentageScore).badgeColor}`}>
                  {categorizeMastery(evaluationResult.percentageScore).label}
                </span>
              </div>
            </div>
          </div>

          {/* CLOSED-LOOP SYSTEM IMPACT NOTIFICATION */}
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Closed-Loop Synchronization Triggered:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-indigo-800 dark:text-indigo-300">
              <li>
                <strong>Study Planner Updated:</strong> Priority score recalculated to match this {evaluationResult.percentageScore}% score.
              </li>
              <li>
                <strong>Revision Scheduled:</strong> Next spaced repetition adjusted using SM-2 algorithm.
              </li>
              <li>
                <strong>Dashboard Synced:</strong> Overall exam readiness index and weak topic alerts updated.
              </li>
            </ul>
          </div>

          {/* MISTAKE ANALYSIS BREAKDOWN */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Conceptual Mistake Diagnosis ({evaluationResult.mistakes.length})</span>
            </h3>

            {evaluationResult.mistakes.length === 0 ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                  Flawless Concept Execution!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Zero conceptual misconceptions detected. This topic has graduated to a longer spaced repetition interval.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {evaluationResult.mistakes.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400">
                          Misconception #{idx + 1}: {m.conceptMissed}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white pt-1">
                          {m.prompt}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {m.severity} severity
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 space-y-1">
                        <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center space-x-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>What you answered:</span>
                        </span>
                        <p className="text-rose-900 dark:text-rose-200">{m.studentResponse}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct Concept Model:</span>
                        </span>
                        <p className="text-emerald-900 dark:text-emerald-200">{m.correctAnswer}</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-xs space-y-1">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Why this answer is incorrect:</span>
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {m.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTION BUTTONS & REMEDIAL DRILL GENERATOR */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Ready to fix these weak concepts?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate a 3-question targeted remedial drill focused directly on your errors.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => startQuiz(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Retake Full Assessment
              </button>

              {!remedialQuestions ? (
                <button
                  onClick={generateRemedialDrill}
                  disabled={isGeneratingRemedial}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center space-x-1.5"
                >
                  <Brain className="w-4 h-4" />
                  <span>{isGeneratingRemedial ? 'Generating Drill...' : 'Generate Targeted Drill'}</span>
                </button>
              ) : (
                <button
                  onClick={() => startQuiz(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1.5 animate-pulse"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start 3-Question Remedial Drill</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUIZ IDLE / START OVERVIEW */}
      {!isQuizActive && !evaluationResult && (
        <div className="space-y-8">
          {/* Topic Hero Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
                  Ready for Diagnostic
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {currentTopic.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                  Test your grasp on critical section invariants, hardware atomic operations, and concurrency edge cases. 
                  Mistakes will be categorized by concept and synced to your study timetable.
                </p>
              </div>

              <button
                onClick={() => startQuiz(false)}
                className="px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all self-start sm:self-auto hover:scale-[1.02]"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Begin Diagnostic Assessment</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Questions</span>
                <strong className="text-slate-800 dark:text-slate-200 text-sm">
                  4 Questions (MCQ + SAQ)
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Current Mastery</span>
                <strong className="text-slate-800 dark:text-slate-200 text-sm">
                  {currentTopic.mastery}% ({categorizeMastery(currentTopic.mastery).label})
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Est. Completion</span>
                <strong className="text-slate-800 dark:text-slate-200 text-sm">
                  6 - 8 Minutes
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Evaluator</span>
                <strong className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
                  Google Gemini AI + Deterministic Fallback
                </strong>
              </div>
            </div>
          </div>

          {/* Historical Assessment Log for Topic */}
          {topicPastResults.length > 0 && (
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Assessment History for {currentTopic.name}
              </h3>
              <div className="space-y-2.5">
                {topicPastResults.map((hist) => (
                  <div
                    key={hist.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Diagnostic Assessment • {hist.date}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Weak concepts flagged: {hist.weakConcepts.join(', ')}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {hist.percentageScore}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {hist.correctCount}/{hist.totalQuestions} correct
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">
          Loading Assessment Engine...
        </div>
      }
    >
      <AssessmentContent />
    </Suspense>
  );
}
