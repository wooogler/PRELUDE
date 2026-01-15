'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, Check } from 'lucide-react';

interface CopyLinkButtonProps {
  url: string;
  className?: string;
  iconOnly?: boolean;
}

export default function CopyLinkButton({ url, className = '', iconOnly = false }: CopyLinkButtonProps) {
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
      variant="ghost"
      size={iconOnly ? "icon" : "sm"}
      className={`text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 ${className}`}
      title={url}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-1" />
          {!iconOnly && "Copied"}
        </>
      ) : (
        <>
          <Link className="w-4 h-4 mr-1" />
          {!iconOnly && "Copy Link"}
        </>
      )}
    </Button>
  );
}
