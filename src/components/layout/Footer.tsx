import React from 'react';
import Link from 'next/link';
import { Compass, Sparkles, BookOpen, Brain, RotateCcw, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">
                PrepPilot <span className="text-brand-600 dark:text-brand-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              An intelligent, closed-loop exam preparation platform engineered for college and university students.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>PromptWars 2026 Hackathon</span>
            </div>
          </div>

          {/* Three Pillars */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              The 3 Core Features
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/planner" className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                  <span>Feature A: Intelligent Study Planner</span>
                </Link>
              </li>
              <li>
                <Link href="/assessment" className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center space-x-1.5">
                  <Brain className="w-3.5 h-3.5 text-rose-500" />
                  <span>Feature B: AI Weakness Analyzer</span>
                </Link>
              </li>
              <li>
                <Link href="/revision" className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center space-x-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Feature C: Adaptive Revision Scheduler</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Connected Loop */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              The Innovation
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Assessment → Weakness Detection → Study Prioritization → Learning → Spaced Revision → Reassessment.
            </p>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Deterministic Math + Gemini AI</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Quick Access
            </h4>
            <div className="flex flex-col space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Link href="/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400">
                Student Dashboard
              </Link>
              <Link href="/analytics" className="hover:text-brand-600 dark:hover:text-brand-400">
                Readiness Analytics & Radar
              </Link>
              <a
                href="https://github.com/jeevimelodies-123/promptwars-hackathon-2026"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-600 dark:hover:text-brand-400"
              >
                GitHub Repository
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 PrepPilot AI. Built for PromptWars 24-Hour AI Hackathon.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>using Next.js, Tailwind CSS & Google Gemini</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
