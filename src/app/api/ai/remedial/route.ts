import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, isGeminiConfigured, cleanAndParseJson } from '@/lib/gemini';
import { AssessmentQuestion } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicName, weakConcepts } = body;

    if (!topicName) {
      return NextResponse.json({ error: 'topicName is required' }, { status: 400 });
    }

    if (isGeminiConfigured) {
      const model = getGeminiModel('gemini-1.5-flash');
      if (model) {
        const conceptsText = Array.isArray(weakConcepts) ? weakConcepts.join(', ') : '';
        const prompt = `A student struggled with these specific concepts in "${topicName}": ${conceptsText}.
Generate 3 focused remedial questions (2 MCQs and 1 Short Answer) designed to correct these specific misunderstandings.

Return ONLY a JSON array of questions matching:
[
  {
    "id": "rem-1",
    "topicId": "top-1",
    "topicName": "${topicName}",
    "type": "mcq",
    "prompt": "...",
    "options": [
      { "id": "a", "text": "..." },
      { "id": "b", "text": "..." },
      { "id": "c", "text": "..." },
      { "id": "d", "text": "..." }
    ],
    "correctAnswer": "a",
    "explanation": "...",
    "conceptTested": "..."
  },
  {
    "id": "rem-3",
    "topicId": "top-1",
    "topicName": "${topicName}",
    "type": "short_answer",
    "prompt": "...",
    "correctAnswer": "...",
    "explanation": "...",
    "conceptTested": "..."
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

    // Fallback remedial questions
    const fallback: AssessmentQuestion[] = [
      {
        id: `rem-fb-1-${Date.now()}`,
        topicId: 'top-1',
        topicName,
        type: 'mcq',
        prompt: `Remedial Drill: Which property is directly violated if a process requesting to enter a critical section in ${topicName} is starved indefinitely by new incoming processes?`,
        options: [
          { id: 'a', text: 'Mutual Exclusion' },
          { id: 'b', text: 'Bounded Waiting' },
          { id: 'c', text: 'Preemptive Priority Scheduling' },
          { id: 'd', text: 'Amdahl\'s Law' },
        ],
        correctAnswer: 'b',
        explanation: 'Bounded waiting guarantees a ceiling on how many other processes can bypass a waiting process, directly preventing starvation.',
        conceptTested: 'Bounded Waiting Violation',
      },
      {
        id: `rem-fb-2-${Date.now()}`,
        topicId: 'top-1',
        topicName,
        type: 'mcq',
        prompt: `Remedial Drill: In hardware atomic instructions, why does Compare-And-Swap (CAS) take three arguments (memory location, expected value, new value)?`,
        options: [
          { id: 'a', text: 'To update memory only if no other thread modified it in the interim' },
          { id: 'b', text: 'To simulate a 3-way multiplexer in software' },
          { id: 'c', text: 'To encrypt the lock address for memory security' },
          { id: 'd', text: 'To assign three concurrent owners to a mutex' },
        ],
        correctAnswer: 'a',
        explanation: 'CAS atomically verifies that the location still holds the expected value before overwriting it with the new value, enabling lock-free concurrency.',
        conceptTested: 'Compare-and-Swap Semantics',
      },
      {
        id: `rem-fb-3-${Date.now()}`,
        topicId: 'top-1',
        topicName,
        type: 'short_answer',
        prompt: `In two sentences, state why testing a lock condition in a while loop (while(lock)) is necessary after waking up from a condition variable wait.`,
        correctAnswer: 'Because of spurious wakeups and race conditions where another thread acquires the lock before the newly awakened thread runs. The while loop re-verifies that the condition remains true before proceeding.',
        explanation: 'Condition variables must always be checked in a loop to guard against spurious wakeups and state invalidation between signal and acquisition.',
        conceptTested: 'Mesa-Style Condition Variable Checking',
      },
    ];

    return NextResponse.json({ questions: fallback, source: 'interactive-demo' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
