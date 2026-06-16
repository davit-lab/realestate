import React, { useState, useMemo } from 'react';
import { Star, MapPin, Wifi, Car, Coffee, Waves, Dumbbell, UtensilsCrossed, Search, SlidersHorizontal, X, ChevronRight, Heart, Phone, Loader2 } from 'lucide-react';
import { type Hotel, type BookingData } from './HotelDetailModal';
import { useServices } from '../hooks/useServices';
export { type Hotel };

const AMENITY_ICONS: Record<string, { icon: React.ReactNode; label: string }> = {
 wifi:  { icon: <Wifi size={13} />,   label: 'Wi-Fi' },
 pool:  { icon: <Waves size={13} />,   label: 'აუზი' },
 gym:  { icon: <Dumbbell size={13} />,  label: 'სპორტ ცენტრი' },
 restaurant: { icon: <UtensilsCrossed size={13} />,label: 'რესტორანი' },
 parking: { icon: <Car size={13} />,   label: 'პარკინგი' },
 breakfast: { icon: <Coffee size={13} />,  label: 'საუზმე' },
};

const CITIES = ['ყველა', 'თბილისი', 'ბათუმი', 'ქუთაისი', 'თელავი', 'ბორჯომი', 'მესტია', 'გუდაური'];

function StarRow({ count, size = 14 }: { count: number; size?: number }) {
 return (
 <div className="flex items-center gap-0.5">
  {[1,2,3,4,5].map(i => (
  <Star key={i} size={size} className={i <= count ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
  ))}
 </div>
 );
}

function RatingBadge({ rating }: { rating: number }) {
 const color = rating >= 9 ? 'bg-emerald-500' : rating >= 8 ? 'bg-blue-500' : 'bg-orange-400';
 const label = rating >= 9 ? 'შესანიშნავი' : rating >= 8 ? 'ძალიან კარგი' : 'კარგი';
 return (
 <div className="flex items-center gap-1.5">
  <span className={`${color} text-white font-black text-[13px] px-2 py-0.5 rounded-lg`}>{rating.toFixed(1)}</span>
  <span className="text-[11px] text-gray-500 font-medium">{label}</span>
 </div>
 );
}

interface HotelsPageProps {
 onSelectHotel?: (hotel: Hotel) => void;
}

export default function HotelsPage({ onSelectHotel }: HotelsPageProps) {
 const { hotels: dbHotels, loading } = useServices();
 const [searchQ, setSearchQ] = useState('');
 const [selectedCity, setSelectedCity] = useState('ყველა');
 const [minStars, setMinStars] = useState(0);
 const [maxPrice, setMaxPrice] = useState('');
 const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'stars'>('rating');
 const [showFilters, setShowFilters] = useState(false);
 const [favorites, setFavorites] = useState<string[]>([]);

 const allHotels = dbHotels;

 const filtered = useMemo(() => {
 return allHotels.filter(h => {
  if (searchQ && !h.name.toLowerCase().includes(searchQ.toLowerCase()) && !h.city.toLowerCase().includes(searchQ.toLowerCase()) && !h.district.toLowerCase().includes(searchQ.toLowerCase())) return false;
  if (selectedCity !== 'ყველა' && h.city !== selectedCity) return false;
  if (minStars > 0 && h.stars < minStars) return false;
  if (maxPrice !== '' && h.pricePerNight > Number(maxPrice)) return false;
  return true;
 }).sort((a, b) => {
  if (sortBy === 'rating') return b.rating - a.rating;
  if (sortBy === 'price_asc') return a.pricePerNight - b.pricePerNight;
  if (sortBy === 'price_desc') return b.pricePerNight - a.pricePerNight;
  if (sortBy === 'stars') return b.stars - a.stars;
  return 0;
 });
 }, [searchQ, selectedCity, minStars, maxPrice, sortBy]);

 const toggleFav = (id: string) => setFavorites(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

 return (
 <div className="min-h-screen bg-[#F4F4F5]">
  {/* Hero */}
  <div className="relative overflow-hidden border-b border-gray-200"
  style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
  <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />
  <div className="relative z-10 max-w-4xl mx-auto px-4 py-10 text-center">
   <h1 className="text-[32px] md:text-[42px] font-black text-gray-900 tracking-tight mb-2 leading-tight">
   იპოვე შენი <span className="text-indigo-600">იდეალური სასტუმრო</span>
   </h1>
   <p className="text-gray-500 text-[14px] mb-8">ბათუმი, თბილისი, სვანეთი, კახეთი — ათასობით ვარიანტი</p>

   {/* Search bar */}
   <div className="bg-gray-50 border border-gray-200 rounded-2xl p-2 flex items-center gap-2 max-w-2xl mx-auto shadow-sm">
   <div className="flex-1 flex items-center gap-3 px-4">
    <Search size={15} className="text-gray-400 shrink-0" />
    <input
    value={searchQ} onChange={e => setSearchQ(e.target.value)}
    placeholder="სასტუმრო, ქალაქი, უბანი..."
    className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
    />
   </div>
   <div className="w-px bg-gray-200 h-8" />
   <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
    className="text-sm text-gray-700 px-3 focus:outline-none bg-transparent cursor-pointer">
    {CITIES.map(c => <option key={c}>{c}</option>)}
   </select>
   <button onClick={() => setShowFilters(!showFilters)}
    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer">
    <SlidersHorizontal size={14} />
    ფილტრი
   </button>
   </div>
  </div>
  </div>

  {/* Filters panel */}
  {showFilters && (
  <div className="border-b border-gray-200 bg-white">
   <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center gap-6">
   <div>
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">მინ. ვარსკვლავები</p>
    <div className="flex items-center gap-1">
    {[0,1,2,3,4,5].map(n => (
     <button key={n} onClick={() => setMinStars(n)}
     className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${minStars === n ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
     {n === 0 ? 'ყველა' : `${n}★`}
     </button>
    ))}
    </div>
   </div>
   <div>
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">მაქს. ფასი/ღამე (₾)</p>
    <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
    placeholder="500"
    className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400" />
   </div>
   <div>
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">სორტირება</p>
    <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none cursor-pointer">
    <option value="rating">რეიტინგი</option>
    <option value="stars">ვარსკვლავები</option>
    <option value="price_asc">ფასი ↑</option>
    <option value="price_desc">ფასი ↓</option>
    </select>
   </div>
   {(minStars > 0 || maxPrice !== '' || searchQ !== '') && (
    <button onClick={() => { setMinStars(0); setMaxPrice(''); setSearchQ(''); }}
    className="flex items-center gap-1 text-[12px] text-red-500 hover:text-red-700 cursor-pointer mt-auto mb-1">
    <X size={12} /> გასუფთავება
    </button>
   )}
   </div>
  </div>
  )}

  <div className="max-w-7xl mx-auto px-4 py-6">
  {/* Results count */}
  <div className="flex items-center justify-between mb-4">
   <p className="text-sm text-gray-600">
   <span className="font-bold text-gray-900">{filtered.length}</span> სასტუმრო
   {selectedCity !== 'ყველა' && <span className="text-gray-400"> — {selectedCity}</span>}
   </p>
   <div className="flex items-center gap-2">
   {CITIES.slice(1).map(c => (
    <button key={c} onClick={() => setSelectedCity(selectedCity === c ? 'ყველა' : c)}
    className={`hidden sm:inline-flex text-[12px] px-3 py-1 rounded-full transition-colors cursor-pointer ${selectedCity === c ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
    {c}
    </button>
   ))}
   </div>
  </div>

  {/* Grid */}
  {loading ? (
   <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
   <Loader2 size={28} className="animate-spin mx-auto text-gray-300 mb-3" />
   <p className="text-gray-400 text-sm">იტვირთება...</p>
   </div>
  ) : filtered.length === 0 ? (
   <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
   <p className="text-gray-400 text-sm">სასტუმრო ვერ მოიძებნა</p>
   <p className="text-gray-300 text-xs mt-1">ადმინ პანელში დაამატეთ სასტუმროები</p>
   </div>
  ) : (
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
   {filtered.map(hotel => (
    <div key={hotel.id} onClick={() => onSelectHotel?.(hotel)} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
    {/* Image */}
    <div className="relative aspect-[4/3] overflow-hidden">
     <img src={hotel.image} alt={hotel.name}
     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
     {hotel.featured && (
     <div className="absolute top-3 left-3 bg-amber-400 text-gray-900 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
      რეკომენდირებული
     </div>
     )}
     <button onClick={() => toggleFav(hotel.id)}
     className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110">
     <Heart size={15} className={favorites.includes(hotel.id) ? 'text-rose-500 fill-rose-500' : 'text-gray-500'} />
     </button>
     <div className="absolute bottom-3 left-3">
     <StarRow count={hotel.stars} size={13} />
     </div>
    </div>

    {/* Content */}
    <div className="p-4">
     <div className="flex items-start justify-between gap-2 mb-2">
     <h3 className="font-bold text-gray-900 text-[15px] leading-snug">{hotel.name}</h3>
     </div>

     <div className="flex items-center gap-1 text-gray-500 text-[12px] mb-3">
     <MapPin size={11} className="text-gray-400" />
     {hotel.district}, {hotel.city}
     </div>

     <RatingBadge rating={hotel.rating} />
     <p className="text-[11px] text-gray-400 mt-0.5">{hotel.reviewCount.toLocaleString()} შეფასება</p>

     {/* Amenities */}
     <div className="flex flex-wrap gap-1.5 mt-3">
     {hotel.amenities.slice(0, 4).map(a => (
      <span key={a} className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-lg px-2 py-0.5 text-[11px] text-gray-600">
      {AMENITY_ICONS[a]?.icon}
      {AMENITY_ICONS[a]?.label}
      </span>
     ))}
     {hotel.amenities.length > 4 && (
      <span className="text-[11px] text-gray-400">+{hotel.amenities.length - 4}</span>
     )}
     </div>

     {/* Price + CTA */}
     <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
     <div>
      <span className="text-[20px] font-black text-gray-900">₾{hotel.pricePerNight}</span>
      <span className="text-[12px] text-gray-400 ml-1">/ღამე</span>
     </div>
     <div className="flex items-center gap-1.5">
      <a href={`tel:${hotel.phone}`}
      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center cursor-pointer transition-colors">
      <Phone size={13} className="text-gray-600" />
      </a>
      <button onClick={e => { e.stopPropagation(); onSelectHotel?.(hotel); }}
      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[12px] px-3.5 py-2 rounded-xl transition-colors cursor-pointer">
      ჯავშანი <ChevronRight size={13} />
      </button>
     </div>
     </div>
    </div>
    </div>
   ))}
   </div>
  )}
  </div>

 </div>
 );
}
