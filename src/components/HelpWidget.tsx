import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, X, ChevronRight, ChevronDown, ChevronUp,
  Send, Loader2, CheckCircle2, ArrowLeft, Ticket, BookOpen,
  Clock, User as UserIcon
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const FAQ_ITEMS = [
  { q: 'როგორ დავამატო განცხადება?', a: 'ნავიგაციაში "+" ღილაკზე დააჭირეთ. საჭიროა ავტორიზაცია. შეავსეთ ფორმა და დააჭირეთ "გამოქვეყნება".' },
  { q: 'VIP სტატუსი რა ღირს?', a: 'VIP — 15₾/კვირა, Super VIP — 35₾/კვირა, Premium — 60₾/კვირა. ბალანსიდან ჩამოიჭრება.' },
  { q: 'განცხადება როდის ჩანს?', a: 'გამოქვეყნებისთანავე ჩანს ძიებაში. VIP განცხადებები სიის თავში ჩანს.' },
  { q: 'ფოტო რამდენი შეიძლება?', a: 'მაქსიმუმ 20 ფოტო ერთ განცხადებაზე. ფორმატი: JPG, PNG, WEBP. მაქს. ზომა 10MB.' },
  { q: 'განცხადების წაშლა შეიძლება?', a: 'კი — "ჩემი პროფილი" → "ჩემი განცხადებები" გვერდზე, წაშლის ღილაკი.' },
  { q: 'პაროლი დამავიწყდა?', a: 'შესვლის ფორმაში "პაროლის აღდგენა" → ელ-ფოსტაზე მოვა ლინკი 5 წუთში.' },
  { q: 'ანგარიშის წაშლა?', a: 'პროფილის პარამეტრებში "ანგარიშის წაშლა". მონაცემები 30 დღეში წაიშლება.' },
];

interface ChatMessage {
  id: string;
  text: string;
  from: 'user' | 'support';
  time: string;
}

const BOT_REPLIES = [
  'გამარჯობა! თქვენი შეტყობინება მივიღეთ. ოპერატორი მალე დაგიკავშირდება.',
  'გმადლობთ, რომ დაგვიკავშირდით. ჩვენი გუნდი მალე გიპასუხებთ.',
  'შეტყობინება მიღებულია! სამუშაო საათებში (ორშ–პარ 10–19) სწრაფად ვპასუხობთ.',
];

type View = 'home' | 'chat' | 'ticket' | 'faq';

export default function HelpWidget() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('home');

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'bot-0', text: 'გამარჯობა! 👋 adjarahome.ge-ს მხარდაჭერაში გადარჩენილხართ. როგორ შეგვიძლია დაგეხმაროთ?', from: 'support', time: 'ახლა' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Ticket state
  const [tName, setTName] = useState(profile?.name || '');
  const [tEmail, setTEmail] = useState(user?.email || '');
  const [tSubject, setTSubject] = useState('');
  const [tMessage, setTMessage] = useState('');
  const [tSending, setTSending] = useState(false);
  const [tSent, setTSent] = useState(false);
  const [tError, setTError] = useState<string | null>(null);

  // FAQ accordion
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    if (open) setView('home');
  }, [open]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');
    setChatSending(true);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`, text, from: 'user',
      time: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, userMsg]);

    if (isSupabaseConfigured) {
      await Promise.resolve(supabase.from('support_chats').insert({
        user_id: user?.id ?? null,
        user_name: profile?.name || tName || 'სტუმარი',
        message: text,
      })).then(() => null).catch(() => null);
    }

    setTimeout(() => {
      const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
      setChatMessages(prev => [...prev, {
        id: `s-${Date.now()}`, text: reply, from: 'support',
        time: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' }),
      }]);
      setChatSending(false);
    }, 1200);
  };

  const sendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tMessage.trim() || !tSubject.trim() || !tEmail.trim()) return;
    setTSending(true);
    setTError(null);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user?.id ?? null,
        name: tName || 'სტუმარი',
        email: tEmail,
        subject: tSubject,
        message: tMessage,
        status: 'open',
      });
      if (error) { setTError('შეცდომა: ' + error.message); setTSending(false); return; }
    }

    setTSent(true);
    setTSending(false);
    setTSubject('');
    setTMessage('');
  };

  const Header = ({ title, sub }: { title: string; sub?: string }) => (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-5 py-4 flex items-center gap-3 shrink-0">
      {view !== 'home' && (
        <button onClick={() => setView('home')} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white cursor-pointer transition-colors shrink-0">
          <ArrowLeft size={16} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white font-black text-[14px] leading-tight">{title}</p>
        {sub && <p className="text-gray-400 text-[11px] mt-0.5">{sub}</p>}
      </div>
      <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-colors shrink-0">
        <X size={16} />
      </button>
    </div>
  );

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 ${
          open ? 'bg-gray-900 scale-95' : 'bg-blue-600 hover:bg-blue-500 hover:scale-110'
        }`}
        title="დახმარება"
      >
        {open
          ? <X size={20} className="text-white" />
          : <MessageCircle size={22} className="text-white" />
        }
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow">1</span>
        )}
      </button>

      {/* Widget panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
          style={{ maxHeight: '580px' }}>

          {/* ─── HOME ─── */}
          {view === 'home' && (
            <>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-5 pt-6 pb-10 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4"><path d="M10 2L3 8v10h5v-5h4v5h5V8L10 2z" fill="white"/></svg>
                    </div>
                    <span className="text-white font-black text-[13px]">adjarahome.ge</span>
                  </div>
                  <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                <h2 className="text-white font-black text-[20px] leading-tight">გამარჯობა! 👋</h2>
                <p className="text-gray-400 text-[12px] mt-1">როგორ შეგვიძლია დაგეხმაროთ?</p>
              </div>

              <div className="flex-1 overflow-y-auto px-4 -mt-6 pb-4 space-y-3">
                {[
                  {
                    view: 'chat' as View,
                    icon: <MessageCircle size={20} className="text-blue-500" />,
                    bg: 'bg-blue-50',
                    title: 'Customer Service ჩატი',
                    sub: 'ოპერატორი პასუხობს 10 წთ-ში',
                    badge: (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />ონლაინ
                      </span>
                    ),
                  },
                  {
                    view: 'ticket' as View,
                    icon: <Ticket size={20} className="text-violet-500" />,
                    bg: 'bg-violet-50',
                    title: 'Support Ticket',
                    sub: 'პასუხი ელ-ფოსტაზე 24 სთ-ში',
                    badge: null,
                  },
                  {
                    view: 'faq' as View,
                    icon: <BookOpen size={20} className="text-amber-500" />,
                    bg: 'bg-amber-50',
                    title: 'FAQ — ხ.დ. კითხვები',
                    sub: `${FAQ_ITEMS.length} პასუხი მზადაა`,
                    badge: null,
                  },
                ].map(item => (
                  <button
                    key={item.view}
                    onClick={() => setView(item.view)}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3.5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer text-left"
                  >
                    <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-[13px]">{item.title}</p>
                        {item.badge}
                      </div>
                      <p className="text-gray-400 text-[11px] mt-0.5">{item.sub}</p>
                    </div>
                    <ChevronRight size={15} className="text-gray-300 shrink-0" />
                  </button>
                ))}

                <div className="flex items-center gap-2 pt-1 pb-2 justify-center">
                  <Clock size={11} className="text-gray-400" />
                  <p className="text-[10px] text-gray-400">სამუშაო საათები: ორშ–პარ 10:00–19:00</p>
                </div>
              </div>
            </>
          )}

          {/* ─── CHAT ─── */}
          {view === 'chat' && (
            <>
              <Header title="Customer Service ჩატი" sub="ოპერატორი მალე დაგიკავშირდება" />
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                    {msg.from === 'support' && (
                      <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5"><path d="M10 2L3 8v10h5v-5h4v5h5V8L10 2z" fill="white"/></svg>
                      </div>
                    )}
                    <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                      msg.from === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                    }`}>
                      <p className="text-[13px] leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.from === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</p>
                    </div>
                    {msg.from === 'user' && (
                      <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <UserIcon size={13} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {chatSending && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5"><path d="M10 2L3 8v10h5v-5h4v5h5V8L10 2z" fill="white"/></svg>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                      {[0,1,2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
              <div className="px-3 py-3 border-t border-gray-100 bg-white shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                    placeholder="შეტყობინება..."
                    className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    onClick={sendChat}
                    disabled={!chatInput.trim() || chatSending}
                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 rounded-xl flex items-center justify-center cursor-pointer transition-colors disabled:cursor-not-allowed shrink-0"
                  >
                    <Send size={13} className={chatInput.trim() ? 'text-white' : 'text-gray-400'} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ─── TICKET ─── */}
          {view === 'ticket' && (
            <>
              <Header title="Support Ticket" sub="ვპასუხობთ 24 საათში" />
              <div className="flex-1 overflow-y-auto">
                {tSent ? (
                  <div className="flex flex-col items-center justify-center gap-3 p-8 text-center h-full">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={28} className="text-emerald-600" />
                    </div>
                    <h3 className="font-black text-gray-900 text-[16px]">ტიკეტი გაგზავნილია!</h3>
                    <p className="text-gray-500 text-[12px]">24 საათის განმავლობაში პასუხს მიიღებთ <strong>{tEmail}</strong>-ზე.</p>
                    <button
                      onClick={() => { setTSent(false); setView('home'); }}
                      className="mt-2 bg-gray-900 text-white font-bold px-5 py-2.5 rounded-xl text-[12px] cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                      მთავარი
                    </button>
                  </div>
                ) : (
                  <form onSubmit={sendTicket} className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5">სახელი</label>
                        <input type="text" value={tName} onChange={e => setTName(e.target.value)} placeholder="სახელი"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-[12px] focus:outline-none focus:border-gray-900 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5">ელ-ფოსტა *</label>
                        <input type="email" value={tEmail} onChange={e => setTEmail(e.target.value)} placeholder="mail@..." required
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-[12px] focus:outline-none focus:border-gray-900 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1.5">თემა *</label>
                      <select value={tSubject} onChange={e => setTSubject(e.target.value)} required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-[12px] focus:outline-none focus:border-gray-900 transition-colors cursor-pointer">
                        <option value="">აირჩიეთ...</option>
                        <option>ანგარიშის პრობლემა</option>
                        <option>განცხადების პრობლემა</option>
                        <option>გადახდის პრობლემა</option>
                        <option>ტექნიკური ხარვეზი</option>
                        <option>სხვა</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1.5">შეტყობინება *</label>
                      <textarea value={tMessage} onChange={e => setTMessage(e.target.value)}
                        placeholder="დეტალურად აღწერეთ პრობლემა..." required rows={4}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-[12px] resize-none focus:outline-none focus:border-gray-900 transition-colors" />
                    </div>
                    {tError && <p className="text-red-600 text-[11px] font-medium bg-red-50 rounded-xl px-3 py-2">{tError}</p>}
                    <button type="submit" disabled={tSending}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-2xl text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60">
                      {tSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
                      {tSending ? 'იგზავნება...' : 'ტიკეტის გაგზავნა'}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}

          {/* ─── FAQ ─── */}
          {view === 'faq' && (
            <>
              <Header title="ხშირად დასმული კითხვები" sub={`${FAQ_ITEMS.length} პასუხი`} />
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {FAQ_ITEMS.map((item, i) => (
                  <div key={i} className="px-4">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
                    >
                      <span className="text-[13px] font-semibold text-gray-900 group-hover:text-blue-600 transition-colors pr-3 leading-snug">{item.q}</span>
                      {expandedFaq === i
                        ? <ChevronUp size={15} className="text-blue-600 shrink-0" />
                        : <ChevronDown size={15} className="text-gray-300 shrink-0" />
                      }
                    </button>
                    {expandedFaq === i && (
                      <p className="pb-4 text-[12px] text-gray-600 leading-relaxed -mt-1">{item.a}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
