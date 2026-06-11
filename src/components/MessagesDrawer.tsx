import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCheck, MessageSquare, Home, ChevronLeft, ImageIcon, XCircle } from 'lucide-react';
import TypingIndicator from './chat/TypingIndicator';
import ChatImagePreview from './chat/ChatImagePreview';

interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
  imageUrl?: string | null;
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
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find((c) => c.id === activeChatId) ?? chats[0] ?? null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!replyText.trim() && !pendingImage) || !selectedChat) return;

    const now = new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { sender: 'user', text: replyText.trim(), imageUrl: pendingImage, time: now };
    const previewText = pendingImage && !replyText.trim() ? '🖼️ სურათი' : replyText.trim();

    setChats(prev => prev.map(c =>
      c.id === selectedChat.id
        ? { ...c, lastMessage: previewText, time: 'ახლახან', messages: [...c.messages, userMsg] }
        : c
    ));
    setReplyText('');
    setPendingImage(null);
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
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex premium-shadow"
        style={{ height: 'calc(100vh - 140px)', minHeight: 540 }}
      >
        {/* ── Left: conversation list ── */}
        <div className={`w-full sm:w-72 md:w-80 shrink-0 border-r border-gray-50 flex flex-col ${mobileShowThread ? 'hidden sm:flex' : 'flex'}`}>
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                <MessageSquare size={16} className="text-ss-primary" />
              </div>
              <h2 className="font-bold text-sm text-gray-900">შეტყობინებები</h2>
            </div>
            <span className="bg-ss-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {chats.length}
            </span>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto bg-white">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
                  <MessageSquare size={28} className="text-purple-300" />
                </div>
                <p className="text-sm font-medium">მიმოწერა არ არის</p>
              </div>
            ) : (
              chats.map((chat) => {
                const isActive = chat.id === (activeChatId ?? chats[0]?.id);
                return (
                  <motion.button
                    key={chat.id}
                    whileHover={{ x: 2 }}
                    onClick={() => openChat(chat.id)}
                    className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-all cursor-pointer border-b border-gray-50 relative ${
                      isActive ? 'bg-purple-50/60' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-ss-primary" />
                    )}
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
                        <span className="text-[11px] text-gray-400 shrink-0 ml-2">{chat.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-50 text-[11px] text-gray-400 text-center select-none bg-white">
            <span className="inline-flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              დაცული კავშირი
            </span>
          </div>
        </div>

        {/* ── Right: thread ── */}
        {selectedChat ? (
          <div className={`flex-1 flex flex-col min-w-0 bg-gradient-to-br from-white to-gray-50/50 ${mobileShowThread ? 'flex' : 'hidden sm:flex'}`}>

            {/* Thread header */}
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-3 bg-white/80 backdrop-blur-xl">
              <button
                onClick={() => setMobileShowThread(false)}
                className="sm:hidden p-1.5 rounded-lg hover:bg-purple-50 cursor-pointer mr-1"
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
                  className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-purple-100"
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
              <div className="hidden md:flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-3 py-1.5 max-w-xs">
                <Home size={12} className="text-ss-primary shrink-0" />
                <span className="text-xs text-gray-600 font-medium truncate">{selectedChat.listingTitle}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
              {selectedChat.messages.map((msg, i) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                    className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {!isUser && (
                      <img
                        src={selectedChat.agentAvatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5 ring-2 ring-purple-100"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div
                      className={`max-w-[72%] px-4 py-2.5 rounded-[20px] text-sm leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-br from-ss-primary to-ss-primary-dark text-white rounded-tr-[6px] shadow-md shadow-purple-500/10'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-[6px] shadow-sm'
                      }`}
                    >
                      {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                      {msg.imageUrl && (
                        <div className={msg.text ? 'mt-2' : ''}>
                          <ChatImagePreview src={msg.imageUrl} maxWidth={200} />
                        </div>
                      )}
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isUser ? 'text-white/60' : 'text-gray-400'}`}>
                        <span className="text-[10px]">{msg.time}</span>
                        {isUser && <CheckCheck size={12} />}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <img src={selectedChat.agentAvatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5 ring-2 ring-purple-100" referrerPolicy="no-referrer" />
                  <TypingIndicator color="gray" size="md" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Pending image preview */}
            {pendingImage && (
              <div className="shrink-0 px-5 py-2 bg-white border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={pendingImage} alt="Preview" className="h-14 rounded-xl object-cover border border-purple-200" />
                    <button
                      onClick={() => setPendingImage(null)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <XCircle size={12} />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">სურათი მზადაა გასაგზავნად</span>
                </div>
              </div>
            )}

            {/* Input bar — hide for booking confirmations */}
            {selectedChat.type === 'booking' ? (
              <div className="px-4 py-3 border-t border-gray-50 bg-blue-50/60 text-center backdrop-blur-sm">
                <p className="text-[12px] text-blue-600 font-semibold">📧 დასტური გაიგზავნა თქვენს ელ-ფოსტაზე</p>
              </div>
            ) : (
              <form
                onSubmit={handleSendMessage}
                className="px-4 py-3.5 border-t border-gray-50 bg-white/80 backdrop-blur-xl flex items-center gap-3"
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
                  <ImageIcon size={20} />
                </button>
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="ჩაწერეთ შეტყობინება..."
                  className="flex-1 bg-gray-50 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 border border-gray-100 outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all"
                />
                <motion.button
                  type="submit"
                  disabled={!replyText.trim() && !pendingImage}
                  whileTap={{ scale: 0.92 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    (replyText.trim() || pendingImage)
                      ? 'bg-gradient-to-br from-ss-primary to-ss-primary-dark text-white shadow-md shadow-purple-500/15'
                      : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  <Send size={16} />
                </motion.button>
              </form>
            )}
          </div>
        ) : (
          <div className="flex-1 hidden sm:flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-200 rounded-2xl blur-2xl opacity-30" />
              <div className="relative w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center">
                <MessageSquare size={28} className="text-purple-300" />
              </div>
            </div>
            <p className="text-sm font-medium">საუბარი ასარჩევად დააწკაპუნეთ</p>
          </div>
        )}
      </div>
    </div>
  );
}
