import { useState } from 'react';
import { MagnifyingGlass, CheckCircle, X, Eye, Clock, IdentificationCard } from '@phosphor-icons/react';
import AdminLayout from '../components/layout/AdminLayout';

const submissions = [
 { id: 'KYC-001', user: 'Ahmad Rizki', email: 'ahmad@email.com', type: 'KTP', submitted: '20 Feb 2026 09:15', status: 'pending', avatar: 'A' },
 { id: 'KYC-002', user: 'Sari Dewi', email: 'sari@email.com', type: 'Paspor', submitted: '20 Feb 2026 08:30', status: 'pending', avatar: 'S' },
 { id: 'KYC-003', user: 'Budi Santoso', email: 'budi@email.com', type: 'KTP', submitted: '19 Feb 2026 17:45', status: 'approved', avatar: 'B' },
 { id: 'KYC-004', user: 'Maya Putri', email: 'maya@email.com', type: 'SIM', submitted: '19 Feb 2026 14:20', status: 'rejected', avatar: 'M' },
 { id: 'KYC-005', user: 'Rizki F.', email: 'rizki@email.com', type: 'KTP', submitted: '18 Feb 2026 11:00', status: 'pending', avatar: 'R' },
];

const statusCls: Record<string,string> = {
 pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
 approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
 rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const statusLabel: Record<string,string> = { pending: 'Pending', approved: 'Disetujui', rejected: 'Ditolak' };

export default function AdminKYC() {
 const [tab, setTab] = useState('Semua');
 const [search, setSearch] = useState('');
 const tabs = ['Semua', 'Pending', 'Disetujui', 'Ditolak'];
 const tabMap: Record<string,string> = { Pending: 'pending', Disetujui: 'approved', Ditolak: 'rejected' };
 const filtered = submissions.filter(s => (tab === 'Semua' || s.status === tabMap[tab]) && (!search || s.user.toLowerCase().includes(search.toLowerCase())));
 const pending = submissions.filter(s => s.status === 'pending').length;

 return (
 <AdminLayout title="Verifikasi KYC" subtitle="Review dan proses pengajuan identitas">
 <div className="space-y-5">
 <div className="grid grid-cols-3 gap-4">
 {[['Pending', pending, 'yellow'], ['Disetujui Hari Ini', 12, 'green'], ['Ditolak Hari Ini', 3, 'red']].map(([label, val, c]) => (
 <div key={String(label)} className="card p-4">
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : c === 'yellow' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}><IdentificationCard size={20} weight="duotone" /></div>
 <p className="text-2xl font-black">{val}</p>
 <p className="text-xs text-muted-foreground">{label}</p>
 </div>
 ))}
 </div>
 <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
 {tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-background ' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>)}
 </div>
 <div className="card overflow-hidden">
 <div className="flex items-center px-5 py-4 border-b border-border bg-muted/30">
 <div className="relative">
 <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pengguna..." className="pl-9 pr-4 py-2 rounded-xl border border-border text-sm bg-background focus:outline-none w-64" />
 </div>
 </div>
 <table className="w-full text-sm">
 <thead className="border-b border-border bg-muted/20">
 <tr>{['ID','Pengguna','Tipe ID','Diajukan','Status','Aksi'].map(h => <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr>
 </thead>
 <tbody className="divide-y divide-border">
 {filtered.map(s => (
 <tr key={s.id} className="hover:bg-muted/30 transition-colors">
 <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{s.avatar}</div>
 <div><p className="font-semibold leading-none">{s.user}</p><p className="text-xs text-muted-foreground">{s.email}</p></div>
 </div>
 </td>
 <td className="px-4 py-3"><span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">{s.type}</span></td>
 <td className="px-4 py-3 text-xs text-muted-foreground">{s.submitted}</td>
 <td className="px-4 py-3"><span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${statusCls[s.status]}`}>{statusLabel[s.status]}</span></td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-1">
 <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Eye size={14} /></button>
 {s.status === 'pending' && <>
 <button className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors"><CheckCircle size={14} weight="fill" /></button>
 <button className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"><X size={14} weight="bold" /></button>
 </>}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </AdminLayout>
 );
}
