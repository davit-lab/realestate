import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, Loader2, Eye, Trash2, X, Search } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { _flash } from './AdminPanel';

interface ConversationRow {
  id: string;
  buyer_id: string | null;
  agent_id: string | null;
  title: string;
  last_message: string | null;
  last_sent_at: string;
  buyer_name?: string;
  agent_name?: string;
  buyer_email?: string;
  agent_email?: string;
}

interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string | null;
  content: string;
  image_url?: string | null;
  is_read: boolean;
  status: string;
  created_at: string;
}

interface Props {
  conversations: ConversationRow[];
  loading: boolean;
  onRefresh: () => void;
  isDark: boolean;
  txtMain: string;
  txtSub: string;
  bgCard: string;
  brdCard: string;
  search: string;
  setSearch: (s: string) => void;
  setFeedback: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function ChatsTab({
  conversations,
  loading,
  onRefresh,
  isDark,
  txtMain,
  txtSub,
  bgCard,
  brdCard,
  search,
  setSearch,
  setFeedback,
}: Props) {
  const [selectedChat, setSelectedChat] = useState<ConversationRow | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [senderMap, setSenderMap] = useState<Map<string, { name: string }>>(new Map());

  console.log('[ChatsTab] conversations:', conversations.length, 'loading:', loading);

  const filtered = useMemo(() => {
    if (!search) return conversations;
    const s = search.toLowerCase();
    return conversations.filter(
      (c) =>
        (c.title || '').toLowerCase().includes(s) ||
        (c.buyer_name || '').toLowerCase().includes(s) ||
        (c.agent_name || '').toLowerCase().includes(s) ||
        (c.last_message || '').toLowerCase().includes(s)
    );
  }, [conversations, search]);

  const fetchMessages = useCallback(async (chatId: string) => {
    if (!isSupabaseConfigured) return;
    setMsgLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(200);

    if (error) {
      console.error('[ChatsTab] fetch messages error:', error.message);
    } else {
      setMessages(data || []);
    }
    setMsgLoading(false);
  }, []);

  const loadSenders = useCallback(async (msgs: ChatMessage[]) => {
    const senderIds = [...new Set(msgs.map((m) => m.sender_id).filter(Boolean) as string[])];
    const missing = senderIds.filter((id) => !senderMap.has(id));
    if (missing.length === 0) return;
    const { data } = await supabase.from('profiles').select('id, name').in('id', missing);
    if (data && data.length > 0) {
      setSenderMap((prev) => {
        const next = new Map(prev);
        data.forEach((p: any) => next.set(p.id, { name: p.name || 'უცნობი' }));
        return next;
      });
    }
  }, [senderMap]);

  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }
    fetchMessages(selectedChat.id);
  }, [selectedChat, fetchMessages]);

  useEffect(() => {
    loadSenders(messages);
  }, [messages, loadSenders]);

  useEffect(() => {
    if (!selectedChat || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`admin-chat:${selectedChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${selectedChat.id}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${selectedChat.id}`,
        },
        (payload) => {
          const oldId = (payload.old as any).id as string;
          setMessages((prev) => prev.filter((m) => m.id !== oldId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat]);

  const deleteMessage = async (msgId: string) => {
    if (!confirm('შეტყობინების წაშლა?')) return;
    const { error } = await supabase.from('messages').delete().eq('id', msgId);
    if (error) {
      _flash('შეცდომა: ' + error.message, setFeedback);
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      _flash('შეტყობინება წაიშალა', setFeedback);
    }
  };

  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('ka-GE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className={`rounded-2xl border p-3 ${bgCard} ${brdCard} flex items-center gap-2`}>
        <Search size={16} className={txtSub} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ძებნა მონაწილის სახელით, თემით ან შეტყობინებით..."
          className={`flex-1 bg-transparent text-sm outline-none ${txtMain} placeholder-gray-400`}
        />
        {search && (
          <button onClick={() => setSearch('')} className={`text-xs ${txtSub} hover:text-gray-900 cursor-pointer`}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Conversations table */}
      <div className={`rounded-2xl border ${bgCard} ${brdCard} overflow-hidden`}>
        <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark ? 'border-[#2A2A32]' : 'border-gray-100'}`}>
          <h3 className={`text-sm font-bold ${txtMain}`}>საუბრები ({filtered.length})</h3>
          <button
            onClick={onRefresh}
            className={`flex items-center gap-1 text-[11px] ${txtSub} hover:text-gray-900 cursor-pointer`}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            განახლება
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={22} className="animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr
                  className={`text-[10px] font-bold uppercase tracking-wider ${txtSub} border-b ${isDark ? 'border-[#2A2A32]' : 'border-gray-100'}`}
                >
                  <th className="px-5 py-2.5">მონაწილეები</th>
                  <th className="px-5 py-2.5">თემა</th>
                  <th className="px-5 py-2.5">ბოლო შეტყობინება</th>
                  <th className="px-5 py-2.5">თარიღი</th>
                  <th className="px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className={`border-b last:border-0 ${isDark ? 'border-[#2A2A32]' : 'border-gray-50'} hover:${isDark ? 'bg-[#25252B]' : 'bg-gray-50/50'} transition-colors`}
                  >
                    <td className="px-5 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-xs font-semibold ${txtMain}`}>
                          {c.buyer_name || 'უცნობი'}
                        </span>
                        {c.agent_id && (
                          <span className={`text-[10px] ${txtSub}`}>
                            ↔ {c.agent_name || 'უცნობი'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{c.title || '—'}</td>
                    <td className={`px-5 py-2.5 text-xs ${txtSub} max-w-xs truncate`}>
                      {c.last_message || '—'}
                    </td>
                    <td className={`px-5 py-2.5 text-xs ${txtSub}`}>
                      {c.last_sent_at ? fmtDate(c.last_sent_at) : '—'}
                    </td>
                    <td className="px-5 py-2.5">
                      <button
                        onClick={() => setSelectedChat(c)}
                        className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                        title="ნახვა"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className={`text-xs ${txtSub} text-center py-8`}>
                      საუბარი არ არის
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chat detail modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
          <div
            className={`rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl ${bgCard} ${brdCard} border`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-5 py-3 border-b shrink-0 ${isDark ? 'border-[#2A2A32]' : 'border-gray-100'}`}
            >
              <div>
                <h3 className={`text-sm font-bold ${txtMain}`}>{selectedChat.title || 'საუბარი'}</h3>
                <p className={`text-[10px] ${txtSub}`}>
                  {selectedChat.buyer_name || 'უცნობი'}
                  {selectedChat.agent_id ? ` ↔ ${selectedChat.agent_name || 'უცნობი'}` : ''}
                </p>
              </div>
              <button
                onClick={() => setSelectedChat(null)}
                className={`p-1.5 rounded-lg cursor-pointer ${txtSub} hover:bg-gray-100`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={22} className="animate-spin text-gray-300" />
                </div>
              ) : messages.length === 0 ? (
                <p className={`text-xs ${txtSub} text-center py-8`}>შეტყობინება არ არის</p>
              ) : (
                messages.map((m) => {
                  const senderName = m.sender_id ? senderMap.get(m.sender_id)?.name || 'უცნობი' : 'სისტემა';
                  return (
                    <div
                      key={m.id}
                      className={`group flex flex-col gap-1 p-3 rounded-xl ${isDark ? 'bg-[#25252B]' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold ${txtMain}`}>{senderName}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] ${txtSub}`}>{fmtTime(m.created_at)}</span>
                          <button
                            onClick={() => deleteMessage(m.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                            title="წაშლა"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      {m.content && (
                        <p className={`text-xs ${txtSub} whitespace-pre-wrap break-words`}>{m.content}</p>
                      )}
                      {m.image_url && (
                        <img
                          src={m.image_url}
                          alt="attachment"
                          className="max-w-xs max-h-48 rounded-lg object-cover mt-1"
                          loading="lazy"
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div
              className={`px-5 py-3 border-t text-[10px] ${txtSub} ${isDark ? 'border-[#2A2A32]' : 'border-gray-100'}`}
            >
              ჯამში {messages.length} შეტყობინება
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
