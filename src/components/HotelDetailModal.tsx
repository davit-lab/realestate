import React, { useState } from 'react';
import {
 X, Star, MapPin, Wifi, Car, Coffee, Waves, Dumbbell, UtensilsCrossed,
 Phone, Users, Calendar, ChevronLeft, ChevronRight, CheckCircle,
 Clock, Tag, Heart
} from 'lucide-react';

export interface Hotel {
 id: string;
 name: string;
 stars: 1 | 2 | 3 | 4 | 5;
 rating: number;
 reviewCount: number;
 pricePerNight: number;
 city: string;
 district: string;
 image: string;
 images: string[];
 amenities: string[];
 description: string;
 phone: string;
 tags: string[];
 featured?: boolean;
}

export interface BookingData {
 type: 'hotel' | 'tourism';
 itemId: string;
 itemName: string;
 itemImage: string;
 details: string;
 email: string;
 phone: string;
 guestName: string;
}

const AMENITY_MAP: Record<string, { label: string; icon: React.ReactNode }> = {
 wifi:  { label: 'Wi-Fi',   icon: <Wifi size={14} /> },
 pool:  { label: 'აუზი',   icon: <Waves size={14} /> },
 gym:  { label: 'სპორტ ცენტრი', icon: <Dumbbell size={14} /> },
 restaurant: { label: 'რესტორანი',  icon: <UtensilsCrossed size={14} /> },
 parking: { label: 'პარკინგი',  icon: <Car size={14} /> },
 breakfast: { label: 'საუზმე',   icon: <Coffee size={14} /> },
};

const ROOM_TYPES = [
 { id: 'standard', label: 'სტანდარტი', extra: 0 },
 { id: 'deluxe', label: 'დელუქსი', extra: 50 },
 { id: 'suite', label: 'სუიტი',  extra: 120 },
];

function ratingLabel(r: number) {
 if (r >= 9.5) return 'განსაკუთრებული';
 if (r >= 9.0) return 'შესანიშნავი';
 if (r >= 8.5) return 'ძალიან კარგი';
 if (r >= 8.0) return 'კარგი';
 return 'საშუალო';
}

interface Props {
 hotel: Hotel | null;
 onClose: () => void;
 onBook: (data: BookingData) => void;
}

export default function HotelDetailModal({ hotel, onClose, onBook }: Props) {
 const [imgIdx, setImgIdx] = useState(0);
 const [roomType, setRoomType] = useState('standard');
 const [checkIn, setCheckIn] = useState('');
 const [checkOut, setCheckOut] = useState('');
 const [guests, setGuests] = useState(2);
 const [name, setName] = useState('');
 const [phone, setPhone] = useState('');
 const [email, setEmail] = useState('');
 const [step, setStep] = useState<'detail' | 'success'>('detail');
 const [isFav, setIsFav] = useState(false);

 if (!hotel) return null;

 const selectedRoom = ROOM_TYPES.find(r => r.id === roomType)!;
 const nightlyPrice = hotel.pricePerNight + selectedRoom.extra;

 const nights = (() => {
 if (!checkIn || !checkOut) return 1;
 const d = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000;
 return d > 0 ? d : 1;
 })();

 const totalPrice = nightlyPrice * nights;

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!name || !email) { alert('შეავსეთ სახელი და ელ-ფოსტა'); return; }
 const details = `🏨 ${hotel.name}\n🛏 ${selectedRoom.label}\n📅 ${checkIn || '—'} → ${checkOut || '—'} (${nights} ღამე)\n👤 სტუმრები: ${guests}\n💰 სულ: ${totalPrice} ₾`;
 onBook({ type: 'hotel', itemId: hotel.id, itemName: hotel.name, itemImage: hotel.image, details, email, phone, guestName: name });
 setStep('success');
 };

 const imgs = hotel.images.length > 1 ? hotel.images : [hotel.image];

 return (
 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
  <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col">

  {step === 'success' ? (
   <div className="flex flex-col items-center justify-center gap-4 p-12 text-center flex-1">
   <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
    <CheckCircle size={36} className="text-blue-500" />
   </div>
   <h3 className="text-xl font-black text-gray-900">ჯავშანი დადასტურდა!</h3>
   <p className="text-[13px] text-gray-500 max-w-xs">
    <strong>{hotel.name}</strong> — {checkIn || '—'} → {checkOut || '—'}<br />
    {nights} ღამე · {guests} სტუმარი · {totalPrice} ₾<br /><br />
    შეტყობინება გაიგზავნა <strong>{email}</strong>-ზე და<br />საიტის შეტყობინებებში.
   </p>
   <button onClick={onClose} className="mt-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-3 rounded-2xl cursor-pointer transition-colors">
    დახურვა
   </button>
   </div>
  ) : (
   <>
   {/* Image gallery */}
   <div className="relative h-56 sm:h-72 shrink-0 bg-gray-200">
    <img src={imgs[imgIdx]} alt={hotel.name} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    {imgs.length > 1 && (
    <>
     <button onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}
     className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
     <ChevronLeft size={16} />
     </button>
     <button onClick={() => setImgIdx(i => (i + 1) % imgs.length)}
     className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
     <ChevronRight size={16} />
     </button>
     <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
     {imgs.map((_, i) => (
      <button key={i} onClick={() => setImgIdx(i)}
      className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
     ))}
     </div>
    </>
    )}
    {/* Close & fav buttons */}
    <button onClick={onClose}
    className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center cursor-pointer transition-colors">
    <X size={15} className="text-white" />
    </button>
    <button onClick={() => setIsFav(f => !f)}
    className="absolute top-3 right-14 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center cursor-pointer transition-colors">
    <Heart size={15} className={isFav ? 'text-red-400 fill-red-400' : 'text-white'} />
    </button>
    {/* Stars overlay */}
    <div className="absolute bottom-4 left-4">
    <div className="flex items-center gap-0.5 mb-1">
     {Array.from({ length: hotel.stars }).map((_, i) => (
     <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
     ))}
    </div>
    <h2 className="text-white font-black text-lg leading-tight drop-shadow-lg">{hotel.name}</h2>
    <div className="flex items-center gap-1 text-white/80 text-[12px]">
     <MapPin size={11} />{hotel.district}, {hotel.city}
    </div>
    </div>
   </div>

   {/* Scrollable body */}
   <div className="overflow-y-auto flex-1">
    <div className="p-5 space-y-5">

    {/* Rating + tags */}
    <div className="flex items-center gap-3 flex-wrap">
     <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-xl">
     <span className="font-black text-[15px]">{hotel.rating}</span>
     <div>
      <p className="text-[11px] font-bold leading-none">{ratingLabel(hotel.rating)}</p>
      <p className="text-[10px] text-white/70 leading-none">{hotel.reviewCount.toLocaleString()} შეფასება</p>
     </div>
     </div>
     {hotel.tags.map(t => (
     <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-xl text-[11px] font-semibold">
      <Tag size={10} />{t}
     </span>
     ))}
    </div>

    {/* Description */}
    <p className="text-[13px] text-gray-600 leading-relaxed">{hotel.description}</p>

    {/* Amenities */}
    <div>
     <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">სერვისები</p>
     <div className="flex flex-wrap gap-2">
     {hotel.amenities.map(a => {
      const am = AMENITY_MAP[a];
      if (!am) return null;
      return (
      <span key={a} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[12px] font-semibold border border-blue-100">
       {am.icon}{am.label}
      </span>
      );
     })}
     </div>
    </div>

    {/* Contact */}
    <div className="flex items-center gap-2 text-[13px] text-gray-500">
     <Phone size={13} className="text-gray-400" />
     <a href={`tel:${hotel.phone}`} className="hover:text-blue-600 transition-colors font-medium">{hotel.phone}</a>
    </div>

    <hr className="border-gray-100" />

    {/* Booking form */}
    <form onSubmit={handleSubmit} className="space-y-4">
     <p className="text-[13px] font-bold text-gray-800">ოთახის ჯავშანი</p>

     {/* Room type */}
     <div className="grid grid-cols-3 gap-2">
     {ROOM_TYPES.map(r => (
      <button key={r.id} type="button" onClick={() => setRoomType(r.id)}
      className={`flex flex-col items-center py-2.5 px-2 rounded-xl border text-center transition-colors cursor-pointer ${
       roomType === r.id ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
      }`}>
      <span className="text-[12px] font-bold">{r.label}</span>
      <span className="text-[11px] text-gray-400">{hotel.pricePerNight + r.extra} ₾/ღამე</span>
      </button>
     ))}
     </div>

     {/* Dates */}
     <div className="grid grid-cols-2 gap-2">
     <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Check-in</label>
      <div className="relative">
      <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
       className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-8 pr-3 text-[13px] focus:outline-none focus:border-blue-400 transition-colors" />
      </div>
     </div>
     <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Check-out</label>
      <div className="relative">
      <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
       className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-8 pr-3 text-[13px] focus:outline-none focus:border-blue-400 transition-colors" />
      </div>
     </div>
     </div>

     {/* Guests */}
     <div>
     <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">სტუმრები</label>
     <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 w-fit">
      <Users size={14} className="text-gray-400" />
      <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))}
      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-pointer font-bold text-gray-700 transition-colors">−</button>
      <span className="text-[15px] font-bold text-gray-900 w-4 text-center">{guests}</span>
      <button type="button" onClick={() => setGuests(g => Math.min(8, g + 1))}
      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-pointer font-bold text-gray-700 transition-colors">+</button>
     </div>
     </div>

     {/* Personal info */}
     <div className="grid grid-cols-1 gap-2.5">
     <input value={name} onChange={e => setName(e.target.value)} placeholder="სახელი და გვარი *" required
      className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors" />
     <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="ტელეფონი"
      className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors" />
     <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ელ-ფოსტა * (დასტური გამოეგზავნება)" required
      className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors" />
     </div>

     {/* Price summary */}
     <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-center justify-between">
     <div>
      <p className="text-[11px] text-gray-500">{nightlyPrice} ₾ × {nights} ღამე · {guests} სტუმ.</p>
      <p className="text-[11px] text-gray-400">{selectedRoom.label}</p>
     </div>
     <p className="text-[22px] font-black text-blue-700">{totalPrice} <span className="text-[14px]">₾</span></p>
     </div>

     <button type="submit"
     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-[14px] cursor-pointer transition-colors shadow-lg shadow-blue-200/50">
     ჯავშნის დადასტურება
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
