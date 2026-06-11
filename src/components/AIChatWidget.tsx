import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, User, Settings, Zap, KeyRound, Trash2, ImageIcon, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendKimiMessage, hasApiKey, setApiKey, removeApiKey, ChatMessage as KimiMsg } from '../services/aiService';
import TypingIndicator from './chat/TypingIndicator';
import MarkdownText from './chat/MarkdownText';
import ChatImagePreview from './chat/ChatImagePreview';

type MessageRole = 'user' | 'ai';

interface ChatMessage {
  role: MessageRole;
  text: string;
  imageUrl?: string | null;
  suggestions?: string[];
  isError?: boolean;
}

const AI_GREETING: ChatMessage = {
  role: 'ai',
  text: 'გამარჯობა! მე ვარ Adjarahome AI ასისტენტი. შემიძლია დაგეხმაროთ უძრავი ქონების ძიებაში, ფასების განხილვაში და რჩევების მიცემაში. რით შემიძლია დაგეხმაროთ?',
  suggestions: ['3-ოთახიანი ბათუმში', 'თბილისში საუკეთესო ფასი', 'იპოთეკის პირობები'],
};

const AI_RESPONSES: { pattern: RegExp; response: string; suggestions?: string[] }[] = [
  {
    pattern: /ბათუმ/i,
    response: 'ბათუმში ამჟამად ბევრი საინტერესო შეთავაზებაა. ზღვისპირა ბინების საშუალო ფასი 1,200-1,800 ₾/მ²-ია. რა ტიპის ქონება გაინტერესებთ?',
    suggestions: ['ბინა ზღვასთან', 'ახალი აშენებული', 'ქირავდება ბათუმში'],
  },
  {
    pattern: /თბილის/i,
    response: 'თბილისში ყველაზე პოპულარული უბნებია: ვაკე, საბურთალო, დიდუბე და ნაძალადევი. საბურთალოზე საშუალო ფასი 1,500-2,200 ₾/მ²-ია. რომელ უბანში გეძებთ?',
    suggestions: ['საბურთალო', 'ვაკე', 'დიდუბე'],
  },
  {
    pattern: /იპოთეკ|სესხ|საპროცენტ|გადახდ/i,
    response: 'იპოთეკის საპროცენტო განაკვეთი საქართველოში ამჟამად დაახლოებით 11-13%-ია წლიურად. ჩვენს პლატფორმაზე შეგიძლიათ იპოთეკით შეიძინოთ ქონება. მინიმალური თანამონაწილეობა არის 20%. რამდენია თქვენი ბიუჯეტი?',
    suggestions: ['100000 ლარამდე', '150000 ლარამდე', 'იპოთეკის კალკულატორი'],
  },
  {
    pattern: /ქირავ|გაქირავ|ქირა/i,
    response: 'ქირავდება ბევრი ვარიანტი. თბილისში 2-ოთახიანის ქირა დაახლოებით 800-1,500 ₾-ია, ბათუმში კი 600-1,200 ₾. რა ბიუჯეტი გაქვთ ქირისთვის?',
    suggestions: ['800 ლარამდე', '1200 ლარამდე', 'ზღვასთან ქირავდება'],
  },
  {
    pattern: /ფას|თანხ|ბიუჯეტ|ლარი|დოლარ/i,
    response: 'ფასების დიაპაზონი ძალიან მ 다양ია. თუ მითხრით კონკრეტულ ბიუჯეტს, შემიძლია შემოგთავაზოთ საუკეთესო ვარიანტები. რამდენი გაქვთ ბიუჯეტი?',
    suggestions: ['50000 ლარამდე', '100000 ლარამდე', '150000 ლარამდე'],
  },
  {
    pattern: /როგორ|help|დახმარებ|სერვის/i,
    response: 'მე შემიძლია დაგეხმაროთ:\n• ქონების ძიებაში ბუნებრივი ენით\n• ფასების შედარებაში\n• უბნების ინფორმაციაში\n• იპოთეკის პირობების განხილვაში\n\nრით შემიძლია დაგეხმაროთ დღეს?',
    suggestions: ['ბინების ძიება', 'იპოთეკის ინფო', 'უბნების შესახებ'],
  },
];

const DEFAULT_RESPONSE: ChatMessage = {
  role: 'ai',
  text: 'გასაგებია! შეგიძლიათ მითხრათ მეტი დეტალი — რომელ ქალაქში ეძებთ, რამდენი ოთახი გჭირდებათ და რა ბიუჯეტი გაქვთ? ასევე შეგიძლიათ გადახედოთ ჩვენს ძირითად ძიებას.',
  suggestions: ['ძირითადი ძიება', 'VIP განცხადებები', 'ახალი დამატებული'],
};

function generateLocalResponse(userText: string): ChatMessage {
  const text = userText.toLowerCase();
  for (const item of AI_RESPONSES) {
    if (item.pattern.test(text)) {
      return { role: 'ai', text: item.response, suggestions: item.suggestions };
    }
  }
  return DEFAULT_RESPONSE;
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([AI_GREETING]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [kimiConnected, setKimiConnected] = useState(hasApiKey());
  const [thinkingMode, setThinkingMode] = useState(true);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    if (!text.trim() && !pendingImage) return;
    const userMsg: ChatMessage = { role: 'user', text: text.trim(), imageUrl: pendingImage };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setPendingImage(null);
    setTyping(true);

    if (kimiConnected) {
      try {
        const history: KimiMsg[] = messages
          .filter(m => !m.isError)
          .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));
        const reply = await sendKimiMessage([...history, { role: 'user', content: text }], thinkingMode);
        setMessages(prev => [...prev, { role: 'ai', text: reply }]);
      } catch (err: any) {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: `Kimi API შეცდომა: ${err.message}. ვრთავ ლოკალურ რეჟიმს.`,
          isError: true,
        }]);
        setKimiConnected(false);
      }
    } else {
      setTimeout(() => {
        const response = generateLocalResponse(text);
        setMessages(prev => [...prev, response]);
      }, 600 + Math.random() * 400);
    }
    setTyping(false);
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items) as DataTransferItem[]) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setPendingImage(ev.target?.result as string);
          reader.readAsDataURL(file);
        }
        e.preventDefault();
        break;
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPendingImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const saveKey = () => {
    if (!apiKeyInput.trim()) return;
    setApiKey(apiKeyInput.trim());
    setKimiConnected(true);
    setApiKeyInput('');
    setShowSettings(false);
    setMessages(prev => [...prev, {
      role: 'ai',
      text: '✅ Kimi K2.5 დაკავშირებულია! ახლა ვიყენებ რეალურ AI-ს პასუხებისთვის.',
      suggestions: ['3-ოთახიანი ბათუმში', 'იპოთეკის პირობები'],
    }]);
  };

  const clearKey = () => {
    removeApiKey();
    setKimiConnected(false);
    setShowSettings(false);
    setMessages(prev => [...prev, {
      role: 'ai',
      text: '🔌 Kimi გამორთულია. ვიყენებ ლოკალურ რეჟიმს.',
    }]);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="mb-3 w-[400px] max-h-[540px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-ss-primary to-ss-primary-dark text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/15 backdrop-blur-sm`}>
                  <Bot size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold">Adjarahome AI</p>
                  <p className="text-[10px] text-purple-200 flex items-center gap-1">
                    {kimiConnected ? (
                      <><Zap size={9} className="text-emerald-300" /> Kimi K2.5</>
                    ) : (
                      'ლოკალური რეჟიმი'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSettings(s => !s)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${showSettings ? 'bg-white/20 text-white' : 'text-purple-200 hover:text-white hover:bg-white/10'}`}
                  title="პარამეტრები"
                >
                  <Settings size={15} />
                </button>
                <button onClick={() => setOpen(false)} className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer">
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Settings panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 border-b border-purple-100 bg-purple-50/50 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <p className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">Kimi K2.5 API</p>
                    {kimiConnected ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-sm text-gray-700 font-medium">დაკავშირებულია</span>
                          </div>
                          <button
                            onClick={clearKey}
                            className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-700 font-medium transition-colors cursor-pointer"
                          >
                            <Trash2 size={11} />
                            გათიშვა
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-500 shrink-0">რეჟიმი:</span>
                          <div className="flex items-center bg-white rounded-xl p-0.5 flex-1 shadow-sm border border-purple-100">
                            <button
                              onClick={() => setThinkingMode(true)}
                              className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                                thinkingMode ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              🧠 Thinking
                            </button>
                            <button
                              onClick={() => setThinkingMode(false)}
                              className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                                !thinkingMode ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              ⚡ Instant
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {thinkingMode
                            ? 'Thinking — ღრმა ანალიზი, ნელი მაგრა ზუსტი (temp=1.0)'
                            : 'Instant — სწრაფი პასუხები, უკეთესი ჩატისთვის (temp=0.6)'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          შეიყვანეთ Moonshot AI API key Kimi K2.5-ის გამოსაყენებლად. თუ key არ გაქვთ, ვიყენებთ ლოკალურ რეჟიმს.
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="sk-..."
                            className="flex-1 text-sm bg-white border border-purple-100 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-300 shadow-sm"
                          />
                          <button
                            onClick={saveKey}
                            disabled={!apiKeyInput.trim()}
                            className="bg-ss-primary hover:bg-ss-primary-dark disabled:bg-gray-200 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-sm"
                          >
                            <KeyRound size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div
              ref={scrollRef}
              className={`flex-1 overflow-y-auto p-4 space-y-3 min-h-0 ${dragOver ? 'bg-purple-50/50' : ''}`}
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 300, delay: 0.02 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'ai'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gradient-to-br from-ss-primary to-ss-primary-dark text-white'
                  }`}>
                    {msg.role === 'ai' ? <Bot size={13} /> : <User size={13} />}
                  </div>
                  <div className={`max-w-[270px] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === 'ai'
                      ? msg.isError
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-white text-gray-700 shadow-sm border border-gray-100 relative'
                      : 'bg-gradient-to-br from-ss-primary to-ss-primary-dark text-white shadow-md shadow-purple-500/15'
                  }`}>
                    {msg.role === 'ai' && !msg.isError && (
                      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-purple-400" />
                    )}
                    {msg.text && (
                      <div className={msg.role === 'ai' && !msg.isError ? 'pl-1.5' : ''}>
                        <MarkdownText text={msg.text} className={msg.role === 'user' ? 'text-white' : ''} />
                      </div>
                    )}
                    {msg.imageUrl && (
                      <div className={msg.text ? 'mt-2' : ''}>
                        <ChatImagePreview src={msg.imageUrl} maxWidth={200} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-purple-100 text-purple-600">
                    <Bot size={13} />
                  </div>
                  <TypingIndicator color="purple" size="sm" />
                </div>
              )}
              {dragOver && (
                <div className="flex justify-center py-4">
                  <div className="bg-purple-100 text-purple-600 px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 animate-pulse">
                    <ImageIcon size={14} />
                    ჩააგდეთ სურათი აქ
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages[messages.length - 1]?.suggestions && !typing && (
              <div className="px-4 pb-2.5 flex flex-wrap gap-2">
                {messages[messages.length - 1].suggestions!.map(s => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(s)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Pending image preview */}
            {pendingImage && (
              <div className="px-4 pb-2">
                <div className="relative inline-block">
                  <img src={pendingImage} alt="Pending" className="h-16 rounded-xl object-cover border border-purple-200" />
                  <button
                    onClick={() => setPendingImage(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <XCircle size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="p-3.5 border-t border-gray-100 flex items-center gap-2.5 shrink-0 bg-white"
            >
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setPendingImage(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                className="p-2.5 rounded-full hover:bg-purple-50 text-gray-400 hover:text-purple-500 transition-colors cursor-pointer shrink-0"
                title="სურათის ატვირთვა"
              >
                <ImageIcon size={18} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={handlePaste}
                placeholder={kimiConnected ? 'Kimi K2.5 — ჩაწერეთ...' : 'ჩაწერეთ შეტყობინება...'}
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-purple-300 focus:bg-white transition-all"
              />
              <motion.button
                type="submit"
                disabled={(!input.trim() && !pendingImage) || typing}
                whileTap={{ scale: 0.92 }}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  (input.trim() || pendingImage) && !typing
                    ? 'bg-gradient-to-br from-ss-primary to-ss-primary-dark text-white shadow-md shadow-purple-500/20'
                    : 'bg-gray-100 text-gray-300'
                }`}
              >
                <Send size={15} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors cursor-pointer relative ${
          open ? 'bg-gray-800 text-white' : 'bg-white text-ss-primary shadow-purple-500/20'
        }`}
        style={open ? undefined : { boxShadow: '0 8px 32px rgba(124, 58, 237, 0.25)' }}
      >
        {open ? <X size={22} /> : <Bot size={24} />}
        {!open && messages.length > 1 && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white" />
        )}
      </motion.button>
    </div>
  );
}
