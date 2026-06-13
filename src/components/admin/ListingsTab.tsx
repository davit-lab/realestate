import React, { useMemo, useState } from 'react';
import { RefreshCw, Trash2, Loader2, Power, PowerOff, AlertTriangle } from 'lucide-react';
import type { Listing } from '../../types';
import { fmtDate, _flash } from './AdminPanel';

interface Props {
 listings: any[];
 loading: boolean;
 onRefresh: () => void;
 onDelete: (id: string) => void;
 onDeleteLocal: (id: string) => void;
 onToggleStatus: (id: string, currentStatus: string) => void;
 isDark: boolean; txtMain: string; txtSub: string; bgCard: string; brdCard: string;
 search: string; setSearch: (s: string) => void;
 setFeedback: React.Dispatch<React.SetStateAction<string|null>>;
}

export default function ListingsTab({ listings, loading, onRefresh, onDelete, onDeleteLocal, onToggleStatus, isDark, txtMain, txtSub, bgCard, brdCard, search, setSearch, setFeedback }: Props) {
 const filtered = useMemo(() => listings.filter(l => !search || (l.title || l.location || '').toLowerCase().includes(search.toLowerCase())), [listings, search]);
 const [confirmDelete, setConfirmDelete] = useState<string|null>(null);

 const isActive = (l: any) => l.status === 'live';

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
    <th className="px-5 py-2.5">სათაური</th><th className="px-5 py-2.5">ფასი</th><th className="px-5 py-2.5">სტატუსი</th><th className="px-5 py-2.5">VIP</th><th className="px-5 py-2.5">ქალაქი</th><th className="px-5 py-2.5">თარიღი</th><th className="px-5 py-2.5 text-right">მოქმედება</th>
    </tr>
   </thead>
   <tbody>
    {filtered.map(l => (
    <tr key={l.id} className={`border-b last:border-0 ${isDark ? 'border-[#2A2A32]' : 'border-gray-50'} ${isActive(l) ? '' : isDark ? 'opacity-60' : 'opacity-50'} hover:${isDark ? 'bg-[#25252B]' : 'bg-gray-50/50'} transition-colors`}>
     <td className={`px-5 py-2.5 text-xs font-semibold ${txtMain}`}>{l.title || l.location || l.id.slice(0, 8)}</td>
     <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{l.price ? `${Number(l.price).toLocaleString()} ${l.currency || 'GEL'}` : '—'}</td>
     <td className="px-5 py-2.5">
     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive(l) ? 'bg-emerald-50 text-emerald-700' : isDark ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-50 text-rose-700'}`}>{isActive(l) ? 'აქტიური' : 'გამორთული'}</span>
     </td>
     <td className="px-5 py-2.5">
     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white`} style={{background:l.vip_status==='premium'?'#d97706':l.vip_status==='super'?'#059669':l.vip_status==='basic'?'#475569':'#E5E7EB',color:l.vip_status? '#fff' : '#374151'}}>{l.vip_status?.toUpperCase() || '—'}</span>
     </td>
     <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{l.city || '—'}</td>
     <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{l.created_at ? fmtDate(l.created_at) : '—'}</td>
     <td className="px-5 py-2.5">
      <div className="flex items-center justify-end gap-1">
       {/* Activate / Deactivate */}
       <button
        onClick={() => onToggleStatus(l.id, l.status || 'live')}
        title={isActive(l) ? 'გამორთვა' : 'ჩართვა'}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
         isActive(l)
          ? 'text-emerald-500 hover:bg-emerald-50'
          : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'
        }`}
       >
        {isActive(l) ? <Power size={13} /> : <PowerOff size={13} />}
       </button>

       {/* Delete */}
       {confirmDelete === l.id ? (
        <div className="flex items-center gap-1">
         <button
          onClick={() => { setConfirmDelete(null); }}
          className="text-[10px] px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
         >
          გაუქმება
         </button>
         <button
          onClick={() => {
           if (l.id.startsWith('local-') || !l.user_id) { onDeleteLocal(l.id); _flash('განცხადება წაიშალა', setFeedback); }
           else { onDelete(l.id); }
           setConfirmDelete(null);
          }}
          className="text-[10px] px-2 py-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600 cursor-pointer transition-colors flex items-center gap-1"
         >
          <AlertTriangle size={10} /> წაშლა
         </button>
        </div>
       ) : (
        <button
         onClick={() => setConfirmDelete(l.id)}
         className="text-rose-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
         title="წაშლა"
        >
         <Trash2 size={13} />
        </button>
       )}
      </div>
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
