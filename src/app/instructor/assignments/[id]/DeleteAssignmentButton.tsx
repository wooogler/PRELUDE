'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@headlessui/react';

interface DeleteAssignmentButtonProps {
  assignmentId: string;
}

export default function DeleteAssignmentButton({ assignmentId }: DeleteAssignmentButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/instructor/dashboard');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete assignment');
      }
    } catch (error) {
      alert('Failed to delete assignment');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">Delete this assignment?</span>
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          className="btn-destructive-sm"
        >
          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
        </Button>
        <Button
          onClick={() => setShowConfirm(false)}
          className="btn-ghost px-3 py-1 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      className="btn-destructive-outline"
    >
      Delete
    </Button>
  );
}
