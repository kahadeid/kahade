import React from 'react';
import { cn } from '@/lib/utils';
export interface PageLoaderProps { message?: string; className?: string; }
export function PageLoader({ message = 'Memuat...', className }: PageLoaderProps) {
  return (
    <div role="status" aria-live="polite" aria-label={message}
      className={cn('min-h-screen flex flex-col items-center justify-center gap-4 bg-background', className)}>
      <svg className="w-10 h-10 animate-spin text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      {message && <p className="text-sm text-muted-foreground font-medium">{message}</p>}
    </div>
  );
}
export default PageLoader;
