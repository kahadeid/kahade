import { useState } from 'react';
import { MagnifyingGlass, Info, CheckCircle, Warning, User } from '@phosphor-icons/react';
import AdminLayout from '../components/layout/AdminLayout';

const logs = [
 { id: 'LOG-2001', action: 'KYC Approved', actor: 'admin@kahade.id', target: 'ahmad@email.com', details: 'KYC submission KYC-001 approved', severity: 'success', time: '20 Feb 2026 14:35' },
 { id: 'LOG-2000', action: 'User Suspended', actor: 'admin@kahade.id', target: 'budi@email.com', details: 'Account suspended: policy violation', severity: 'warning', time: '20 Feb 2026 13:22' },
 { id: 'LOG-1999', action: 'Withdrawal Approved', actor: 'admin@kahade.id', target: 'WD-201', details: 'Rp 2.000.000 withdrawal approved to BCA *1234', severity: 'info', time: '20 Feb 2026 12:10' },
 { id: 'LOG-1998', action: 'Dispute Resolved', actor: 'admin@kahade.id', target: 'D-087', details: 'Dispute resolved: full refund issued to buyer', severity: 'success', time: '20 Feb 2026 11:05' },
 { id: 'LOG-1997', action: 'Promo Created', actor: 'admin@kahade.id', target: 'FLASH25', details: '25% promo created with limit of 50 uses', severity: 'info', time: '20 Feb 2026 10:30' },
 { id: 'LOG-1996', action: 'Login Failed', actor: 'unknown', target: 'admin panel', details: '5 failed login attempts from IP 192.168.1.100', severity: 'error', time: '20 Feb 2026 09:15' },
];

const severityCls: Record<string,string> = {
 info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
 success: 'bg-green-100 text-green-600 dark:bg-green-900/30',
 warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30',
 error: 'bg-red-100 text-red-600 dark:bg-red-900/30',
};
const severityBadge: Record<string,string> = {
 info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
 success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
 warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
 error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const iconMap: Record<string, any> = { info: Info, success: CheckCircle, warning: Warning, error: Warning };

export default function AdminAuditLogs() {
 const [search, setSearch] = useState('');
 const [severity, setSeverity] = useState('Semua');
 const severities = ['Semua','Info','Success','Warning','Error'];
 const filtered = logs.filter(l =>
 (severity === 'Semua' || l.severity === severity.toLowerCase()) &&
 (!search || l.action.toLowerCase().includes(search.toLowerCase()) || l.actor.includes(search))
 );

 return (
 <AdminLayout title="Log Audit" subtitle="Rekam jejak semua aksi admin dan sistem">
 <div className="card overflow-hidden">
 <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30 flex-wrap gap-3">
 <div className="relative">
 <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari log..." className="pl-9 pr-4 py-2 rounded-xl border border-border text-sm bg-background focus:outline-none w-64" />
 </div>
 <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
 {severities.map(s => <button key={s} onClick={() => setSeverity(s)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${severity === s ? 'bg-background ' : 'text-muted-foreground hover:text-foreground'}`}>{s}</button>)}
 </div>
 </div>
 <div className="divide-y divide-border">
 {filtered.map(log => {
 const Icon = iconMap[log.severity] || Info;
 return (
 <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
 <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${severityCls[log.severity]}`}>
 <Icon size={16} weight="fill" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <span className="font-semibold text-sm">{log.action}</span>
 <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full uppercase ${severityBadge[log.severity]}`}>{log.severity}</span>
 </div>
 <p className="text-xs text-muted-foreground mb-1.5">{log.details}</p>
 <div className="flex items-center gap-3 text-[0.65rem] text-muted-foreground flex-wrap">
 <span className="flex items-center gap-1"><User size={10} />{log.actor}</span>
 <span>→ <span className="font-mono">{log.target}</span></span>
 <span className="ml-auto font-medium">{log.time}</span>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </AdminLayout>
 );
}
