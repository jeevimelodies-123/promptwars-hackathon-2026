'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  Brain,
  CalendarCheck2,
  RotateCcw,
  Sparkles,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  TrendingUp,
  Layers,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function LandingPage() {
  const { resetToDemoData } = useApp();

  return (
    <div className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-500/15 via-indigo-500/5 to-transparent blur-3xl -z-10 pointer-events-none" />

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Hackathon Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-xs font-semibold text-brand-700 dark:text-brand-300 shadow-sm animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Built for PromptWars 2026 • 24-Hour AI Hackathon</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Study Smarter. Identify Gaps.{' '}
            <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              Never Miss Revision.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            The first AI-powered exam preparation engine connecting{' '}
            <strong className="text-slate-900 dark:text-white font-semibold">dynamic study prioritization</strong>,{' '}
            <strong className="text-slate-900 dark:text-white font-semibold">diagnostic weakness detection</strong>, and{' '}
            <strong className="text-slate-900 dark:text-white font-semibold">adaptive spaced revision</strong> into one closed feedback loop.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <span>Launch PrepPilot Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/assessment"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <Brain className="w-4 h-4 text-brand-600" />
              <span>Take Diagnostic Quiz</span>
            </Link>
          </div>

          {/* Quick Scenario Loader Bar */}
          <div className="pt-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">Active Scenario:</span>
              <span>Operating Systems Exam in 5 Days (Process Sync: 35% Mastery)</span>
              <button
                onClick={resetToDemoData}
                className="text-brand-600 dark:text-brand-400 hover:underline font-semibold ml-2"
              >
                Reload Scenario
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* THE 3 PROBLEMS & 3 SOLUTIONS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
            Real Student Problems • Engineered Solutions
          </span>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Three Critical Exam Obstacles, Solved Together
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Generic chatbots provide unorganized answers. PrepPilot AI solves the structural failure points of exam study.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="rounded-2xl p-6 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <CalendarCheck2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Problem 1: Overwhelm</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Intelligent Study Planner
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Students panic when exams approach because they don't know what to study first. PrepPilot calculates deterministic priority scores from exam proximity, syllabus weightage, and weak areas, building an exact minute-by-minute daily timetable.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-700/60 mt-6">
              <Link
                href="/planner"
                className="text-sm font-semibold text-brand-600 dark:text-brand-400 flex items-center space-x-1 group"
              >
                <span>Explore Dynamic Planner</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl p-6 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Brain className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Problem 2: Blind Spots</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  AI Weakness Analyzer
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                A simple test score doesn’t tell a student what went wrong. PrepPilot’s Gemini-powered diagnostics evaluate MCQs and short answers, isolating exact concept misconceptions (e.g. Peterson’s Solution race condition) and generating remedial drills.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-700/60 mt-6">
              <Link
                href="/assessment"
                className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-1 group"
              >
                <span>Run Diagnostic Assessment</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl p-6 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Problem 3: The Forgetting Curve</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Adaptive Revision Scheduler
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Students study once and forget before test day. PrepPilot runs a modified SuperMemo SM-2 spaced repetition engine. Poor quiz scores bring topics back in 24 hours, while high mastery pushes intervals to 3, 7, and 14 days with flashcards and drills.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-700/60 mt-6">
              <Link
                href="/revision"
                className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 group"
              >
                <span>Open Revision Centre</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* THE CENTRAL INNOVATION: CONNECTED CLOSED-LOOP VISUALIZER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 border border-indigo-800/50 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-semibold">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>The Main Hackathon Innovation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              The Connected Closed-Loop Learning System
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              When a student scores 35% on <span className="text-indigo-400 font-semibold">Process Synchronization</span> in the Weakness Analyzer, all three modules react automatically:
            </p>
          </div>

          {/* Interactive Flow Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur space-y-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Step 1: Detection
              </span>
              <h4 className="font-bold text-white text-base">Weakness Flagged</h4>
              <p className="text-xs text-slate-300">
                Score 35%. Peterson’s Algorithm and Critical Section concepts identified as primary knowledge gaps.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur space-y-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Step 2: Planner Re-tune
              </span>
              <h4 className="font-bold text-white text-base">Priority Escalates</h4>
              <p className="text-xs text-slate-300">
                Priority score surges to 92/100. Planner automatically assigns 60 minutes in today's study schedule.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur space-y-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Step 3: Revision Rescheduled
              </span>
              <h4 className="font-bold text-white text-base">24-Hour Interval</h4>
              <p className="text-xs text-slate-300">
                SM-2 spaced repetition resets interval to 1 day. Topic queued into "Due Today" revision with flashcards.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur space-y-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Step 4: Reassessment
              </span>
              <h4 className="font-bold text-white text-base">Graduation</h4>
              <p className="text-xs text-slate-300">
                Student passes follow-up drill (&gt;85%). Topic priority drops, next revision pushes to 3 days, readiness gauge rises.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Deterministic Math Engine + Google Gemini AI • Zero Hallucination Scheduling
            </span>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors flex items-center space-x-1.5"
            >
              <span>See It Live on Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
