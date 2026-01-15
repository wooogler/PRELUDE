'use client';

import { useState } from 'react';
import { Button } from '@headlessui/react';

interface CopyLinkButtonProps {
  url: string;
  className?: string;
}

export default function CopyLinkButton({ url, className = '' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  return (
    <Button
      onClick={handleCopy}
      className={`text-sm text-blue-600 hover:text-blue-800 font-medium ${className}`}
      title={url}
    >
      {copied ? 'Copied!' : 'Copy Link'}
    </Button>
  );
}
