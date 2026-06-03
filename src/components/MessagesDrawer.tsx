import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckCheck, MessageSquare, Home, ChevronLeft } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

interface Chat {
  id: string;
  listingTitle: string;
  listingId: string;
  agentName: string;
  agentAvatar: string;
  lastMessage: string;
  time: string;
  type?: 'chat' | 'booking';
  messages: ChatMessage[];
}

interface MessagesDrawerProps {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
}

export default function MessagesDrawer({ chats, setChats, activeChatId, setActiveChatId }: MessagesDrawerProps) {
  const [replyText, setReplyText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find((c) => c.id === activeChatId) ?? chats[0] ?? null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChat) return;

    const now = new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { sender: 'user', text: replyText.trim(), time: now };

    setChats(prev => prev.map(c =>
      c.id === selectedChat.id
        ? { ...c, lastMessage: userMsg.text, time: 'ახლახან', messages: [...c.messages, userMsg] }
        : c
    ));
    setReplyText('');
    setIsTyping(true);

    setTimeout(() => {
      const replies = [
        'გასაგებია, საკადასტრო კოდს მალე გადმოგიგზავნით.',
        'საღამოს თუ გაწყობთ ბინის ნახვა?',
        'ფასზე შეთანხმება შესაძლებელია ადგილზე შეხვედრისას.',
        'დიახ, ბინაში რჩება სამზარეულოს ინვენტარი სრულად.',
        'საბუთები წესრიგშია, ნებისმიერ დროს შეგვიძლია ნოტარიუსთან.',
      ];
      const agentMsg: ChatMessage = {
        sender: 'agent',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' }),
      };
      setIsTyping(false);
      setChats(prev => prev.map(c =>
        c.id === selectedChat.id
          ? { ...c, lastMessage: agentMsg.text, time: 'ახლახან', messages: [...c.messages, agentMsg] }
          : c
      ));
    }, 1800);
  };

  const openChat = (id: string) => {
    setActiveChatId(id);
    setMobileShowThread(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex"
        style={{ height: 'calc(100vh - 140px)', minHeight: 540 }}
      >
        {/* ── Left: conversation list ── */}
        <div className={`w-full sm:w-72 md:w-80 shrink-0 border-r border-gray-100 flex flex-col ${mobileShowThread ? 'hidden sm:flex' : 'flex'}`}>
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-ss-primary" />
              <h2 className="font-bold text-sm text-gray-900">შეტყობინებები</h2>
            </div>
            <span className="bg-ss-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {chats.length}
            </span>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 px-6 text-center">
                <MessageSquare size={32} className="opacity-30" />
                <p className="text-sm">მიმოწერა არ არის</p>
              </div>
            ) : (
              chats.map((chat) => {
                const isActive = chat.id === (activeChatId ?? chats[0]?.id);
                return (
                  <button
                    key={chat.id}
                    onClick={() => openChat(chat.id)}
                    className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-all cursor-pointer border-b border-gray-50 ${
                      isActive ? 'bg-ss-primary/8' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {chat.type === 'booking' ? (
                        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                          {chat.agentName.startsWith('🏨') ? '🏨' : '🎟'}
                        </div>
                      ) : (
                        <img
                          src={chat.agentAvatar}
                          alt={chat.agentName}
                          className="w-11 h-11 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${chat.type === 'booking' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm font-semibold truncate ${isActive ? 'text-ss-primary' : 'text-gray-900'}`}>
                          {chat.agentName}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{chat.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 text-center select-none">
            🔒 დაცული კავშირი
          </div>
        </div>

        {/* ── Right: thread ── */}
        {selectedChat ? (
          <div className={`flex-1 flex flex-col min-w-0 ${mobileShowThread ? 'flex' : 'hidden sm:flex'}`}>

            {/* Thread header */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 bg-white">
              <button
                onClick={() => setMobileShowThread(false)}
                className="sm:hidden p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer mr-1"
              >
                <ChevronLeft size={18} className="text-gray-600" />
              </button>

              {selectedChat.type === 'booking' ? (
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-base shrink-0">
                  {selectedChat.agentName.startsWith('🏨') ? '🏨' : '🎟'}
                </div>
              ) : (
                <img
                  src={selectedChat.agentAvatar}
                  alt={selectedChat.agentName}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-none">{selectedChat.agentName}</p>
                <p className={`text-xs font-medium mt-0.5 ${selectedChat.type === 'booking' ? 'text-blue-500' : 'text-emerald-500'}`}>
                  {selectedChat.type === 'booking' ? '✅ დადასტურებულია' : 'ონლაინ'}
                </p>
              </div>

              {/* Listing chip */}
              <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 max-w-xs">
                <Home size={12} className="text-ss-primary shrink-0" />
                <span className="text-xs text-gray-600 font-medium truncate">{selectedChat.listingTitle}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-gray-50/50">
              {selectedChat.messages.map((msg, i) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={i} className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isUser && (
                      <img
                        src={selectedChat.agentAvatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div
                      className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-ss-primary text-white rounded-br-md'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isUser ? 'text-white/60' : 'text-gray-400'}`}>
                        <span className="text-[10px]">{msg.time}</span>
                        {isUser && <CheckCheck size={12} />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <img src={selectedChat.agentAvatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-1">
                    {[0,1,2].map(j => (
                      <span
                        key={j}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${j * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar — hide for booking confirmations */}
            {selectedChat.type === 'booking' ? (
              <div className="px-4 py-3 border-t border-gray-100 bg-blue-50 text-center">
                <p className="text-[12px] text-blue-600 font-semibold">📧 დასტური გაიგზავნა თქვენს ელ-ფოსტაზე</p>
              </div>
            ) : (
            <form
              onSubmit={handleSendMessage}
              className="px-4 py-3.5 border-t border-gray-100 bg-white flex items-center gap-3"
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="ჩაწერეთ შეტყობინება..."
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 border-none outline-none focus:ring-2 focus:ring-ss-primary/30 transition-all"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="w-10 h-10 rounded-full bg-ss-primary hover:bg-ss-primary-dark disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
              >
                <Send size={16} />
              </button>
            </form>
            )}
          </div>
        ) : (
          <div className="flex-1 hidden sm:flex flex-col items-center justify-center text-gray-400 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <MessageSquare size={28} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium">საუბარი ასარჩევად დააწკაპუნეთ</p>
          </div>
        )}
      </div>
    </div>
  );
}
