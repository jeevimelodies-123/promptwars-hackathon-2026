import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, isGeminiConfigured, cleanAndParseJson } from '@/lib/gemini';
import { AssessmentQuestion } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicName, topicId, subjectName, subtopics } = body;

    if (!topicName) {
      return NextResponse.json({ error: 'topicName is required' }, { status: 400 });
    }

    if (isGeminiConfigured) {
      const model = getGeminiModel('gemini-1.5-flash');
      if (model) {
        const subtopicText = Array.isArray(subtopics) && subtopics.length > 0 
          ? `Subtopics: ${subtopics.map((s: { name: string }) => s.name).join(', ')}` 
          : '';

        const prompt = `You are a university professor preparing a rigorous diagnostic exam for college students in ${subjectName || 'Computer Science'}.
Generate a diagnostic assessment for the topic "${topicName}". ${subtopicText}

Create exactly 4 questions:
- 3 Multiple Choice Questions (MCQ) testing deep conceptual understanding, common pitfalls, and edge cases. Each MCQ must have exactly 4 choices (labeled 'a', 'b', 'c', 'd'), the correct answer id, and a detailed explanation.
- 1 Conceptual Short-Answer Question (SAQ) where the student must explain the mechanism, tradeoff, or edge condition.

Return ONLY a valid JSON array matching this TypeScript structure:
[
  {
    "id": "q1",
    "topicId": "${topicId || 'top-1'}",
    "topicName": "${topicName}",
    "subtopicName": "Subtopic Name",
    "type": "mcq",
    "prompt": "Question text here...",
    "options": [
      { "id": "a", "text": "Choice A" },
      { "id": "b", "text": "Choice B" },
      { "id": "c", "text": "Choice C" },
      { "id": "d", "text": "Choice D" }
    ],
    "correctAnswer": "a",
    "explanation": "Why choice A is correct and others fail...",
    "conceptTested": "Core concept tested"
  },
  {
    "id": "q4",
    "topicId": "${topicId || 'top-1'}",
    "topicName": "${topicName}",
    "subtopicName": "Subtopic Name",
    "type": "short_answer",
    "prompt": "Explain...",
    "correctAnswer": "Ideal conceptual answer description...",
    "explanation": "Detailed theoretical breakdown...",
    "conceptTested": "Specific mechanism tested"
  }
]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const questions = cleanAndParseJson<AssessmentQuestion[]>(text, []);
        if (questions && questions.length > 0) {
          return NextResponse.json({ questions, source: 'gemini-live' });
        }
      }
    }

    // High-Fidelity Fallback Demo Mode Questions
    const fallbackQuestions: AssessmentQuestion[] = [
      {
        id: `fb-1-${Date.now()}`,
        topicId: topicId || 'top-1',
        topicName,
        subtopicName: 'Core Foundations',
        type: 'mcq',
        prompt: `In the context of ${topicName}, what is the primary structural reason that synchronization or state inconsistencies arise in concurrent environments?`,
        options: [
          { id: 'a', text: 'Lack of compiler optimization passes' },
          { id: 'b', text: 'Non-atomic read-modify-write sequences across shared memory' },
          { id: 'c', text: 'Excessive thread stack memory allocation' },
          { id: 'd', text: 'Single-core synchronous execution delays' },
        ],
        correctAnswer: 'b',
        explanation: 'Shared memory race conditions occur because high-level operations like count++ compile into non-atomic load-modify-store sequences that can be preempted at arbitrary instruction boundaries.',
        conceptTested: 'Atomicity & Race Conditions',
      },
      {
        id: `fb-2-${Date.now()}`,
        topicId: topicId || 'top-1',
        topicName,
        subtopicName: 'Algorithmic Invariants',
        type: 'mcq',
        prompt: `Which of the following guarantees must be satisfied to prevent starvation when multiple entities compete for ${topicName}?`,
        options: [
          { id: 'a', text: 'Bounded Waiting' },
          { id: 'b', text: 'Strict Alternation' },
          { id: 'c', text: 'Indefinite Postponement' },
          { id: 'd', text: 'Immediate Preemption' },
        ],
        correctAnswer: 'a',
        explanation: 'Bounded waiting ensures that after a process makes a request, a bound exists on the number of times other processes can enter ahead of it, strictly forbidding starvation.',
        conceptTested: 'Bounded Waiting & Starvation Freedom',
      },
      {
        id: `fb-3-${Date.now()}`,
        topicId: topicId || 'top-1',
        topicName,
        subtopicName: 'Hardware Mechanisms',
        type: 'mcq',
        prompt: `How do atomic hardware primitives (e.g. Compare-and-Swap / TSL) support correct software implementations of ${topicName}?`,
        options: [
          { id: 'a', text: 'They eliminate the need for CPU interrupts entirely' },
          { id: 'b', text: 'They execute multi-step memory checks in a single indivisible bus/cache cycle' },
          { id: 'c', text: 'They convert all multi-threaded programs into sequential single-threaded execution' },
          { id: 'd', text: 'They automatically resolve deadlocks at compile time' },
        ],
        correctAnswer: 'b',
        explanation: 'Atomic hardware instructions lock the memory bus or cache line during the read-modify-write cycle, preventing any other processor core from altering state simultaneously.',
        conceptTested: 'Hardware Memory Atomicity',
      },
      {
        id: `fb-4-${Date.now()}`,
        topicId: topicId || 'top-1',
        topicName,
        subtopicName: 'Conceptual Analysis',
        type: 'short_answer',
        prompt: `Explain the fundamental tradeoff between busy-waiting (spinlocks) and blocking synchronization (sleep locks) when coordinating ${topicName}. Under what duration threshold is a spinlock preferred?`,
        correctAnswer: 'Spinlocks burn CPU cycles while looping but avoid the heavy context-switch latency (register save, cache invalidation, scheduler dispatch). If the expected wait time is shorter than two context switches, spinlocks provide higher throughput; otherwise, blocking is superior.',
        explanation: 'Spinlocks are optimal for short critical sections on multiprocessor systems; sleeping locks are optimal when critical sections are prolonged or on uniprocessors.',
        conceptTested: 'Spinlock vs Blocking Latency Tradeoffs',
      },
    ];

    return NextResponse.json({ questions: fallbackQuestions, source: 'interactive-demo' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
