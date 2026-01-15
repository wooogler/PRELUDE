'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Type,
  MessageSquare,
  FileEdit,
  ChevronLeft,
  PlayCircle
} from 'lucide-react';

const ViewClient = dynamic(() => import('./ViewClient'), {
  ssr: false,
});

interface ViewWrapperProps {
  session: {
    id: string;
    studentFirstName: string;
    studentLastName: string;
    studentEmail: string;
    startedAt: Date;
    lastSavedAt: Date | null;
  };
  assignment: {
    id: string;
    title: string;
  };
  stats: {
    totalEditorEvents: number;
    externalPasteAttempts: number;
    internalPastes: number;
    totalConversations: number;
    totalChatMessages: number;
    userMessages: number;
    assistantMessages: number;
    timeSpent: number;
    wordCount: number;
  };
  latestSnapshot: { eventData: Record<string, unknown>[] } | null;
  submissions: Array<{
    id: number;
    eventData: Record<string, unknown>[];
    timestamp: Date;
    sequenceNumber: number;
  }>;
  latestSubmission: {
    eventData: Record<string, unknown>[];
    timestamp: Date;
  } | null;
}

export default function ViewWrapper({ session, assignment, stats, latestSnapshot, submissions, latestSubmission }: ViewWrapperProps) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/instructor/assignments/${assignment.id}`}>
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-heading font-semibold text-[hsl(var(--foreground))]">
                  {session.studentLastName}, {session.studentFirstName}
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {assignment.title} • {session.studentEmail} • Last Saved: {session.lastSavedAt ? new Date(session.lastSavedAt).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
            <Link href={`/instructor/replay/${session.id}`}>
              <Button>
                <PlayCircle className="w-4 h-4 mr-2" />
                Replay Session
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Time */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Time</CardTitle>
              <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(stats.timeSpent / (1000 * 60))}m {Math.floor((stats.timeSpent % (1000 * 60)) / 1000)}s
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Typing activity only
              </p>
            </CardContent>
          </Card>

          {/* Word Count */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Word Count</CardTitle>
              <Type className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.wordCount}</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Total words in final document
              </p>
            </CardContent>
          </Card>

          {/* AI Assistance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Assistance</CardTitle>
              <MessageSquare className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.userMessages} turns</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {stats.totalChatMessages} messages in {stats.totalConversations} {stats.totalConversations === 1 ? 'conversation' : 'conversations'}
              </p>
            </CardContent>
          </Card>

          {/* Paste Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paste Activity</CardTitle>
              <FileEdit className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.internalPastes}</div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Internal</p>
                </div>
                <div className="h-8 w-px bg-[hsl(var(--border))]" />
                <div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.externalPasteAttempts}</div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">External</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final Document Preview */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-[hsl(var(--muted))]/30">
            <CardTitle>Final Document Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ViewClient
              finalDocument={
                latestSubmission?.eventData ||
                latestSnapshot?.eventData ||
                [{ type: 'paragraph', content: [] }]
              }
              submissions={submissions}
            />
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
