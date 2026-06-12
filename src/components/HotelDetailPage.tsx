import React, { useState } from 'react';
import {
 ArrowLeft, Star, MapPin, Wifi, Car, Coffee, Waves, Dumbbell, UtensilsCrossed,
 Phone, Users, Calendar, ChevronLeft, ChevronRight, CheckCircle, Heart, Tag,
 Clock, Share2
} from 'lucide-react';
import type { Hotel } from './HotelDetailModal';
import { useBookings } from '../hooks/useBookings';
import { useAuth } from '../contexts/AuthContext';

const AMENITY_MAP: Record<string, { label: string; icon: React.ReactNode }> = {
 wifi:  { label: 'Wi-Fi',   icon: <Wifi size={15} /> },
 pool:  { label: 'აუზი',   icon: <Waves size={15} /> },
 gym:  { label: 'სპორტ ცენტრი', icon: <Dumbbell size={15} /> },
 restaurant: { label: 'რესტორანი',  icon: <UtensilsCrossed size={15} /> },
 parking: { label: 'პარკინგი',  icon: <Car size={15} /> },
 breakfast: { label: 'საუზმე',   icon: <Coffee size={15} /> },
};

const ROOM_TYPES = [
 { id: 'standard', label: 'სტანდარტი',  desc: '1 მეფის/ორი ერთადერთი', extra: 0 },
 { id: 'deluxe', label: 'დელუქსი',   desc: 'მეფის, ზღვის ხედი',  extra: 50 },
 { id: 'suite', label: 'სუიტი',    desc: 'ფართო, სალონი + ოთახი', extra: 120 },
];

function ratingLabel(r: number) {
 if (r >= 9.5) return 'განსაკუთრებული';
 if (r >= 9.0) return 'შესანიშნავი';
 if (r >= 8.5) return 'ძალიან კარგი';
 return 'კარგი';
}

interface Props {
 hotel: Hotel;
 onBack: () => void;
}

export default function HotelDetailPage({ hotel, onBack }: Props) {
 const { user } = useAuth();
 const { createBooking, loading: bookingLoading } = useBookings(user?.id);
 const [imgIdx, setImgIdx] = useState(0);
 const [roomType, setRoomType] = useState('standard');
 const [checkIn, setCheckIn] = useState('');
 const [checkOut, setCheckOut] = useState('');
 const [guests, setGuests] = useState(2);
 const [name, setName] = useState('');
 const [phone, setPhone] = useState('');
 const [email, setEmail] = useState('');
 const [isFav, setIsFav] = useState(false);
 const [booked, setBooked] = useState(false);

 const imgs = hotel.images?.length > 1 ? hotel.images : [hotel.image];
 const selectedRoom = ROOM_TYPES.find(r => r.id === roomType)!;
 const nightlyPrice = hotel.pricePerNight + selectedRoom.extra;

 const nights = (() => {
 if (!checkIn || !checkOut) return 1;
 const d = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000;
 return d > 0 ? d : 1;
 })();

 const totalPrice = nightlyPrice * nights;

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!name || !email) { alert('შეავსეთ სახელი და ელ-ფოსტა'); return; }
 if (!user) { alert('ჯავშნისთვის საჭიროა ავტორიზაცია'); return; }
 const details = `🏨 ${hotel.name} — ${selectedRoom.label}\n📅 ${checkIn || '—'} → ${checkOut || '—'} (${nights} ღამე)\n👤 სტუმრები: ${guests}\n💰 სულ: ${totalPrice} ₾`;
 const { error } = await createBooking({
  item_id: hotel.id,
  item_type: 'hotel',
  item_name: hotel.name,
  item_image: hotel.image,
  guest_name: name,
  email,
  phone,
  check_in: checkIn || undefined,
  check_out: checkOut || undefined,
  guests,
  details,
 });
 if (!error) setBooked(true);
 else alert('ჯავშნის შეცდომა: ' + error);
 };

 if (booked) {
 return (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 p-8 text-center">
  <div className="w-24 h-24 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center">
   <CheckCircle size={44} className="text-blue-500" />
  </div>
  <div>
   <h2 className="text-2xl font-black text-gray-900 mb-2">ჯავშანი დადასტურდა!</h2>
   <p className="text-gray-500 text-[14px] max-w-sm">
   <strong>{hotel.name}</strong><br />
   {checkIn || '—'} → {checkOut || '—'} · {nights} ღამე · {guests} სტუმ.<br />
   სულ: <strong>{totalPrice} ₾</strong><br /><br />
   შეტყობინება გაიგზავნება <strong>{email}</strong>-ზე<br />
   და საიტის შეტყობინებებში გამოჩნდება.
   </p>
  </div>
  <button onClick={onBack}
   className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-10 py-3.5 rounded-2xl cursor-pointer transition-colors">
   უკან სასტუმროებზე
  </button>
  </div>
 );
 }

 return (
 <div className="min-h-screen bg-gray-50 font-sans">

  {/* ── Hero ── */}
  <div className="relative h-[55vh] min-h-[340px] bg-gray-300">
  <img
   src={imgs[imgIdx]}
   alt={hotel.name}
   className="w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

  {/* Nav controls */}
  <div className="absolute top-0 left-0 right-0 px-4 pt-5 flex items-center justify-between">
   <button onClick={onBack}
   className="flex items-center gap-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer transition-colors">
   <ArrowLeft size={16} /> სასტუმრო
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

  {/* Gallery thumbs */}
  {imgs.length > 1 && (
   <>
   <button onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}
    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg">
    <ChevronLeft size={18} />
   </button>
   <button onClick={() => setImgIdx(i => (i + 1) % imgs.length)}
    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg">
    <ChevronRight size={18} />
   </button>
   <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-1.5">
    {imgs.map((_, i) => (
    <button key={i} onClick={() => setImgIdx(i)}
     className={`w-2 h-2 rounded-full cursor-pointer transition-all ${i === imgIdx ? 'bg-white scale-125' : 'bg-white/50'}`} />
    ))}
   </div>
   </>
  )}

  {/* Title overlay */}
  <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
   <div className="flex items-center gap-1 mb-2">
   {Array.from({ length: hotel.stars }).map((_, i) => (
    <Star key={i} size={15} className="text-amber-400 fill-amber-400" />
   ))}
   </div>
   <h1 className="text-white text-2xl sm:text-3xl font-black drop-shadow-lg leading-tight mb-1">
   {hotel.name}
   </h1>
   <div className="flex items-center gap-2 text-white/80 text-[13px]">
   <MapPin size={13} />
   {hotel.district}, {hotel.city}
   </div>
  </div>
  </div>

  {/* ── Body ── */}
  <div className="max-w-5xl mx-auto px-4 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

   {/* Left: Info */}
   <div className="lg:col-span-2 space-y-7">

   {/* Rating + tags */}
   <div className="flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-sm">
    <span className="text-[18px] font-black">{hotel.rating}</span>
    <div>
     <p className="text-[12px] font-bold leading-none">{ratingLabel(hotel.rating)}</p>
     <p className="text-[10px] text-white/70">{hotel.reviewCount.toLocaleString()} შეფ.</p>
    </div>
    </div>
    {hotel.tags.map(t => (
    <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-[12px] font-semibold shadow-sm">
     <Tag size={11} />{t}
    </span>
    ))}
   </div>

   {/* Description */}
   <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
    <h3 className="font-bold text-gray-900 text-[15px] mb-2">სასტუმროს შესახებ</h3>
    <p className="text-[14px] text-gray-600 leading-relaxed">{hotel.description}</p>
   </div>

   {/* Amenities */}
   <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
    <h3 className="font-bold text-gray-900 text-[15px] mb-4">სერვისები და კეთილმოწყობა</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {hotel.amenities.map(a => {
     const am = AMENITY_MAP[a];
     if (!am) return null;
     return (
     <div key={a} className="flex items-center gap-2.5 bg-blue-50 text-blue-700 rounded-xl px-3 py-2.5 border border-blue-100">
      {am.icon}
      <span className="text-[13px] font-semibold">{am.label}</span>
     </div>
     );
    })}
    </div>
   </div>

   {/* Contact */}
   <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
    <Phone size={16} className="text-gray-600" />
    </div>
    <div>
    <p className="text-[11px] text-gray-400 font-medium">ტელეფონი</p>
    <a href={`tel:${hotel.phone}`} className="text-[15px] font-bold text-gray-900 hover:text-blue-600 transition-colors">{hotel.phone}</a>
    </div>
   </div>
   </div>

   {/* Right: Booking */}
   <div className="lg:col-span-1">
   <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5 sticky top-5">
    <div className="flex items-baseline gap-1 mb-5">
    <span className="text-[28px] font-black text-gray-900">₾{nightlyPrice}</span>
    <span className="text-[13px] text-gray-400">/ღამე</span>
    </div>

    <form onSubmit={handleSubmit} className="space-y-4">
    {/* Room type */}
    <div>
     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">ოთახის ტიპი</p>
     <div className="space-y-2">
     {ROOM_TYPES.map(r => (
      <button key={r.id} type="button" onClick={() => setRoomType(r.id)}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
       roomType === r.id ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
      }`}>
      <div>
       <p className="text-[13px] font-bold">{r.label}</p>
       <p className="text-[11px] text-gray-400">{r.desc}</p>
      </div>
      <span className="text-[12px] font-bold shrink-0 ml-2">₾{hotel.pricePerNight + r.extra}</span>
      </button>
     ))}
     </div>
    </div>

    {/* Dates */}
    <div className="grid grid-cols-2 gap-2">
     <div>
     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Check-in</p>
     <div className="relative">
      <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
      className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-8 pr-2 text-[12px] focus:outline-none focus:border-blue-400 transition-colors" />
     </div>
     </div>
     <div>
     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Check-out</p>
     <div className="relative">
      <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
      className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-8 pr-2 text-[12px] focus:outline-none focus:border-blue-400 transition-colors" />
     </div>
     </div>
    </div>

    {/* Guests */}
    <div>
     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">სტუმრები</p>
     <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
     <Users size={14} className="text-gray-400" />
     <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))}
      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-pointer font-bold text-gray-700 transition-colors text-lg leading-none">−</button>
     <span className="text-[16px] font-bold text-gray-900 flex-1 text-center">{guests}</span>
     <button type="button" onClick={() => setGuests(g => Math.min(8, g + 1))}
      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-pointer font-bold text-gray-700 transition-colors text-lg leading-none">+</button>
     </div>
    </div>

    {/* Personal info */}
    <div className="space-y-2">
     <input value={name} onChange={e => setName(e.target.value)} placeholder="სახელი და გვარი *" required
     className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors" />
     <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="ტელეფონი"
     className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors" />
     <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ელ-ფოსტა *" required
     className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors" />
    </div>

    {/* Price summary */}
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
     <div className="flex justify-between text-[12px] text-gray-500 mb-1">
     <span>₾{nightlyPrice} × {nights} ღამე</span>
     <span>{selectedRoom.label}</span>
     </div>
     <div className="flex justify-between items-baseline">
     <span className="text-[13px] font-semibold text-gray-700">სულ</span>
     <span className="text-[24px] font-black text-blue-700">₾{totalPrice}</span>
     </div>
    </div>

    <button type="submit" disabled={bookingLoading}
     className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-[15px] cursor-pointer transition-all shadow-lg shadow-blue-200/60 flex items-center justify-center gap-2">
     {bookingLoading ? 'იტვირთება...' : 'ჯავშნის გაკეთება'}
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
