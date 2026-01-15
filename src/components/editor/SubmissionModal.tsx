'use client';

import { Fragment, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Dialog, Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, Check } from 'lucide-react';

const SubmissionPreview = dynamic(() => import('./SubmissionPreview'), {
  ssr: false,
  loading: () => (
    <div className="text-center text-[hsl(var(--muted-foreground))] py-16">Loading preview...</div>
  ),
});

interface SubmissionEvent {
  id: number;
  eventData: Record<string, unknown>[];
  timestamp: string | Date;
  sequenceNumber: number;
}

interface SubmissionModalProps {
  isOpen: boolean;
  submissions: SubmissionEvent[];
  selectedSubmissionId: number | null;
  onSelectSubmission: (id: number) => void;
  onClose: () => void;
}

export default function SubmissionModal({
  isOpen,
  submissions,
  selectedSubmissionId,
  onSelectSubmission,
  onClose,
}: SubmissionModalProps) {
  const sortedSubmissions = useMemo(
    () =>
      [...submissions].sort((a, b) => {
        const timeDiff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        if (timeDiff !== 0) {
          return timeDiff;
        }
        return a.sequenceNumber - b.sequenceNumber;
      }),
    [submissions]
  );

  const selectedSubmission =
    sortedSubmissions.find(s => s.id === selectedSubmissionId) ||
    sortedSubmissions[sortedSubmissions.length - 1];

  const documentToShow = selectedSubmission?.eventData || [{ type: 'paragraph', content: [] }];

  const selectedIndex = selectedSubmission
    ? sortedSubmissions.findIndex(s => s.id === selectedSubmission.id)
    : -1;
  const hasSubmissions = sortedSubmissions.length > 0;
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95 translate-y-2"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-2"
          >
            <Dialog.Panel className="w-[90vw] max-w-5xl max-h-[85vh] bg-[hsl(var(--background))] rounded-lg shadow-xl flex flex-col overflow-hidden border border-[hsl(var(--border))]">
              <div className="px-6 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
                <div>
                  <Dialog.Title className="text-lg font-semibold text-[hsl(var(--foreground))]">
                    Submission Preview
                  </Dialog.Title>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                    {sortedSubmissions.length > 0
                      ? `${selectedIndex + 1} / ${sortedSubmissions.length} • ${selectedSubmission ? new Date(selectedSubmission.timestamp).toLocaleString() : ''}`
                      : 'No submissions yet'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Listbox
                    value={selectedSubmission ?? null}
                    onChange={(submission) => onSelectSubmission(submission.id)}
                    disabled={!hasSubmissions}
                  >
                    <div className="relative">
                      <ListboxButton className="px-3 py-1.5 text-sm border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] disabled:opacity-50 min-w-[220px] text-left flex items-center justify-between gap-2 hover:bg-[hsl(var(--accent))] transition-colors">
                        <span>
                          {selectedSubmission
                            ? `Submission ${selectedIndex + 1}`
                            : 'No submissions'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </ListboxButton>
                      <ListboxOptions className="absolute right-0 mt-2 max-h-60 w-72 overflow-auto rounded-md bg-[hsl(var(--popover))] py-1 text-sm shadow-md ring-1 ring-[hsl(var(--border))] z-10 focus:outline-none">
                        {sortedSubmissions.map((submission, index) => (
                          <ListboxOption
                            key={submission.id}
                            value={submission}
                            className="cursor-pointer select-none px-3 py-2 hover:bg-[hsl(var(--accent))] text-[hsl(var(--popover-foreground))]"
                          >
                            {({ selected }) => (
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{`Submission ${index + 1}`}</span>
                                  {selected && (
                                    <Check className="w-4 h-4 text-[hsl(var(--primary))]" />
                                  )}
                                </div>
                                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                  {new Date(submission.timestamp).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </Listbox>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-auto bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
                <div className="max-w-4xl mx-auto">
                  {hasSubmissions ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <SubmissionPreview document={documentToShow} />
                    </div>
                  ) : (
                    <div className="text-center text-[hsl(var(--muted-foreground))] py-16">
                      No submissions yet.
                    </div>
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
