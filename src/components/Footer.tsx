import React, { useState } from 'react';
import {
 Home,
 Mail,
 Phone,
 MapPin,
 Facebook,
 Instagram,
 Youtube,
 Send,
 ArrowUpRight,
 ChevronRight,
 MessageCircle,
 CheckCircle,
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const LINKS = {
 listings: [
 { label: 'იყიდება თბილისში', href: '#' },
 { label: 'ქირავდება ბათუმში', href: '#' },
 { label: 'იპოთეკა', href: '#' },
 { label: 'გირაო', href: '#' },
 { label: 'VIP განცხადებები', href: '#' },
 { label: 'ახალი აშენებული', href: '#' },
 ],
 company: [
 { label: 'ჩვენს შესახებ', href: '#' },
 { label: 'ბლოგი', href: '#' },
 { label: 'კარიერა', href: '#' },
 { label: 'პარტნიორები', href: '#' },
 { label: 'რეკლამა', href: '#' },
 { label: 'აგენტების სია', href: '#' },
 ],
 support: [
 { label: 'ხშირად დასმული კითხვები', href: '#' },
 { label: 'განცხადების დამატება', href: '#' },
 { label: 'VIP სტატუსი', href: '#' },
 { label: 'წესები და პირობები', href: '#' },
 { label: 'კონფიდენციალურობა', href: '#' },
 { label: 'დახმარების ცენტრი', href: '#' },
 ],
};

const CITIES = ['თბილისი', 'ბათუმი', 'ქობულეთი', 'ქუთაისი', 'გორი', 'რუსთავი', 'ზუგდიდი', 'ფოთი'];

interface FooterProps {
 onTermsClick?: () => void;
 onPrivacyClick?: () => void;
 onHelpClick?: () => void;
}

export default function Footer({ onTermsClick, onPrivacyClick, onHelpClick }: FooterProps) {
 const currentYear = new Date().getFullYear();
 const [email, setEmail] = useState('');
 const [subscribed, setSubscribed] = useState(false);
 const { showToast } = useToast();

 const handleSubscribe = (e: React.FormEvent) => {
 e.preventDefault();
 if (!email.trim() || !email.includes('@')) {
  showToast('გთხოვთ, შეიყვანეთ სწორი იმეილი', 'warning');
  return;
 }
 setSubscribed(true);
 showToast('თქვენ წარმატებით გამოიწერეთ!', 'success');
 setEmail('');
 setTimeout(() => setSubscribed(false), 4000);
 };

 return (
 <footer className="bg-[#0F0F12] text-gray-300 border-t border-gray-800">
  {/* ── Newsletter bar ── */}
  <div className="border-b border-gray-800">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
   <div className="flex flex-col md:flex-row items-center justify-between gap-5">
   <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
    <Mail size={18} className="text-ss-primary" />
    </div>
    <div>
    <h3 className="text-white font-bold text-sm">ახალი განცხადებების გამოწერა</h3>
    <p className="text-gray-500 text-xs mt-0.5">მიიღეთ პირველებმა საუკეთესო შეთავაზებები</p>
    </div>
   </div>
   <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full md:w-auto">
    <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="იმეილი"
    disabled={subscribed}
    className="flex-1 md:w-64 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-ss-primary transition-colors disabled:opacity-50"
    />
    <button
    type="submit"
    disabled={subscribed}
    className="bg-ss-primary hover:bg-ss-primary-dark disabled:bg-emerald-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
    >
    {subscribed ? <CheckCircle size={13} /> : <Send size={13} />}
    {subscribed ? 'გამოიწერა!' : 'გამოწერა'}
    </button>
   </form>
   </div>
  </div>
  </div>

  {/* ── Main footer ── */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

   {/* Brand column */}
   <div className="lg:col-span-2 space-y-4">
   <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-lg bg-ss-primary flex items-center justify-center shrink-0">
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
     <path d="M10 2L3 8v10h5v-5h4v5h5V8L10 2z" fill="white" />
    </svg>
    </div>
    <span className="text-[15px] font-black text-white tracking-tight">
    adjara<span className="text-ss-primary">home</span>
    </span>
   </div>
   <p className="text-gray-500 text-[13px] leading-relaxed max-w-sm">
    საქართველოს უდიდესი უძრავი ქონების პორტალი. იპოვეთ, შეადარეთ და შეიძინეთ თქვენი ახალი სახლი მარტივად და სწრაფად.
   </p>

   {/* Contact */}
   <div className="space-y-2 pt-2">
    <a href="tel:+995322111111" className="flex items-center gap-2 text-gray-500 hover:text-white text-[13px] transition-colors">
    <Phone size={13} className="text-gray-600" />
    +995 (32) 2-11-11-11
    </a>
    <a href="mailto:info@adjarahome.ge" className="flex items-center gap-2 text-gray-500 hover:text-white text-[13px] transition-colors">
    <Mail size={13} className="text-gray-600" />
    info@adjarahome.ge
    </a>
    <div className="flex items-center gap-2 text-gray-500 text-[13px]">
    <MapPin size={13} className="text-gray-600" />
    თბილისი, რუსთაველის გამზირი 10
    </div>
   </div>

   {/* Socials */}
   <div className="flex items-center gap-2 pt-1">
    {[
    { icon: <Facebook size={15} />, label: 'Facebook' },
    { icon: <Instagram size={15} />, label: 'Instagram' },
    { icon: <Youtube size={15} />, label: 'YouTube' },
    { icon: <MessageCircle size={15} />, label: 'Messenger' },
    ].map(({ icon, label }) => (
    <button
     key={label}
     className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 flex items-center justify-center transition-colors cursor-pointer"
     title={label}
    >
     {icon}
    </button>
    ))}
   </div>
   </div>

   {/* Listings */}
   <div>
   <h4 className="text-white font-bold text-[13px] mb-3.5">განცხადებები</h4>
   <ul className="space-y-2">
    {LINKS.listings.map(l => (
    <li key={l.label}>
     <a href={l.href} className="text-gray-500 hover:text-white text-[12px] transition-colors flex items-center gap-1 group">
     <ChevronRight size={10} className="text-gray-700 group-hover:text-ss-primary transition-colors" />
     {l.label}
     </a>
    </li>
    ))}
   </ul>
   </div>

   {/* Company */}
   <div>
   <h4 className="text-white font-bold text-[13px] mb-3.5">კომპანია</h4>
   <ul className="space-y-2">
    {LINKS.company.map(l => (
    <li key={l.label}>
     <a href={l.href} className="text-gray-500 hover:text-white text-[12px] transition-colors flex items-center gap-1 group">
     <ChevronRight size={10} className="text-gray-700 group-hover:text-ss-primary transition-colors" />
     {l.label}
     </a>
    </li>
    ))}
   </ul>
   </div>

   {/* Support */}
   <div>
   <h4 className="text-white font-bold text-[13px] mb-3.5">დახმარება</h4>
   <ul className="space-y-2">
    {LINKS.support.map(l => {
    const handler =
     l.label === 'წესები და პირობები' ? onTermsClick :
     l.label === 'კონფიდენციალურობა' ? onPrivacyClick :
     l.label === 'დახმარების ცენტრი' ? onHelpClick :
     undefined;
    return (
     <li key={l.label}>
     {handler ? (
      <button
      onClick={handler}
      className="text-gray-500 hover:text-white text-[12px] transition-colors flex items-center gap-1 group cursor-pointer"
      >
      <ChevronRight size={10} className="text-gray-700 group-hover:text-blue-400 transition-colors" />
      {l.label}
      </button>
     ) : (
      <a href={l.href} className="text-gray-500 hover:text-white text-[12px] transition-colors flex items-center gap-1 group">
      <ChevronRight size={10} className="text-gray-700 group-hover:text-ss-primary transition-colors" />
      {l.label}
      </a>
     )}
     </li>
    );
    })}
   </ul>
   </div>
  </div>

  {/* ── Cities bar ── */}
  <div className="mt-10 pt-6 border-t border-gray-800">
   <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">ქალაქები</p>
   <div className="flex flex-wrap gap-x-4 gap-y-2">
   {CITIES.map(c => (
    <a key={c} href="#" className="text-gray-500 hover:text-white text-[12px] transition-colors flex items-center gap-0.5 group">
    {c}
    <ArrowUpRight size={10} className="text-gray-700 group-hover:text-ss-primary transition-colors" />
    </a>
   ))}
   </div>
  </div>
  </div>

  {/* ── Copyright ── */}
  <div className="border-t border-gray-800">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
   <p className="text-gray-600 text-[11px]">
   © {currentYear} Adjarahome.ge — ყველა უფლება დაცულია.
   </p>
   <div className="flex items-center gap-4 text-gray-600 text-[11px]">
   <button onClick={onTermsClick} className="hover:text-gray-400 transition-colors cursor-pointer">წესები და პირობები</button>
   <button onClick={onPrivacyClick} className="hover:text-gray-400 transition-colors cursor-pointer">კონფიდენციალურობა</button>
   <button onClick={onHelpClick} className="hover:text-gray-400 transition-colors cursor-pointer">დახმარება</button>
   </div>
  </div>
  </div>
 </footer>
 );
}
