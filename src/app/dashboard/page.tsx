'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Brain,
  Sparkles,
  Calendar,
  Flame,
  CheckSquare,
  Square,
  PlayCircle,
  Award,
} from 'lucide-react';
import { calculateDaysUntilExam, categorizeMastery } from '@/lib/algorithms';

export default function DashboardPage() {
  const {
    subjects,
    activeSubject,
    dailySchedule,
    revisionQueue,
    metrics,
    toggleTaskCompletion,
  } = useApp();

  const daysUntil = activeSubject ? calculateDaysUntilExam(activeSubject.examDate) : 0;

  // Find the top 3 weakest topics across all subjects
  const allTopics: {
    id: string;
    name: string;
    subjectName: string;
    masteryScore: number;
    priority: number;
  }[] = [];

  subjects.forEach((sub) => {
    sub.chapters.forEach((chap) => {
      chap.topics.forEach((top) => {
        allTopics.push({
          id: top.id,
          name: top.name,
          subjectName: sub.name,
          masteryScore: top.masteryScore,
          priority: top.calculatedPriority,
        });
      });
    });
  });

  // Sort by lowest mastery first
  const weakestTopics = [...allTopics].sort((a, b) => a.masteryScore - b.masteryScore).slice(0, 3);

  // Topics due for revision today
  const dueTodayRevisions = revisionQueue.filter((item) => item.isOverdue || item.dueDate <= new Date().toISOString().split('T')[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Student Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              Active Prep
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time synchronization across your study schedule, diagnostic gaps, and spaced revision queue.
          </p>
        </div>

        {/* Exam Countdown Banner */}
        {activeSubject && (
          <div className="flex items-center space-x-4 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-brand-600 text-white shadow-md shadow-brand-500/20">
            <div className="p-2.5 rounded-xl bg-white/15">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-indigo-100 font-semibold block">
                Target Examination
              </span>
              <span className="text-base font-bold">
                {activeSubject.name} ({activeSubject.code})
              </span>
            </div>
            <div className="pl-3 border-l border-white/20 text-center">
              <span className="text-2xl font-black">{daysUntil}</span>
              <span className="text-[10px] block uppercase text-indigo-100 font-medium">Days Left</span>
            </div>
          </div>
        )}
      </div>

      {/* METRIC CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Overall Readiness */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Exam Readiness Index</span>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.overallReadiness}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Weighted</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.overallReadiness >= 75
                  ? 'bg-emerald-500'
                  : metrics.overallReadiness >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${metrics.overallReadiness}%` }}
            />
          </div>
        </div>

        {/* Study Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Daily Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.studyStreakDays}
            </span>
            <span className="text-xs text-amber-600 font-semibold">Days Active</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep momentum alive before exam day!
          </p>
        </div>

        {/* Mastered vs Weak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Topic Mastery Ratio</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.masteredTopics}/{metrics.totalTopics}
            </span>
            <span className="text-xs text-slate-500 font-medium">Mastered</span>
          </div>
          <p className="text-xs text-rose-500 font-semibold">
            {metrics.weakTopics} weak topic(s) requiring remediation
          </p>
        </div>

        {/* Due Revisions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Spaced Revisions Due</span>
            <RotateCcw className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {dueTodayRevisions.length}
            </span>
            <span className="text-xs text-indigo-600 font-semibold">Ready Today</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {metrics.revisionsCompleted} total spaced repetitions completed
          </p>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: TODAY'S STUDY TIMETABLE (FEATURE A) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-brand-600" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Today's Prioritized Study Timetable
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Allocated based on exam countdown ({daysUntil}d), syllabus weightage, and current weakness.
                </p>
              </div>

              <Link
                href="/planner"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <span>Full Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Task List */}
            {dailySchedule.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No tasks scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {dailySchedule.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                      task.completed
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60'
                        : task.type === 'weakness_remedy'
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                        : task.type === 'scheduled_revision'
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="mt-1 text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        {task.completed ? (
                          <CheckSquare className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-semibold text-sm ${
                              task.completed
                                ? 'line-through text-slate-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {task.topicName}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {task.subjectName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {task.reason}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 space-y-1">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{task.allocatedMinutes} min</span>
                      </span>
                      <div className="text-[10px] text-slate-400">
                        Priority: <strong className="text-slate-700 dark:text-slate-300">{task.priorityScore}/100</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SPURRED ACTION: DIAGNOSTIC QUICK BANNER */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-900/40">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base">Unsure of your preparation status?</h3>
              </div>
              <p className="text-xs text-slate-300 max-w-lg">
                Run an instant AI Diagnostic Quiz on any chapter. The system will detect your knowledge gaps and re-tune today’s study timetable.
              </p>
            </div>
            <Link
              href="/assessment"
              className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 flex items-center space-x-1.5 whitespace-nowrap"
            >
              <span>Take Diagnostic Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: WEAKNESS ALERT & REVISION RADAR */}
        <div className="space-y-6">
          {/* WEAKEST TOPICS RADAR (FEATURE B) */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Identified Weak Concepts
                </h3>
              </div>
              <Link
                href="/assessment"
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                View Gaps
              </Link>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Concepts scored below 65% in recent diagnostic assessments.
            </p>

            <div className="space-y-3">
              {weakestTopics.map((top) => {
                const category = categorizeMastery(top.masteryScore);
                return (
                  <div
                    key={top.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                        {top.name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${category.badgeColor}`}>
                        {top.masteryScore}% Mastery • {category.label}
                      </span>
                    </div>

                    <Link
                      href={`/assessment?topicId=${top.id}`}
                      className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      title="Practice this topic"
                    >
                      <PlayCircle className="w-4 h-4 text-brand-600" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DUE REVISIONS CARD (FEATURE C) */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Spaced Revision Queue
                </h3>
              </div>
              <Link
                href="/revision"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Review All
              </Link>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              SM-2 scheduled topics due to prevent memory decay.
            </p>

            {dueTodayRevisions.length === 0 ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                All caught up! No spaced repetitions due today.
              </p>
            ) : (
              <div className="space-y-2.5">
                {dueTodayRevisions.map((rev) => (
                  <div
                    key={rev.topicId}
                    className="p-3 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                        {rev.topicName}
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                        Due Today • Interval: {rev.intervalDays}d
                      </span>
                    </div>

                    <Link
                      href="/revision"
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                    >
                      Revise
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
