import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  RotateCcw,
  AlertTriangle,
  MoreHorizontal,
  Phone,
  Video,
  ChevronLeft,
  Check,
  CheckCheck,
  Paperclip,
} from 'lucide-react';
import { useChat, type ChatMessage } from '../hooks/useChat';

interface ChatWindowProps {
  chatId: string;
  currentUserId: string;
  agentName: string;
  agentAvatar?: string;
  onBack?: () => void;
}

const BURNT_PAPER_BG = `
  radial-gradient(ellipse at 20% 50%, rgba(210, 180, 140, 0.15) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, rgba(188, 160, 120, 0.12) 0%, transparent 45%),
  radial-gradient(ellipse at 50% 80%, rgba(200, 170, 130, 0.10) 0%, transparent 55%),
  linear-gradient(175deg, #f5f0e8 0%, #ede7dc 40%, #e8e2d4 100%)
`;

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
}

function groupByDate(messages: ChatMessage[]): [string, ChatMessage[]][] {
  const groups = new Map<string, ChatMessage[]>();
  messages.forEach((m) => {
    const date = new Date(m.created_at).toLocaleDateString('ka-GE', {
      day: 'numeric',
      month: 'short',
    });
    const arr = groups.get(date) || [];
    arr.push(m);
    groups.set(date, arr);
  });
  return Array.from(groups.entries());
}

export default function ChatWindow({
  chatId,
  currentUserId,
  agentName,
  agentAvatar,
  onBack,
}: ChatWindowProps) {
  const {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    retryMessage,
    markRead,
  } = useChat({ chatId, currentUserId });

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Mark unread messages as read
  useEffect(() => {
    const unread = messages
      .filter((m) => m.sender_id !== currentUserId && !m.is_read)
      .map((m) => m.id);
    if (unread.length) markRead(unread);
  }, [messages, currentUserId, markRead]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const text = input.trim();
    setInput('');
    setSending(true);

    try {
      await sendMessage(text);
    } catch {
      // Optimistic UI already shows failed state; no alert needed
    } finally {
      setSending(false);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleTyping = useCallback(() => {
    // Debounced typing broadcast
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {}, 2000);
  }, []);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    setInput(el.value);
    handleTyping();
  };

  const isOwn = (m: ChatMessage) => m.sender_id === currentUserId;

  const grouped = groupByDate(messages);

  return (
    <div className="flex flex-col h-[100dvh] w-full font-sans overflow-hidden">
      {/* Burnt paper background layer */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: BURNT_PAPER_BG }}
      />

      {/* Header */}
      <header className="shrink-0 backdrop-blur-2xl bg-white/40 border-b border-white/50 px-4 py-3 flex items-center gap-3 z-20">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-white/50 transition-colors cursor-pointer"
          >
            <ChevronLeft size={22} className="text-gray-700" />
          </button>
        )}
        <div className="relative">
          <img
            src={agentAvatar || '/avatar-placeholder.png'}
            alt={agentName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/60 shadow-sm"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-bold text-gray-900 truncate leading-tight">
            {agentName}
          </h2>
          <p className="text-[11px] text-gray-500 font-medium">
            {isTyping ? 'წერს...' : 'ონლაინ'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2.5 rounded-full hover:bg-white/50 transition-colors cursor-pointer">
            <Phone size={18} className="text-gray-600" />
          </button>
          <button className="p-2.5 rounded-full hover:bg-white/50 transition-colors cursor-pointer">
            <Video size={18} className="text-gray-600" />
          </button>
          <button className="p-2.5 rounded-full hover:bg-white/50 transition-colors cursor-pointer">
            <MoreHorizontal size={18} className="text-gray-600" />
          </button>
        </div>
      </header>

      {/* Message List */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-1 scroll-smooth">
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          </div>
        )}

        {grouped.map(([date, msgs]) => (
          <React.Fragment key={date}>
            {/* Date separator */}
            <div className="flex justify-center my-4">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/40">
                {date}
              </span>
            </div>

            {msgs.map((msg) => {
              const own = isOwn(msg);
              const failed = msg.status === 'failed';

              return (
                <div
                  key={msg.id}
                  className={`flex w-full mb-1 ${
                    own ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`relative max-w-[75%] sm:max-w-[65%] px-[14px] py-[9px] text-[15px] leading-[1.35] shadow-sm ${
                      own
                        ? 'bg-[#007AFF] text-white'
                        : 'bg-white/80 text-gray-900 backdrop-blur-sm'
                    } ${
                      own
                        ? 'rounded-[20px] rounded-tr-[6px]'
                        : 'rounded-[20px] rounded-tl-[6px]'
                    } ${
                      failed ? 'opacity-70' : ''
                    }`}
                    style={{ wordBreak: 'break-word' }}
                  >
                    {msg.content}

                    {/* Meta row */}
                    <div
                      className={`flex items-center gap-1 mt-0.5 ${
                        own ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-medium ${
                          own ? 'text-blue-200' : 'text-gray-400'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </span>

                      {own && (
                        <span className="flex items-center">
                          {msg.status === 'pending' && (
                            <Check size={11} className="text-blue-200" />
                          )}
                          {msg.status === 'sent' && (
                            <CheckCheck size={11} className="text-blue-200" />
                          )}
                          {msg.status === 'failed' && (
                            <AlertTriangle size={11} className="text-amber-300" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Failed retry */}
                    {failed && own && (
                      <button
                        onClick={() => retryMessage(msg)}
                        className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white cursor-pointer"
                        title="ხელახლა გაგზავნა"
                      >
                        <RotateCcw size={12} className="text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mb-1">
            <div className="bg-white/70 backdrop-blur-sm px-4 py-3 rounded-[20px] rounded-tl-[6px] shadow-sm inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="shrink-0 backdrop-blur-2xl bg-white/50 border-t border-white/50 px-4 py-3 z-20"
      >
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <button
            type="button"
            className="p-2.5 rounded-full hover:bg-white/60 transition-colors cursor-pointer shrink-0"
          >
            <Paperclip size={20} className="text-gray-500" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onInput={handleInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="შეტყობინება..."
              className="w-full bg-white/70 border border-white/80 rounded-[22px] py-2.5 px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none resize-none max-h-[120px] focus:bg-white/90 focus:shadow-md focus:shadow-stone-200/30 transition-all duration-200"
              style={{ minHeight: '44px' }}
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || sending}
            className={`p-3 rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
              input.trim() && !sending
                ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/20 hover:bg-[#0051D5]'
                : 'bg-gray-200 text-gray-400'
            }`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={18} className="ml-0.5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
