import React, { useState } from 'react';
import { RefreshCw, Loader2, Plus, Trash2, X } from 'lucide-react';
import type { UserPackage, AdminUserExtended } from '../../types';

interface Props {
  packages: UserPackage[];
  users: AdminUserExtended[];
  loading: boolean;
  onRefresh: () => void;
  onAssign: (uid: string, ptype: 'vip'|'vip_plus'|'super_vip', listings: number, days: number) => void;
  onRevoke: (pid: string) => void;
  isDark: boolean; txtMain: string; txtSub: string; bgCard: string; brdCard: string;
  search: string;
}

export default function PackagesTab({ packages, users, loading, onRefresh, onAssign, onRevoke, isDark, txtMain, txtSub, bgCard, brdCard, search }: Props) {
  const [modal, setModal] = useState<{userId:string}|null>(null);
  const [ptype, setPtype] = useState<'vip'|'vip_plus'|'super_vip'>('vip');
  const [listings, setListings] = useState('5');
  const [days, setDays] = useState('30');

  const filtered = packages.filter(p => !search || (p.user_name || '').toLowerCase().includes(search.toLowerCase()));

  const pkgLabel = (t: string) => {
    switch(t) { case 'vip': return 'VIP'; case 'vip_plus': return 'VIP+'; case 'super_vip': return 'Super VIP'; }
    return t;
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-4 ${bgCard} ${brdCard}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-bold ${txtMain}`}>VIP პაკეტები ({filtered.length})</h3>
          <button onClick={onRefresh} className={`flex items-center gap-1 text-[11px] ${txtSub} hover:text-gray-900 cursor-pointer`}>
            <RefreshCw size={12} className={loading?'animate-spin':''}/>განახლება
          </button>
        </div>
        {loading?(
          <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-gray-300"/></div>
        ):(
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className={`text-[10px] font-bold uppercase tracking-wider ${txtSub} border-b ${isDark?'border-[#2A2A32]':'border-gray-100'}`}><th className="px-4 py-2">მომხმარებელი</th><th className="px-4 py-2">პაკეტი</th><th className="px-4 py-2">დარჩენილი</th><th className="px-4 py-2">ვადა</th><th className="px-4 py-2"></th></tr></thead>
              <tbody>
                {filtered.map(p=>(
                  <tr key={p.id} className={`border-b last:border-0 ${isDark?'border-[#2A2A32]':'border-gray-50'}`}>
                    <td className={`px-4 py-2 text-xs font-semibold ${txtMain}`}>{p.user_name||'უცნობი'}</td>
                    <td className="px-4 py-2"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white`} style={{background:p.package_type==='super_vip'?'#7C3AED':p.package_type==='vip_plus'?'#A78BFA':'#C4B5FD',color:p.package_type==='vip'?'#4B5563':'#fff'}}>{pkgLabel(p.package_type)}</span></td>
                    <td className={`px-4 py-2 text-xs ${txtSub}`}>{p.listings_remaining}/{p.total_listings}</td>
                    <td className={`px-4 py-2 text-xs ${txtSub}`}>{p.expires_at?new Date(p.expires_at).toLocaleDateString('ka-GE'):'—'}</td>
                    <td className="px-4 py-2"><button onClick={()=>onRevoke(p.id)} className="text-rose-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg cursor-pointer"><Trash2 size={12}/></button></td>
                  </tr>
                ))}
                {filtered.length===0&&<tr><td colSpan={5} className={`text-xs ${txtSub} text-center py-8`}>პაკეტი არ არის</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <button onClick={()=>setModal({userId:users[0]?.id||''})} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer transition-colors hover:opacity-90" style={{background:'#7C3AED'}}><Plus size={14}/>პაკეტის მინიჭება</button>

      {modal&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
          <div className={`rounded-2xl p-5 w-full max-w-sm shadow-2xl ${bgCard} ${brdCard} border`}>
            <h3 className={`text-sm font-bold mb-3 ${txtMain}`}>VIP პაკეტის მინიჭება</h3>
            <label className={`text-[11px] font-semibold mb-1 block ${txtSub}`}>მომხმარებელი</label>
            <select value={modal.userId} onChange={e=>setModal({userId:e.target.value})} className={`w-full border rounded-xl px-3 py-2 text-sm mb-2 outline-none ${isDark?'bg-[#25252B] border-[#2A2A32] text-white':'bg-white border-gray-200 text-gray-900'}`}>
              {users.map(u=>(<option key={u.id} value={u.id}>{u.name||u.email}</option>))}
            </select>
            <label className={`text-[11px] font-semibold mb-1 block ${txtSub}`}>პაკეტი</label>
            <div className="flex gap-1 mb-2">
              {(['vip','vip_plus','super_vip'] as const).map(t=> (
                <button key={t} onClick={()=>setPtype(t)} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${ptype===t?'text-white':'text-gray-500'}`} style={ptype===t?{background:'#7C3AED'}:{background:isDark?'#25252B':'#F3F4F6'}}>{t==='vip'?'VIP':t==='vip_plus'?'VIP+':'Super'}</button>
              ))}
            </div>
            <div className="flex gap-2 mb-3">
              <div className="flex-1"><label className={`text-[11px] font-semibold mb-1 block ${txtSub}`}>განცხადებები</label><input type="number" value={listings} onChange={e=>setListings(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-sm outline-none ${isDark?'bg-[#25252B] border-[#2A2A32] text-white':'bg-white border-gray-200 text-gray-900'}`}/></div>
              <div className="flex-1"><label className={`text-[11px] font-semibold mb-1 block ${txtSub}`}>დღეები</label><input type="number" value={days} onChange={e=>setDays(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-sm outline-none ${isDark?'bg-[#25252B] border-[#2A2A32] text-white':'bg-white border-gray-200 text-gray-900'}`}/></div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setModal(null)} className={`flex-1 py-2 rounded-xl text-xs font-semibold cursor-pointer ${isDark?'text-gray-400 bg-[#25252B] hover:bg-[#2A2A32]':'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}>გაუქმება</button>
              <button onClick={()=>{onAssign(modal.userId,ptype,parseInt(listings)||5,parseInt(days)||30);setModal(null);}} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer" style={{background:'#7C3AED'}}>მინიჭება</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
