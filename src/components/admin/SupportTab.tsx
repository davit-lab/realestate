import React, { useState } from 'react';
import { RefreshCw, Loader2, Send, X } from 'lucide-react';
import type { SupportTemplate } from '../../types';
import { SupportTicket } from './AdminPanel';
import { _flash } from './AdminPanel';

interface Props {
  tickets: SupportTicket[];
  templates: SupportTemplate[];
  loading: boolean;
  onRefresh: () => void;
  onUpdate: (id: string, status: string, response?: string) => void;
  isDark: boolean; txtMain: string; txtSub: string; bgCard: string; brdCard: string;
  setFeedback: React.Dispatch<React.SetStateAction<string|null>>;
}

export default function SupportTab({ tickets, templates, loading, onRefresh, onUpdate, isDark, txtMain, txtSub, bgCard, brdCard, setFeedback }: Props) {
  const [reply, setReply] = useState<{id:string;text:string}|null>(null);
  const [selTpl, setSelTpl] = useState('');

  const statusBadge = (s: string) => {
    switch(s) {
      case 'open': return 'bg-rose-50 text-rose-600';
      case 'in_progress': return 'bg-amber-50 text-amber-600';
      case 'resolved': return 'bg-emerald-50 text-emerald-600';
      case 'closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  const statusLabel = (s: string) => {
    switch(s) { case 'open': return 'ღია'; case 'in_progress': return 'მუშავდება'; case 'resolved': return 'გადაწყვეტილი'; case 'closed': return 'დახურული'; }
    return s;
  };

  const insertTemplate = (tplId: string) => {
    const tpl = templates.find(t => t.id === tplId);
    if (tpl && reply) setReply({ ...reply, text: reply.text ? reply.text + '\n\n' + tpl.content : tpl.content });
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border ${bgCard} ${brdCard} overflow-hidden`}>
        <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark?'border-[#2A2A32]':'border-gray-100'}`}>
          <h3 className={`text-sm font-bold ${txtMain}`}>საპორტის ბილეთები ({tickets.length})</h3>
          <button onClick={onRefresh} className={`flex items-center gap-1 text-[11px] ${txtSub} hover:text-gray-900 cursor-pointer`}>
            <RefreshCw size={12} className={loading?'animate-spin':''}/>განახლება
          </button>
        </div>
        {loading?(
          <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-gray-300"/></div>
        ):(
          <div className="space-y-0">
            {tickets.map(t=>(
              <div key={t.id} className={`px-5 py-3 border-b last:border-0 ${isDark?'border-[#2A2A32]':'border-gray-100'}`}>
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <p className={`text-xs font-bold ${txtMain}`}>{t.subject}</p>
                    <p className={`text-[10px] ${txtSub}`}>{t.user_name} {t.created_at?new Date(t.created_at).toLocaleDateString('ka-GE'):'—'}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(t.status)}`}>{statusLabel(t.status)}</span>
                </div>
                <p className={`text-xs ${txtSub} mb-2`}>{t.message}</p>
                {t.admin_response&&(
                  <div className={`rounded-lg p-2.5 mb-2 ${isDark?'bg-[#25252B]':'bg-gray-50'}`}>
                    <p className={`text-[10px] font-semibold ${txtMain} mb-0.5`}>ადმინის პასუხი:</p>
                    <p className={`text-xs ${txtSub}`}>{t.admin_response}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <select value={t.status} onChange={e=>onUpdate(t.id,e.target.value)} className={`text-[10px] border rounded-lg px-2 py-1 cursor-pointer outline-none ${isDark?'bg-[#25252B] border-[#2A2A32] text-white':'bg-white border-gray-200 text-gray-900'}`}>
                    <option value="open">ღია</option><option value="in_progress">მუშავდება</option><option value="resolved">გადაწყვეტილი</option><option value="closed">დახურული</option>
                  </select>
                  <button onClick={()=>setReply({id:t.id,text:''})} className="text-[11px] font-semibold cursor-pointer" style={{color:'#7C3AED'}}>პასუხის დაწერა</button>
                </div>
              </div>
            ))}
            {tickets.length===0&&<p className={`text-xs ${txtSub} text-center py-8`}>ბილეთი არ არის</p>}
          </div>
        )}
      </div>

      {/* Reply modal */}
      {reply&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
          <div className={`rounded-2xl p-5 w-full max-w-lg shadow-2xl ${bgCard} ${brdCard} border`}>
            <h3 className={`text-sm font-bold mb-3 ${txtMain}`}>ადმინის პასუხი</h3>
            {templates.length>0&&(
              <div className="mb-2">
                <select value={selTpl} onChange={e=>{setSelTpl(e.target.value);insertTemplate(e.target.value);}} className={`text-[11px] border rounded-lg px-2 py-1 cursor-pointer outline-none w-full ${isDark?'bg-[#25252B] border-[#2A2A32] text-white':'bg-white border-gray-200 text-gray-900'}`}>
                  <option value="">შაბლონის არჩევა...</option>
                  {templates.filter(t=>t.is_active).map(t=>(<option key={t.id} value={t.id}>{t.title}</option>))}
                </select>
              </div>
            )}
            <textarea value={reply.text} onChange={e=>setReply({...reply,text:e.target.value})} placeholder="პასუხი..." rows={5} className={`w-full border rounded-xl px-3 py-2 text-sm mb-3 outline-none resize-none ${isDark?'bg-[#25252B] border-[#2A2A32] text-white':'bg-white border-gray-200 text-gray-900'}`}/>
            <div className="flex gap-2">
              <button onClick={()=>setReply(null)} className={`flex-1 py-2 rounded-xl text-xs font-semibold cursor-pointer ${isDark?'text-gray-400 bg-[#25252B] hover:bg-[#2A2A32]':'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}>გაუქმება</button>
              <button onClick={()=>onUpdate(reply.id,'in_progress',reply.text)} disabled={!reply.text.trim()} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer disabled:opacity-40" style={{background:'#7C3AED'}}><Send size={12} className="inline mr-1"/>გაგზავნა</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
