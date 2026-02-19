import React from 'react';
import { cn } from '@/lib/utils';
export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> { variant?:'default'|'primary'|'success'|'warning'|'error'|'outline'; onRemove?:()=>void; icon?:React.ReactNode; disabled?:boolean; children:React.ReactNode; }
const VS:Record<string,string>={default:'bg-muted text-muted-foreground',primary:'bg-foreground text-background',success:'bg-green-100 text-green-800',warning:'bg-yellow-100 text-yellow-800',error:'bg-red-100 text-red-800',outline:'bg-transparent border border-border text-foreground'};
export function Chip({variant='default',onRemove,icon,disabled=false,className,children,...props}:ChipProps) {
  return <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',VS[variant],disabled&&'opacity-50 cursor-not-allowed',className)} {...props}>
    {icon&&<span className="inline-flex shrink-0" aria-hidden="true">{icon}</span>}
    {children}
    {onRemove&&<button type="button" onClick={disabled?undefined:onRemove} className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-black/10 transition-colors focus:outline-none" aria-label="Hapus" disabled={disabled}><svg viewBox="0 0 24 24" className="w-2.5 h-2.5" stroke="currentColor" strokeWidth="3" fill="none" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg></button>}
  </span>;
}
export default Chip;
