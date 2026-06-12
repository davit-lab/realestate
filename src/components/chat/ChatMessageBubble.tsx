import React from 'react';
import { motion } from 'motion/react';
import { Check, CheckCheck, AlertTriangle, RotateCcw } from 'lucide-react';
import MarkdownText from './MarkdownText';
import ChatImagePreview from './ChatImagePreview';

export interface BubbleMessage {
 id: string;
 content: string;
 imageUrl?: string | null;
 created_at: string;
 status?: 'pending' | 'sent' | 'failed';
 is_read?: boolean;
 sender_id?: string | null;
}

interface ChatMessageBubbleProps {
 key?: React.Key;
 message: BubbleMessage;
 variant: 'user' | 'agent' | 'ai';
 isOwn?: boolean;
 onRetry?: (msg: BubbleMessage) => void;
 index?: number;
}

function formatTime(iso: string): string {
 const d = new Date(iso);
 return d.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatMessageBubble({
 message,
 variant,
 isOwn = false,
 onRetry,
 index = 0,
}: ChatMessageBubbleProps) {
 const failed = message.status === 'failed';

 const bubbleClasses = {
 user: 'bg-gradient-to-br from-ss-primary to-ss-primary-dark text-white rounded-[22px] rounded-tr-[8px]',
 agent: 'bg-white text-gray-800 rounded-[22px] rounded-tl-[8px] shadow-sm border border-gray-100',
 ai: 'bg-white text-gray-700 rounded-[22px] rounded-tl-[8px] shadow-sm border border-gray-100',
 };

 const accentBar = variant !== 'user' && (
 <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${
  variant === 'ai' ? 'bg-violet-400' : 'bg-purple-400'
 }`} />
 );

 return (
 <motion.div
  initial={{ opacity: 0, y: 12, scale: 0.97 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{
  type: 'spring',
  damping: 24,
  stiffness: 300,
  delay: index * 0.03,
  }}
  className={`flex w-full mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}
 >
  <div className="relative max-w-[78%] sm:max-w-[68%]">
  <div
   className={`relative px-[14px] py-[10px] text-[14px] leading-[1.45] ${bubbleClasses[variant]} ${
   failed ? 'opacity-70' : ''
   }`}
   style={{ wordBreak: 'break-word' }}
  >
   {accentBar}
   {message.content && (
   <div className={variant !== 'user' ? 'pl-1' : ''}>
    <MarkdownText text={message.content} className={variant === 'user' ? 'text-white' : ''} />
   </div>
   )}
   {message.imageUrl && (
   <div className={message.content ? 'mt-2' : ''}>
    <ChatImagePreview src={message.imageUrl} maxWidth={220} />
   </div>
   )}

   {/* Meta row */}
   <div
   className={`flex items-center gap-1 mt-1 ${
    isOwn ? 'justify-end' : 'justify-start'
   }`}
   >
   <span
    className={`text-[10px] font-medium ${
    variant === 'user' ? 'text-purple-200' : 'text-gray-400'
    }`}
   >
    {formatTime(message.created_at)}
   </span>

   {isOwn && (
    <span className="flex items-center">
    {message.status === 'pending' && (
     <Check size={11} className="text-purple-200" />
    )}
    {message.status === 'sent' && (
     <CheckCheck size={11} className="text-purple-200" />
    )}
    {failed && (
     <AlertTriangle size={11} className="text-amber-300" />
    )}
    </span>
   )}
   </div>
  </div>

  {/* Failed retry */}
  {failed && isOwn && onRetry && (
   <button
   onClick={() => onRetry(message)}
   className="absolute -right-9 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white shadow-sm hover:bg-purple-50 border border-gray-100 transition-colors cursor-pointer"
   title="ხელახლა გაგზავნა"
   >
   <RotateCcw size={12} className="text-gray-500" />
   </button>
  )}
  </div>
 </motion.div>
 );
}
