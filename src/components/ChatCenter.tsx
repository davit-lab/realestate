import React, { useState } from 'react';
import { MessageSquare, Plus, ArrowLeft } from 'lucide-react';
import { useConversations } from '../hooks/useConversations';
import { useAuth } from '../contexts/AuthContext';
import ChatWindow from './ChatWindow';

export default function ChatCenter() {
 const { user, profile } = useAuth();
 const { conversations, loading, refresh } = useConversations(user?.id);
 const [activeChatId, setActiveChatId] = useState<string | null>(null);

 const activeConv = conversations.find((c) => c.id === activeChatId);

 if (activeChatId && activeConv) {
 return (
  <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-80px)]">
  <button
   onClick={() => { setActiveChatId(null); refresh(); }}
   className="flex items-center gap-2 text-gray-600 text-sm mb-3 hover:text-gray-900 cursor-pointer"
  >
   <ArrowLeft size={16} /> უკან
  </button>
  <ChatWindow
   chatId={activeChatId}
   currentUserId={user?.id || ''}
   agentName={activeConv.title}
   onBack={() => { setActiveChatId(null); refresh(); }}
  />
  </div>
 );
 }

 return (
 <div className="max-w-2xl mx-auto px-4 py-8">
  <div className="flex items-center justify-between mb-6">
  <h2 className="text-lg font-bold text-gray-900">ჩემი მიმოწერები</h2>
  </div>

  {loading && <p className="text-sm text-gray-400">იტვირთება...</p>}

  {!loading && conversations.length === 0 && (
  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
   <MessageSquare size={32} className="mx-auto mb-3 text-gray-300" />
   <p className="text-sm text-gray-500">მიმოწერები არ არის</p>
   <p className="text-xs text-gray-400 mt-1">განცხადების გვერდიდან დააჭირეთ "მესიჯი"</p>
  </div>
  )}

  <div className="space-y-2">
  {conversations.map((conv) => (
   <button
   key={conv.id}
   onClick={() => setActiveChatId(conv.id)}
   className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-400 transition-colors cursor-pointer flex items-center justify-between"
   >
   <div>
    <p className="font-semibold text-sm text-gray-900">{conv.title}</p>
    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
    {conv.last_message || 'არანაირი მესიჯი'}
    </p>
   </div>
   <div className="flex items-center gap-2">
    {conv.unread_count > 0 && (
    <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
     {conv.unread_count}
    </span>
    )}
    <span className="text-[10px] text-gray-400">
    {new Date(conv.last_sent_at).toLocaleDateString('ka-GE', { day: 'numeric', month: 'short' })}
    </span>
   </div>
   </button>
  ))}
  </div>
 </div>
 );
}
