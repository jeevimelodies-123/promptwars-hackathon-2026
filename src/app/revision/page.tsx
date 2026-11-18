'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Award,
  BookOpen,
  Zap,
} from 'lucide-react';
import { Flashcard, RevisionQueueItem } from '@/types';
import confetti from 'canvas-confetti';

export default function RevisionPage() {
  const { revisionQueue, flashcards, completeRevision, activeSubject } = useApp();

  const [activeTab, setActiveTab] = useState<'queue' | 'flashcards' | 'quick_drill'>('flashcards');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('top-proc-sync');

  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [reviewCount, setReviewCount] = useState<number>(0);

  // Quick Drill state
  const [quickDrillAnswer, setQuickDrillAnswer] = useState<string>('');
  const [drillSubmitted, setDrillSubmitted] = useState<boolean>(false);

  // Filter flashcards for the selected topic
  const topicCards = flashcards.filter((fc) => fc.topicId === selectedTopicId);
  const activeCard = topicCards[currentCardIndex] || topicCards[0] || flashcards[0];

  const dueToday = revisionQueue.filter((item) => item.isOverdue || item.dueDate <= new Date().toISOString().split('T')[0]);
  const upcoming = revisionQueue.filter((item) => !item.isOverdue && item.dueDate > new Date().toISOString().split('T')[0]);

  const handleGradeCard = (grade: 'again' | 'hard' | 'good' | 'easy') => {
    let scorePercentage = 80;
    if (grade === 'again') scorePercentage = 30;
    if (grade === 'hard') scorePercentage = 55;
    if (grade === 'good') scorePercentage = 80;
    if (grade === 'easy') scorePercentage = 100;

    completeRevision(selectedTopicId, scorePercentage);
    setReviewCount((prev) => prev + 1);

    if (grade === 'easy' || grade === 'good') {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });
    }

    // Flip back and advance to next card
    setIsFlipped(false);
    if (currentCardIndex < topicCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handleMarkQueueCompleted = (topicId: string) => {
    completeRevision(topicId, 85);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Adaptive Revision Centre
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Feature C
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            SuperMemo SM-2 spaced repetition queue to intercept memory decay before examination day.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'flashcards'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Spaced Flashcards
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'queue'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Revision Queue ({dueToday.length})
          </button>
        </div>
      </div>

      {/* VIEW: FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          {/* Topic selector for flashcards */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Revise Topic:</span>
              <select
                value={selectedTopicId}
                onChange={(e) => {
                  setSelectedTopicId(e.target.value);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="top-proc-sync">Process Synchronization (Due Today)</option>
                <option value="top-deadlocks">Deadlocks (Interval: 3d)</option>
                <option value="top-mem-mgmt">Memory Management (Interval: 2d)</option>
              </select>
            </div>

            <span className="text-xs text-slate-500">
              Card <strong>{currentCardIndex + 1}</strong> of {topicCards.length || 1} • {reviewCount} reviewed this session
            </span>
          </div>

          {/* 3D Interactive Flip Card Container */}
          <div className="max-w-2xl mx-auto perspective-1000">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`relative min-h-[320px] sm:min-h-[360px] w-full rounded-3xl p-8 sm:p-10 cursor-pointer transition-transform duration-500 transform-style-3d shadow-xl border ${
                isFlipped
                  ? 'rotate-y-180 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 border-indigo-700 text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              }`}
            >
              {/* FRONT OF CARD */}
              <div
                className={`absolute inset-0 p-8 sm:p-10 flex flex-col justify-between backface-hidden ${
                  isFlipped ? 'pointer-events-none' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {activeCard?.concept || 'Core Concept'}
                    </span>
                    <span className="text-slate-400 font-medium">Click card to reveal answer</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold pt-4 leading-relaxed">
                    {activeCard?.front}
                  </h3>

                  {activeCard?.hint && (
                    <p className="text-xs text-slate-400 italic pt-2">
                      💡 Hint: {activeCard.hint}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-slate-100 dark:border-slate-700/60">
                  <span>Topic: {activeCard?.topicName}</span>
                  <span className="flex items-center space-x-1 font-semibold text-brand-600 dark:text-brand-400">
                    <Eye className="w-4 h-4" />
                    <span>Flip Card</span>
                  </span>
                </div>
              </div>

              {/* BACK OF CARD */}
              <div
                className={`absolute inset-0 p-8 sm:p-10 flex flex-col justify-between rotate-y-180 backface-hidden ${
                  !isFlipped ? 'pointer-events-none' : ''
                }`}
              >
                <div className="space-y-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Verified Theoretical Answer
                  </span>

                  <p className="text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-line pt-2">
                    {activeCard?.back}
                  </p>
                </div>

                <div className="text-xs text-slate-400 pt-4 border-t border-white/10">
                  Rate your recall below to update the SM-2 interval
                </div>
              </div>
            </div>
          </div>

          {/* SM-2 Recall Grading Bar */}
          <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <span className="text-xs font-semibold text-slate-500 text-center block">
              How accurately did you recall this concept?
            </span>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleGradeCard('again')}
                className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors text-center"
              >
                <div className="text-sm">Again</div>
                <div className="text-[10px] font-normal text-rose-500">Reset to 1d</div>
              </button>

              <button
                onClick={() => handleGradeCard('hard')}
                className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-100 transition-colors text-center"
              >
                <div className="text-sm">Hard</div>
                <div className="text-[10px] font-normal text-amber-500">Tight 1-2d</div>
              </button>

              <button
                onClick={() => handleGradeCard('good')}
                className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors text-center"
              >
                <div className="text-sm">Good</div>
                <div className="text-[10px] font-normal text-blue-500">+3-5 Days</div>
              </button>

              <button
                onClick={() => handleGradeCard('easy')}
                className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 transition-colors text-center"
              >
                <div className="text-sm">Easy</div>
                <div className="text-[10px] font-normal text-emerald-500">+7-14 Days</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: REVISION QUEUE TABLE */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Due Today Section */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Topics Due For Revision Today ({dueToday.length})
              </h2>
            </div>

            {dueToday.length === 0 ? (
              <p className="text-xs text-emerald-600 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                You are completely up to date! No topics currently due for review.
              </p>
            ) : (
              <div className="space-y-3">
                {dueToday.map((rev) => (
                  <div
                    key={rev.topicId}
                    className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {rev.topicName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400">
                          Due Today
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {rev.subjectName} • Mastery: {rev.currentMastery}% • Current Interval: {rev.intervalDays} days
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTopicId(rev.topicId);
                          setActiveTab('flashcards');
                        }}
                        className="px-3.5 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                      >
                        Study Flashcards
                      </button>
                      <button
                        onClick={() => handleMarkQueueCompleted(rev.topicId)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Revised</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Spaced Intervals */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upcoming Spaced Intervals (SuperMemo SM-2)
            </h3>
            <div className="space-y-2.5">
              {upcoming.map((rev) => (
                <div
                  key={rev.topicId}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {rev.topicName}
                    </span>
                    <span className="text-slate-400 block text-[11px]">
                      {rev.subjectName} • Repetitions completed: {rev.repetitions}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                      Due: {rev.dueDate}
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                      Interval: {rev.intervalDays} days
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
