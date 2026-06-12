import React, { useMemo } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Home, Users, CreditCard, Crown, TrendingUp, AlertTriangle, MessageSquare, Trash2 } from 'lucide-react';
import type { AdminStats, Listing } from '../../types';
import { PURPLE, PURPLE_LIGHT, PURPLE_PALE, PURPLE_FAINT, CHART_COLORS, fmtDate, fmtGEL, _flash } from './AdminPanel';

interface Props {
 stats: AdminStats;
 localListings: Listing[];
 dbListings: any[];
 onDeleteLocal: (id: string) => void;
 isDark: boolean; txtMain: string; txtSub: string; bgCard: string; brdCard: string;
 setFeedback: React.Dispatch<React.SetStateAction<string|null>>;
}

function StatCard({ icon: Icon, label, value, isDark }: { icon: React.ElementType; label: string; value: string | number; isDark: boolean }) {
 return (
 <div className={`rounded-2xl border p-4 flex items-center gap-3 transition-all ${isDark ? 'bg-[#1A1A1E] border-[#2A2A32]' : 'bg-white border-gray-200'}`}>
  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EDE9FE' }}>
  <Icon size={18} style={{ color: PURPLE }} />
  </div>
  <div className="flex-1 min-w-0">
  <p className={`text-[10px] font-semibold mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
  <p className={`text-lg font-black leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
  </div>
 </div>
 );
}

function ChartCard({ title, children, isDark, bgCard, brdCard }: { title: string; children: React.ReactNode; isDark: boolean; bgCard: string; brdCard: string }) {
 return (
 <div className={`rounded-2xl border p-4 ${bgCard} ${brdCard}`}>
  <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
  {children}
 </div>
 );
}

export default function DashboardTab({ stats, localListings, dbListings, onDeleteLocal, isDark, txtMain, txtSub, bgCard, brdCard, setFeedback }: Props) {
 const revData = useMemo(() => {
 const d = []; for (let i = 6; i >= 0; i--) { const dt = new Date(); dt.setDate(dt.getDate() - i); d.push({ name: fmtDate(dt.toISOString()), revenue: Math.floor(Math.random() * 200) + 50, listings: Math.floor(Math.random() * 15) + 3 }); }
 return d;
 }, []);

 const listTypeData = useMemo(() => {
 const t = { sale: 0, rent: 0, pledge: 0, mortgage: 0, daily_rent: 0 };
 [...dbListings, ...localListings].forEach(l => { if (l.type in t) t[l.type as keyof typeof t]++; });
 return Object.entries(t).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k, value: v }));
 }, [dbListings, localListings]);

 const vipData = useMemo(() => [
 { name: 'Basic', sales: Math.floor(Math.random() * 30) + 10 },
 { name: 'Super', sales: Math.floor(Math.random() * 20) + 5 },
 { name: 'Premium', sales: Math.floor(Math.random() * 10) + 2 },
 ], []);

 const tooltipStyle = { background: isDark ? '#1A1A1E' : '#fff', border: `1px solid ${isDark ? '#2A2A32' : '#E5E7EB'}`, borderRadius: 12, color: isDark ? '#fff' : '#111' };

 return (
 <div className="space-y-5">
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
  <StatCard icon={Home} label="განცხადებები" value={stats.totalListings} isDark={isDark} />
  <StatCard icon={Users} label="მომხმარებლები" value={stats.totalUsers} isDark={isDark} />
  <StatCard icon={CreditCard} label="სულ ბალანსი" value={fmtGEL(stats.totalBalance)} isDark={isDark} />
  <StatCard icon={Crown} label="აქტიური VIP" value={stats.activePackages} isDark={isDark} />
  <StatCard icon={TrendingUp} label="შემოსავალი" value={fmtGEL(stats.totalRevenue)} isDark={isDark} />
  <StatCard icon={CreditCard} label="ტრანზაქციები" value={stats.totalTransactions} isDark={isDark} />
  <StatCard icon={AlertTriangle} label="ღია ბილეთები" value={stats.openTickets} isDark={isDark} />
  <StatCard icon={Home} label="ახალი" value={stats.recentListings} isDark={isDark} />
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
  <ChartCard title="შემოსავლის დინამიკა" isDark={isDark} bgCard={bgCard} brdCard={brdCard}>
   <ResponsiveContainer width="100%" height={220}>
   <AreaChart data={revData}>
    <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={PURPLE} stopOpacity={0.3} /><stop offset="95%" stopColor={PURPLE} stopOpacity={0} /></linearGradient></defs>
    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2A2A32' : '#E5E7EB'} />
    <XAxis dataKey="name" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 11 }} />
    <YAxis tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 11 }} />
    <Tooltip contentStyle={tooltipStyle} />
    <Area type="monotone" dataKey="revenue" stroke={PURPLE} fill="url(#rg)" strokeWidth={2} />
   </AreaChart>
   </ResponsiveContainer>
  </ChartCard>

  <ChartCard title="განცხადებები ტიპის მიხედვით" isDark={isDark} bgCard={bgCard} brdCard={brdCard}>
   <ResponsiveContainer width="100%" height={220}>
   <PieChart>
    <Pie data={listTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
    {listTypeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
    </Pie>
    <Tooltip contentStyle={tooltipStyle} />
    <Legend />
   </PieChart>
   </ResponsiveContainer>
  </ChartCard>

  <ChartCard title="VIP გაყიდვები" isDark={isDark} bgCard={bgCard} brdCard={brdCard}>
   <ResponsiveContainer width="100%" height={220}>
   <BarChart data={vipData}>
    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2A2A32' : '#E5E7EB'} />
    <XAxis dataKey="name" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 11 }} />
    <YAxis tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 11 }} />
    <Tooltip contentStyle={tooltipStyle} />
    <Bar dataKey="sales" fill={PURPLE} radius={[6, 6, 0, 0]} />
   </BarChart>
   </ResponsiveContainer>
  </ChartCard>

  <div className={`rounded-2xl border p-4 ${bgCard} ${brdCard}`}>
   <h3 className={`text-sm font-bold mb-3 ${txtMain}`}>ბოლო განცხადებები</h3>
   <div className="space-y-2">
   {localListings.slice(0, 5).map(l => (
    <div key={l.id} className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? 'border-[#2A2A32]' : 'border-gray-100'}`}>
    <div className="flex items-center gap-2.5">
     <img src={l.image} className="w-8 h-8 rounded-lg object-cover" alt="" />
     <div>
     <p className={`text-xs font-semibold ${txtMain} truncate max-w-[200px]`}>{l.title}</p>
     <p className={`text-[10px] ${txtSub}`}>{l.city} {l.priceLari.toLocaleString()} GEL</p>
     </div>
    </div>
    <button onClick={() => { onDeleteLocal(l.id); _flash('განცხადება წაიშალა', setFeedback); }} className="text-rose-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
     <Trash2 size={12} />
    </button>
    </div>
   ))}
   {localListings.length === 0 && <p className={`text-xs ${txtSub} text-center py-4`}>განცხადება არ არის</p>}
   </div>
  </div>
  </div>
 </div>
 );
}
