'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Compass,
  LayoutDashboard,
  CalendarDays,
  Activity,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Menu,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { calculateDaysUntilExam } from '@/lib/algorithms';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { activeSubject, isAiLive, resetToDemoData } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResetNotice, setShowResetNotice] = useState(false);

  const daysUntil = activeSubject ? calculateDaysUntilExam(activeSubject.examDate) : 0;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/planner', label: 'Study Planner', icon: CalendarDays },
    { href: '/assessment', label: 'Weakness Analyzer', icon: Activity },
    { href: '/revision', label: 'Revision Centre', icon: RotateCcw },
    { href: '/analytics', label: 'Analytics', icon: Sparkles },
  ];

  const handleReset = () => {
    if (confirm('Reset to standard Hackathon demo dataset (Operating Systems exam in 5 days)?')) {
      resetToDemoData();
      setShowResetNotice(true);
      setTimeout(() => setShowResetNotice(false), 3000);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  PrepPilot <span className="text-brand-600 dark:text-brand-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  Hack2Skill
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Study Smarter. Identify Gaps. Never Miss Revision.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action Widgets */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Exam Countdown Pill */}
            {activeSubject && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {activeSubject.name}: <strong className="font-bold text-indigo-900 dark:text-indigo-200">{daysUntil}d left</strong>
                </span>
              </div>
            )}

            {/* AI Status Badge */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isAiLive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
              title={
                isAiLive
                  ? 'Connected directly to Google Gemini Generative AI API'
                  : 'Running in Interactive Demo Mode with high-fidelity deterministic responses. Set GEMINI_API_KEY in .env.local to activate live LLM generation.'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAiLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{isAiLive ? 'Gemini AI Live' : 'Demo Mode'}</span>
            </div>

            {/* Reset Demo State Button */}
            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset to sample dataset (OS Exam in 5 days)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              title="Reset Demo Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Exam: <strong>{daysUntil} days left</strong>
            </span>
            <span
              className={`px-2 py-0.5 rounded font-medium ${
                isAiLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isAiLive ? 'Gemini Live' : 'Demo Mode'}
            </span>
          </div>
        </div>
      )}

      {/* Temporary toast notification for reset */}
      {showResetNotice && (
        <div className="absolute top-16 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Reset to Operating Systems 5-day exam scenario successfully!</span>
        </div>
      )}
    </nav>
  );
};
