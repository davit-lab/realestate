import React from 'react';
import { MessageSquare, Eye, Loader2 } from 'lucide-react';

interface Props { isDark: boolean; txtMain: string; txtSub: string; bgCard: string; brdCard: string; }

export default function ChatsTab({ isDark, txtMain, txtSub, bgCard, brdCard }: Props) {
 return (
 <div className={`rounded-2xl border p-8 ${bgCard} ${brdCard} text-center`}>
  <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center`} style={{background:'#EDE9FE'}}>
  <MessageSquare size={28} style={{color:'#7C3AED'}}/>
  </div>
  <h3 className={`text-sm font-bold mb-2 ${txtMain}`}>ჩატების მონიტორინგი</h3>
  <p className={`text-xs ${txtSub} max-w-sm mx-auto leading-relaxed mb-4`}>
  ამ განყოფილებაში ადმინი შეძლებს ყველა მომხმარებლის ჩატის ნახვას, მოდერაციას და მართვას.
  <br/><br/>
  ფუნქცია მალე დაემატება — ამ ეტაპზე ჩატები ინახება Supabase-ში messages ცხრილში.
  </p>
  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold ${isDark?'bg-[#25252B] text-gray-400':'bg-gray-50 text-gray-500'}`}>
  <Loader2 size={14} className="animate-spin"/> მოდული მზადდება
  </div>
 </div>
 );
}
