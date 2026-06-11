import React, { useMemo } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import type { AdminTransaction } from '../../types';
import { fmtDate, fmtGEL } from './AdminPanel';

interface Props {
  transactions: AdminTransaction[];
  loading: boolean;
  onRefresh: () => void;
  isDark: boolean; txtMain: string; txtSub: string; bgCard: string; brdCard: string;
  search: string;
}

export default function TransactionsTab({ transactions, loading, onRefresh, isDark, txtMain, txtSub, bgCard, brdCard, search }: Props) {
  const filtered = useMemo(() => transactions.filter(t =>
    !search || (t.user_name || '').toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
  ), [transactions, search]);

  const typeColor = (type: string) => {
    switch (type) {
      case 'refill': return 'bg-emerald-50 text-emerald-700';
      case 'deduct': return 'bg-rose-50 text-rose-700';
      case 'package_purchase': return 'bg-purple-50 text-purple-700';
      case 'package_refund': return 'bg-amber-50 text-amber-700';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'refill': return 'შევსება';
      case 'deduct': return 'ჩამოჭრა';
      case 'package_purchase': return 'პაკეტი';
      case 'package_refund': return 'რეფანდი';
      case 'listing_fee': return 'განცხადება';
      default: return type;
    }
  };

  return (
    <div className={`rounded-2xl border ${bgCard} ${brdCard} overflow-hidden`}>
      <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark ? 'border-[#2A2A32]' : 'border-gray-100'}`}>
        <h3 className={`text-sm font-bold ${txtMain}`}>ტრანზაქციები ({filtered.length})</h3>
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
                <th className="px-5 py-2.5">მომხმარებელი</th><th className="px-5 py-2.5">ტიპი</th><th className="px-5 py-2.5">თანხა</th><th className="px-5 py-2.5">აღწერა</th><th className="px-5 py-2.5">თარიღი</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className={`border-b last:border-0 ${isDark ? 'border-[#2A2A32]' : 'border-gray-50'} hover:${isDark ? 'bg-[#25252B]' : 'bg-gray-50/50'} transition-colors`}>
                  <td className={`px-5 py-2.5 text-xs font-semibold ${txtMain}`}>{t.user_name || 'უცნობი'}</td>
                  <td className="px-5 py-2.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor(t.type)}`}>{typeLabel(t.type)}</span></td>
                  <td className={`px-5 py-2.5 text-xs font-semibold ${t.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{t.amount > 0 ? '+' : ''}{fmtGEL(Math.abs(t.amount))}</td>
                  <td className={`px-5 py-2.5 text-xs ${txtSub} max-w-[200px] truncate`}>{t.description}</td>
                  <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{fmtDate(t.created_at)}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className={`text-xs ${txtSub} text-center py-8`}>ტრანზაქცია არ არის</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
