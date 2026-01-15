'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import CopyLinkButton from '@/components/instructor/CopyLinkButton';
import StudentTable from './StudentTable';
import InstructionEditor from '@/components/editor/InstructionEditor';
import { Card, CardContent } from '@/components/ui/card';
import { Link as LinkIcon, Users, FileText, Brain } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  instructions: string;
  customSystemPrompt: string | null;
  deadline: Date;
  shareToken: string;
}

interface StudentWithStats {
  id: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  startedAt: Date;
  lastSavedAt: Date | null;
  stats: {
    submissions: number;
    pasteInternal: number;
    pasteExternal: number;
    snapshots: number;
  };
}

interface AssignmentTabsProps {
  assignment: Assignment;
  students: StudentWithStats[];
  shareUrl: string;
}

export default function AssignmentTabs({ assignment, students, shareUrl }: AssignmentTabsProps) {
  return (
    <Card className="overflow-hidden">
      <TabGroup defaultIndex={0}>
        <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20">
          <TabList className="flex">
            <Tab className="px-6 py-4 text-sm font-medium border-b-2 transition-all data-[selected]:border-[hsl(var(--primary))] data-[selected]:text-[hsl(var(--primary))] border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border))] outline-none flex items-center gap-2">
              <Users className="w-4 h-4" />
              Students ({students.length})
            </Tab>
            <Tab className="px-6 py-4 text-sm font-medium border-b-2 transition-all data-[selected]:border-[hsl(var(--primary))] data-[selected]:text-[hsl(var(--primary))] border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border))] outline-none flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Assignment Details
            </Tab>
          </TabList>
        </div>

        <TabPanels>
          <TabPanel>
            <div className="p-0">
              {/* Table has its own padding/layout usually, but here likely needs container adjustment */}
              <StudentTable students={students} />
            </div>
          </TabPanel>

          <TabPanel>
            <CardContent className="space-y-8 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-[hsl(var(--foreground))] flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    Share Link
                  </h3>
                  <div className="flex items-center gap-2 p-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                    <code className="text-sm text-[hsl(var(--foreground))] flex-1 truncate px-2">{shareUrl}</code>
                    <CopyLinkButton url={shareUrl} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-[hsl(var(--foreground))] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    Total Students
                  </h3>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))] px-2">
                    {students.length} <span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">enrolled</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[hsl(var(--foreground))] flex items-center gap-2 border-b border-[hsl(var(--border))] pb-2">
                  <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  Instructions
                </h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <InstructionEditor
                    initialContent={assignment.instructions}
                    editable={false}
                  />
                </div>
              </div>

              {assignment.customSystemPrompt && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-[hsl(var(--foreground))] flex items-center gap-2 border-b border-[hsl(var(--border))] pb-2">
                    <Brain className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Custom System Prompt
                  </h3>
                  <div className="bg-[hsl(var(--muted))]/30 border border-[hsl(var(--border))] p-4 rounded-md">
                    <p className="text-sm text-[hsl(var(--muted-foreground))] font-mono whitespace-pre-wrap">{assignment.customSystemPrompt}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </Card>
  );
}
