import React from 'react';
import { cn } from '@/lib/utils';
export type CalloutVariant = 'info'|'warning'|'error'|'success'|'default';
export interface CalloutProps { variant?: CalloutVariant; title?: string; icon?: React.ReactNode; children: React.ReactNode; className?: string; }
const VS: Record<CalloutVariant,{c:string;t:string}> = {
  default:{c:'bg-muted border-border',t:'text-foreground'},
  info:{c:'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',t:'text-blue-900 dark:text-blue-100'},
  warning:{c:'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800',t:'text-yellow-900 dark:text-yellow-100'},
  error:{c:'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',t:'text-red-900 dark:text-red-100'},
  success:{c:'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',t:'text-green-900 dark:text-green-100'},
};
export function Callout({variant='default',title,icon,children,className}:CalloutProps) {
  const s=VS[variant];
  return <div className={cn('rounded-lg border p-4',s.c,className)} role={variant==='error'?'alert':'note'}>
    <div className="flex gap-3">
      {icon&&<span className="mt-0.5 shrink-0" aria-hidden="true">{icon}</span>}
      <div className="flex-1 min-w-0">
        {title&&<p className={cn('font-semibold text-sm mb-1',s.t)}>{title}</p>}
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  </div>;
}
export default Callout;
