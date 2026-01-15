'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteStudentSessionButtonProps {
  sessionId: string;
  studentName: string;
}

export default function DeleteStudentSessionButton({
  sessionId,
  studentName
}: DeleteStudentSessionButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${studentName}'s work?\n\nThis action cannot be undone. All student data (chat history, edit history, etc.) will be permanently deleted.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/student-sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Refresh the page to show updated list
        router.refresh();
      } else {
        const data = await res.json();
        alert(`Failed to delete: ${data.error || 'Unknown error'}`);
      }
    } catch {
      alert('Failed to delete: Network error');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="h-8 w-8 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 hover:text-[hsl(var(--destructive))]"
      title="Delete Student Work"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

