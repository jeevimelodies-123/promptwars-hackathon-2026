import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, isGeminiConfigured, cleanAndParseJson } from '@/lib/gemini';
import { Chapter } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { syllabusText, subjectName } = body;

    if (!syllabusText || syllabusText.trim().length === 0) {
      return NextResponse.json({ error: 'syllabusText is required' }, { status: 400 });
    }

    if (isGeminiConfigured) {
      const model = getGeminiModel('gemini-1.5-flash');
      if (model) {
        const prompt = `You are an academic curriculum parser.
Convert the following course syllabus or text into structured Chapters and Topics for the subject "${subjectName || 'Course'}".

Syllabus Input:
${syllabusText}

Rules:
1. Group into logical Chapters (2 to 5 chapters).
2. Each Chapter must have 2 to 4 Topics.
3. For each topic, assign importance ('low' | 'medium' | 'high' | 'critical'), weightagePercentage (20 to 90), estimatedMinutes (30 to 75), and 2-3 subtopics.

Return ONLY valid JSON matching this array of Chapter objects:
[
  {
    "id": "chap-1",
    "subjectId": "temp-sub",
    "name": "Chapter Name",
    "topics": [
      {
        "id": "top-1",
        "subjectId": "temp-sub",
        "chapterId": "chap-1",
        "name": "Topic Name",
        "importance": "high",
        "weightagePercentage": 75,
        "estimatedMinutes": 45,
        "masteryScore": 50,
        "revisionIntervalDays": 1,
        "easeFactor": 2.5,
        "revisionRepetitions": 0,
        "calculatedPriority": 60,
        "subtopics": [
          { "id": "sub-1", "name": "Subtopic A", "masteryScore": 50 }
        ]
      }
    ]
  }
]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const chapters = cleanAndParseJson<Chapter[]>(text, []);
        if (chapters && chapters.length > 0) {
          return NextResponse.json({ chapters, source: 'gemini-live' });
        }
      }
    }

    // Deterministic parsing fallback
    const lines = syllabusText
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    const fallbackChapters: Chapter[] = [
      {
        id: `chap-${Date.now()}-1`,
        subjectId: 'temp-sub',
        name: lines[0] ? lines[0].replace(/^[0-9.:\- ]+/, '') : 'Core Principles & Architecture',
        topics: [
          {
            id: `top-${Date.now()}-1`,
            subjectId: 'temp-sub',
            chapterId: `chap-${Date.now()}-1`,
            name: lines[1] ? lines[1].replace(/^[0-9.:\- ]+/, '') : 'Fundamental Concepts & Invariants',
            importance: 'high',
            weightagePercentage: 75,
            estimatedMinutes: 50,
            masteryScore: 50,
            revisionIntervalDays: 1,
            easeFactor: 2.5,
            revisionRepetitions: 0,
            calculatedPriority: 70,
            subtopics: [
              { id: `sub-${Date.now()}-1`, name: 'Foundations & Definitions', masteryScore: 50 },
              { id: `sub-${Date.now()}-2`, name: 'Mechanisms & Tradeoffs', masteryScore: 50 },
            ],
          },
          {
            id: `top-${Date.now()}-2`,
            subjectId: 'temp-sub',
            chapterId: `chap-${Date.now()}-1`,
            name: lines[2] ? lines[2].replace(/^[0-9.:\- ]+/, '') : 'Applied Protocols & Scheduling',
            importance: 'critical',
            weightagePercentage: 85,
            estimatedMinutes: 60,
            masteryScore: 40,
            revisionIntervalDays: 1,
            easeFactor: 2.5,
            revisionRepetitions: 0,
            calculatedPriority: 80,
            subtopics: [
              { id: `sub-${Date.now()}-3`, name: 'Protocol Execution', masteryScore: 40 },
              { id: `sub-${Date.now()}-4`, name: 'Failure Recovery Models', masteryScore: 40 },
            ],
          },
        ],
      },
    ];

    return NextResponse.json({ chapters: fallbackChapters, source: 'interactive-demo' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
