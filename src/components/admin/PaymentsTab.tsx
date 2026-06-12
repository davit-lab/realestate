import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Banknote } from 'lucide-react';
import type { PaymentProvider, PaymentProviderType } from '../../types';

interface Props {
  providers: PaymentProvider[];
  onSave: (provider: PaymentProvider) => void;
  onToggleActive: (id: string, active: boolean) => void;
  isDark: boolean;
  txtMain: string;
  txtSub: string;
  bgCard: string;
  brdCard: string;
}

const DEFAULT_PROVIDERS: Omit<PaymentProvider, 'id' | 'updated_at' | 'created_at'>[] = [
  {
    provider_type: 'bog_ipay',
    name: 'საქართველოს ბანკი (BOG iPay)',
    description: 'საბანკო გადახდა',
    is_active: false,
    callback_url: '',
    client_id: '',
    merchant_id: '',
    secret_key: '',
    terminal_id: '',
  },
  {
    provider_type: 'flitt',
    name: 'Flitt (საბანკო გადახდა)',
    description: 'საბანკო გადახდა',
    is_active: false,
    callback_url: '',
    client_id: '',
    merchant_id: '',
    secret_key: '',
    terminal_id: '',
  },
  {
    provider_type: 'tbc_opay',
    name: 'ოპინი ბანკი (TBC E-Commerce)',
    description: 'ონლაინ გადახდები',
    is_active: false,
    callback_url: '',
    client_id: '',
    merchant_id: '',
    secret_key: '',
    terminal_id: '',
  },
];

function ProviderCard({
  provider,
  onSave,
  onToggleActive,
  isDark,
  txtMain,
  txtSub,
  bgCard,
  brdCard,
}: {
  key?: React.Key;
  provider: PaymentProvider;
  onSave: (p: PaymentProvider) => void;
  onToggleActive: (id: string, active: boolean) => void;
  isDark: boolean;
  txtMain: string;
  txtSub: string;
  bgCard: string;
  brdCard: string;
}) {
  const [form, setForm] = useState<PaymentProvider>(provider);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    setForm(provider);
  }, [provider]);

  const hasChanges =
    form.callback_url !== provider.callback_url ||
    form.client_id !== provider.client_id ||
    form.merchant_id !== provider.merchant_id ||
    form.secret_key !== provider.secret_key ||
    form.terminal_id !== provider.terminal_id;

  const inputBase = `w-full rounded-xl border px-3 py-2.5 text-xs outline-none transition-colors ${
    isDark
      ? 'bg-[#1A1A1E] border-[#2A2A32] text-white placeholder-gray-500 focus:border-violet-500'
      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-500'
  }`;

  const labelBase = `text-[10px] font-semibold uppercase tracking-wide mb-1 flex items-center gap-1`;

  return (
    <div
      className={`rounded-2xl border p-5 transition-colors ${bgCard} ${brdCard} ${
        provider.is_active ? (isDark ? 'ring-1 ring-violet-500/30' : 'ring-1 ring-violet-200') : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              provider.is_active ? 'bg-violet-600' : isDark ? 'bg-[#2A2A32]' : 'bg-gray-100'
            }`}
          >
            <Banknote size={16} className={provider.is_active ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'} />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${txtMain}`}>{provider.name}</h3>
            <p className={`text-[11px] ${txtSub}`}>
              {provider.description}
              {provider.is_active && (
                <span className="ml-2 text-emerald-400 font-semibold">• აქტიური</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] ${txtSub}`}>
            {provider.is_active ? 'ჩართული' : 'გამორთული'}
          </span>
          <button
            onClick={() => onToggleActive(provider.id, !provider.is_active)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
              provider.is_active ? 'bg-violet-600' : isDark ? 'bg-gray-700' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                provider.is_active ? 'translate-x-4.5' : 'translate-x-1'
              }`}
              style={{ transform: provider.is_active ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {/* Callback URL */}
        <div>
          <label className={`${labelBase} ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
            <span className="text-violet-500">#</span> Callback URL
          </label>
          <p className={`text-[10px] ${txtSub} mb-1`}>
            გადახდის შედეგის დასაბრუნებელი URL (Flitt-ისთვის და სხვა პროვაიდერებისთვის)
          </p>
          <input
            type="text"
            value={form.callback_url}
            onChange={(e) => setForm((p) => ({ ...p, callback_url: e.target.value }))}
            placeholder="შეიყვანეთ Callback URL"
            className={inputBase}
          />
        </div>

        {/* Client ID */}
        <div>
          <label className={`${labelBase} ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
            <span className="text-violet-500">#</span> Client ID
          </label>
          <p className={`text-[10px] ${txtSub} mb-1`}>
            ბანკის მიერ მონიჭებული კლიენტის იდენტიფიკატორი
          </p>
          <input
            type="text"
            value={form.client_id}
            onChange={(e) => setForm((p) => ({ ...p, client_id: e.target.value }))}
            placeholder="შეიყვანეთ Client ID"
            className={inputBase}
          />
        </div>

        {/* Merchant ID */}
        <div>
          <label className={`${labelBase} ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
            <span className="text-violet-500">#</span> Merchant ID (და/ან ნომერი)
          </label>
          <p className={`text-[10px] ${txtSub} mb-1`}>
            მერჩანტის უნიკალური იდენტიფიკატორი
          </p>
          <input
            type="text"
            value={form.merchant_id}
            onChange={(e) => setForm((p) => ({ ...p, merchant_id: e.target.value }))}
            placeholder="შეიყვანეთ Merchant ID (და/ან ნომერი)"
            className={inputBase}
          />
        </div>

        {/* Secret Key */}
        <div>
          <label className={`${labelBase} ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
            <span className="text-violet-500">#</span> Secret Key (გადახდის გასაღები)
          </label>
          <p className={`text-[10px] ${txtSub} mb-1`}>
            საიდუმლო გასაღები ტრანზაქციის ვერიფიკაციისთვის
          </p>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={form.secret_key}
              onChange={(e) => setForm((p) => ({ ...p, secret_key: e.target.value }))}
              placeholder="შეიყვანეთ Secret Key (საიდუმლო გასაღები)"
              className={`${inputBase} pr-10`}
            />
            <button
              onClick={() => setShowSecret((s) => !s)}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${txtSub} hover:${txtMain} cursor-pointer transition-colors`}
              type="button"
              tabIndex={-1}
            >
              {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Terminal ID */}
        <div>
          <label className={`${labelBase} ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
            <span className="text-violet-500">#</span> Terminal ID
          </label>
          <p className={`text-[10px] ${txtSub} mb-1`}>
            ტერმინალის უნიკალური იდენტიფიკატორი
          </p>
          <input
            type="text"
            value={form.terminal_id}
            onChange={(e) => setForm((p) => ({ ...p, terminal_id: e.target.value }))}
            placeholder="შეიყვანეთ Terminal ID"
            className={inputBase}
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => onSave(form)}
          disabled={!hasChanges}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            hasChanges ? 'bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-900/20' : 'bg-gray-500'
          }`}
        >
          <Save size={13} />
          შენახვა
        </button>
      </div>
    </div>
  );
}

export default function PaymentsTab({
  providers,
  onSave,
  onToggleActive,
  isDark,
  txtMain,
  txtSub,
  bgCard,
  brdCard,
}: Props) {
  const [localProviders, setLocalProviders] = useState<PaymentProvider[]>([]);

  useEffect(() => {
    if (providers.length === 0) {
      // Initialize with defaults if none exist
      setLocalProviders(
        DEFAULT_PROVIDERS.map((p, i) => ({
          ...p,
          id: `default-${p.provider_type}-${i}`,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }))
      );
    } else {
      // Merge DB providers with defaults for missing types
      const merged: PaymentProvider[] = [];
      for (const def of DEFAULT_PROVIDERS) {
        const found = providers.find((p) => p.provider_type === def.provider_type);
        if (found) {
          merged.push(found);
        } else {
          merged.push({
            ...def,
            id: `default-${def.provider_type}`,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          });
        }
      }
      setLocalProviders(merged);
    }
  }, [providers]);

  return (
    <div className="space-y-4 max-w-3xl">
      <div className={`rounded-2xl border p-4 ${bgCard} ${brdCard}`}>
        <h3 className={`text-sm font-bold mb-1 ${txtMain}`}>გადახდის პროვაიდერები</h3>
        <p className={`text-xs ${txtSub}`}>
          აირჩიეთ და კონფიგურაცია გაუკეთეთ სასურველ საბანკო პროვაიდერს. მხოლოდ ერთი შეიძლება იყოს აქტიური ერთდროულად.
        </p>
      </div>

      {localProviders.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          onSave={(p) => {
            // Ensure only one provider is active
            if (p.is_active) {
              setLocalProviders((prev) =>
                prev.map((lp) =>
                  lp.provider_type === p.provider_type
                    ? p
                    : { ...lp, is_active: false }
                )
              );
            }
            onSave(p);
          }}
          onToggleActive={(id, active) => {
            if (active) {
              // Deactivate all others visually
              setLocalProviders((prev) =>
                prev.map((lp) => ({
                  ...lp,
                  is_active: lp.id === id ? true : false,
                }))
              );
            } else {
              setLocalProviders((prev) =>
                prev.map((lp) =>
                  lp.id === id ? { ...lp, is_active: false } : lp
                )
              );
            }
            onToggleActive(id, active);
          }}
          isDark={isDark}
          txtMain={txtMain}
          txtSub={txtSub}
          bgCard={bgCard}
          brdCard={brdCard}
        />
      ))}
    </div>
  );
}
