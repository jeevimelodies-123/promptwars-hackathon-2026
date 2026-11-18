'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { categorizeMastery } from '@/lib/algorithms';

export default function AnalyticsPage() {
  const {
    subjects,
    activeSubject,
    assessmentResults,
    metrics,
    exportDataJson,
    importDataJson,
    resetToDemoData,
  } = useApp();

  const [isMounted, setIsMounted] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!activeSubject) {
    return <div className="p-8 text-center text-slate-500">No subject loaded.</div>;
  }

  // Prepare chart data: Topic vs Mastery Score & Calculated Priority
  const topicChartData: { name: string; mastery: number; priority: number }[] = [];
  activeSubject.chapters.forEach((chap) => {
    chap.topics.forEach((top) => {
      topicChartData.push({
        name: top.name.length > 18 ? top.name.substring(0, 16) + '...' : top.name,
        mastery: top.masteryScore,
        priority: top.calculatedPriority,
      });
    });
  });

  // Prepare trend data from assessment history
  const trendChartData = assessmentResults
    .slice()
    .reverse()
    .map((res, i) => ({
      name: `Quiz #${i + 1}`,
      score: res.percentageScore,
      topic: res.topicName,
    }));

  if (trendChartData.length === 0) {
    trendChartData.push({ name: 'Initial', score: 35, topic: 'Process Synchronization' });
  }

  const handleExport = () => {
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preppilot-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJson(content);
        if (success) {
          setImportStatus('Data backup successfully restored!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Invalid JSON format. Restore aborted.');
          setTimeout(() => setImportStatus(null), 3000);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Preparation Analytics & Mastery
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              Exam Readiness
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Empirical measurements tracking topic mastery, revision retention, and weak-point remediation.
          </p>
        </div>

        {/* Export / Import Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Snapshot</span>
          </button>

          <label className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center space-x-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore JSON</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-semibold">
          {importStatus}
        </div>
      )}

      {/* METRIC OVERVIEW TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Exam Readiness</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics.overallReadiness}%
          </div>
          <p className="text-[11px] text-slate-500">
            Composite index of coverage & diagnostic accuracy
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Average Diagnostic</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics.averageQuizScore}%
          </div>
          <p className="text-[11px] text-slate-500">
            Across {metrics.quizzesTaken} assessments taken
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Mastery Distribution</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics.masteredTopics}/{metrics.totalTopics}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {Math.round((metrics.masteredTopics / metrics.totalTopics) * 100)}% topics mastered
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Spaced Reviews</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics.revisionsCompleted}
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            SM-2 intervals successfully consolidated
          </p>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CHART 1: TOPIC MASTERY VS STUDY PRIORITY */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Topic Mastery vs Study Priority
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Notice the inverse relationship: Weak concepts (low mastery) automatically receive elevated priority.
            </p>
          </div>

          <div className="h-72 w-full pt-4">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="mastery" name="Mastery Score (%)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="priority" name="Study Priority" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 2: SCORE PROGRESSION OVER TIME */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Assessment Score Progression
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trajectory of student performance after diagnostic and remedial iterations.
            </p>
          </div>

          <div className="h-72 w-full pt-4">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Score %"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#10b981' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED TOPIC AUDIT TABLE */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Curriculum Mastery & Retention Audit
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-4">Mastery Band</th>
                <th className="py-3 px-4">Current Priority</th>
                <th className="py-3 px-4">SM-2 Interval</th>
                <th className="py-3 px-4">Ease Factor</th>
                <th className="py-3 px-4">Next Spaced Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {activeSubject.chapters.flatMap((c) =>
                c.topics.map((t) => {
                  const cat = categorizeMastery(t.masteryScore);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {t.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${cat.badgeColor}`}>
                          {t.masteryScore}% • {cat.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                        {t.calculatedPriority} / 100
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {t.revisionIntervalDays} days
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {t.easeFactor}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {t.nextRevisionDate || 'Pending'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
