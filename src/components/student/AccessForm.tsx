'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AccessFormProps {
  assignmentId: string;
  shareToken: string;
}

export default function AccessForm({ assignmentId, shareToken }: AccessFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // Create or find existing session
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId,
          studentName: name,
          studentEmail: email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const { sessionId, isExisting } = await response.json();

      // Show feedback message
      if (isExisting) {
        setSuccessMessage('Welcome back! Resuming your previous session...');
      } else {
        setSuccessMessage('Session created! Redirecting to editor...');
      }

      // Small delay to show the message
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to editor with sessionId in URL
      router.push(`/s/${shareToken}/editor/${sessionId}`);
    } catch (err) {
      setError('Failed to start session. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="your.email@example.com"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading ? 'Starting...' : 'Start Assignment'}
      </button>
    </form>
  );
}
