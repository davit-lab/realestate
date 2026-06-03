import React, { useState, useEffect } from 'react';
import {
  Users, Home, TrendingUp, Shield, Trash2, CheckCircle, XCircle,
  RefreshCw, Eye, Crown, LayoutDashboard, AlertTriangle, Loader2
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Listing } from '../types';

interface AdminUser {
  id: string;
  name: string;
  avatar_url: string;
  phone: string;
  balance: number;
  is_admin: boolean;
  is_agent: boolean;
  created_at: string;
  email?: string;
}

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  admin_response: string | null;
  created_at: string;
  user_name?: string;
}

interface AdminStats {
  totalListings: number;
  totalUsers: number;
  totalBalance: number;
  recentListings: number;
}

type SubTab = 'dashboard' | 'listings' | 'users' | 'support' | 'balance';

interface AdminPanelProps {
  localListings: Listing[];
  onDeleteListing: (id: string) => void;
}

export default function AdminPanel({ localListings, onDeleteListing }: AdminPanelProps) {
  const [sub, setSub] = useState<SubTab>('dashboard');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [dbListings, setDbListings] = useState<any[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<AdminStats>({ totalListings: 0, totalUsers: 0, totalBalance: 0, recentListings: 0 });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [addBalanceUserId, setAddBalanceUserId] = useState<string | null>(null);
  const [addBalanceAmount, setAddBalanceAmount] = useState('');
  const [ticketResponse, setTicketResponse] = useState<{ id: string; text: string } | null>(null);

  const flash = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(null), 3000); };

  const loadTickets = async () => {
    if (!isSupabaseConfigured) return;
    setLoadingTickets(true);
    const { data } = await supabase
      .from('support_tickets')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })
      .limit(50);
    setTickets((data || []).map((t: any) => ({
      ...t,
      user_name: t.profiles?.name || 'უცნობი',
    })));
    setLoadingTickets(false);
  };

  const loadUsers = async () => {
    if (!isSupabaseConfigured) return;
    setLoadingUsers(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data as AdminUser[]) || []);
    setLoadingUsers(false);
  };

  const loadDbListings = async () => {
    if (!isSupabaseConfigured) return;
    setLoadingListings(true);
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false }).limit(100);
    setDbListings(data || []);
    setLoadingListings(false);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStats({ totalListings: localListings.length, totalUsers: 0, totalBalance: 0, recentListings: localListings.length });
      return;
    }
    (async () => {
      const [{ count: lc }, { data: ud }] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('balance'),
      ]);
      const totalBalance = (ud || []).reduce((s: number, r: any) => s + (r.balance || 0), 0);
      setStats({
        totalListings: (lc ?? 0) + localListings.length,
        totalUsers: ud?.length ?? 0,
        totalBalance,
        recentListings: localListings.length,
      });
    })();
  }, [localListings]);

  useEffect(() => {
    if (sub === 'users') loadUsers();
    if (sub === 'listings') loadDbListings();
    if (sub === 'support') loadTickets();
  }, [sub]);

  const toggleAdmin = async (userId: string, current: boolean) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('profiles').update({ is_admin: !current }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !current } : u));
    flash(`Admin ${!current ? 'მიენიჭა' : 'გაუქმდა'}`);
  };

  const toggleAgent = async (userId: string, current: boolean) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('profiles').update({ is_agent: !current }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_agent: !current } : u));
    flash(`აგენტის სტატუსი ${!current ? 'მიენიჭა' : 'გაუქმდა'}`);
  };

  const addBalance = async (userId: string, amount: number) => {
    if (!isSupabaseConfigured || amount <= 0) return;
    const { data: current } = await supabase.from('profiles').select('balance').eq('id', userId).single();
    const newBalance = (current?.balance || 0) + amount;
    await supabase.from('profiles').update({ balance: newBalance }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: newBalance } : u));
    setAddBalanceUserId(null);
    setAddBalanceAmount('');
    flash(`${amount} ₾ ჩარიცხულია`);
  };

  const updateTicketStatus = async (id: string, status: string, response?: string) => {
    if (!isSupabaseConfigured) return;
    const update: any = { status };
    if (response !== undefined) update.admin_response = response;
    await supabase.from('support_tickets').update(update).eq('id', id);
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status, admin_response: response || t.admin_response } : t));
    setTicketResponse(null);
    flash('საპორტი განახლდა');
  };

  const deleteDbListing = async (id: string) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('properties').delete().eq('id', id);
    setDbListings(prev => prev.filter(l => l.id !== id));
    flash('განცხადება წაიშალა');
  };

  const statCards = [
    { icon: <Home size={20} />, label: 'სულ განცხადება', value: stats.totalListings, color: 'bg-blue-50 text-blue-600' },
    { icon: <Users size={20} />, label: 'დარეგისტრირებული', value: stats.totalUsers, color: 'bg-violet-50 text-violet-600' },
    { icon: <TrendingUp size={20} />, label: 'სულ ბალანსი', value: `${stats.totalBalance.toFixed(2)} ₾`, color: 'bg-emerald-50 text-emerald-600' },
    { icon: <Crown size={20} />, label: 'ახლო განცხ.', value: stats.recentListings, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="min-h-full w-full bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-gray-900 leading-none">ადმინ პანელი</h1>
            <p className="text-[12px] text-gray-500 mt-0.5">სრული კონტროლი</p>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="flex bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm gap-1 mb-6 w-fit flex-wrap">
          {([
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
            { id: 'listings', label: 'განცხადებები', icon: <Home size={14} /> },
            { id: 'users', label: 'მომხმარებლები', icon: <Users size={14} /> },
            { id: 'support', label: 'საპორტი', icon: <AlertTriangle size={14} /> },
            { id: 'balance', label: 'ბალანსი', icon: <TrendingUp size={14} /> },
          ] as { id: SubTab; label: string; icon: React.ReactNode }[]).map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setSub(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                sub === id ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {feedback && (
          <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-[13px] font-semibold">
            <CheckCircle size={15} />{feedback}
          </div>
        )}

        {!isSupabaseConfigured && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-[13px] font-semibold">
            <AlertTriangle size={15} />
            Supabase კონფიგაცია არ არის — local data-ს ვაჩვენებ
          </div>
        )}

        {/* ── Dashboard ── */}
        {sub === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((c, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.color}`}>{c.icon}</div>
                  <div>
                    <p className="text-[11px] text-gray-500 font-semibold">{c.label}</p>
                    <p className="text-[20px] font-black text-gray-900 leading-none mt-0.5">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent local listings preview */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 text-[15px] mb-4">ბოლო განცხადებები (local)</h3>
              {localListings.length === 0 ? (
                <p className="text-gray-400 text-[13px]">განცხადება არ არის</p>
              ) : (
                <div className="space-y-2">
                  {localListings.slice(0, 5).map(l => (
                    <div key={l.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <img src={l.image} className="w-10 h-10 rounded-lg object-cover border border-gray-200" alt="" />
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900 line-clamp-1">{l.title}</p>
                          <p className="text-[11px] text-gray-500">{l.city} · {l.priceLari.toLocaleString()} ₾</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { onDeleteListing(l.id); flash('განცხადება წაიშალა'); }}
                        className="text-red-400 hover:text-red-600 transition-colors cursor-pointer p-1.5 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Listings (Supabase) ── */}
        {sub === 'listings' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-[15px]">DB განცხადებები</h3>
              <button onClick={loadDbListings} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">
                <RefreshCw size={13} className={loadingListings ? 'animate-spin' : ''} />განახლება
              </button>
            </div>
            {loadingListings ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
            ) : dbListings.length === 0 ? (
              <p className="text-gray-400 text-[13px] text-center py-8">Supabase-ში განცხადება არ არის</p>
            ) : (
              <div className="space-y-2">
                {dbListings.map(l => (
                  <div key={l.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">{l.title || l.location || l.id}</p>
                      <p className="text-[11px] text-gray-500">{l.status} · {l.price ? `${l.price} ${l.currency}` : '—'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${l.status === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {l.status}
                      </span>
                      <button onClick={() => deleteDbListing(l.id)} className="text-red-400 hover:text-red-600 cursor-pointer p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Users ── */}
        {sub === 'users' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-[15px]">მომხმარებლები ({users.length})</h3>
              <button onClick={loadUsers} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">
                <RefreshCw size={13} className={loadingUsers ? 'animate-spin' : ''} />განახლება
              </button>
            </div>
            {loadingUsers ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
            ) : users.length === 0 ? (
              <p className="text-gray-400 text-[13px] text-center py-8">
                {isSupabaseConfigured ? 'მომხმარებელი არ არის' : 'Supabase კონფიგაცია არ არის'}
              </p>
            ) : (
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                        {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-[13px] font-bold">
                            {(u.name || '?')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900 flex items-center gap-1.5">
                          {u.name || 'უცნობი'}
                          {u.is_admin && <span className="text-[9px] bg-gray-900 text-white px-1.5 py-0.5 rounded-full font-bold">ADMIN</span>}
                          {u.is_agent && <span className="text-[9px] bg-violet-600 text-white px-1.5 py-0.5 rounded-full font-bold">აგენტი</span>}
                        </p>
                        <p className="text-[11px] text-gray-500">{u.phone || '—'} · ბალ: {u.balance?.toFixed(2) || '0.00'} ₾</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAgent(u.id, u.is_agent)}
                        className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          u.is_agent ? 'bg-violet-50 text-violet-600 hover:bg-violet-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {u.is_agent ? <><XCircle size={12} />აგენტი გაუქმება</> : <><CheckCircle size={12} />აგენტი მინიჭება</>}
                      </button>
                      <button
                        onClick={() => toggleAdmin(u.id, u.is_admin)}
                        className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          u.is_admin ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {u.is_admin ? <><XCircle size={12} />Admin გაუქმება</> : <><CheckCircle size={12} />Admin მინიჭება</>}
                      </button>
                      <button
                        onClick={() => { setAddBalanceUserId(u.id); setAddBalanceAmount(''); }}
                        className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 cursor-pointer transition-colors"
                      >
                        <TrendingUp size={12} />ბალანსი+
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Support Tickets ── */}
        {sub === 'support' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-[15px]">საპორტის ბილეთები ({tickets.length})</h3>
              <button onClick={loadTickets} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">
                <RefreshCw size={13} className={loadingTickets ? 'animate-spin' : ''} />განახლება
              </button>
            </div>
            {loadingTickets ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
            ) : tickets.length === 0 ? (
              <p className="text-gray-400 text-[13px] text-center py-8">საპორტის ბილეთი არ არის</p>
            ) : (
              <div className="space-y-3">
                {tickets.map(t => (
                  <div key={t.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[13px] font-bold text-gray-900">{t.subject}</p>
                        <p className="text-[11px] text-gray-500">{t.user_name} · {new Date(t.created_at).toLocaleDateString('ka-GE')}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        t.status === 'open' ? 'bg-red-50 text-red-600' :
                        t.status === 'in_progress' ? 'bg-amber-50 text-amber-600' :
                        t.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {t.status === 'open' ? 'ღია' : t.status === 'in_progress' ? 'მუშავდება' : t.status === 'resolved' ? 'გადაწყვეტილი' : 'დახურული'}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-700 mb-3">{t.message}</p>
                    {t.admin_response && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-[11px] font-semibold text-gray-900 mb-1">ადმინის პასუხი:</p>
                        <p className="text-[12px] text-gray-600">{t.admin_response}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <select
                        value={t.status}
                        onChange={(e) => updateTicketStatus(t.id, e.target.value)}
                        className="text-[11px] border border-gray-200 rounded-lg px-2 py-1 cursor-pointer"
                      >
                        <option value="open">ღია</option>
                        <option value="in_progress">მუშავდება</option>
                        <option value="resolved">გადაწყვეტილი</option>
                        <option value="closed">დახურული</option>
                      </select>
                      <button
                        onClick={() => setTicketResponse({ id: t.id, text: '' })}
                        className="text-[11px] font-semibold text-violet-600 hover:text-violet-800 cursor-pointer"
                      >
                        პასუხის დაწერა
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Balance Management ── */}
        {sub === 'balance' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 text-[15px] mb-5">ბალანსის მართვა</h3>
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                      {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-[13px] font-bold">
                          {(u.name || '?')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">{u.name || 'უცნობი'}</p>
                      <p className="text-[11px] text-gray-500">ბალ: {u.balance?.toFixed(2) || '0.00'} ₾</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setAddBalanceUserId(u.id); setAddBalanceAmount(''); }}
                    className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 cursor-pointer transition-colors"
                  >
                    <TrendingUp size={12} />ბალანსი+
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Balance Modal */}
        {addBalanceUserId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="font-bold text-gray-900 text-[15px] mb-4">ბალანსის შევსება</h3>
              <input
                type="number"
                value={addBalanceAmount}
                onChange={(e) => setAddBalanceAmount(e.target.value)}
                placeholder="თანხა (₾)"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] mb-4 outline-none focus:border-violet-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setAddBalanceUserId(null)}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  გაუქმება
                </button>
                <button
                  onClick={() => addBalance(addBalanceUserId, parseFloat(addBalanceAmount) || 0)}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer transition-colors"
                >
                  დადასტურება
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Response Modal */}
        {ticketResponse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="font-bold text-gray-900 text-[15px] mb-4">ადმინის პასუხი</h3>
              <textarea
                value={ticketResponse.text}
                onChange={(e) => setTicketResponse({ ...ticketResponse, text: e.target.value })}
                placeholder="პასუხი..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] mb-4 outline-none focus:border-violet-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setTicketResponse(null)}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  გაუქმება
                </button>
                <button
                  onClick={() => updateTicketStatus(ticketResponse.id, 'in_progress', ticketResponse.text)}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-violet-600 hover:bg-violet-700 cursor-pointer transition-colors"
                >
                  გაგზავნა
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
