'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DeleteAccountButton() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  async function handleDelete() {
    if (confirmText !== 'DELETE') {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      });

      if (res.ok) {
        // Redirect to login page
        router.push('/login?message=account-deleted');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete account');
        setIsDeleting(false);
      }
    } catch {
      alert('Failed to delete account');
      setIsDeleting(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/10 dark:border-red-900/20">
          <p className="text-sm text-red-800 font-medium mb-2 dark:text-red-400">
            ⚠️ This action cannot be undone!
          </p>
          <p className="text-sm text-red-700 mb-4 dark:text-red-300">
            Type <span className="font-mono font-bold">DELETE</span> to confirm account deletion:
          </p>
          <div className="mb-3">
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full bg-white dark:bg-black"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDelete}
              disabled={isDeleting || confirmText !== 'DELETE'}
              variant="destructive"
            >
              {isDeleting ? 'Deleting...' : 'Delete My Account'}
            </Button>
            <Button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText('');
              }}
              disabled={isDeleting}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      variant="destructive"
    >
      Delete Account
    </Button>
  );
}

