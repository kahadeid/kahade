import { useState } from 'react';
import { MagnifyingGlass, FunnelSimple, Download, Eye } from '@phosphor-icons/react';
import AdminLayout from '@/components/layout/AdminLayout';

const transactions = [
 { id: 'KHD-2451', title: 'Laptop ASUS ROG', buyer: 'ahmad@email.com', seller: 'seller_081', amount: 'Rp 5.200.000', fee: 'Rp 130.000', status: 'active', label: 'Aktif', date: '18 Feb 2026' },
 { id: 'KHD-2450', title: 'iPhone 15 Pro', buyer: 'budi@email.com', seller: 'iphone_store', amount: 'Rp 14.500.000', fee: 'Rp 362.500', status: 'completed', label: 'Selesai', date: '17 Feb 2026' },
 { id: 'KHD-2449', title: 'Jasa Logo Design', buyer: 'sari@email.com', seller: 'jasa_design', amount: 'Rp 800.000', fee: 'Rp 20.000', status: 'completed', label: 'Selesai', date: '16 Feb 2026' },
 { id: 'KHD-2448', title: 'Kamera Sony A7', buyer: 'rizki@email.com', seller: 'camera_store', amount: 'Rp 18.000.000', fee: 'Rp 450.000', status: 'dispute', label: 'Sengketa', date: '15 Feb 2026' },
 { id: 'KHD-2447', title: 'MacBook Air M2', buyer: 'maya@email.com', seller: 'mac_seller', amount: 'Rp 15.000.000', fee: 'Rp 375.000', status: 'pending', label: 'Menunggu', date: '14 Feb 2026' },
 { id: 'KHD-2446', title: 'Jasa Web Dev', buyer: 'dito@email.com', seller: 'webdev_pro', amount: 'Rp 8.000.000', fee: 'Rp 200.000', status: 'cancelled', label: 'Dibatalkan', date: '13 Feb 2026' },
];

const statusCls: Record<string,string> = {
 active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
 completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
 pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
 dispute: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
 cancelled: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
};

export default function AdminTransactions() {
 const [search, setSearch] = useState('');
 const [tab, setTab] = useState('Semua');
 const tabs = ['Semua', 'Aktif', 'Selesai', 'Sengketa', 'Pending', 'Dibatalkan'];
 const labelMap: Record<string,string> = { Aktif: 'active', Selesai: 'completed', Sengketa: 'dispute', Pending: 'pending', Dibatalkan: 'cancelled' };
 const filtered = transactions.filter(t => (tab === 'Semua' || t.status === labelMap[tab]) && (!search || t.id.toLowerCase().includes(search.toLowerCase()) || t.title.toLowerCase().includes(search.toLowerCase())));

 return (
 <AdminLayout title="Manajemen Transaksi" subtitle="Monitor semua transaksi platform">
 <div className="space-y-4">
 <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit overflow-x-auto">
 {tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t ? 'bg-background ' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>)}
 </div>
 <div className="card overflow-hidden">
 <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
 <div className="relative">
 <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari transaksi..." className="pl-9 pr-4 py-2 rounded-xl border border-border text-sm bg-background focus:outline-none w-64" />
 </div>
 <div className="flex gap-2">
 <button className="btn-secondary gap-2 text-sm px-3 py-2"><FunnelSimple size={15} /> Filter</button>
 <button className="btn-secondary gap-2 text-sm px-3 py-2"><Download size={15} /> Export</button>
 </div>
 </div>
 <table className="w-full text-sm">
 <thead className="border-b border-border bg-muted/20">
 <tr>{['ID','Transaksi','Pembeli','Penjual','Nilai','Biaya','Status','Tanggal',''].map(h => <th key={h} className="px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr>
 </thead>
 <tbody className="divide-y divide-border">
 {filtered.map(tx => (
 <tr key={tx.id} className="hover:bg-muted/30 transition-colors group">
 <td className="px-4 py-3 font-mono text-xs">{tx.id}</td>
 <td className="px-4 py-3 font-semibold max-w-[140px] truncate">{tx.title}</td>
 <td className="px-4 py-3 text-xs text-muted-foreground">{tx.buyer}</td>
 <td className="px-4 py-3 text-xs text-muted-foreground">{tx.seller}</td>
 <td className="px-4 py-3 font-semibold">{tx.amount}</td>
 <td className="px-4 py-3 text-green-600 font-semibold">{tx.fee}</td>
 <td className="px-4 py-3"><span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${statusCls[tx.status]}`}>{tx.label}</span></td>
 <td className="px-4 py-3 text-xs text-muted-foreground">{tx.date}</td>
 <td className="px-4 py-3"><button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-muted transition-all"><Eye size={14} /></button></td>
 </tr>
 ))}
 </tbody>
 </table>
 <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">Menampilkan {filtered.length} dari {transactions.length} transaksi</div>
 </div>
 </div>
 </AdminLayout>
 );
}
