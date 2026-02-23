import { useState } from 'react';
import { MagnifyingGlass, FunnelSimple, Download, Eye, DotsThree } from '@phosphor-icons/react';
import AdminLayout from '../components/layout/AdminLayout';

const users = [
 { id: 'U-001', name: 'Ahmad Rizki', email: 'ahmad@email.com', kyc: 'verified', status: 'active', joined: '15 Jan 2025', txCount: 47, volume: 'Rp 85.2M' },
 { id: 'U-002', name: 'Sari Dewi', email: 'sari@email.com', kyc: 'pending', status: 'active', joined: '12 Jan 2025', txCount: 12, volume: 'Rp 22.5M' },
 { id: 'U-003', name: 'Budi Santoso', email: 'budi@email.com', kyc: 'verified', status: 'suspended', joined: '8 Jan 2025', txCount: 5, volume: 'Rp 8.1M' },
 { id: 'U-004', name: 'Maya Putri', email: 'maya@email.com', kyc: 'rejected', status: 'active', joined: '5 Jan 2025', txCount: 28, volume: 'Rp 41.3M' },
 { id: 'U-005', name: 'Rizki Fadillah', email: 'rizki@email.com', kyc: 'verified', status: 'active', joined: '2 Jan 2025', txCount: 63, volume: 'Rp 124.7M' },
];

const kycCls: Record<string,string> = {
 verified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
 pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
 rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const statusCls: Record<string,string> = {
 active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
 suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminUsers() {
 const [search, setSearch] = useState('');
 const [tab, setTab] = useState('Semua');
 const tabs = ['Semua', 'Aktif', 'Suspended', 'KYC Pending'];

 const filtered = users.filter(u =>
 (tab === 'Semua' || (tab === 'Aktif' && u.status === 'active') || (tab === 'Suspended' && u.status === 'suspended') || (tab === 'KYC Pending' && u.kyc === 'pending')) &&
 (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search))
 );

 return (
 <AdminLayout title="Manajemen Pengguna" subtitle="Kelola semua pengguna platform">
 <div className="space-y-4">
 <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
 {tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-background ' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>)}
 </div>
 <div className="card overflow-hidden">
 <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
 <div className="relative">
 <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pengguna..." className="pl-9 pr-4 py-2 rounded-xl border border-border text-sm bg-background focus:outline-none w-64" />
 </div>
 <div className="flex gap-2">
 <button className="btn-secondary gap-2 text-sm px-3 py-2"><FunnelSimple size={15} /> Filter</button>
 <button className="btn-secondary gap-2 text-sm px-3 py-2"><Download size={15} /> Export</button>
 </div>
 </div>
 <table className="w-full text-sm">
 <thead className="border-b border-border bg-muted/20">
 <tr>{['ID','Pengguna','KYC','Status','Bergabung','Transaksi','Volume',''].map(h => <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr>
 </thead>
 <tbody className="divide-y divide-border">
 {filtered.map(u => (
 <tr key={u.id} className="hover:bg-muted/30 transition-colors group">
 <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.id}</td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{u.name.charAt(0)}</div>
 <div><p className="font-semibold leading-none">{u.name}</p><p className="text-xs text-muted-foreground mt-0.5">{u.email}</p></div>
 </div>
 </td>
 <td className="px-4 py-3"><span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full capitalize ${kycCls[u.kyc]}`}>{u.kyc}</span></td>
 <td className="px-4 py-3"><span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full capitalize ${statusCls[u.status]}`}>{u.status}</span></td>
 <td className="px-4 py-3 text-xs text-muted-foreground">{u.joined}</td>
 <td className="px-4 py-3 font-semibold text-center">{u.txCount}</td>
 <td className="px-4 py-3 font-semibold">{u.volume}</td>
 <td className="px-4 py-3"><button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-muted transition-all"><DotsThree size={16} /></button></td>
 </tr>
 ))}
 </tbody>
 </table>
 <div className="flex items-center justify-between px-5 py-3 border-t border-border text-xs text-muted-foreground">
 <span>Menampilkan {filtered.length} dari {users.length} pengguna</span>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
}
