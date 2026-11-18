import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PrepPilot AI – Study Smarter. Identify Gaps. Never Miss Revision.',
  description:
    'An innovative AI-powered personalized exam preparation platform connecting intelligent study planning, diagnostic weakness analysis, and adaptive spaced revision.',
  keywords: [
    'AI Study Planner',
    'Exam Preparation',
    'Weakness Analyzer',
    'Spaced Repetition',
    'SuperMemo SM-2',
    'College Exam Prep',
    'PromptWars Hackathon',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white`}>
        <AppProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
