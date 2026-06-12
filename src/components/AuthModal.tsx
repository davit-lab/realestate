import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
 onClose: () => void;
 onSuccess?: () => void;
}

type Mode = 'signin' | 'signup';

const PHOTOS = [
 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80',
];

interface FieldProps {
 icon: React.ReactNode;
 type: string;
 value: string;
 onChange: (v: string) => void;
 placeholder: string;
 required?: boolean;
 right?: React.ReactNode;
 autoComplete?: string;
}

function Field({ icon, type, value, onChange, placeholder, required, right, autoComplete }: FieldProps) {
 return (
 <div className="relative group">
  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-700 transition-colors pointer-events-none">
  {icon}
  </div>
  <input
  type={type}
  value={value}
  onChange={e => onChange(e.target.value)}
  placeholder={placeholder}
  required={required}
  autoComplete={autoComplete}
  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 text-[14px] font-medium focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
  />
  {right && (
  <div className="absolute right-4 top-1/2 -translate-y-1/2">{right}</div>
  )}
 </div>
 );
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
 const [mode, setMode] = useState<Mode>('signin');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [name, setName] = useState('');
 const [phone, setPhone] = useState('');
 const [showPw, setShowPw] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState<string | null>(null);
 const [photoIdx, setPhotoIdx] = useState(0);

 const { signIn, signUp } = useAuth();

 useEffect(() => {
 const t = setInterval(() => setPhotoIdx(i => (i + 1) % PHOTOS.length), 4000);
 return () => clearInterval(t);
 }, []);

 const switchMode = (m: Mode) => { setMode(m); setError(null); setSuccess(null); };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);
 setSuccess(null);
 setLoading(true);

 if (!isSupabaseConfigured) {
  setError('Supabase კონფიგაცია არ არის. დაამატეთ .env.local ფაილი.');
  setLoading(false);
  return;
 }

 if (mode === 'signup') {
  if (!name.trim()) { setError('სახელი სავალდებულოა'); setLoading(false); return; }
  if (password.length < 6) { setError('პაროლი მინ. 6 სიმბოლო'); setLoading(false); return; }
  const { error: err } = await signUp(email, password, name, phone);
  if (err) {
  setError(err.message === 'User already registered' ? 'ეს ელ-ფოსტა უკვე დარეგისტრირებულია' : err.message);
  } else {
  setSuccess('გამარჯობა! გთხოვთ გაიარეთ ელ-ფოსტის ვერიფიკაცია.');
  }
 } else {
  const { error: err } = await signIn(email, password);
  if (err) {
  setError(err.message === 'Invalid login credentials' ? 'არასწორი ელ-ფოსტა ან პაროლი' : err.message);
  } else {
  onSuccess?.();
  onClose();
  }
 }
 setLoading(false);
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: 'system-ui, sans-serif' }}>
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />

  {/* Card */}
  <div className="relative w-full max-w-[860px] h-auto rounded-3xl overflow-hidden shadow-2xl flex bg-white">

  {/* ── LEFT: photo panel (hidden on mobile) ── */}
  <div className="hidden md:flex md:w-[46%] relative flex-col overflow-hidden">
   {PHOTOS.map((src, i) => (
   <div
    key={src}
    className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
    style={{ backgroundImage: `url(${src})`, opacity: i === photoIdx ? 1 : 0 }}
   />
   ))}
   {/* Dark gradient overlay */}
   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

   {/* Logo top */}
   <div className="relative z-10 p-7">
   <div className="flex items-center gap-2.5">
    <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xl border border-white/25 flex items-center justify-center">
    <Building2 size={18} className="text-white" />
    </div>
    <span className="text-white font-black text-[18px] tracking-tight">adjarahome</span>
   </div>
   </div>

   {/* Bottom tagline */}
   <div className="relative z-10 mt-auto p-7">
   <p className="text-white font-black text-[22px] leading-tight mb-2">
    საუკეთესო<br />უძრავი ქონება<br />საქართველოში
   </p>
   <p className="text-white/60 text-[13px] font-medium">
    ათასობით განცხადება · ვერიფიცირებული მოიჯარეები
   </p>
   {/* Photo dots */}
   <div className="flex gap-1.5 mt-4">
    {PHOTOS.map((_, i) => (
    <div
     key={i}
     onClick={() => setPhotoIdx(i)}
     className={`rounded-full cursor-pointer transition-all duration-300 ${i === photoIdx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}
    />
    ))}
   </div>
   </div>
  </div>

  {/* ── RIGHT: form panel ── */}
  <div className="flex-1 flex flex-col p-8 sm:p-10 overflow-y-auto max-h-[90vh]">

   {/* Close */}
   <button
   onClick={onClose}
   className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer transition-all z-10"
   >
   <X size={16} />
   </button>

   {/* Title */}
   <div className="mb-8">
   <h2 className="text-[26px] font-black text-gray-900 tracking-tight leading-none">
    {mode === 'signin' ? 'კეთილი იყოს' : 'შექმენი'}
    <br />
    <span className="text-gray-400 font-medium text-[22px]">
    {mode === 'signin' ? 'შემოსვლა' : 'ახალი ანგარიში'}
    </span>
   </h2>
   </div>

   {/* Tab switch */}
   <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
   {(['signin', 'signup'] as Mode[]).map(m => (
    <button
    key={m}
    onClick={() => switchMode(m)}
    className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
     mode === m
     ? 'bg-white text-gray-900 shadow-sm'
     : 'text-gray-500 hover:text-gray-700'
    }`}
    >
    {m === 'signin' ? 'შესვლა' : 'რეგისტრაცია'}
    </button>
   ))}
   </div>

   {/* Form */}
   <form onSubmit={handleSubmit} className="space-y-3 flex-1">
   {mode === 'signup' && (
    <Field
    icon={<User size={16} />}
    type="text"
    value={name}
    onChange={setName}
    placeholder="სახელი და გვარი"
    required
    autoComplete="name"
    />
   )}
   {mode === 'signup' && (
    <Field
    icon={<Phone size={16} />}
    type="tel"
    value={phone}
    onChange={setPhone}
    placeholder="ტელეფონი (სურვილისამებრ)"
    autoComplete="tel"
    />
   )}
   <Field
    icon={<Mail size={16} />}
    type="email"
    value={email}
    onChange={setEmail}
    placeholder="ელ-ფოსტა"
    required
    autoComplete="email"
   />
   <Field
    icon={<Lock size={16} />}
    type={showPw ? 'text' : 'password'}
    value={password}
    onChange={setPassword}
    placeholder="პაროლი"
    required
    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
    right={
    <button
     type="button"
     onClick={() => setShowPw(v => !v)}
     className="text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
    >
     {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
    }
   />

   {/* Feedback */}
   {error && (
    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-[13px] font-medium">
    <AlertCircle size={15} className="shrink-0 mt-0.5" />
    {error}
    </div>
   )}
   {success && (
    <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-emerald-700 text-[13px] font-medium">
    <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
    {success}
    </div>
   )}

   {/* Submit */}
   <button
    type="submit"
    disabled={loading}
    className="w-full bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-[15px] flex items-center justify-center gap-2.5 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
   >
    {loading
    ? <Loader2 size={17} className="animate-spin" />
    : <>{mode === 'signin' ? 'შესვლა' : 'ანგარიშის შექმნა'}<ArrowRight size={17} /></>
    }
   </button>

   {/* Switch hint */}
   <p className="text-center text-[13px] text-gray-400 pt-1">
    {mode === 'signin' ? 'ანგარიში არ გაქვს?' : 'უკვე დარეგისტრირებული ხარ?'}{' '}
    <button
    type="button"
    onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
    className="text-gray-900 font-bold hover:underline cursor-pointer"
    >
    {mode === 'signin' ? 'დარეგისტრირდი' : 'შედი'}
    </button>
   </p>
   </form>
  </div>
  </div>
 </div>
 );
}
