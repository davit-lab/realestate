import React, { useState } from 'react';
import {
 X, Star, MapPin, Calendar, Clock, Tag, ChevronLeft, ChevronRight,
 CheckCircle, Plane, Train, Music, Mountain, Camera, Heart, Ticket, Users
} from 'lucide-react';
import type { BookingData } from './HotelDetailModal';

export type TourismCategory = 'all' | 'attractions' | 'flights' | 'trains' | 'concerts';

export interface TourismItem {
 id: string;
 category: TourismCategory;
 title: string;
 subtitle: string;
 image: string;
 city: string;
 price?: number;
 currency?: string;
 date?: string;
 time?: string;
 duration?: string;
 rating?: number;
 reviewCount?: number;
 tags: string[];
 featured?: boolean;
 badge?: string;
}

function CategoryIcon({ cat, size = 16 }: { cat: TourismCategory; size?: number }) {
 if (cat === 'flights') return <Plane size={size} className="text-blue-500" />;
 if (cat === 'trains') return <Train size={size} className="text-emerald-500" />;
 if (cat === 'concerts') return <Music size={size} className="text-purple-500" />;
 return <Mountain size={size} className="text-orange-500" />;
}

function categoryLabel(cat: TourismCategory) {
 if (cat === 'flights') return 'ფრენა';
 if (cat === 'trains') return 'მატარებელი';
 if (cat === 'concerts') return 'კონცერტი';
 return 'ადგილი';
}

function actionLabel(cat: TourismCategory) {
 if (cat === 'concerts') return 'ბილეთის ჯავშანი';
 if (cat === 'flights') return 'ბილეთის ჯავშანი';
 if (cat === 'trains') return 'ბილეთის ჯავშანი';
 return 'ტურის ჯავშანი';
}

function submitLabel(cat: TourismCategory) {
 if (cat === 'concerts' || cat === 'flights' || cat === 'trains') return 'ბილეთის დადასტურება';
 return 'ტურის დადასტურება';
}

const CAT_COLORS: Record<TourismCategory, string> = {
 all:   'bg-gray-100 text-gray-700',
 attractions: 'bg-orange-100 text-orange-700',
 flights:  'bg-blue-100 text-blue-700',
 trains:  'bg-emerald-100 text-emerald-700',
 concerts: 'bg-purple-100 text-purple-700',
};

interface Props {
 item: TourismItem | null;
 onClose: () => void;
 onBook: (data: BookingData) => void;
}

export default function TourismDetailModal({ item, onClose, onBook }: Props) {
 const [qty, setQty] = useState(1);
 const [selectedDate, setSelectedDate] = useState(item?.date || '');
 const [name, setName] = useState('');
 const [phone, setPhone] = useState('');
 const [email, setEmail] = useState('');
 const [step, setStep] = useState<'detail' | 'success'>('detail');
 const [isFav, setIsFav] = useState(false);

 if (!item) return null;

 const unitPrice = item.price ?? 0;
 const totalPrice = unitPrice * qty;
 const currency = item.currency ?? '₾';

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!name || !email) { alert('შეავსეთ სახელი და ელ-ფოსტა'); return; }
 const details = `${item.title}\n📍 ${item.city}\n📅 ${selectedDate || item.date || '—'} ${item.time ? '· ' + item.time : ''}\n🎟 ${qty} × ${unitPrice}${currency}\n💰 სულ: ${totalPrice}${currency}\n👤 ${name}`;
 onBook({ type: 'tourism', itemId: item.id, itemName: item.title, itemImage: item.image, details, email, phone, guestName: name });
 setStep('success');
 };

 const bgColor = CAT_COLORS[item.category];

 return (
 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
  <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col">

  {step === 'success' ? (
   <div className="flex flex-col items-center justify-center gap-4 p-12 text-center flex-1">
   <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
    <CheckCircle size={36} className="text-emerald-500" />
   </div>
   <h3 className="text-xl font-black text-gray-900">ჯავშანი დადასტურდა!</h3>
   <p className="text-[13px] text-gray-500 max-w-xs">
    <strong>{item.title}</strong><br />
    📍 {item.city} · {qty} {item.category === 'concerts' || item.category === 'flights' || item.category === 'trains' ? 'ბილეთი' : 'ადამიანი'}<br />
    💰 {totalPrice}{currency}<br /><br />
    შეტყობინება გაიგზავნა <strong>{email}</strong>-ზე<br />და საიტის შეტყობინებებში.
   </p>
   <button onClick={onClose} className="mt-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-3 rounded-2xl cursor-pointer transition-colors">
    დახურვა
   </button>
   </div>
  ) : (
   <>
   {/* Hero image */}
   <div className="relative h-52 sm:h-64 shrink-0 bg-gray-200">
    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    <button onClick={onClose}
    className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center cursor-pointer transition-colors">
    <X size={15} className="text-white" />
    </button>
    <button onClick={() => setIsFav(f => !f)}
    className="absolute top-3 right-14 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center cursor-pointer transition-colors">
    <Heart size={15} className={isFav ? 'text-red-400 fill-red-400' : 'text-white'} />
    </button>
    {item.badge && (
    <span className="absolute top-3 left-3 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl backdrop-blur-sm">
     {item.badge}
    </span>
    )}
    <div className="absolute bottom-4 left-4 right-4">
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold mb-2 ${bgColor}`}>
     <CategoryIcon cat={item.category} size={12} />
     {categoryLabel(item.category)}
    </div>
    <h2 className="text-white font-black text-base leading-snug drop-shadow-lg">{item.title}</h2>
    <p className="text-white/80 text-[12px] mt-0.5">{item.subtitle}</p>
    </div>
   </div>

   {/* Scrollable body */}
   <div className="overflow-y-auto flex-1">
    <div className="p-5 space-y-5">

    {/* Meta row */}
    <div className="flex flex-wrap gap-3">
     <span className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
     <MapPin size={13} className="text-gray-400" />{item.city}
     </span>
     {item.date && (
     <span className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
      <Calendar size={13} className="text-gray-400" />{item.date}
     </span>
     )}
     {item.time && (
     <span className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
      <Clock size={13} className="text-gray-400" />{item.time}
     </span>
     )}
     {item.duration && (
     <span className="text-[12px] text-gray-500 font-medium">⏱ {item.duration}</span>
     )}
     {item.rating && (
     <span className="flex items-center gap-1 text-[12px] text-gray-500 font-medium">
      <Star size={12} className="text-amber-400 fill-amber-400" />{item.rating}
      {item.reviewCount && <span className="text-gray-400">({item.reviewCount.toLocaleString()})</span>}
     </span>
     )}
    </div>

    {/* Tags */}
    <div className="flex flex-wrap gap-1.5">
     {item.tags.map(t => (
     <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-xl text-[11px] font-semibold">
      <Tag size={9} />{t}
     </span>
     ))}
    </div>

    <hr className="border-gray-100" />

    {/* Booking form */}
    <form onSubmit={handleSubmit} className="space-y-4">
     <p className="text-[13px] font-bold text-gray-800">{actionLabel(item.category)}</p>

     {/* Date selector for non-fixed events */}
     {!item.date && (
     <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">თარიღი</label>
      <div className="relative">
      <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
       className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-8 pr-3 text-[13px] focus:outline-none focus:border-gray-400 transition-colors" />
      </div>
     </div>
     )}

     {/* Quantity */}
     <div>
     <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
      {item.category === 'concerts' || item.category === 'flights' || item.category === 'trains' ? 'ბილეთების რაოდენობა' : 'სტუმრები'}
     </label>
     <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 w-fit">
      {item.category === 'concerts' || item.category === 'flights' ? <Ticket size={14} className="text-gray-400" /> : <Users size={14} className="text-gray-400" />}
      <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-pointer font-bold text-gray-700 transition-colors">−</button>
      <span className="text-[15px] font-bold text-gray-900 w-4 text-center">{qty}</span>
      <button type="button" onClick={() => setQty(q => Math.min(10, q + 1))}
      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-pointer font-bold text-gray-700 transition-colors">+</button>
     </div>
     </div>

     {/* Personal info */}
     <div className="space-y-2.5">
     <input value={name} onChange={e => setName(e.target.value)} placeholder="სახელი და გვარი *" required
      className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
     <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="ტელეფონი"
      className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
     <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ელ-ფოსტა * (დასტური გამოეგზავნება)" required
      className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
     </div>

     {/* Price */}
     {unitPrice > 0 && (
     <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between">
      <p className="text-[12px] text-gray-500">{unitPrice}{currency} × {qty}</p>
      <p className="text-[22px] font-black text-gray-900">{totalPrice}<span className="text-[14px] ml-1">{currency}</span></p>
     </div>
     )}

     <button type="submit"
     className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-2xl text-[14px] cursor-pointer transition-colors">
     {submitLabel(item.category)}
     </button>
    </form>
    </div>
   </div>
   </>
  )}
  </div>
 </div>
 );
}
