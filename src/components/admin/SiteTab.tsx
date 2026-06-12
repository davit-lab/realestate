import React, { useState } from 'react';
import { Save, Trash2, Plus, Globe, ToggleLeft, ToggleRight } from 'lucide-react';
import type { SiteSetting, Announcement } from '../../types';

interface Props {
 settings: SiteSetting[];
 announcements: Announcement[];
 onSaveSetting: (key: string, value: string) => void;
 onSaveAnn: (id: string|null, content: string, isActive: boolean) => void;
 onDeleteAnn: (id: string) => void;
 isDark: boolean; txtMain: string; txtSub: string; bgCard: string; brdCard: string;
}

export default function SiteTab({ settings, announcements, onSaveSetting, onSaveAnn, onDeleteAnn, isDark, txtMain, txtSub, bgCard, brdCard }: Props) {
 const [editing, setEditing] = useState<Record<string,string>>({});
 const [newAnn, setNewAnn] = useState('');

 const boolSettings = ['hotels_enabled','tourism_enabled','ai_chat_enabled','map_view_enabled','vip_system_enabled'];

 return (
 <div className="space-y-5">
  {/* Feature toggles */}
  <div className={`rounded-2xl border p-4 ${bgCard} ${brdCard}`}>
  <h3 className={`text-sm font-bold mb-3 ${txtMain}`}>ფუნქციების მართვა</h3>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
   {settings.filter(s=>boolSettings.includes(s.key)).map(s=>{
   const isOn = s.value==='true';
   return (
    <div key={s.key} className={`flex items-center justify-between p-3 rounded-xl border ${isDark?'border-[#2A2A32]':'border-gray-100'}`}>
    <div><p className={`text-xs font-semibold ${txtMain}`}>{s.description||s.key}</p><p className={`text-[10px] ${txtSub}`}>{s.key}</p></div>
    <button onClick={()=>onSaveSetting(s.key,String(!isOn))} className="cursor-pointer">
     {isOn?<ToggleRight size={22} style={{color:'#7C3AED'}}/>:<ToggleLeft size={22} className="text-gray-400"/>}
    </button>
    </div>
   );
   })}
  </div>
  </div>

  {/* Text settings */}
  <div className={`rounded-2xl border p-4 ${bgCard} ${brdCard}`}>
  <h3 className={`text-sm font-bold mb-3 ${txtMain}`}>ტექსტური პარამეტრები</h3>
  <div className="space-y-2">
   {settings.filter(s=>!boolSettings.includes(s.key)).map(s=> (
   <div key={s.key} className={`flex items-center gap-2 p-2 rounded-xl ${isDark?'bg-[#25252B]':'bg-gray-50'}`}>
    <div className="flex-1 min-w-0"><p className={`text-[11px] font-semibold ${txtMain}`}>{s.description||s.key}</p>
    <input type="text" value={editing[s.key]!==undefined?editing[s.key]:s.value} onChange={e=>setEditing(p=>({...p,[s.key]:e.target.value}))} className={`w-full bg-transparent text-xs outline-none ${txtMain} placeholder-gray-400`}/>
    </div>
    <button onClick={()=>{onSaveSetting(s.key,editing[s.key]!==undefined?editing[s.key]:s.value);setEditing(p=>{const n={...p};delete n[s.key];return n;});}} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" style={{color:'#7C3AED'}}><Save size={13}/></button>
   </div>
   ))}
  </div>
  </div>

  {/* Announcements */}
  <div className={`rounded-2xl border p-4 ${bgCard} ${brdCard}`}>
  <h3 className={`text-sm font-bold mb-3 ${txtMain}`}>საიტის განცხადებები</h3>
  <div className="flex gap-2 mb-3">
   <input type="text" value={newAnn} onChange={e=>setNewAnn(e.target.value)} placeholder="ახალი განცხადება..." className={`flex-1 border rounded-xl px-3 py-2 text-xs outline-none ${isDark?'bg-[#25252B] border-[#2A2A32] text-white':'bg-white border-gray-200 text-gray-900'}`}/>
   <button onClick={()=>{if(newAnn.trim()){onSaveAnn(null,newAnn.trim(),true);setNewAnn('');}}} disabled={!newAnn.trim()} className="px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer disabled:opacity-40" style={{background:'#7C3AED'}}><Plus size={14}/></button>
  </div>
  <div className="space-y-2">
   {announcements.map(a=> (
   <div key={a.id} className={`flex items-center justify-between p-2.5 rounded-xl ${isDark?'bg-[#25252B]':'bg-gray-50'}`}>
    <div className="flex-1 min-w-0"><p className={`text-xs ${txtMain} truncate`}>{a.content}</p><p className={`text-[10px] ${txtSub}`}>{a.is_active?'აქტიური':'არააქტიური'} {a.created_at?new Date(a.created_at).toLocaleDateString('ka-GE'):''}</p></div>
    <div className="flex items-center gap-1">
    <button onClick={()=>onSaveAnn(a.id,a.content,!a.is_active)} className="cursor-pointer">{a.is_active?<ToggleRight size={18} style={{color:'#7C3AED'}}/>:<ToggleLeft size={18} className="text-gray-400"/>}</button>
    <button onClick={()=>onDeleteAnn(a.id)} className="text-rose-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg cursor-pointer"><Trash2 size={12}/></button>
    </div>
   </div>
   ))}
   {announcements.length===0&&<p className={`text-xs ${txtSub} text-center py-4`}>განცხადება არ არის</p>}
  </div>
  </div>
 </div>
 );
}
