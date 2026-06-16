import React, { useState, useMemo } from 'react';
import {
 Compass, Plane, Train, Music, MapPin, Calendar, Clock, Search,
 Star, ArrowRight, ChevronRight, Ticket, Mountain, Camera, Heart, Tag, Loader2
} from 'lucide-react';
import { type TourismItem, type TourismCategory } from './TourismDetailModal';
import { useServices } from '../hooks/useServices';

const CATEGORY_TABS: { value: TourismCategory; label: string; icon: React.ReactNode }[] = [
 { value: 'all',   label: 'ყველა',  icon: <Compass size={15} /> },
 { value: 'attractions', label: 'ადგილები', icon: <Mountain size={15} /> },
 { value: 'flights',  label: 'ფრენები',  icon: <Plane size={15} /> },
 { value: 'trains',  label: 'მატარებელი', icon: <Train size={15} /> },
 { value: 'concerts', label: 'კონცერტები', icon: <Music size={15} /> },
];

const CITIES_FILTER = ['ყველა', 'თბილისი', 'ბათუმი', 'სიგნაღი', 'მესტია', 'გუდაური', 'ქუთაისი'];

function CategoryIcon({ cat }: { cat: TourismCategory }) {
 if (cat === 'flights') return <Plane size={16} className="text-blue-500" />;
 if (cat === 'trains') return <Train size={16} className="text-emerald-500" />;
 if (cat === 'concerts') return <Music size={16} className="text-purple-500" />;
 return <Camera size={16} className="text-orange-500" />;
}

interface TourismPageProps {
 onSelectItem?: (item: TourismItem) => void;
}

export default function TourismPage({ onSelectItem }: TourismPageProps) {
 const { tourismItems: dbTourism, loading } = useServices();
 const [category, setCategory] = useState<TourismCategory>('all');
 const [searchQ, setSearchQ] = useState('');
 const [selectedCity, setSelectedCity] = useState('ყველა');
 const [favorites, setFavorites] = useState<string[]>([]);

 const allItems = dbTourism;

 const filtered = useMemo(() => {
 return allItems.filter(item => {
  if (category !== 'all' && item.category !== category) return false;
  if (selectedCity !== 'ყველა' && item.city !== selectedCity) return false;
  if (searchQ && !item.title.toLowerCase().includes(searchQ.toLowerCase()) && !item.city.toLowerCase().includes(searchQ.toLowerCase())) return false;
  return true;
 });
 }, [category, selectedCity, searchQ, allItems]);

 const toggleFav = (id: string) => setFavorites(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

 const featured = filtered.filter(i => i.featured);
 const rest = filtered.filter(i => !i.featured);

 return (
 <div className="min-h-screen bg-[#F4F4F5]">
  {/* Hero */}
  <div className="relative overflow-hidden">
  <div className="absolute inset-0"
   style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
  <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
   <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-5">
   <Compass size={13} className="text-emerald-400" />
   <span className="text-white/90 text-[12px] font-semibold">საქართველოს ტურისტული პლატფორმა</span>
   </div>
   <h1 className="text-[38px] md:text-[50px] font-black text-white tracking-tight mb-3 leading-tight">
   აღმოაჩინე<br /><span className="text-emerald-400">საქართველო</span>
   </h1>
   <p className="text-white/70 text-[15px] mb-8 max-w-xl mx-auto">
   ადგილები, ფრენები, მატარებლის ბილეთები, კონცერტები — ყველაფერი ერთ სივრცეში
   </p>

   {/* Search */}
   <div className="bg-white rounded-2xl shadow-2xl p-1.5 flex items-center gap-2 max-w-xl mx-auto">
   <div className="flex-1 flex items-center gap-3 px-4">
    <Search size={15} className="text-gray-400 shrink-0" />
    <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
    placeholder="ადგილი, ქალაქი, ფრენა..."
    className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent" />
   </div>
   <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center gap-1.5">
    <Search size={14} />
    ძებნა
   </button>
   </div>
  </div>
  </div>

  {/* Category tabs */}
  <div className="bg-white border-b border-gray-200 sticky top-[60px] z-30">
  <div className="max-w-7xl mx-auto px-4">
   <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
   {CATEGORY_TABS.map(tab => (
    <button key={tab.value} onClick={() => setCategory(tab.value)}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
     category === tab.value
     ? 'bg-emerald-500 text-white shadow-sm'
     : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
    }`}>
    {tab.icon}
    {tab.label}
    </button>
   ))}
   <div className="flex-1" />
   <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
    className="text-[12px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer text-gray-700 ml-2 shrink-0">
    {CITIES_FILTER.map(c => <option key={c}>{c}</option>)}
   </select>
   </div>
  </div>
  </div>

  <div className="max-w-7xl mx-auto px-4 py-6">
  {loading ? (
   <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
   <Loader2 size={28} className="animate-spin mx-auto text-gray-300 mb-3" />
   <p className="text-gray-400 text-sm">იტვირთება...</p>
   </div>
  ) : filtered.length === 0 ? (
   <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
   <p className="text-gray-400 text-sm">შედეგი ვერ მოიძებნა</p>
   <p className="text-gray-300 text-xs mt-1">ადმინ პანელში დაამატეთ ტურისტული ობიექტები</p>
   </div>
  ) : (
   <>
   {/* Featured */}
   {featured.length > 0 && (
    <div className="mb-8">
    <div className="flex items-center gap-2 mb-4">
     <Star size={14} className="text-amber-400 fill-amber-400" />
     <h2 className="text-[15px] font-bold text-gray-900">რეკომენდირებული</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
     {featured.map(item => (
     <React.Fragment key={item.id}>
      <TourismCard item={item} isFav={favorites.includes(item.id)} onFav={toggleFav} onOpen={() => onSelectItem?.(item)} />
     </React.Fragment>
     ))}
    </div>
    </div>
   )}

   {/* Rest */}
   {rest.length > 0 && (
    <div>
    {featured.length > 0 && (
     <div className="flex items-center gap-2 mb-4">
     <Tag size={14} className="text-gray-400" />
     <h2 className="text-[15px] font-bold text-gray-900">ყველა</h2>
     </div>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
     {rest.map(item => (
     <React.Fragment key={item.id}>
      <TourismCard item={item} isFav={favorites.includes(item.id)} onFav={toggleFav} onOpen={() => onSelectItem?.(item)} />
     </React.Fragment>
     ))}
    </div>
    </div>
   )}
   </>
  )}
  </div>
 </div>
 );
}

// eslint-disable-next-line react/display-name
function TourismCard({ item, isFav, onFav, onOpen }: { item: TourismItem; isFav: boolean; onFav: (id: string) => void; onOpen: () => void }) {
 const catColors: Record<TourismCategory, string> = {
 all: 'bg-gray-100 text-gray-600',
 attractions: 'bg-orange-50 text-orange-600',
 flights: 'bg-blue-50 text-blue-600',
 trains: 'bg-emerald-50 text-emerald-600',
 concerts: 'bg-purple-50 text-purple-600',
 };

 return (
 <div onClick={onOpen} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
  {/* Image */}
  <div className="relative aspect-[16/10] overflow-hidden">
  <img src={item.image} alt={item.title}
   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
  {item.badge && (
   <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
   {item.badge}
   </div>
  )}
  <button onClick={() => onFav(item.id)}
   className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110">
   <Heart size={14} className={isFav ? 'text-rose-500 fill-rose-500' : 'text-gray-500'} />
  </button>
  <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 ${catColors[item.category]} rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm`}>
   <CategoryIcon cat={item.category} />
   {CATEGORY_TABS.find(t => t.value === item.category)?.label}
  </div>
  </div>

  {/* Content */}
  <div className="p-4">
  <h3 className="font-bold text-gray-900 text-[14px] leading-snug mb-1">{item.title}</h3>
  <p className="text-gray-500 text-[12px] mb-3 line-clamp-1">{item.subtitle}</p>

  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 mb-3">
   <span className="flex items-center gap-1"><MapPin size={10} />{item.city}</span>
   {item.date && <span className="flex items-center gap-1"><Calendar size={10} />{item.date}</span>}
   {item.time && <span className="flex items-center gap-1"><Clock size={10} />{item.time}</span>}
   {item.duration && <span className="flex items-center gap-1"><Compass size={10} />{item.duration}</span>}
  </div>

  {item.rating && (
   <div className="flex items-center gap-1.5 mb-3">
   <Star size={12} className="text-amber-400 fill-amber-400" />
   <span className="text-[13px] font-bold text-gray-900">{item.rating}</span>
   {item.reviewCount && <span className="text-[11px] text-gray-400">({item.reviewCount.toLocaleString()})</span>}
   </div>
  )}

  <div className="flex flex-wrap gap-1 mb-3">
   {item.tags.map(t => (
   <span key={t} className="bg-gray-50 text-gray-500 text-[10px] px-2 py-0.5 rounded-full border border-gray-100">
    {t}
   </span>
   ))}
  </div>

  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
   <div>
   {item.price !== undefined ? (
    item.price === 0
    ? <span className="text-[14px] font-black text-emerald-600">უფასო</span>
    : <span className="text-[17px] font-black text-gray-900">{item.currency}{item.price}
     {item.category === 'attractions' && <span className="text-[11px] text-gray-400 font-normal ml-1">/კაცი</span>}
     </span>
   ) : null}
   </div>
   <button onClick={e => { e.stopPropagation(); onOpen(); }} className="flex items-center gap-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-[12px] px-3.5 py-2 rounded-xl transition-colors cursor-pointer">
   {item.category === 'concerts' ? <><Ticket size={12} />ბილეთი</> :
    item.category === 'flights' ? <><Plane size={12} />ჯავშანი</> :
    item.category === 'trains' ? <><Train size={12} />ბილეთი</> :
    <>დეტ. <ChevronRight size={12} /></>}
   </button>
  </div>
  </div>
 </div>
 );
}

