import { NextResponse } from 'next/server';

export async function GET() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
  return NextResponse.json({
    live: hasKey,
    mode: hasKey ? 'live_gemini' : 'interactive_demo',
    message: hasKey
      ? 'Google Gemini AI active.'
      : 'Running in Interactive Demo Mode with high-fidelity deterministic responses. Set GEMINI_API_KEY in .env.local to enable live generative AI.',
  });
}
