import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
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
  X,
} from 'lucide-react';
import { useChat, type ChatMessage } from '../hooks/useChat';
import ChatMessageBubble from './chat/ChatMessageBubble';
import TypingIndicator from './chat/TypingIndicator';
import ImageUploadButton from './chat/ImageUploadButton';

interface ChatWindowProps {
  chatId: string;
  currentUserId: string;
  agentName: string;
  agentAvatar?: string;
  onBack?: () => void;
}


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
    uploadImage,
  } = useChat({ chatId, currentUserId });

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !imagePreview) || sending) return;

    const text = input.trim();
    setInput('');
    setSending(true);

    try {
      let imageUrl: string | null = null;
      if (imagePreview) {
        setUploadingImage(true);
        // Convert base64 preview to File and upload
        const res = await fetch(imagePreview);
        const blob = await res.blob();
        const file = new File([blob], `chat-image-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
        imageUrl = await uploadImage(file);
        setImagePreview(null);
        setUploadingImage(false);
      }
      await sendMessage(text, imageUrl);
    } catch {
      // Optimistic UI already shows failed state; no alert needed
    } finally {
      setSending(false);
      setUploadingImage(false);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleImageSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleTyping = useCallback(() => {
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
    <div className="flex flex-col h-[100dvh] w-full font-sans overflow-hidden bg-gradient-to-br from-white to-gray-50">
      {/* Header */}
      <header className="shrink-0 glass-panel-strong border-b border-gray-100/80 px-5 py-3.5 flex items-center gap-3 z-20">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <ChevronLeft size={22} className="text-gray-700" />
          </button>
        )}
        <div className="relative">
          <img
            src={agentAvatar || '/avatar-placeholder.png'}
            alt={agentName}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-100 shadow-sm"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-bold text-gray-900 truncate leading-tight">
            {agentName}
          </h2>
          <p className="text-[11px] text-purple-500 font-medium">
            {isTyping ? 'წერს...' : 'ონლაინ'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2.5 rounded-full hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition-colors cursor-pointer">
            <Phone size={18} />
          </button>
          <button className="p-2.5 rounded-full hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition-colors cursor-pointer">
            <Video size={18} />
          </button>
          <button className="p-2.5 rounded-full hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition-colors cursor-pointer">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>

      {/* Message List */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 space-y-1 scroll-smooth">
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        )}

        {grouped.map(([date, msgs]) => (
          <React.Fragment key={date}>
            {/* Date separator */}
            <div className="flex justify-center my-4">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
                {date}
              </span>
            </div>

            {msgs.map((msg, idx) => (
              <ChatMessageBubble
                key={msg.id}
                message={{
                  id: msg.id,
                  content: msg.content,
                  imageUrl: msg.image_url,
                  created_at: msg.created_at,
                  status: msg.status,
                  is_read: msg.is_read,
                  sender_id: msg.sender_id,
                }}
                variant={isOwn(msg) ? 'user' : 'agent'}
                isOwn={isOwn(msg)}
                onRetry={(m) => {
                  const original = messages.find((om) => om.id === m.id);
                  if (original) retryMessage(original);
                }}
                index={idx}
              />
            ))}
          </React.Fragment>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mb-1">
            <TypingIndicator color="gray" size="md" />
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Image preview bar */}
      {imagePreview && (
        <div className="shrink-0 px-5 py-2 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="h-14 rounded-xl object-cover border border-purple-200" />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={10} />
              </button>
            </div>
            <span className="text-xs text-gray-500">სურათი მზადაა გასაგზავნად</span>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="shrink-0 glass-panel-strong border-t border-gray-100/80 px-5 py-3.5 z-20"
      >
        <div className="flex items-end gap-2.5 max-w-3xl mx-auto">
          <ImageUploadButton
            onImageSelected={handleImageSelected}
            onClear={() => setImagePreview(null)}
            previewUrl={imagePreview}
            uploading={uploadingImage}
            disabled={sending}
          />

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onInput={handleInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="შეტყობინება..."
              className="w-full bg-white/80 border border-gray-100 rounded-[24px] py-3 px-5 text-[15px] text-gray-900 placeholder-gray-400 outline-none resize-none max-h-[120px] focus:bg-white focus:shadow-md focus:shadow-purple-100/50 focus:border-purple-200 transition-all duration-200"
              style={{ minHeight: '48px' }}
            />
          </div>

          <motion.button
            type="submit"
            disabled={(!input.trim() && !imagePreview) || sending || uploadingImage}
            whileTap={{ scale: 0.92 }}
            className={`p-3.5 rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
              (input.trim() || imagePreview) && !sending && !uploadingImage
                ? 'bg-gradient-to-br from-ss-primary to-ss-primary-dark text-white shadow-md shadow-purple-500/20'
                : 'bg-gray-100 text-gray-300'
            }`}
          >
            {sending || uploadingImage ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={18} className="ml-0.5" />
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
