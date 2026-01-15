'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import CopyLinkButton from '@/components/instructor/CopyLinkButton';
import StudentTable from './StudentTable';
import InstructionEditor from '@/components/editor/InstructionEditor';

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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <TabGroup defaultIndex={0}>
        <div className="border-b border-gray-200">
          <TabList className="flex -mb-px">
            <Tab className="px-6 py-4 text-sm font-medium border-b-2 transition-colors data-[selected]:border-blue-500 data-[selected]:text-blue-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 data-[hover]:text-gray-700 data-[hover]:border-gray-300 outline-none">
              Students ({students.length})
            </Tab>
            <Tab className="px-6 py-4 text-sm font-medium border-b-2 transition-colors data-[selected]:border-blue-500 data-[selected]:text-blue-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 data-[hover]:text-gray-700 data-[hover]:border-gray-300 outline-none">
              Assignment Details
            </Tab>
          </TabList>
        </div>

        <TabPanels>
          <TabPanel>
            <StudentTable students={students} assignmentId={assignment.id} />
          </TabPanel>

          <TabPanel className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Share Link</h3>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{shareUrl}</code>
                  <CopyLinkButton url={shareUrl} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Students</h3>
                <p className="text-gray-900">{students.length} student{students.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Instructions</h3>
              <div className="py-6">
                <InstructionEditor
                  initialContent={assignment.instructions}
                  editable={false}
                />
              </div>
            </div>

            {assignment.customSystemPrompt && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Custom System Prompt</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm">{assignment.customSystemPrompt}</p>
              </div>
            )}
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
