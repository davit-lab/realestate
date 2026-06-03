import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Settings, Zap, KeyRound, Trash2 } from 'lucide-react';
import { sendKimiMessage, hasApiKey, setApiKey, removeApiKey, ChatMessage as KimiMsg } from '../services/aiService';

type MessageRole = 'user' | 'ai';

interface ChatMessage {
  role: MessageRole;
  text: string;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
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
      {/* Chat window */}
      {open && (
        <div className="mb-3 w-[360px] max-h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kimiConnected ? 'bg-emerald-600' : 'bg-violet-600'}`}>
                <Bot size={16} />
              </div>
              <div>
                <p className="text-sm font-bold">Adjarahome AI</p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  {kimiConnected ? (
                    <><Zap size={9} className="text-emerald-400" /> Kimi K2.6</>
                  ) : (
                    'ლოკალური რეჟიმი'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(s => !s)}
                className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                title="პარამეტრები"
              >
                <Settings size={14} />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="shrink-0 border-b border-gray-100 bg-gray-50 p-4 space-y-3">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Kimi K2.5 API</p>
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
                  {/* Thinking / Instant toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500 shrink-0">რეჟიმი:</span>
                    <div className="flex items-center bg-gray-200 rounded-lg p-0.5 flex-1">
                      <button
                        onClick={() => setThinkingMode(true)}
                        className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-all ${
                          thinkingMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        🧠 Thinking
                      </button>
                      <button
                        onClick={() => setThinkingMode(false)}
                        className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-all ${
                          !thinkingMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
                      className="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-300"
                    />
                    <button
                      onClick={saveKey}
                      disabled={!apiKeyInput.trim()}
                      className="bg-ss-primary hover:bg-ss-primary-dark disabled:bg-gray-200 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      <KeyRound size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'ai' ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {msg.role === 'ai' ? <Bot size={12} /> : <User size={12} />}
                </div>
                <div className={`max-w-[260px] px-3 py-2 rounded-xl text-[13px] leading-relaxed ${
                  msg.role === 'ai'
                    ? msg.isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-gray-50 text-gray-700 border border-gray-100'
                    : 'bg-ss-primary text-white'
                }`}>
                  {msg.text.split('\n').map((line, li) => (
                    <React.Fragment key={li}>
                      {line}
                      {li < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${kimiConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600'}`}>
                  <Bot size={12} />
                </div>
                <div className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages[messages.length - 1]?.suggestions && !typing && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {messages[messages.length - 1].suggestions!.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="p-3 border-t border-gray-100 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={kimiConnected ? 'Kimi K2.6 — ჩაწერეთ...' : 'ჩაწერეთ შეტყობინება...'}
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-300 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                kimiConnected
                  ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white'
                  : 'bg-ss-primary hover:bg-ss-primary-dark disabled:bg-gray-200 text-white'
              }`}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all cursor-pointer ${
          open ? 'bg-gray-800 text-white rotate-0' : 'bg-ss-primary text-white hover:scale-105'
        }`}
      >
        {open ? <X size={20} /> : <Bot size={22} />}
      </button>
    </div>
  );
}
