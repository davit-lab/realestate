import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, ChevronRight, ChevronDown, ChevronUp, Send, Loader2, CheckCircle2, ArrowLeft, Ticket, BookOpen, Clock, User as UserIcon, Bot, Headphones } from 'lucide-react';
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

const SMART_SUGGESTIONS = [
 'როგორ დავამატო განცხადება?',
 'VIP სტატუსი რა ღირს?',
 'განცხადების წაშლა შეიძლება?',
 'პაროლი დამავიწყდა',
];

function getBotReply(text: string): string {
 const t = text.toLowerCase();
 if (t.includes('განცხადებ') || t.includes('დავამატო') || t.includes('როგორ დავ') || t.includes('add')) {
 return 'განცხადების დასამატებლად:\n1) გაიარეთ ავტორიზაცია\n2) დააჭირეთ "+" ღილაკს\n3) შეავსეთ ფორმა და დააჭირეთ "გამოქვეყნება"\n\nVIP სტატუსით განცხადება სიის თავში გამოჩნდება.';
 }
 if (t.includes('vip') || t.includes('სტატუს') || t.includes('ღირს') || t.includes('ფასი')) {
 return 'VIP სტატუსები:\n• VIP — 15₾/კვირა\n• Super VIP — 35₾/კვირა\n• Premium — 60₾/კვირა\n\nბალანსიდან ავტომატურად ჩამოგეჭრებათ.';
 }
 if (t.includes('წაშლა') || t.includes('წავშალო') || t.includes('delete')) {
 return 'განცხადების წასაშლელად: გადადით "ჩემი პროფილი" → "ჩემი განცხადებები" და დააჭირეთ წაშლის ღილაკს.';
 }
 if (t.includes('პაროლ') || t.includes('დამავიწყდა') || t.includes('აღდგენა') || t.includes('password')) {
 return 'პაროლის აღსადგენად აირჩიეთ "პაროლის აღდგენა" შესვლის ფორმაში. ელ-ფოსტაზე მოგივათ ლინკი 5 წუთში.';
 }
 if (t.includes('ფოტო') || t.includes('სურათ') || t.includes('photo') || t.includes('image')) {
 return 'ერთ განცხადებაზე მაქსიმუმ 20 ფოტო. ფორმატები: JPG, PNG, WEBP. მაქსიმალური ზომა — 10MB.';
 }
 if (t.includes('ანგარიშ') || t.includes('ავტორიზაცი') || t.includes('რეგისტრაცი') || t.includes('account')) {
 return 'ანგარიშის შესაქმნელად დააჭირეთ "შესვლა" → "რეგისტრაცია". საჭიროა: სახელი, ელ-ფოსტა, ტელეფონი და პაროლი.';
 }
 if (t.includes('გადახდ') || t.includes('ბალანს') || t.includes('თანხ') || t.includes('payment')) {
 return 'ბალანსის შესავსებად გადადით "პროფილი" → "ბალანსი". მხარდაჭერილი მეთოდი: ბანკის ბარათი.';
 }
 if (t.includes('ქირავდება') || t.includes('ქირა') || t.includes('rent') || t.includes('გაქირავებ')) {
 return 'თბილისში 2-ოთახიანის ქირა 800–1,500 ₾-ია, ბათუმში 600–1,200 ₾. ძიების ფილტრებით შეგიძლიათ შეარჩიოთ ბიუჯეტის მიხედვით.';
 }
 if (t.includes('იყიდება') || t.includes('ყიდვა') || t.includes('buy') || t.includes('sale')) {
 return 'თბილისში საშუალო ფასი 1,500–2,200 ₾/მ², ბათუმში 1,200–1,800 ₾/მ². ფილტრებით შეგიძლიათ შეარჩიოთ ბიუჯეტის მიხედვით.';
 }
 if (t.includes('იპოთეკ') || t.includes('სესხ') || t.includes('mortgage')) {
 return 'იპოთეკის საპროცენტო განაკვეთი 11–13%-ია წლიურად. მინიმალური თანამონაწილეობა — 20%.';
 }
 if (t.includes('ბათუმ')) {
 return 'ბათუმში საშუალო ფასი 1,200–1,800 ₾/მ². პოპულარული უბნები: ძველი ბულვარი, ახალი ბულვარი, გონიო.';
 }
 if (t.includes('თბილის')) {
 return 'თბილისში პოპულარული უბნებია: ვაკე, საბურთალო, დიდუბე. საბურთალოზე საშუალო ფასი 1,500–2,200 ₾/მ².';
 }
 const replies = [
 'გამარჯობა! თქვენი შეტყობინება მივიღეთ. ოპერატორი მალე დაგიკავშირდება.',
 'გმადლობთ, რომ დაგვიკავშირდით. ჩვენი გუნდი მალე გიპასუხებთ.',
 'შეტყობინება მიღებულია! სამუშაო საათებში (ორშ–პარ 10–19) სწრაფად ვპასუხობთ.',
 ];
 return replies[Math.floor(Math.random() * replies.length)];
}

interface ChatMsg { id: string; text: string; from: 'user' | 'support'; time: string; }
type View = 'home' | 'chat' | 'ticket' | 'faq';

export default function HelpWidget() {
 const { user, profile } = useAuth();
 const [open, setOpen] = useState(false);
 const [view, setView] = useState<View>('home');

 // Chat state
 const [msgs, setMsgs] = useState<ChatMsg[]>([
 { id: 'b0', text: 'გამარჯობა! 👋 newlife.ge-ს მხარდაჭერაში მოგესალმებით. როგორ შეგვიძლია დაგეხმაროთ?', from: 'support', time: 'ახლა' },
 ]);
 const [input, setInput] = useState('');
 const [sending, setSending] = useState(false);
 const [unread, setUnread] = useState(1);
 const panelRef = useRef<HTMLDivElement>(null);
 const bottomRef = useRef<HTMLDivElement>(null);

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

 // Support chat — Supabase integration
 const [supportConvId, setSupportConvId] = useState<string | null>(null);

 useEffect(() => { if (open) { setView('home'); setUnread(0); } }, [open]);

 // Find or create support conversation when entering chat view
 const ensureSupportConv = useCallback(async () => {
  if (!isSupabaseConfigured || !user?.id || supportConvId) return;
  const { data: existing } = await supabase
   .from('conversations')
   .select('id')
   .eq('buyer_id', user.id)
   .is('listing_id', null)
   .order('created_at', { ascending: false })
   .limit(1);
  if (existing && existing.length > 0) {
   setSupportConvId(existing[0].id);
   return;
  }
  const { data: created } = await supabase
   .from('conversations')
   .insert({ buyer_id: user.id, title: 'სუპორტი', agent_id: null })
   .select()
   .single();
  if (created) setSupportConvId(created.id);
 }, [user?.id, supportConvId]);

 useEffect(() => {
  if (view === 'chat') ensureSupportConv();
 }, [view, ensureSupportConv]);

 // Load admin replies from Supabase
 const loadRemoteMessages = useCallback(async () => {
  if (!isSupabaseConfigured || !supportConvId || !user?.id) return;
  const { data } = await supabase
   .from('messages')
   .select('*')
   .eq('chat_id', supportConvId)
   .order('created_at', { ascending: true });
  if (!data) return;
  const adminMsgs: ChatMsg[] = data
   .filter((m: any) => m.sender_id !== user.id)
   .map((m: any) => ({
    id: m.id,
    text: m.content,
    from: 'support' as const,
    time: new Date(m.created_at).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' }),
   }));
  setMsgs(prev => {
   const existingIds = new Set(prev.map(p => p.id));
   const newMsgs = adminMsgs.filter(m => !existingIds.has(m.id));
   if (newMsgs.length === 0) return prev;
   return [...prev, ...newMsgs];
  });
 }, [supportConvId, user?.id]);

 useEffect(() => {
  if (supportConvId) loadRemoteMessages();
 }, [supportConvId, loadRemoteMessages]);

 // Realtime subscription for admin replies
 useEffect(() => {
  if (!supportConvId || !isSupabaseConfigured) return;
  const channel = supabase
   .channel(`support-chat:${supportConvId}`)
   .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `chat_id=eq.${supportConvId}`,
   }, (payload) => {
    const newMsg = payload.new as any;
    if (newMsg.sender_id === user?.id) return;
    setMsgs(prev => {
     if (prev.some(m => m.id === newMsg.id)) return prev;
     return [...prev, {
      id: newMsg.id,
      text: newMsg.content,
      from: 'support' as const,
      time: new Date(newMsg.created_at).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' }),
     }];
    });
   })
   .subscribe();
  return () => { supabase.removeChannel(channel); };
 }, [supportConvId, user?.id]);
 useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, sending]);

 useEffect(() => {
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
  const onClick = (e: MouseEvent) => {
   if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
    if (!(e.target as HTMLElement).closest('[data-chat-trigger]')) setOpen(false);
   }
  };
  if (open) { window.addEventListener('keydown', onKey); window.addEventListener('mousedown', onClick); }
  return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onClick); };
 }, [open]);

 const sendChat = async () => {
 const text = input.trim();
 if (!text) return;
 setInput('');
 setSending(true);

 const userMsg: ChatMsg = {
  id: `local-${Date.now()}`, text, from: 'user',
  time: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' }),
 };
 setMsgs(prev => [...prev, userMsg]);

 // Persist to Supabase if authenticated and conversation exists
 if (isSupabaseConfigured && user?.id && supportConvId) {
  const { error } = await supabase.from('messages').insert({
   chat_id: supportConvId,
   sender_id: user.id,
   content: text,
   status: 'sent',
  });
  if (error) console.error('[HelpWidget] message insert error:', error.message);
 }

 setTimeout(() => {
  const reply = getBotReply(text);
  setMsgs(prev => [...prev, {
  id: `s-${Date.now()}`, text: reply, from: 'support',
  time: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' }),
  }]);
  setSending(false);
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
 <div className="bg-ss-primary px-5 py-4 flex items-center gap-3 shrink-0">
  {view !== 'home' && (
  <button onClick={() => setView('home')} className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white cursor-pointer transition-colors shrink-0">
   <ArrowLeft size={16} />
  </button>
  )}
  <div className="flex-1 min-w-0">
  <p className="text-white font-bold text-[14px] leading-tight">{title}</p>
  {sub && <p className="text-white/70 text-[11px] mt-0.5">{sub}</p>}
  </div>
  <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white cursor-pointer transition-colors shrink-0">
  <X size={16} />
  </button>
 </div>
 );

 return (
 <>
  {/* Trigger */}
  <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100]">
   <AnimatePresence>
    {!open && unread > 0 && (
     <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
      className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1.5 border-2 border-[#F4F4F5] z-10 shadow-sm">
      {unread}
     </motion.span>
    )}
   </AnimatePresence>
   <motion.button data-chat-trigger onClick={() => setOpen(v => !v)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
    className={`relative w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center cursor-pointer transition-colors overflow-hidden ${
     open ? 'bg-gray-900 text-white' : 'bg-ss-primary text-white'
    }`}>
    <motion.div key={open ? 'close' : 'open'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
     {open ? <X size={22} /> : <MessageCircle size={24} />}
    </motion.div>
   </motion.button>
  </div>

  {/* Widget panel */}
  <AnimatePresence>
  {open && (
   <motion.div
   initial={{ opacity: 0, y: 20, scale: 0.95 }}
   animate={{ opacity: 1, y: 0, scale: 1 }}
   exit={{ opacity: 0, y: 20, scale: 0.95 }}
   transition={{ type: 'spring', damping: 22, stiffness: 300 }}
   className="fixed bottom-20 left-4 right-4 sm:left-auto sm:bottom-24 sm:right-6 z-[100] sm:w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
   style={{ maxHeight: 'min(680px, calc(100vh - 7rem))' }}
   >

   {/* ─── HOME ─── */}
   {view === 'home' && (
   <>
    <div className="shrink-0 bg-ss-primary px-6 pt-6 pb-10">
      <div className="flex items-center justify-between mb-4">
       <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
         <Headphones size={17} className="text-white" />
        </div>
        <span className="text-white font-bold text-[13px] tracking-wide">newlife.ge</span>
       </div>
       <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer">
        <X size={16} />
       </button>
      </div>
      <h2 className="text-white font-bold text-[22px] leading-tight">გამარჯობა! 👋</h2>
      <p className="text-white/70 text-[13px] mt-1.5 font-medium">როგორ შეგვიძლია დაგეხმაროთ დღეს?</p>
    </div>

    <div className="flex-1 overflow-y-auto px-4 -mt-6 pb-4 space-y-3">
    {[
     {
     view: 'chat' as View,
     icon: <Bot size={20} className="text-white" />,
     bg: 'bg-ss-primary',
     title: 'Live ჩატი',
     sub: 'ოპერატორი პასუხობს 10 წთ-ში',
     badge: (
      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />ონლაინ
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
     title: 'ხ.დ. კითხვები',
     sub: `${FAQ_ITEMS.length} პასუხი მზადაა`,
     badge: null,
     },
    ].map(item => (
     <motion.button
     key={item.view}
     whileHover={{ scale: 1.015, y: -1 }}
     whileTap={{ scale: 0.985 }}
     onClick={() => setView(item.view)}
     className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3.5 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer text-left shadow-sm"
     >
     <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
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

    <div className="pt-2">
     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">სწრაფი პასუხები</p>
     <div className="flex flex-wrap gap-2">
      {SMART_SUGGESTIONS.map(s => (
       <motion.button key={s} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setView('chat'); setInput(s); }}
        className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-100 hover:bg-purple-50 hover:text-ss-primary hover:border-purple-100 transition-all cursor-pointer">
        {s}
       </motion.button>
      ))}
     </div>
    </div>

    <div className="flex items-center gap-2 pt-2 pb-1 justify-center">
     <Clock size={11} className="text-gray-300" />
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
    {msgs.map((msg, i) => (
     <motion.div
     key={msg.id}
     initial={{ opacity: 0, y: 10, scale: 0.97 }}
     animate={{ opacity: 1, y: 0, scale: 1 }}
     transition={{ type: 'spring', damping: 24, stiffness: 300 }}
     className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
     >
     {msg.from === 'support' && (
      <div className="w-7 h-7 bg-ss-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
      <Bot size={14} className="text-white" />
      </div>
     )}
     <div className={`max-w-[78%] rounded-[20px] px-3.5 py-2.5 text-[13px] leading-relaxed ${
      msg.from === 'user'
      ? 'bg-ss-primary text-white rounded-tr-[6px] shadow-sm'
      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-[6px] shadow-sm'
     }`}>
      <p>{msg.text}</p>
      <p className={`text-[10px] mt-1 ${msg.from === 'user' ? 'text-white/70' : 'text-gray-400'}`}>{msg.time}</p>
     </div>
     {msg.from === 'user' && (
      <div className="w-7 h-7 bg-ss-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
      <UserIcon size={13} className="text-white" />
      </div>
     )}
     </motion.div>
    ))}
    {sending && (
     <div className="flex items-center gap-2">
     <div className="w-7 h-7 bg-ss-primary rounded-full flex items-center justify-center shrink-0">
      <Bot size={14} className="text-white" />
     </div>
     <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-[6px] px-4 py-3 shadow-sm flex items-center gap-1">
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
     </div>
    )}
    <div ref={bottomRef} />
    </div>
    <div className="px-4 py-3.5 border-t border-gray-50 bg-white shrink-0">
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-[22px] px-3 py-2.5 focus-within:bg-white focus-within:border-ss-primary transition-all">
     <input
     type="text"
     value={input}
     onChange={e => setInput(e.target.value)}
     onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
     placeholder="შეტყობინება..."
     className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none"
     />
     <motion.button
     onClick={sendChat}
     disabled={!input.trim() || sending}
     whileTap={{ scale: 0.9 }}
     className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
      input.trim() && !sending
      ? 'bg-ss-primary text-white shadow-sm'
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
      className="mt-2 bg-ss-primary hover:bg-ss-primary-dark text-white font-bold px-6 py-2.5 rounded-xl text-[12px] cursor-pointer transition-colors shadow-sm"
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
      className="w-full bg-ss-primary hover:bg-ss-primary-dark text-white font-bold py-3 rounded-2xl text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60 shadow-sm">
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
