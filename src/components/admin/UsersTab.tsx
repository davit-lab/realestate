import React, { useState, useMemo } from 'react';
import { RefreshCw, Loader2, Shield, UserCheck, Plus, Minus, Mail, Eye, X } from 'lucide-react';
import type { AdminUserExtended } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { fmtGEL, _flash } from './AdminPanel';

interface Props {
  users: AdminUserExtended[];
  loading: boolean;
  onRefresh: () => void;
  onToggleAdmin: (id: string, current: boolean) => void;
  onToggleAgent: (id: string, current: boolean) => void;
  onAdjustBalance: (id: string, mode: 'add' | 'deduct', amount: number, reason: string) => void;
  isDark: boolean; txtMain: string; txtSub: string; bgCard: string; brdCard: string;
  search: string; setSearch: (s: string) => void;
  setFeedback: React.Dispatch<React.SetStateAction<string|null>>;
}

export default function UsersTab({ users, loading, onRefresh, onToggleAdmin, onToggleAgent, onAdjustBalance, isDark, txtMain, txtSub, bgCard, brdCard, search, setSearch, setFeedback }: Props) {
  const { generatePasswordResetLink } = useAuth();
  const [balModal, setBalModal] = useState<{ userId: string; mode: 'add' | 'deduct' } | null>(null);
  const [balAmt, setBalAmt] = useState('');
  const [balReason, setBalReason] = useState('');
  const [pwEmail, setPwEmail] = useState('');
  const [pwSent, setPwSent] = useState(false);
  const [detailUser, setDetailUser] = useState<AdminUserExtended | null>(null);

  const filtered = useMemo(() => users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || (u.phone || '').includes(search)
  ), [users, search]);

  const sendPw = async () => {
    if (!pwEmail) return;
    const { error } = await generatePasswordResetLink(pwEmail);
    if (error) _flash(`შეცდომა: ${error.message}`, setFeedback);
    else { setPwSent(true); setTimeout(() => setPwSent(false), 3000); _flash('ბმული გაგზავნილია', setFeedback); }
  };

  return (
    <div className="space-y-4">
      {/* Password reset + stats row */}
      <div className={`rounded-2xl border p-4 ${bgCard} ${brdCard} flex flex-col sm:flex-row items-start sm:items-center gap-3`}>
        <div className="flex items-center gap-2 flex-1">
          <Mail size={16} className={txtSub} />
          <input type="email" value={pwEmail} onChange={e => setPwEmail(e.target.value)} placeholder="მომხმარებლის ელ-ფოსტა..." className={`flex-1 bg-transparent text-sm outline-none ${txtMain} placeholder-gray-400`} />
        </div>
        <button onClick={sendPw} disabled={!pwEmail} className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-40" style={{ background: '#7C3AED' }}>
          {pwSent ? 'გაგზავნილია!' : 'პაროლის აღდგენა'}
        </button>
      </div>

      {/* Users table */}
      <div className={`rounded-2xl border ${bgCard} ${brdCard} overflow-hidden`}>
        <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark ? 'border-[#2A2A32]' : 'border-gray-100'}`}>
          <h3 className={`text-sm font-bold ${txtMain}`}>მომხმარებლები ({filtered.length})</h3>
          <button onClick={onRefresh} className={`flex items-center gap-1 text-[11px] ${txtSub} hover:text-gray-900 cursor-pointer`}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />განახლება
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-gray-300" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`text-[10px] font-bold uppercase tracking-wider ${txtSub} border-b ${isDark ? 'border-[#2A2A32]' : 'border-gray-100'}`}>
                  <th className="px-5 py-2.5">მომხმარებელი</th><th className="px-5 py-2.5">ელ-ფოსტა</th><th className="px-5 py-2.5">ბალანსი</th><th className="px-5 py-2.5">როლები</th><th className="px-5 py-2.5">ბოლო აქტივობა</th><th className="px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className={`border-b last:border-0 ${isDark ? 'border-[#2A2A32]' : 'border-gray-50'} hover:${isDark ? 'bg-[#25252B]' : 'bg-gray-50/50'} transition-colors`}>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center text-[11px] font-bold shrink-0 ${isDark ? 'border-[#2A2A32] bg-[#25252B] text-gray-400' : 'border-gray-200 bg-gray-100 text-gray-500'}`}>
                          {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : (u.name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${txtMain}`}>{u.name || 'უცნობი'}</p>
                          <p className={`text-[10px] ${txtSub}`}>{u.phone || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{u.email}</td>
                    <td className={`px-5 py-2.5 text-xs font-semibold ${txtMain}`}>{fmtGEL(u.balance || 0)}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-1">
                        {u.is_admin && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: '#7C3AED' }}>ADMIN</span>}
                        {u.is_agent && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">აგენტი</span>}
                      </div>
                    </td>
                    <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('ka-GE') : '—'}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onToggleAgent(u.id, u.is_agent)} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${u.is_agent ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`} title={u.is_agent ? 'აგენტის გაუქმება' : 'აგენტის მინიჭება'}><UserCheck size={13} /></button>
                        <button onClick={() => onToggleAdmin(u.id, u.is_admin)} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${u.is_admin ? 'text-rose-500 hover:bg-rose-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`} title={u.is_admin ? 'Admin გაუქმება' : 'Admin მინიჭება'}><Shield size={13} /></button>
                        <button onClick={() => { setBalModal({ userId: u.id, mode: 'add' }); setBalAmt(''); setBalReason(''); }} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer" title="ბალანსის შევსება"><Plus size={13} /></button>
                        <button onClick={() => { setBalModal({ userId: u.id, mode: 'deduct' }); setBalAmt(''); setBalReason(''); }} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer" title="ბალანსის ჩამოჭრა"><Minus size={13} /></button>
                        <button onClick={() => setDetailUser(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer" title="დეტალები"><Eye size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className={`text-xs ${txtSub} text-center py-8`}>მომხმარებელი არ არის</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Balance modal */}
      {balModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
          <div className={`rounded-2xl p-5 w-full max-w-sm shadow-2xl ${bgCard} ${brdCard} border`}>
            <h3 className={`text-sm font-bold mb-3 ${txtMain}`}>ბალანსის {balModal.mode === 'add' ? 'შევსება' : 'ჩამოჭრა'}</h3>
            <input type="number" value={balAmt} onChange={e => setBalAmt(e.target.value)} placeholder="თანხა (GEL)" className={`w-full border rounded-xl px-3 py-2 text-sm mb-2 outline-none ${isDark ? 'bg-[#25252B] border-[#2A2A32] text-white' : 'bg-white border-gray-200 text-gray-900'}`} />
            <input type="text" value={balReason} onChange={e => setBalReason(e.target.value)} placeholder="მიზეზი..." className={`w-full border rounded-xl px-3 py-2 text-sm mb-3 outline-none ${isDark ? 'bg-[#25252B] border-[#2A2A32] text-white' : 'bg-white border-gray-200 text-gray-900'}`} />
            <div className="flex gap-2">
              <button onClick={() => setBalModal(null)} className={`flex-1 py-2 rounded-xl text-xs font-semibold cursor-pointer ${isDark ? 'text-gray-400 bg-[#25252B] hover:bg-[#2A2A32]' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}>გაუქმება</button>
              <button onClick={() => onAdjustBalance(balModal.userId, balModal.mode, parseFloat(balAmt) || 0, balReason)} disabled={!balAmt || parseFloat(balAmt) <= 0} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer disabled:opacity-40" style={{ background: balModal.mode === 'add' ? '#10B981' : '#EF4444' }}>დადასტურება</button>
            </div>
          </div>
        </div>
      )}

      {/* User detail modal */}
      {detailUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
          <div className={`rounded-2xl p-5 w-full max-w-md shadow-2xl ${bgCard} ${brdCard} border`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-bold ${txtMain}`}>მომხმარებლის დეტალები</h3>
              <button onClick={() => setDetailUser(null)} className={`p-1 rounded-lg cursor-pointer ${txtSub} hover:bg-gray-100`}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-[#25252B] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{detailUser.avatar_url ? <img src={detailUser.avatar_url} className="w-full h-full rounded-full object-cover" alt="" /> : (detailUser.name || '?')[0].toUpperCase()}</div>
                <div><p className={`text-sm font-bold ${txtMain}`}>{detailUser.name || 'უცნობი'}</p><p className={`text-xs ${txtSub}`}>{detailUser.email}</p></div>
              </div>
              <div className={`grid grid-cols-2 gap-2 text-xs ${txtSub}`}>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#25252B]' : 'bg-gray-50'}`}><p>ტელეფონი</p><p className={`font-semibold ${txtMain}`}>{detailUser.phone || '—'}</p></div>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#25252B]' : 'bg-gray-50'}`}><p>ბალანსი</p><p className={`font-semibold ${txtMain}`}>{fmtGEL(detailUser.balance || 0)}</p></div>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#25252B]' : 'bg-gray-50'}`}><p>რეგისტრაცია</p><p className={`font-semibold ${txtMain}`}>{detailUser.user_created_at ? new Date(detailUser.user_created_at).toLocaleDateString('ka-GE') : '—'}</p></div>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#25252B]' : 'bg-gray-50'}`}><p>ბოლო აქტივობა</p><p className={`font-semibold ${txtMain}`}>{detailUser.last_sign_in_at ? new Date(detailUser.last_sign_in_at).toLocaleDateString('ka-GE') : '—'}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
