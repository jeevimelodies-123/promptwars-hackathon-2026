'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  CalendarDays,
  Plus,
  Clock,
  Flame,
  Award,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Edit2,
  CheckCircle2,
  FileText,
  Upload,
  ArrowUpDown,
  AlertCircle,
} from 'lucide-react';
import {
  calculateDaysUntilExam,
  calculateExamUrgency,
  categorizeMastery,
  PRIORITY_WEIGHTS,
} from '@/lib/algorithms';
import { TopicImportance, Chapter, Topic } from '@/types';

export default function PlannerPage() {
  const {
    subjects,
    activeSubject,
    setActiveSubjectId,
    addSubject,
    updateTopic,
    addTopic,
    dailySchedule,
  } = useApp();

  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');

  // Forms
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubExamDate, setNewSubExamDate] = useState('');
  const [newSubHours, setNewSubHours] = useState('3.5');

  const [newTopName, setNewTopName] = useState('');
  const [newTopImportance, setNewTopImportance] = useState<TopicImportance>('high');
  const [newTopWeightage, setNewTopWeightage] = useState('75');
  const [newTopMinutes, setNewTopMinutes] = useState('45');
  const [newTopPrepLevel, setNewTopPrepLevel] = useState('50');

  // Syllabus AI Import Form
  const [syllabusInput, setSyllabusInput] = useState('');
  const [isParsingSyllabus, setIsParsingSyllabus] = useState(false);
  const [syllabusStatus, setSyllabusStatus] = useState<string | null>(null);

  if (!activeSubject) {
    return <div className="p-8 text-center text-slate-500">No subject loaded.</div>;
  }

  const daysUntil = calculateDaysUntilExam(activeSubject.examDate);
  const urgencyScore = calculateExamUrgency(daysUntil);

  // Flatten topics for the subject to rank by calculatedPriority
  const subjectTopics: {
    topic: Topic;
    chapterName: string;
    chapterId: string;
  }[] = [];

  activeSubject.chapters.forEach((chap) => {
    chap.topics.forEach((top) => {
      subjectTopics.push({
        topic: top,
        chapterName: chap.name,
        chapterId: chap.id,
      });
    });
  });

  // Sort by highest priority descending
  subjectTopics.sort((a, b) => b.topic.calculatedPriority - a.topic.calculatedPriority);

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubExamDate) return;

    addSubject({
      name: newSubName.trim(),
      code: newSubCode.trim() || 'EXAM-101',
      examDate: newSubExamDate,
      availableHoursPerDay: parseFloat(newSubHours) || 3,
      preparationLevel: 'intermediate',
      colorTheme: '#4f46e5',
      chapters: [
        {
          id: `chap-${Date.now()}`,
          subjectId: 'new',
          name: 'Core Syllabus Topics',
          topics: [],
        },
      ],
    });

    setNewSubName('');
    setNewSubCode('');
    setShowAddSubjectModal(false);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopName.trim() || !selectedChapterId) return;

    addTopic(activeSubject.id, selectedChapterId, {
      subjectId: activeSubject.id,
      chapterId: selectedChapterId,
      name: newTopName.trim(),
      importance: newTopImportance,
      weightagePercentage: parseInt(newTopWeightage, 10) || 50,
      estimatedMinutes: parseInt(newTopMinutes, 10) || 45,
      masteryScore: parseInt(newTopPrepLevel, 10) || 50,
      revisionIntervalDays: 1,
      easeFactor: 2.5,
      revisionRepetitions: 0,
      subtopics: [
        { id: `sub-${Date.now()}-1`, name: 'Core Foundations', masteryScore: parseInt(newTopPrepLevel, 10) || 50 },
      ],
    });

    setNewTopName('');
    setShowAddTopicModal(false);
  };

  const handleParseSyllabus = async () => {
    if (!syllabusInput.trim()) return;
    setIsParsingSyllabus(true);
    setSyllabusStatus('AI is analyzing syllabus structure and computing weightages...');

    try {
      const res = await fetch('/api/ai/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusText: syllabusInput,
          subjectName: activeSubject.name,
        }),
      });

      const data = await res.json();
      if (data.chapters && Array.isArray(data.chapters)) {
        // Append parsed chapters to current active subject
        data.chapters.forEach((parsedChap: Chapter) => {
          parsedChap.topics.forEach((t) => {
            addTopic(activeSubject.id, activeSubject.chapters[0]?.id || 'chap-1', {
              subjectId: activeSubject.id,
              chapterId: activeSubject.chapters[0]?.id || 'chap-1',
              name: t.name,
              importance: t.importance || 'high',
              weightagePercentage: t.weightagePercentage || 70,
              estimatedMinutes: t.estimatedMinutes || 45,
              masteryScore: t.masteryScore || 50,
              revisionIntervalDays: 1,
              easeFactor: 2.5,
              revisionRepetitions: 0,
              subtopics: t.subtopics || [],
            });
          });
        });
        setSyllabusStatus('Syllabus imported successfully!');
        setTimeout(() => {
          setShowSyllabusModal(false);
          setSyllabusStatus(null);
          setSyllabusInput('');
        }, 1200);
      }
    } catch (err) {
      setSyllabusStatus('Failed to parse syllabus. Please try again.');
    } finally {
      setIsParsingSyllabus(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER & SUBJECT SWITCHER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Intelligent Study Planner
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              Feature A
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dynamic prioritization engine weighting exam proximity, topic importance, and real diagnostic scores.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Selector */}
          <select
            value={activeSubject.id}
            onChange={(e) => setActiveSubjectId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowSyllabusModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>AI Syllabus Import</span>
          </button>

          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Subject</span>
          </button>
        </div>
      </div>

      {/* PARAMETERS & WEIGHTAGE BREAKDOWN BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Target Exam Date</span>
          <p className="text-base font-bold text-slate-900 dark:text-white">
            {activeSubject.examDate} ({daysUntil} days left)
          </p>
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
            Proximity Urgency: {urgencyScore}/100 (Weight: 35%)
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Available Study Time</span>
          <p className="text-base font-bold text-slate-900 dark:text-white">
            {activeSubject.availableHoursPerDay} Hours / Day
          </p>
          <div className="text-[10px] text-slate-500">
            Total capacity: {Math.round(activeSubject.availableHoursPerDay * 60)} minutes/day
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Total Topics In Course</span>
          <p className="text-base font-bold text-slate-900 dark:text-white">
            {subjectTopics.length} Topics
          </p>
          <div className="text-[10px] text-slate-500">
            Across {activeSubject.chapters.length} course chapters
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Formula Weights</span>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            35% Urgency • 25% Weightage • 30% Weakness • 10% Revision
          </p>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Deterministic Mathematical Engine
          </div>
        </div>
      </div>

      {/* TOPIC PRIORITY RANKING TABLE */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Priority-Ranked Study Syllabus
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Topics dynamically ranked by calculated urgency. Topics with low test scores automatically rise to the top.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedChapterId(activeSubject.chapters[0]?.id || '');
              setShowAddTopicModal(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Topic Manually</span>
          </button>
        </div>

        {/* Table / Cards */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Topic & Chapter</th>
                <th className="py-3 px-4">Syllabus Weightage</th>
                <th className="py-3 px-4">Diagnostic Mastery</th>
                <th className="py-3 px-4">Est. Duration</th>
                <th className="py-3 px-4">Next Revision</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {subjectTopics.map(({ topic, chapterName, chapterId }, index) => {
                const category = categorizeMastery(topic.masteryScore);
                const isTop1 = index === 0;

                return (
                  <tr
                    key={topic.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors ${
                      isTop1 ? 'bg-brand-50/30 dark:bg-brand-950/20' : ''
                    }`}
                  >
                    {/* Rank & Priority Score */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                            isTop1
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <strong className="text-sm font-bold text-slate-900 dark:text-white">
                            {topic.calculatedPriority}
                          </strong>
                          <span className="text-[10px] text-slate-400 block">/ 100</span>
                        </div>
                      </div>
                    </td>

                    {/* Topic Name */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                          {topic.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {chapterName} • {topic.subtopics.length} subtopics
                        </span>
                      </div>
                    </td>

                    {/* Weightage */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {topic.weightagePercentage}%
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          ({topic.importance})
                        </span>
                      </div>
                    </td>

                    {/* Mastery Level */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${category.badgeColor}`}>
                        {topic.masteryScore}% • {category.label}
                      </span>
                    </td>

                    {/* Est Duration */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {topic.estimatedMinutes} mins
                    </td>

                    {/* Next Revision */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {topic.nextRevisionDate || 'Not scheduled'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/assessment?topicId=${topic.id}`}
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        Assess
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DAILY STUDY TIMETABLE GENERATOR PREVIEW */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Generated Daily Study Timetable (Time-Budgeted)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Total Allocated: {dailySchedule.reduce((sum, t) => sum + t.allocatedMinutes, 0)} mins / {Math.round(activeSubject.availableHoursPerDay * 60)} mins budget
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {dailySchedule.map((task, idx) => (
            <div
              key={task.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  Slot #{idx + 1}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {task.allocatedMinutes} mins
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {task.topicName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {task.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: ADD SUBJECT */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add New Course / Subject
            </h3>
            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Management Systems"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS-401"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Daily Study Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="16"
                    value={newSubHours}
                    onChange={(e) => setNewSubHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Examination Date
                </label>
                <input
                  type="date"
                  required
                  value={newSubExamDate}
                  onChange={(e) => setNewSubExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TOPIC */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Topic to {activeSubject.name}
            </h3>
            <form onSubmit={handleCreateTopic} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Select Chapter
                </label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  {activeSubject.chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Topic Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B+ Trees and Indexing"
                  value={newTopName}
                  onChange={(e) => setNewTopName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Syllabus Weightage (%)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={newTopWeightage}
                    onChange={(e) => setNewTopWeightage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Initial Mastery (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newTopPrepLevel}
                    onChange={(e) => setNewTopPrepLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTopicModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AI SYLLABUS PARSER */}
      {showSyllabusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Syllabus & Outline Parser
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste your course outline, lecture list, or PDF text. PrepPilot will automatically extract chapters, subtopics, and weightages.
            </p>

            <textarea
              rows={6}
              placeholder="Paste syllabus text here (e.g., Unit 1: Relational Algebra, SQL queries, Normalization. Unit 2: Indexing, B-Trees, Hashing...)"
              value={syllabusInput}
              onChange={(e) => setSyllabusInput(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs leading-relaxed"
            />

            {syllabusStatus && (
              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs">
                {syllabusStatus}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                disabled={isParsingSyllabus}
                onClick={() => setShowSyllabusModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isParsingSyllabus || !syllabusInput.trim()}
                onClick={handleParseSyllabus}
                className="px-4 py-2 rounded-lg bg-brand-600 text-white font-semibold text-xs flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isParsingSyllabus ? 'Analyzing...' : 'Parse & Import'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
