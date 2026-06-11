import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle, X, ChevronRight, ChevronDown, ChevronUp,
  Send, Loader2, CheckCircle2, ArrowLeft, Ticket, BookOpen,
  Clock, User as UserIcon, Bot, HelpCircle, Sparkles
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TypingIndicator from './chat/TypingIndicator';

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
    <div className="bg-gradient-to-r from-ss-primary to-ss-primary-dark px-5 py-4 flex items-center gap-3 shrink-0">
      {view !== 'home' && (
        <button onClick={() => setView('home')} className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white cursor-pointer transition-colors shrink-0">
          <ArrowLeft size={16} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-[14px] leading-tight">{title}</p>
        {sub && <p className="text-purple-200 text-[11px] mt-0.5">{sub}</p>}
      </div>
      <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-purple-200 hover:text-white cursor-pointer transition-colors shrink-0">
        <X size={16} />
      </button>
    </div>
  );

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-colors relative ${
          open ? 'bg-gray-800 text-white' : 'bg-white text-ss-primary'
        }`}
        style={open ? undefined : { boxShadow: '0 8px 32px rgba(124, 58, 237, 0.25)' }}
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full border-2 border-white" />
        )}
      </motion.button>

      {/* Widget panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col premium-shadow"
            style={{ maxHeight: '600px' }}
          >

          {/* ─── HOME ─── */}
          {view === 'home' && (
            <>
              <div className="bg-gradient-to-r from-ss-primary to-ss-primary-dark px-5 pt-6 pb-10 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-[13px]">adjarahome.ge</span>
                  </div>
                  <button onClick={() => setOpen(false)} className="text-purple-200 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10">
                    <X size={16} />
                  </button>
                </div>
                <h2 className="text-white font-bold text-[20px] leading-tight">გამარჯობა! 👋</h2>
                <p className="text-purple-200 text-[12px] mt-1">როგორ შეგვიძლია დაგეხმაროთ?</p>
              </div>

              <div className="flex-1 overflow-y-auto px-4 -mt-6 pb-4 space-y-3">
                {[
                  {
                    view: 'chat' as View,
                    icon: <MessageCircle size={20} className="text-ss-primary" />,
                    bg: 'bg-purple-50',
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
                    icon: <Ticket size={20} className="text-ss-primary" />,
                    bg: 'bg-purple-50',
                    title: 'Support Ticket',
                    sub: 'პასუხი ელ-ფოსტაზე 24 სთ-ში',
                    badge: null,
                  },
                  {
                    view: 'faq' as View,
                    icon: <BookOpen size={20} className="text-ss-primary" />,
                    bg: 'bg-purple-50',
                    title: 'FAQ — ხ.დ. კითხვები',
                    sub: `${FAQ_ITEMS.length} პასუხი მზადაა`,
                    badge: null,
                  },
                ].map(item => (
                  <motion.button
                    key={item.view}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => setView(item.view)}
                    className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3.5 hover:border-purple-200 hover:shadow-md hover:shadow-purple-500/5 transition-all cursor-pointer text-left premium-shadow"
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
                  </motion.button>
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
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-white to-gray-50/50">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                    className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                  >
                    {msg.from === 'support' && (
                      <div className="w-7 h-7 bg-gradient-to-br from-ss-primary to-ss-primary-dark rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Bot size={14} className="text-white" />
                      </div>
                    )}
                    <div className={`max-w-[78%] rounded-[20px] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.from === 'user'
                        ? 'bg-gradient-to-br from-ss-primary to-ss-primary-dark text-white rounded-tr-[6px] shadow-md shadow-purple-500/10'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-[6px] shadow-sm'
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.from === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>{msg.time}</p>
                    </div>
                    {msg.from === 'user' && (
                      <div className="w-7 h-7 bg-gradient-to-br from-ss-primary to-ss-primary-dark rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <UserIcon size={13} className="text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {chatSending && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-ss-primary to-ss-primary-dark rounded-full flex items-center justify-center shrink-0">
                      <Bot size={14} className="text-white" />
                    </div>
                    <TypingIndicator color="gray" size="sm" />
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
              <div className="px-4 py-3.5 border-t border-gray-50 bg-white shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-[22px] px-3 py-2.5 focus-within:bg-white focus-within:border-purple-200 focus-within:shadow-sm transition-all">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                    placeholder="შეტყობინება..."
                    className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                  <motion.button
                    onClick={sendChat}
                    disabled={!chatInput.trim() || chatSending}
                    whileTap={{ scale: 0.9 }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                      chatInput.trim() && !chatSending
                        ? 'bg-gradient-to-br from-ss-primary to-ss-primary-dark text-white shadow-md shadow-purple-500/15'
                        : 'bg-gray-100 text-gray-300'
                    }`}
                  >
                    <Send size={14} />
                  </motion.button>
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
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center gap-3 p-8 text-center h-full"
                  >
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center ring-4 ring-emerald-100/50">
                      <CheckCircle2 size={28} className="text-emerald-500" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-[16px]">ტიკეტი გაგზავნილია!</h3>
                    <p className="text-gray-500 text-[12px]">24 საათის განმავლობაში პასუხს მიიღებთ <strong className="text-gray-700">{tEmail}</strong>-ზე.</p>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setTSent(false); setView('home'); }}
                      className="mt-2 bg-gradient-to-r from-ss-primary to-ss-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-[12px] cursor-pointer hover:opacity-90 transition-opacity shadow-md shadow-purple-500/15"
                    >
                      მთავარი
                    </motion.button>
                  </motion.div>
                ) : (
                  <form onSubmit={sendTicket} className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5">სახელი</label>
                        <input type="text" value={tName} onChange={e => setTName(e.target.value)} placeholder="სახელი"
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 text-[12px] focus:outline-none focus:border-purple-300 focus:bg-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5">ელ-ფოსტა *</label>
                        <input type="email" value={tEmail} onChange={e => setTEmail(e.target.value)} placeholder="mail@..." required
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 text-[12px] focus:outline-none focus:border-purple-300 focus:bg-white transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1.5">თემა *</label>
                      <select value={tSubject} onChange={e => setTSubject(e.target.value)} required
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 text-[12px] focus:outline-none focus:border-purple-300 focus:bg-white transition-all cursor-pointer">
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
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3 text-[12px] resize-none focus:outline-none focus:border-purple-300 focus:bg-white transition-all" />
                    </div>
                    {tError && <p className="text-rose-600 text-[11px] font-medium bg-rose-50 rounded-xl px-3 py-2">{tError}</p>}
                    <motion.button type="submit" disabled={tSending} whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-ss-primary to-ss-primary-dark text-white font-bold py-3 rounded-2xl text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60 shadow-md shadow-purple-500/10">
                      {tSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
                      {tSending ? 'იგზავნება...' : 'ტიკეტის გაგზავნა'}
                    </motion.button>
                  </form>
                )}
              </div>
            </>
          )}

          {/* ─── FAQ ─── */}
          {view === 'faq' && (
            <>
              <Header title="ხშირად დასმული კითხვები" sub={`${FAQ_ITEMS.length} პასუხი`} />
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {FAQ_ITEMS.map((item, i) => (
                  <div key={i} className="px-4">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
                    >
                      <span className="text-[13px] font-semibold text-gray-900 group-hover:text-ss-primary transition-colors pr-3 leading-snug">{item.q}</span>
                      {expandedFaq === i
                        ? <ChevronUp size={15} className="text-ss-primary shrink-0" />
                        : <ChevronDown size={15} className="text-gray-300 shrink-0" />
                      }
                    </button>
                    {expandedFaq === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pb-4 text-[12px] text-gray-600 leading-relaxed -mt-1"
                      >
                        {item.a}
                      </motion.p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
