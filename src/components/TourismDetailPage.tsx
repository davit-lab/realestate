import React, { useState } from 'react';
import {
 ArrowLeft, Star, MapPin, Calendar, Clock, Tag, ChevronLeft, ChevronRight,
 CheckCircle, Plane, Train, Music, Mountain, Heart, Ticket, Users, Share2
} from 'lucide-react';
import type { TourismItem, TourismCategory } from './TourismDetailModal';
import { useBookings } from '../hooks/useBookings';
import { useAuth } from '../contexts/AuthContext';

const CAT_COLORS: Record<string, { bg: string; text: string; light: string }> = {
 attractions: { bg: 'from-orange-500 to-amber-500', text: 'text-orange-600', light: 'bg-orange-50 border-orange-200' },
 flights:  { bg: 'from-blue-500 to-indigo-600', text: 'text-blue-600', light: 'bg-blue-50 border-blue-200' },
 trains:  { bg: 'from-emerald-500 to-teal-600', text: 'text-emerald-600', light: 'bg-emerald-50 border-emerald-200' },
 concerts: { bg: 'from-purple-500 to-fuchsia-600',text: 'text-purple-600', light: 'bg-purple-50 border-purple-200' },
 all:   { bg: 'from-gray-500 to-gray-600',  text: 'text-gray-600', light: 'bg-gray-50 border-gray-200' },
};

function CatIcon({ cat, size = 18 }: { cat: TourismCategory; size?: number }) {
 if (cat === 'flights') return <Plane size={size} />;
 if (cat === 'trains') return <Train size={size} />;
 if (cat === 'concerts') return <Music size={size} />;
 return <Mountain size={size} />;
}

function categoryLabel(cat: TourismCategory) {
 if (cat === 'flights') return 'ფრენა';
 if (cat === 'trains') return 'მატარებელი';
 if (cat === 'concerts') return 'კონცერტი';
 return 'ადგილი';
}

function actionLabel(cat: TourismCategory) {
 return cat === 'attractions' ? 'ტურის ჯავშანი' : 'ბილეთის ჯავშანი';
}

interface Props {
 item: TourismItem;
 onBack: () => void;
}

export default function TourismDetailPage({ item, onBack }: Props) {
 const { user } = useAuth();
 const { createBooking, loading: bookingLoading } = useBookings(user?.id);
 const [qty, setQty] = useState(1);
 const [selectedDate, setSelectedDate] = useState('');
 const [name, setName] = useState('');
 const [phone, setPhone] = useState('');
 const [email, setEmail] = useState('');
 const [isFav, setIsFav] = useState(false);
 const [booked, setBooked] = useState(false);

 const colors = CAT_COLORS[item.category] ?? CAT_COLORS.all;
 const unitPrice = item.price ?? 0;
 const currency = item.currency ?? '₾';
 const total = unitPrice * qty;
 const isTicket = item.category === 'concerts' || item.category === 'flights' || item.category === 'trains';

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!name || !email) { alert('შეავსეთ სახელი და ელ-ფოსტა'); return; }
 if (!user) { alert('ჯავშნისთვის საჭიროა ავტორიზაცია'); return; }
 const details = `${item.title}\n📍 ${item.city}\n📅 ${selectedDate || item.date || '—'} ${item.time ? '· ' + item.time : ''}\n🎟 ${qty} × ${unitPrice}${currency}\n💰 სულ: ${total}${currency}\n👤 ${name}`;
 const { error } = await createBooking({
  item_id: item.id,
  item_type: 'tourism',
  item_name: item.title,
  item_image: item.image,
  guest_name: name,
  email,
  phone,
  check_in: selectedDate || item.date || undefined,
  guests: qty,
  details,
 });
 if (!error) setBooked(true);
 else alert('ჯავშნის შეცდომა: ' + error);
 };

 if (booked) {
 return (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 p-8 text-center">
  <div className="w-24 h-24 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
   <CheckCircle size={44} className="text-emerald-500" />
  </div>
  <div>
   <h2 className="text-2xl font-black text-gray-900 mb-2">ჯავშანი დადასტურდა!</h2>
   <p className="text-gray-500 text-[14px] max-w-sm">
   <strong>{item.title}</strong><br />
   📍 {item.city} · {qty} {isTicket ? 'ბილეთი' : 'სტუმ.'}<br />
   {unitPrice > 0 && <>💰 სულ: <strong>{total}{currency}</strong><br /></>}
   <br />
   შეტყობინება გაიგზავნება <strong>{email}</strong>-ზე<br />
   და საიტის შეტყობინებებში გამოჩნდება.
   </p>
  </div>
  <button onClick={onBack}
   className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-10 py-3.5 rounded-2xl cursor-pointer transition-colors">
   უკან ტურიზმზე
  </button>
  </div>
 );
 }

 return (
 <div className="min-h-screen bg-gray-50 font-sans">

  {/* ── Hero ── */}
  <div className="relative h-[50vh] min-h-[320px] bg-gray-300">
  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10`} />

  {/* Nav */}
  <div className="absolute top-0 left-0 right-0 px-4 pt-5 flex items-center justify-between">
   <button onClick={onBack}
   className="flex items-center gap-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer transition-colors">
   <ArrowLeft size={16} /> ტურიზმი
   </button>
   <div className="flex gap-2">
   <button onClick={() => setIsFav(f => !f)}
    className="w-9 h-9 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer transition-colors">
    <Heart size={16} className={isFav ? 'text-red-400 fill-red-400' : 'text-white'} />
   </button>
   <button className="w-9 h-9 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer transition-colors">
    <Share2 size={16} className="text-white" />
   </button>
   </div>
  </div>

  {/* Badge */}
  {item.badge && (
   <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
   {item.badge}
   </div>
  )}

  {/* Title overlay */}
  <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
   <div className={`inline-flex items-center gap-2 ${colors.light} ${colors.text} border px-3 py-1 rounded-full text-[12px] font-bold mb-3`}>
   <CatIcon cat={item.category} size={13} />
   {categoryLabel(item.category)}
   </div>
   <h1 className="text-white text-2xl sm:text-3xl font-black drop-shadow-lg leading-snug mb-1">
   {item.title}
   </h1>
   <p className="text-white/70 text-[13px]">{item.subtitle}</p>
  </div>
  </div>

  {/* ── Body ── */}
  <div className="max-w-5xl mx-auto px-4 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

   {/* Left: Info */}
   <div className="lg:col-span-2 space-y-6">

   {/* Meta */}
   <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
    <div className="flex flex-wrap gap-4">
    <div className="flex items-center gap-2 text-gray-600">
     <MapPin size={15} className="text-gray-400 shrink-0" />
     <span className="text-[14px] font-semibold">{item.city}</span>
    </div>
    {item.date && (
     <div className="flex items-center gap-2 text-gray-600">
     <Calendar size={15} className="text-gray-400 shrink-0" />
     <span className="text-[14px] font-semibold">{item.date}</span>
     </div>
    )}
    {item.time && (
     <div className="flex items-center gap-2 text-gray-600">
     <Clock size={15} className="text-gray-400 shrink-0" />
     <span className="text-[14px] font-semibold">{item.time}</span>
     </div>
    )}
    {item.duration && (
     <span className="text-[14px] text-gray-600 font-semibold">⏱ {item.duration}</span>
    )}
    {item.rating && (
     <div className="flex items-center gap-1.5 text-gray-600">
     <Star size={14} className="text-amber-400 fill-amber-400" />
     <span className="text-[14px] font-bold">{item.rating}</span>
     {item.reviewCount && <span className="text-gray-400 text-[12px]">({item.reviewCount.toLocaleString()})</span>}
     </div>
    )}
    </div>
   </div>

   {/* Tags */}
   <div className="flex flex-wrap gap-2">
    {item.tags.map(t => (
    <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-[12px] font-semibold shadow-sm">
     <Tag size={11} />{t}
    </span>
    ))}
   </div>

   {/* About */}
   <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
    <h3 className="font-bold text-gray-900 text-[15px] mb-2">
    {item.category === 'concerts' ? 'კონცერტის შესახებ' :
     item.category === 'flights' ? 'ფრენის შესახებ' :
     item.category === 'trains' ? 'მარშრუტის შესახებ' : 'ადგილის შესახებ'}
    </h3>
    <p className="text-[14px] text-gray-600 leading-relaxed">{item.subtitle}</p>
   </div>
   </div>

   {/* Right: Booking */}
   <div className="lg:col-span-1">
   <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5 sticky top-5">

    {/* Price header */}
    <div className="mb-5">
    {unitPrice === 0 ? (
     <span className="text-[28px] font-black text-emerald-600">უფასო</span>
    ) : (
     <div className="flex items-baseline gap-1">
     <span className="text-[28px] font-black text-gray-900">{unitPrice}{currency}</span>
     <span className="text-[13px] text-gray-400">/{isTicket ? 'ბილეთი' : 'კაცი'}</span>
     </div>
    )}
    </div>

    <form onSubmit={handleSubmit} className="space-y-4">
    {/* Date (if no fixed date) */}
    {!item.date && (
     <div>
     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">თარიღი</p>
     <div className="relative">
      <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
      className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-8 pr-3 text-[13px] focus:outline-none focus:border-gray-400 transition-colors" />
     </div>
     </div>
    )}

    {/* Quantity */}
    <div>
     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
     {isTicket ? 'ბილეთების რაოდენობა' : 'სტუმრები'}
     </p>
     <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
     {isTicket ? <Ticket size={14} className="text-gray-400" /> : <Users size={14} className="text-gray-400" />}
     <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-pointer font-bold text-gray-700 transition-colors text-lg leading-none">−</button>
     <span className="text-[16px] font-bold text-gray-900 flex-1 text-center">{qty}</span>
     <button type="button" onClick={() => setQty(q => Math.min(10, q + 1))}
      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-pointer font-bold text-gray-700 transition-colors text-lg leading-none">+</button>
     </div>
    </div>

    {/* Personal info */}
    <div className="space-y-2">
     <input value={name} onChange={e => setName(e.target.value)} placeholder="სახელი და გვარი *" required
     className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
     <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="ტელეფონი"
     className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
     <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ელ-ფოსტა *" required
     className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
    </div>

    {/* Price summary */}
    {unitPrice > 0 && (
     <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
     <div className="flex justify-between text-[12px] text-gray-500 mb-1">
      <span>{unitPrice}{currency} × {qty}</span>
     </div>
     <div className="flex justify-between items-baseline">
      <span className="text-[13px] font-semibold text-gray-700">სულ</span>
      <span className="text-[24px] font-black text-gray-900">{total}{currency}</span>
     </div>
     </div>
    )}

    <button type="submit" disabled={bookingLoading}
     className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-[15px] cursor-pointer transition-all flex items-center justify-center gap-2">
     {bookingLoading ? 'იტვირთება...' : actionLabel(item.category)}
    </button>

    <p className="text-center text-[11px] text-gray-400">📧 დასტური გამოეგზავნება ელ-ფოსტაზე</p>
    </form>
   </div>
   </div>

  </div>
  </div>
 </div>
 );
}
