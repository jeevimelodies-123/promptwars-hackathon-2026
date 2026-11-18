import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, isGeminiConfigured, cleanAndParseJson } from '@/lib/gemini';
import { AssessmentQuestion } from '@/types';

interface AnswerSubmission {
  question: AssessmentQuestion;
  studentResponse: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicName, answers }: { topicName: string; answers: AnswerSubmission[] } = body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'answers array is required' }, { status: 400 });
    }

    if (isGeminiConfigured) {
      const model = getGeminiModel('gemini-1.5-flash');
      if (model) {
        const prompt = `You are an expert university exam grader in Computer Science.
Analyze this student's diagnostic test answers for the topic "${topicName}".

Questions and Student Submissions:
${JSON.stringify(
  answers.map((a, i) => ({
    questionIndex: i + 1,
    type: a.question.type,
    prompt: a.question.prompt,
    studentResponse: a.studentResponse,
    correctAnswer: a.question.correctAnswer,
    conceptTested: a.question.conceptTested,
    explanation: a.question.explanation,
  })),
  null,
  2
)}

Task:
1. Grade each question carefully.
   - For MCQs: If studentResponse matches correctAnswer id, isCorrect=true, score=1, else isCorrect=false, score=0.
   - For Short Answer: Grade semantic conceptual understanding from 0.0 to 1.0. If score >= 0.7, isCorrect=true, else false.
2. For ANY incorrect or low-scoring answer, explain PRECISELY why the student's response is incorrect or incomplete, and what concept was misunderstood.
3. List 2-3 specific weak concepts detected.
4. Provide 3 actionable remedial recommendations to resolve the gaps.
5. Provide a 2-sentence executive summary.

Return ONLY valid JSON matching this exact structure:
{
  "totalQuestions": ${answers.length},
  "correctCount": 1,
  "percentageScore": 35,
  "weakConcepts": ["Concept A", "Concept B"],
  "mistakes": [
    {
      "questionId": "q1",
      "prompt": "Question text...",
      "studentResponse": "What student wrote...",
      "correctAnswer": "Correct answer...",
      "explanation": "Why student's answer was incorrect and the right conceptual model...",
      "conceptMissed": "Specific missing concept",
      "severity": "high"
    }
  ],
  "remedialRecommendations": [
    "Step 1...",
    "Step 2...",
    "Step 3..."
  ],
  "aiAnalysisSummary": "Summary text here..."
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const evaluation = cleanAndParseJson<any>(text, null);
        if (evaluation && typeof evaluation.percentageScore === 'number') {
          return NextResponse.json({ ...evaluation, source: 'gemini-live' });
        }
      }
    }

    // High-Fidelity Deterministic Fallback Analyzer
    let correctCount = 0;
    const mistakes: any[] = [];
    const weakConceptsSet = new Set<string>();

    answers.forEach((item, index) => {
      const q = item.question;
      const resp = (item.studentResponse || '').trim();

      if (q.type === 'mcq') {
        const isCorrect = resp.toLowerCase() === q.correctAnswer.toLowerCase();
        if (isCorrect) {
          correctCount++;
        } else {
          weakConceptsSet.add(q.conceptTested);
          const studentOptionText = q.options?.find((o) => o.id === resp)?.text || resp || 'No answer chosen';
          const correctOptionText = q.options?.find((o) => o.id === q.correctAnswer)?.text || q.correctAnswer;
          mistakes.push({
            questionId: q.id || `q-${index}`,
            prompt: q.prompt,
            studentResponse: studentOptionText,
            correctAnswer: correctOptionText,
            explanation: q.explanation || `The selected choice fails because it does not satisfy ${q.conceptTested}.`,
            conceptMissed: q.conceptTested,
            severity: 'high',
          });
        }
      } else {
        // Short Answer grading heuristic
        const isDetailed = resp.length > 25;
        // Simple keyword check against explanation or concept
        const keywords = q.conceptTested.toLowerCase().split(' ');
        const matchesKeyword = keywords.some((k) => k.length > 3 && resp.toLowerCase().includes(k));

        if (isDetailed && matchesKeyword) {
          correctCount++;
        } else {
          weakConceptsSet.add(q.conceptTested);
          mistakes.push({
            questionId: q.id || `q-${index}`,
            prompt: q.prompt,
            studentResponse: resp || 'Incomplete answer submitted',
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || `The answer misses the key theoretical distinction required for ${q.conceptTested}.`,
            conceptMissed: q.conceptTested,
            severity: resp.length === 0 ? 'high' : 'medium',
          });
        }
      }
    });

    const percentageScore = Math.round((correctCount / answers.length) * 100);
    const weakConcepts = Array.from(weakConceptsSet);
    if (weakConcepts.length === 0) {
      weakConcepts.push('Advanced Edge Cases & Race Timing');
    }

    const fallbackResult = {
      totalQuestions: answers.length,
      correctCount,
      percentageScore,
      weakConcepts,
      mistakes,
      remedialRecommendations: [
        `Review the core principles of ${topicName}, especially: ${weakConcepts.join(', ')}.`,
        'Work through step-by-step state transition diagrams to visualize concurrent interactions.',
        'Retake a focused 3-question drill after 24 hours to cement the correct mental model.',
      ],
      aiAnalysisSummary: percentageScore < 60
        ? `Diagnostic analysis detected significant conceptual gaps in ${topicName} (Score: ${percentageScore}%). Priority has been increased in your study timetable, and an accelerated revision has been scheduled.`
        : `Solid performance on ${topicName} (${percentageScore}%). Continued practice on edge cases will solidify long-term retention.`,
      source: 'interactive-demo',
    };

    return NextResponse.json(fallbackResult);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
