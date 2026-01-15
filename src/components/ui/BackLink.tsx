'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

interface BackLinkProps extends ComponentProps<typeof Link> {
  label: string;
  className?: string;
}

export default function BackLink({ label, className, ...props }: BackLinkProps) {
  return (
    <Link
      {...props}
      className={`btn-ghost inline-flex items-center gap-1.5 ${className || ''}`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {label}
    </Link>
  );
}
