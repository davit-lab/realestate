import React, { useMemo } from 'react';
import { RefreshCw, Trash2, Loader2 } from 'lucide-react';
import type { Listing } from '../../types';
import { fmtDate, _flash } from './AdminPanel';

interface Props {
 listings: any[];
 loading: boolean;
 onRefresh: () => void;
 onDelete: (id: string) => void;
 onDeleteLocal: (id: string) => void;
 isDark: boolean; txtMain: string; txtSub: string; bgCard: string; brdCard: string;
 search: string; setSearch: (s: string) => void;
 setFeedback: React.Dispatch<React.SetStateAction<string|null>>;
}

export default function ListingsTab({ listings, loading, onRefresh, onDelete, onDeleteLocal, isDark, txtMain, txtSub, bgCard, brdCard, search, setSearch, setFeedback }: Props) {
 const filtered = useMemo(() => listings.filter(l => !search || (l.title || l.location || '').toLowerCase().includes(search.toLowerCase())), [listings, search]);

 return (
 <div className={`rounded-2xl border ${bgCard} ${brdCard} overflow-hidden`}>
  <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark ? 'border-[#2A2A32]' : 'border-gray-100'}`}>
  <h3 className={`text-sm font-bold ${txtMain}`}>განცხადებები ({filtered.length})</h3>
  <button onClick={onRefresh} className={`flex items-center gap-1 text-[11px] ${txtSub} hover:text-gray-900 cursor-pointer transition-colors`}>
   <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />განახლება
  </button>
  </div>
  {loading ? (
  <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-gray-300" /></div>
  ) : (
  <div className="overflow-x-auto">
   <table className="w-full text-left">
   <thead>
    <tr className={`text-[10px] font-bold uppercase tracking-wider ${txtSub} border-b ${isDark ? 'border-[#2A2A32]' : 'border-gray-100'}`}>
    <th className="px-5 py-2.5">სათაური</th><th className="px-5 py-2.5">ფასი</th><th className="px-5 py-2.5">სტატუსი</th><th className="px-5 py-2.5">VIP</th><th className="px-5 py-2.5">ქალაქი</th><th className="px-5 py-2.5">თარიღი</th><th className="px-5 py-2.5"></th>
    </tr>
   </thead>
   <tbody>
    {filtered.map(l => (
    <tr key={l.id} className={`border-b last:border-0 ${isDark ? 'border-[#2A2A32]' : 'border-gray-50'} hover:${isDark ? 'bg-[#25252B]' : 'bg-gray-50/50'} transition-colors`}>
     <td className={`px-5 py-2.5 text-xs font-semibold ${txtMain}`}>{l.title || l.location || l.id.slice(0, 8)}</td>
     <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{l.price ? `${Number(l.price).toLocaleString()} ${l.currency || 'GEL'}` : '—'}</td>
     <td className="px-5 py-2.5">
     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.status === 'live' ? 'bg-emerald-50 text-emerald-700' : isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>{l.status || '—'}</span>
     </td>
     <td className="px-5 py-2.5">
     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.vip_status === 'super_vip' ? 'text-white' : l.vip_status === 'vip+' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`} style={l.vip_status === 'super_vip' ? { background: '#7C3AED' } : {}}>{l.vip_status || '—'}</span>
     </td>
     <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{l.city || '—'}</td>
     <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{l.created_at ? fmtDate(l.created_at) : '—'}</td>
     <td className="px-5 py-2.5">
     <button onClick={() => { if (l.id.startsWith('local-') || !l.agent_id) { onDeleteLocal(l.id); _flash('განცხადება წაიშალა', setFeedback); } else { onDelete(l.id); } }} className="text-rose-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
      <Trash2 size={13} />
     </button>
     </td>
    </tr>
    ))}
    {filtered.length === 0 && <tr><td colSpan={7} className={`text-xs ${txtSub} text-center py-8`}>განცხადება არ არის</td></tr>}
   </tbody>
   </table>
  </div>
  )}
 </div>
 );
}
