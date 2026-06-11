import React, { useState } from 'react';
import { RefreshCw, Edit3, Copy, Check } from 'lucide-react';
import type { SupportTemplate } from '../../types';

interface Props {
  templates: SupportTemplate[];
  onRefresh: () => void;
  isDark: boolean; txtMain: string; txtSub: string; bgCard: string; brdCard: string;
}

export default function TemplatesTab({ templates, onRefresh, isDark, txtMain, txtSub, bgCard, brdCard }: Props) {
  const [copied, setCopied] = useState<string|null>(null);

  const copyContent = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(()=>setCopied(null),2000);
  };

  const cats: Record<string,string> = { all:'ყველა', listings:'განცხადებები', payments:'გადახდები', vip:'VIP', account:'ანგარიში', safety:'უსაფრთხოება', general:'ზოგადი' };

  return (
    <div className={`rounded-2xl border ${bgCard} ${brdCard} overflow-hidden`}>
      <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark?'border-[#2A2A32]':'border-gray-100'}`}>
        <h3 className={`text-sm font-bold ${txtMain}`}>შაბლონები ({templates.length})</h3>
        <button onClick={onRefresh} className={`flex items-center gap-1 text-[11px] ${txtSub} hover:text-gray-900 cursor-pointer`}><RefreshCw size={12}/>განახლება</button>
      </div>
      <div className="space-y-0">
        {templates.map(t=> (
          <div key={t.id} className={`px-5 py-3 border-b last:border-0 ${isDark?'border-[#2A2A32]':'border-gray-100'}`}>
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isDark?'bg-[#25252B] text-gray-300':'bg-gray-100 text-gray-600'}`}>{cats[t.category]||t.category}</span>
                <p className={`text-xs font-bold ${txtMain}`}>{t.title}</p>
              </div>
              <button onClick={()=>copyContent(t.id,t.content)} className={`p-1 rounded-lg transition-colors cursor-pointer ${copied===t.id?'text-emerald-500':'text-gray-400 hover:text-gray-600'}`} title="კოპირება">
                {copied===t.id?<Check size={13}/>:<Copy size={13}/>}
              </button>
            </div>
            <p className={`text-[11px] ${txtSub} whitespace-pre-wrap`}>{t.content}</p>
            <p className={`text-[10px] ${txtSub} mt-1`}>გამოყენება: {t.usage_count||0}</p>
          </div>
        ))}
        {templates.length===0&&<p className={`text-xs ${txtSub} text-center py-8`}>შაბლონი არ არის</p>}
      </div>
    </div>
  );
}
