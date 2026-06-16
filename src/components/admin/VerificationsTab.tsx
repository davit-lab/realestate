import React, { useState, useMemo } from 'react';
import { RefreshCw, Loader2, Eye, X, CheckCircle, XCircle } from 'lucide-react';
import type { ProfileVerification } from '../../types';
import { _flash } from './AdminPanel';

interface VerificationRow extends ProfileVerification {
  user_name?: string;
}

interface Props {
  verifications: VerificationRow[];
  loading: boolean;
  onRefresh: () => void;
  onReview: (vid: string, userId: string, status: 'approved' | 'rejected', note?: string) => void;
  isDark: boolean;
  txtMain: string;
  txtSub: string;
  bgCard: string;
  brdCard: string;
  setFeedback: React.Dispatch<React.SetStateAction<string | null>>;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const docTypeLabels: Record<string, string> = {
  id_card: 'პირადობის მოწმობა',
  passport: 'პასპორტი',
  license: 'მართვის მოწმობა',
};

const statusLabels: Record<string, string> = {
  pending: 'მომლოდინე',
  approved: 'დადასტურებული',
  rejected: 'უარყოფილი',
};

export default function VerificationsTab({
  verifications,
  loading,
  onRefresh,
  onReview,
  isDark,
  txtMain,
  txtSub,
  bgCard,
  brdCard,
  setFeedback,
}: Props) {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [detail, setDetail] = useState<VerificationRow | null>(null);
  const [note, setNote] = useState('');

  const filtered = useMemo(() => {
    if (filter === 'all') return verifications;
    return verifications.filter((v) => v.status === filter);
  }, [verifications, filter]);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('ka-GE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const handleReview = (status: 'approved' | 'rejected') => {
    if (!detail) return;
    onReview(detail.id, detail.user_id, status, note.trim());
    setDetail(null);
    setNote('');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className={`rounded-2xl border p-3 flex flex-wrap gap-2 ${bgCard} ${brdCard}`}>
        {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
              filter === f
                ? 'text-white'
                : isDark
                ? 'text-gray-400 hover:text-white hover:bg-[#25252B]'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
            style={filter === f ? { background: '#7C3AED' } : {}}
          >
            {f === 'all' && 'ყველა'}
            {f === 'pending' && 'მომლოდინე'}
            {f === 'approved' && 'დადასტურებული'}
            {f === 'rejected' && 'უარყოფილი'}
            <span className="ml-1 opacity-70">
              ({f === 'all' ? verifications.length : verifications.filter((v) => v.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={`rounded-2xl border ${bgCard} ${brdCard} overflow-hidden`}>
        <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark ? 'border-[#2A2A32]' : 'border-gray-100'}`}>
          <h3 className={`text-sm font-bold ${txtMain}`}>ვერიფიკაციები ({filtered.length})</h3>
          <button onClick={onRefresh} className={`flex items-center gap-1 text-[11px] ${txtSub} hover:text-gray-900 cursor-pointer`}>
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
                <tr className={`text-[10px] font-bold uppercase tracking-wider ${txtSub} border-b ${isDark ? 'border-[#2A2A32]' : 'border-gray-100'}`}>
                  <th className="px-5 py-2.5">მომხმარებელი</th>
                  <th className="px-5 py-2.5">დოკუმენტის ტიპი</th>
                  <th className="px-5 py-2.5">სტატუსი</th>
                  <th className="px-5 py-2.5">თარიღი</th>
                  <th className="px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr
                    key={v.id}
                    className={`border-b last:border-0 ${isDark ? 'border-[#2A2A32]' : 'border-gray-50'} hover:${isDark ? 'bg-[#25252B]' : 'bg-gray-50/50'} transition-colors`}
                  >
                    <td className="px-5 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-xs font-semibold ${txtMain}`}>{v.user_name || 'უცნობი'}</span>
                        <span className={`text-[10px] ${txtSub}`}>{v.user_id?.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{docTypeLabels[v.doc_type] || v.doc_type}</td>
                    <td className="px-5 py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          v.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : v.status === 'rejected'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {statusLabels[v.status] || v.status}
                      </span>
                    </td>
                    <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{v.submitted_at ? fmtDate(v.submitted_at) : '—'}</td>
                    <td className="px-5 py-2.5">
                      <button
                        onClick={() => { setDetail(v); setNote(''); }}
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
                      მოთხოვნა არ არის
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail / Review Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
          <div className={`rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl ${bgCard} ${brdCard} border`}>
            <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark ? 'border-[#2A2A32]' : 'border-gray-100'}`}>
              <h3 className={`text-sm font-bold ${txtMain}`}>ვერიფიკაციის დეტალები</h3>
              <button onClick={() => setDetail(null)} className={`p-1 rounded-lg cursor-pointer ${txtSub} hover:bg-gray-100`}>
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className={`grid grid-cols-2 gap-3 text-xs ${txtSub}`}>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#25252B]' : 'bg-gray-50'}`}>
                  <p>მომხმარებელი</p>
                  <p className={`font-semibold ${txtMain}`}>{detail.user_name || 'უცნობი'}</p>
                </div>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#25252B]' : 'bg-gray-50'}`}>
                  <p>დოკუმენტი</p>
                  <p className={`font-semibold ${txtMain}`}>{docTypeLabels[detail.doc_type] || detail.doc_type}</p>
                </div>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#25252B]' : 'bg-gray-50'}`}>
                  <p>სტატუსი</p>
                  <p className={`font-semibold ${txtMain}`}>{statusLabels[detail.status] || detail.status}</p>
                </div>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#25252B]' : 'bg-gray-50'}`}>
                  <p>თარიღი</p>
                  <p className={`font-semibold ${txtMain}`}>{detail.submitted_at ? fmtDate(detail.submitted_at) : '—'}</p>
                </div>
              </div>

              {detail.admin_note && (
                <div className={`p-3 rounded-lg text-xs ${txtSub} ${isDark ? 'bg-[#25252B]' : 'bg-gray-50'}`}>
                  <p className="font-semibold mb-1">ადმინის შენიშვნა:</p>
                  <p>{detail.admin_note}</p>
                </div>
              )}

              {/* Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detail.front_image_url && (
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${txtSub}`}>წინა მხარე</p>
                    <a href={detail.front_image_url} target="_blank" rel="noreferrer">
                      <img
                        src={detail.front_image_url}
                        alt="front"
                        className="rounded-xl w-full h-48 object-cover border hover:opacity-90 transition-opacity"
                        style={{ borderColor: isDark ? '#2A2A32' : '#E5E7EB' }}
                      />
                    </a>
                  </div>
                )}
                {detail.back_image_url && (
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${txtSub}`}>უკანა მხარე</p>
                    <a href={detail.back_image_url} target="_blank" rel="noreferrer">
                      <img
                        src={detail.back_image_url}
                        alt="back"
                        className="rounded-xl w-full h-48 object-cover border hover:opacity-90 transition-opacity"
                        style={{ borderColor: isDark ? '#2A2A32' : '#E5E7EB' }}
                      />
                    </a>
                  </div>
                )}
              </div>

              {/* Review actions */}
              {detail.status === 'pending' && (
                <div className="space-y-2">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="ადმინის შენიშვნა (არასავალდებულო)..."
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none resize-none ${isDark ? 'bg-[#25252B] border-[#2A2A32] text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview('approved')}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer flex items-center justify-center gap-1.5"
                      style={{ background: '#10B981' }}
                    >
                      <CheckCircle size={13} />
                      დადასტურება
                    </button>
                    <button
                      onClick={() => handleReview('rejected')}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer flex items-center justify-center gap-1.5"
                      style={{ background: '#EF4444' }}
                    >
                      <XCircle size={13} />
                      უარყოფა
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
