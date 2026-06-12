import React, { useState, useRef, useEffect } from 'react';
import {
 X, CheckCircle, Image as ImageIcon, Home, Building2, Compass,
 Star, Wifi, Car, Coffee, Waves, Dumbbell, UtensilsCrossed,
 Plane, Train, Music, Mountain, MapPin, Calendar, Clock, ChevronLeft, Map
} from 'lucide-react';
import { Listing, ListingType } from '../types';
import LocationPicker from './LocationPicker';
import { ALL_CITIES } from '../data/allGeorgianLocations';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type Section = 'real_estate' | 'hotel' | 'tourism';
type TourismCat = 'attractions' | 'flights' | 'trains' | 'concerts';

interface AddListingModalProps {
 isOpen: boolean;
 onClose: () => void;
 onAddListing: (newListing: Listing) => void;
}

// City list sourced from comprehensive Georgian locations data (~150 entries)
const CITIES = ALL_CITIES;
const AMENITY_LIST = [
 { id: 'wifi', label: 'Wi-Fi', icon: <Wifi size={13} /> },
 { id: 'pool', label: 'აუზი', icon: <Waves size={13} /> },
 { id: 'gym', label: 'სპორტ ცენტრი', icon: <Dumbbell size={13} /> },
 { id: 'restaurant', label: 'რესტორანი', icon: <UtensilsCrossed size={13} /> },
 { id: 'parking', label: 'პარკინგი', icon: <Car size={13} /> },
 { id: 'breakfast', label: 'საუზმე', icon: <Coffee size={13} /> },
];

function PhotoUploader({ images, onAdd, onRemove }: { images: string[]; onAdd: (files: File[]) => void; onRemove: (i: number) => void }) {
 const ref = useRef<HTMLInputElement>(null);
 const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = Array.from(e.target.files || []) as File[];
 onAdd(files);
 if (ref.current) ref.current.value = '';
 };
 return (
 <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl p-3">
  <input ref={ref} type="file" accept="image/*" multiple onChange={handle} className="hidden" />
  {images.length === 0 ? (
  <button type="button" onClick={() => ref.current?.click()}
   className="w-full flex flex-col items-center justify-center gap-1.5 py-5 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
   <ImageIcon size={22} strokeWidth={1.5} />
   <span className="text-[13px] font-medium">ფოტოების ატვირთვა</span>
  </button>
  ) : (
  <div className="flex gap-2 overflow-x-auto pb-1">
   {images.map((img, i) => (
   <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0">
    <img src={img} className="w-full h-full object-cover" alt="" />
    <button type="button" onClick={() => onRemove(i)}
    className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 text-white rounded-full flex items-center justify-center cursor-pointer">
    <X size={9} />
    </button>
   </div>
   ))}
   {images.length < 10 && (
   <button type="button" onClick={() => ref.current?.click()}
    className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
    <span className="text-xl leading-none">+</span>
   </button>
   )}
  </div>
  )}
 </div>
 );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
 return (
 <div>
  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
  {children}
 </div>
 );
}

function inp(extra = '') {
 return `w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors ${extra}`;
}

export default function AddListingModal({ isOpen, onClose, onAddListing }: AddListingModalProps) {
 const { user } = useAuth();
 const [section, setSection] = useState<Section | null>(null);
 const [success, setSuccess] = useState(false);
 const [images, setImages] = useState<string[]>([]);
 const [imageFiles, setImageFiles] = useState<File[]>([]);

 // Real Estate state
 const [re, setRe] = useState({ dealType: 'sale' as ListingType, propType: 'apartment', title: '', city: 'თბილისი', district: '', street: '', rooms: '3', beds: '2', area: '', floor: '', totalFloors: '', status: 'ახალი აშენებული', condition: 'ახალი რემონტით', description: '', priceGel: '', priceUsd: '', phone: '' });
 const [pickedLat, setPickedLat] = useState<number | null>(null);
 const [pickedLng, setPickedLng] = useState<number | null>(null);
 const [showMapPicker, setShowMapPicker] = useState(false);
 const [mapError, setMapError] = useState('');
 const [selectedPackage, setSelectedPackage] = useState<'basic' | 'super' | 'premium' | null>(null);

 // Hotel state
 const [hotel, setHotel] = useState({ name: '', stars: 4, city: 'ბათუმი', district: '', pricePerNight: '', amenities: [] as string[], checkin: '14:00', checkout: '12:00', description: '', phone: '', website: '' });

 // Tourism state
 const [tour, setTour] = useState({ cat: 'attractions' as TourismCat, title: '', city: 'თბილისი', price: '', currency: '₾', date: '', time: '', duration: '', description: '', phone: '', from: '', to: '' });

 useEffect(() => {
 if (isOpen) {
  setPickedLat(null);
  setPickedLng(null);
  setShowMapPicker(false);
  setMapError('');
  setSelectedPackage(null);
 }
 }, [isOpen]);

 if (!isOpen) return null;

 const handleAddImages = (files: File[]) => {
 files.forEach(f => {
  const r = new FileReader();
  r.onloadend = () => { if (typeof r.result === 'string') setImages(p => [...p, r.result as string]); };
  r.readAsDataURL(f);
 });
 setImageFiles(p => [...p, ...files]);
 };
 const handleRemoveImage = (i: number) => {
 setImages(p => p.filter((_, j) => j !== i));
 setImageFiles(p => p.filter((_, j) => j !== i));
 };

 const toggleAmenity = (id: string) => {
 setHotel(p => ({ ...p, amenities: p.amenities.includes(id) ? p.amenities.filter(a => a !== id) : [...p.amenities, id] }));
 };

 const handleGelChange = (v: string) => {
 setRe(p => ({ ...p, priceGel: v, priceUsd: v && !isNaN(Number(v)) ? Math.round(Number(v) / 2.7).toString() : '' }));
 };
 const handleUsdChange = (v: string) => {
 setRe(p => ({ ...p, priceUsd: v, priceGel: v && !isNaN(Number(v)) ? Math.round(Number(v) * 2.7).toString() : '' }));
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setMapError('');
 if (section === 'real_estate') {
  if (!re.priceGel || !re.area) { alert('შეავსეთ ფასი და ფართობი'); return; }
  if (pickedLat == null || pickedLng == null) { setMapError('გთხოვთ მონიშნოთ მდებარეობა რუკაზე'); return; }
  if (!selectedPackage) { alert('აირჩიეთ პაკეტი'); return; }
  const priceLari = parseFloat(re.priceGel) || 0;
  const newListing: Listing = {
  id: `custom-${Date.now()}`,
  title: re.title || `${re.propType === 'apartment' ? 'ბინა' : re.propType === 'house' ? 'სახლი' : 'ობიექტი'} ${re.city}-ში`,
  type: re.dealType,
  priceLari, priceUsd: parseFloat(re.priceUsd) || priceLari / 2.7,
  location: [re.street, re.district, re.city].filter(Boolean).join(', '),
  district: re.district || re.city, city: re.city,
  rooms: re.rooms, beds: parseInt(re.beds) || 2, area: parseFloat(re.area) || 0,
  vipStatus: selectedPackage, image: images[0] || '', images,
  time: 'ახლახან',
  author: { name: 'მომხმარებელი', phone: re.phone || '599 00 00 00', avatar: '', isAgent: false, listingCount: 1 },
  condition: re.condition, status: re.status,
  descriptions: { ka: re.description || '', en: '', ru: '' },
  priceLevel: priceLari > 1500000 ? 'high' : priceLari < 300000 ? 'cheap' : 'average',
  coordinates: { x: 35 + Math.random() * 30, y: 35 + Math.random() * 30 }, comments: [],
  lat: pickedLat, lng: pickedLng,
  user_id: user?.id,
  property_type: re.propType
  };
  // Insert to Supabase if configured
  if (isSupabaseConfigured && user?.id) {
  const payload = {
   user_id: user.id,
   title: newListing.title,
   deal_type: newListing.type,
   property_type: re.propType || 'apartment',
   location: newListing.location,
   city: newListing.city,
   district: newListing.district,
   rooms: newListing.rooms ?? null,
   area_sqm: newListing.area || null,
   price: priceLari,
   currency: 'GEL',
   description: re.description || '',
   phone: re.phone || null,
   floor: re.floor ? parseInt(re.floor) : null,
   total_floors: null,
   lat: pickedLat,
   lng: pickedLng,
   images: newListing.images || [],
   status: 'live',
   vip_status: selectedPackage,
   author_name: user?.user_metadata?.name || 'მომხმარებელი',
   author_avatar: '',
  };
  const { error } = await supabase.from('properties').insert(payload);
  if (error) {
   console.error('Supabase insert error:', error);
   alert('განცხადების შენახვა ვერ მოხერხდა: ' + error.message);
   return;
  }
  }
  onAddListing(newListing);
 }
 setSuccess(true);
 setTimeout(() => {
  setSuccess(false); setSection(null); setImages([]); setImageFiles([]);
  setPickedLat(null); setPickedLng(null); setShowMapPicker(false); setMapError('');
  onClose();
 }, 2500);
 };

 const SECTIONS = [
 { id: 'real_estate' as Section, label: 'უძრავი ქონება', sub: 'ბინა, სახლი, მიწა, კომერციული', icon: <Home size={22} />, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
 { id: 'hotel' as Section, label: 'სასტუმრო', sub: 'სასტუმრო, ჰოსტელი, აპარტამენტი', icon: <Building2 size={22} />, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
 { id: 'tourism' as Section, label: 'ტურიზმი', sub: 'ადგილი, ფრენა, მატარებელი, კონცერტი', icon: <Compass size={22} />, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
 ];

 const activeSection = SECTIONS.find(s => s.id === section);
 const headerGradient = section ? activeSection?.color : 'from-gray-800 to-gray-900';

 return (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
  <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col">

  {/* Header */}
  <div className={`bg-gradient-to-r ${headerGradient} text-white px-5 py-4 flex items-center justify-between shrink-0`}>
   <div className="flex items-center gap-3">
   {section && (
    <button onClick={() => { setSection(null); setImages([]); setImageFiles([]); }}
    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition-colors">
    <ChevronLeft size={15} />
    </button>
   )}
   <div>
    <h3 className="font-bold text-[15px]">
    {!section ? 'განცხადების დამატება' : activeSection?.label}
    </h3>
    {section && <p className="text-white/70 text-[11px]">{activeSection?.sub}</p>}
   </div>
   </div>
   <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition-colors">
   <X size={15} />
   </button>
  </div>

  {/* Success */}
  {success ? (
   <div className="p-12 text-center flex flex-col items-center gap-3 bg-white flex-1 justify-center">
   <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
    <CheckCircle size={28} className="text-emerald-500" />
   </div>
   <h4 className="font-bold text-gray-900">განცხადება დაიდო!</h4>
   <p className="text-[13px] text-gray-500">წარმატებით გამოქვეყნდა.</p>
   </div>

  /* Section chooser */
  ) : !section ? (
   <div className="p-5 space-y-3 flex-1">
   <p className="text-[13px] text-gray-500 text-center mb-4">სად გინდა განათავსო განცხადება?</p>
   {SECTIONS.map(s => (
    <button key={s.id} onClick={() => setSection(s.id)}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 ${s.bg} ${s.border} hover:shadow-md transition-all cursor-pointer group`}>
    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
     {s.icon}
    </div>
    <div className="text-left">
     <p className={`font-bold text-[15px] ${s.text}`}>{s.label}</p>
     <p className="text-[12px] text-gray-500">{s.sub}</p>
    </div>
    <div className="ml-auto text-gray-300 group-hover:text-gray-400">›</div>
    </button>
   ))}
   </div>

  /* Real Estate form */
  ) : section === 'real_estate' ? (
   <form onSubmit={handleSubmit} className="px-5 py-4 overflow-y-auto space-y-4 flex-1">
   {/* Deal type */}
   <div className="flex gap-1 bg-violet-50 p-1 rounded-xl border border-violet-100">
    {(['sale','rent','daily_rent','pledge'] as ListingType[]).map(d => (
    <button key={d} type="button" onClick={() => setRe(p=>({...p,dealType:d}))}
     className={`flex-1 py-2 text-[12px] font-semibold rounded-lg transition-all cursor-pointer ${re.dealType===d ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
     {d==='sale'?'იყიდება':d==='rent'?'ქირავდება':d==='daily_rent'?'დღიურად':'გირაო'}
    </button>
    ))}
   </div>
   {/* Property type */}
   <div className="flex gap-1.5 flex-wrap">
    {[{id:'apartment',l:'ბინა'},{id:'house',l:'სახლი'},{id:'cottage',l:'კოტეჯი'},{id:'land',l:'მიწა'},{id:'commercial',l:'კომერც.'}].map(t => (
    <button key={t.id} type="button" onClick={() => setRe(p=>({...p,propType:t.id}))}
     className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer ${re.propType===t.id ? 'bg-violet-100 text-violet-700 border border-violet-300' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
     {t.l}
    </button>
    ))}
   </div>

   <PhotoUploader images={images} onAdd={handleAddImages} onRemove={handleRemoveImage} />

   <Field label="სათაური">
    <input value={re.title} onChange={e=>setRe(p=>({...p,title:e.target.value}))} placeholder={re.propType === 'land' ? "მაგ. 500 მ² მიწის ნაკვეთი ბათუმში" : "მაგ. 3-ოთახიანი ბინა ვაკეში, 85 მ²"} className={inp()} />
   </Field>
   <div className="grid grid-cols-2 gap-2.5">
    <Field label="ქალაქი">
    <select value={re.city} onChange={e=>setRe(p=>({...p,city:e.target.value}))} className={inp()}>
     {CITIES.map(c=><option key={c}>{c}</option>)}
    </select>
    </Field>
    <Field label="უბანი">
    <input value={re.district} onChange={e=>setRe(p=>({...p,district:e.target.value}))} placeholder="საბურთალო" className={inp()} />
    </Field>
   </div>
   <input value={re.street} onChange={e=>setRe(p=>({...p,street:e.target.value}))} placeholder="ქუჩა, სახლის ნომერი" className={inp()} />

   {/* Map Location Picker */}
   <div className="space-y-2">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1">
    <MapPin size={11} />მდებარეობა რუკაზე <span className="text-red-400">*</span>
    </label>
    <button
    type="button"
    onClick={() => setShowMapPicker(v => !v)}
    className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all cursor-pointer w-full justify-center ${
     showMapPicker || pickedLat
     ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200/50'
     : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
    }`}
    >
    <Map size={14} />
    {pickedLat ? '✓ მონიშნულია' : 'მდებარეობის არჩევა რუკაზე'}
    </button>
    {showMapPicker && (
    <LocationPicker
     onPick={(lat, lng, address) => {
     setPickedLat(lat);
     setPickedLng(lng);
     setMapError('');
     if (address && !re.street) {
      setRe(p => ({ ...p, street: address }));
     }
     }}
     initialLat={pickedLat ?? undefined}
     initialLng={pickedLng ?? undefined}
     initialAddress={re.street}
    />
    )}
    {mapError && (
    <p className="text-[12px] text-red-500 font-medium">{mapError}</p>
    )}
   </div>

   <div className={`grid gap-2 ${re.propType === 'land' ? 'grid-cols-1' : 'grid-cols-4'}`}>
    {[{k:'rooms',l:'ოთახი',ph:'3'},{k:'beds',l:'საძინ.',ph:'2'},{k:'area',l:'ფართობი',ph:'85'},{k:'floor',l:'სართ.',ph:'4/12'}]
     .filter(f => re.propType !== 'land' || f.k === 'area')
     .map(f=>(
    <React.Fragment key={f.k}>
     <Field label={f.l}>
     <input value={(re as any)[f.k]} onChange={e=>setRe(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} className={inp('text-center')} />
     </Field>
    </React.Fragment>
    ))}
   </div>
   {re.propType !== 'land' && (
   <div className="grid grid-cols-2 gap-2.5">
    <Field label="სტატუსი">
    <select value={re.status} onChange={e=>setRe(p=>({...p,status:e.target.value}))} className={inp()}>
     <option>ახალი აშენებული</option><option>ძველი აშენებული</option><option>მშენებარე</option>
    </select>
    </Field>
    <Field label="მდგომარეობა">
    <select value={re.condition} onChange={e=>setRe(p=>({...p,condition:e.target.value}))} className={inp()}>
     <option>ახალი რემონტით</option><option>კოსმეტიკური რემონტი</option><option>გარეულია</option><option>ჩარჩო</option>
    </select>
    </Field>
   </div>
   )}
   <textarea rows={3} value={re.description} onChange={e=>setRe(p=>({...p,description:e.target.value}))} placeholder="აღწერა — ლოკაცია, უპირატესობები, ინფრასტრუქტურა..." className={inp('resize-none')} />
   <div className="grid grid-cols-2 gap-2.5">
    <Field label="ფასი ₾">
    <input value={re.priceGel} onChange={e=>handleGelChange(e.target.value)} placeholder="240 000" className={inp('font-semibold')} />
    </Field>
    <Field label="ფასი $">
    <input value={re.priceUsd} onChange={e=>handleUsdChange(e.target.value)} placeholder="88 000" className={inp('font-semibold')} />
    </Field>
   </div>
   <Field label="ტელეფონი">
    <input value={re.phone} onChange={e=>setRe(p=>({...p,phone:e.target.value}))} placeholder="599 12 34 56" className={inp()} />
   </Field>
   <div className="space-y-2">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">პაკეტის არჩევა</label>
    <div className="grid grid-cols-3 gap-2">
     {([
      { id: 'basic', name: 'ბეისიქი', price: 1, color: 'bg-slate-600', border: 'border-slate-500' },
      { id: 'super', name: 'სუპერი', price: 3, color: 'bg-emerald-600', border: 'border-emerald-500' },
      { id: 'premium', name: 'პრემიუმი', price: 8, color: 'bg-amber-600', border: 'border-amber-500' },
     ] as const).map((pkg) => (
      <button
       key={pkg.id}
       type="button"
       onClick={() => setSelectedPackage(pkg.id)}
       className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 transition-all cursor-pointer ${
        selectedPackage === pkg.id ? pkg.border + ' shadow-md ' + pkg.color + ' text-white' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
       }`}
      >
       <span className="text-[9px] font-black">{pkg.name.toUpperCase()}</span>
       <span className="text-[12px] font-black">{pkg.price} ₾</span>
      </button>
     ))}
    </div>
   </div>

   <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
    <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-semibold hover:bg-gray-50 cursor-pointer">გაუქმება</button>
    <button
    type="submit"
    disabled={pickedLat == null || pickedLng == null || !selectedPackage}
    className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-colors"
    >
    გამოქვეყნება
    </button>
   </div>
   </form>

  /* ═══════════════════ HOTEL FORM ═══════════════════ */
  ) : section === 'hotel' ? (
   <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">

   {/* Blue banner with star picker */}
   <div className="bg-blue-600 px-5 pt-4 pb-5">
    <p className="text-blue-100 text-[11px] font-semibold uppercase tracking-widest mb-3">სასტუმროს კლასი</p>
    <div className="flex items-center gap-2">
    {[1,2,3,4,5].map(n => (
     <button key={n} type="button" onClick={() => setHotel(p => ({...p, stars: n}))}
     className="cursor-pointer transition-all hover:scale-125 active:scale-95">
     <Star size={32} className={n <= hotel.stars ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-blue-400 fill-blue-400/30'} />
     </button>
    ))}
    <span className="ml-2 text-white font-black text-[18px]">{hotel.stars}★</span>
    </div>
    <p className="text-blue-200 text-[12px] mt-1">
    {hotel.stars===5?'ლუქს კლასი':hotel.stars===4?'სუპერიორ კლასი':hotel.stars===3?'სტანდარტ კლასი':hotel.stars===2?'ეკონომ კლასი':'ბიუჯეტ კლასი'}
    </p>
   </div>

   <div className="px-5 py-4 space-y-5">
    {/* Photos */}
    <PhotoUploader images={images} onAdd={handleAddImages} onRemove={handleRemoveImage} />

    {/* Name */}
    <div className="relative">
    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
    <input value={hotel.name} onChange={e => setHotel(p => ({...p, name: e.target.value}))}
     placeholder="სასტუმროს სახელი (მაგ. Grand Palace Hotel)"
     className="w-full bg-blue-50 border border-blue-200 rounded-xl py-3 pl-9 pr-4 text-[14px] text-gray-800 placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-colors font-semibold" />
    </div>

    {/* Location row */}
    <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
    <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
     <MapPin size={13} className="text-blue-500" />
     <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ადგილმდებარეობა</span>
    </div>
    <div className="grid grid-cols-2 divide-x divide-gray-200">
     <div className="p-3">
     <p className="text-[10px] text-gray-400 font-semibold mb-1">ქალაქი</p>
     <select value={hotel.city} onChange={e => setHotel(p => ({...p, city: e.target.value}))}
      className="w-full bg-transparent text-[14px] text-gray-800 font-semibold focus:outline-none cursor-pointer">
      {CITIES.map(c => <option key={c}>{c}</option>)}
     </select>
     </div>
     <div className="p-3">
     <p className="text-[10px] text-gray-400 font-semibold mb-1">უბანი / ზონა</p>
     <input value={hotel.district} onChange={e => setHotel(p => ({...p, district: e.target.value}))}
      placeholder="ბულვარი, ცენტრი..."
      className="w-full bg-transparent text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none" />
     </div>
    </div>
    </div>

    {/* Price + times */}
    <div className="bg-blue-50 rounded-2xl border border-blue-100 overflow-hidden">
    <div className="px-4 py-2 border-b border-blue-100 flex items-center gap-2">
     <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">ტარიფი და დრო</span>
    </div>
    <div className="grid grid-cols-3 divide-x divide-blue-100">
     <div className="p-3">
     <p className="text-[10px] text-blue-400 font-semibold mb-1">₾ / ღამე</p>
     <input value={hotel.pricePerNight} onChange={e => setHotel(p => ({...p, pricePerNight: e.target.value}))}
      placeholder="150" className="w-full bg-transparent text-[16px] font-black text-blue-700 placeholder-blue-200 focus:outline-none" />
     </div>
     <div className="p-3">
     <p className="text-[10px] text-blue-400 font-semibold mb-1">Check-in</p>
     <input type="time" value={hotel.checkin} onChange={e => setHotel(p => ({...p, checkin: e.target.value}))}
      className="w-full bg-transparent text-[14px] font-bold text-gray-700 focus:outline-none" />
     </div>
     <div className="p-3">
     <p className="text-[10px] text-blue-400 font-semibold mb-1">Check-out</p>
     <input type="time" value={hotel.checkout} onChange={e => setHotel(p => ({...p, checkout: e.target.value}))}
      className="w-full bg-transparent text-[14px] font-bold text-gray-700 focus:outline-none" />
     </div>
    </div>
    </div>

    {/* Amenities */}
    <div>
    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">სერვისები და კეთილმოწყობა</p>
    <div className="flex flex-wrap gap-2">
     {AMENITY_LIST.map(a => (
     <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold border-2 transition-all cursor-pointer ${
      hotel.amenities.includes(a.id)
       ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
       : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'
      }`}>
      {a.icon}{a.label}
     </button>
     ))}
    </div>
    </div>

    {/* Description */}
    <textarea rows={3} value={hotel.description} onChange={e => setHotel(p => ({...p, description: e.target.value}))}
    placeholder="სასტუმროს შესახებ — ოთახები, ხედი, სპეციალური შეთავაზება..."
    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 resize-none transition-colors" />

    {/* Contacts */}
    <div className="grid grid-cols-2 gap-3">
    <div className="relative">
     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">📞</span>
     <input value={hotel.phone} onChange={e => setHotel(p => ({...p, phone: e.target.value}))} placeholder="ტელეფონი"
     className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-8 pr-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors" />
    </div>
    <div className="relative">
     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">🌐</span>
     <input value={hotel.website} onChange={e => setHotel(p => ({...p, website: e.target.value}))} placeholder="ვებსაიტი"
     className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-8 pr-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors" />
    </div>
    </div>

    <div className="flex gap-2 pt-1">
    <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-[13px] font-bold hover:bg-gray-50 cursor-pointer transition-colors">გაუქმება</button>
    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-[13px] font-bold cursor-pointer transition-colors shadow-lg shadow-blue-200/50">გამოქვეყნება</button>
    </div>
   </div>
   </form>

  /* ═══════════════════ TOURISM FORM ═══════════════════ */
  ) : (
   <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">

   {/* Category selector — large icon cards */}
   <div className="grid grid-cols-4 gap-0 border-b border-gray-100">
    {([
    { id: 'attractions' as TourismCat, l: 'ადგილი', icon: <Mountain size={20}/>, bg: 'bg-orange-500', light: 'bg-orange-50 text-orange-700 border-orange-300' },
    { id: 'flights'  as TourismCat, l: 'ფრენა',  icon: <Plane size={20}/>, bg: 'bg-blue-500', light: 'bg-blue-50 text-blue-700 border-blue-300' },
    { id: 'trains'  as TourismCat, l: 'მატარებელი',icon: <Train size={20}/>, bg: 'bg-emerald-500',light: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    { id: 'concerts' as TourismCat, l: 'კონცერტი', icon: <Music size={20}/>, bg: 'bg-purple-500', light: 'bg-purple-50 text-purple-700 border-purple-300' },
    ]).map(c => (
    <button key={c.id} type="button" onClick={() => setTour(p => ({...p, cat: c.id}))}
     className={`flex flex-col items-center gap-1.5 py-4 text-[11px] font-bold transition-all cursor-pointer border-b-2 ${
     tour.cat === c.id ? `${c.light} border-b-current` : 'text-gray-400 border-transparent hover:bg-gray-50'
     }`}>
     <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all ${tour.cat === c.id ? c.bg : 'bg-gray-200'}`}>
     {c.icon}
     </div>
     {c.l}
    </button>
    ))}
   </div>

   <div className="px-5 py-4 space-y-4">
    {/* Photos */}
    <PhotoUploader images={images} onAdd={handleAddImages} onRemove={handleRemoveImage} />

    {/* Route card for flights/trains */}
    {(tour.cat === 'flights' || tour.cat === 'trains') ? (
    <div className={`rounded-2xl border-2 overflow-hidden ${tour.cat === 'flights' ? 'border-blue-200 bg-blue-50' : 'border-emerald-200 bg-emerald-50'}`}>
     <div className={`px-4 py-2 flex items-center gap-2 ${tour.cat === 'flights' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
     {tour.cat === 'flights' ? <Plane size={13} className="text-blue-600" /> : <Train size={13} className="text-emerald-600" />}
     <span className={`text-[11px] font-bold uppercase tracking-wider ${tour.cat === 'flights' ? 'text-blue-600' : 'text-emerald-600'}`}>
      {tour.cat === 'flights' ? 'ფრენის მარშრუტი' : 'მატარებლის მარშრუტი'}
     </span>
     </div>
     <div className="flex items-center gap-3 px-4 py-3">
     <div className="flex-1">
      <p className="text-[10px] text-gray-400 font-semibold mb-1">საიდან</p>
      <input value={tour.from} onChange={e => setTour(p => ({...p, from: e.target.value}))} placeholder="თბილისი"
      className="w-full bg-transparent text-[16px] font-black text-gray-800 placeholder-gray-300 focus:outline-none" />
     </div>
     <div className={`text-xl font-black ${tour.cat === 'flights' ? 'text-blue-400' : 'text-emerald-400'}`}>→</div>
     <div className="flex-1">
      <p className="text-[10px] text-gray-400 font-semibold mb-1">სად</p>
      <input value={tour.to} onChange={e => setTour(p => ({...p, to: e.target.value}))} placeholder="ბარსელონა"
      className="w-full bg-transparent text-[16px] font-black text-gray-800 placeholder-gray-300 focus:outline-none" />
     </div>
     </div>
    </div>
    ) : (
    <input value={tour.title} onChange={e => setTour(p => ({...p, title: e.target.value}))}
     placeholder={tour.cat === 'concerts' ? 'კონცერტის სახელი, მხატვარი...' : 'ადგილის სახელი, მარშრუტი...'}
     className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 text-[14px] font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors" />
    )}

    {(tour.cat === 'flights' || tour.cat === 'trains') && (
    <input value={tour.title} onChange={e => setTour(p => ({...p, title: e.target.value}))}
     placeholder={tour.cat === 'flights' ? 'ფრენის სახელი (მაგ. Georgian Airways 204)' : 'მატარებლის სახელი (მაგ. ექსპრესი)'}
     className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors" />
    )}

    {/* Date / Time / Duration — timeline style */}
    <div className="bg-gray-900 rounded-2xl p-4 flex items-center gap-4">
    <div className="flex-1">
     <p className="text-[10px] text-gray-400 font-semibold mb-1 flex items-center gap-1"><Calendar size={10} />თარიღი</p>
     <input type="date" value={tour.date} onChange={e => setTour(p => ({...p, date: e.target.value}))}
     className="w-full bg-transparent text-white text-[14px] font-bold focus:outline-none" />
    </div>
    <div className="w-px bg-gray-700 h-8" />
    <div className="flex-1">
     <p className="text-[10px] text-gray-400 font-semibold mb-1 flex items-center gap-1"><Clock size={10} />დრო</p>
     <input type="time" value={tour.time} onChange={e => setTour(p => ({...p, time: e.target.value}))}
     className="w-full bg-transparent text-white text-[14px] font-bold focus:outline-none" />
    </div>
    <div className="w-px bg-gray-700 h-8" />
    <div className="flex-1">
     <p className="text-[10px] text-gray-400 font-semibold mb-1">ხანგრძ.</p>
     <input value={tour.duration} onChange={e => setTour(p => ({...p, duration: e.target.value}))} placeholder="2 სთ"
     className="w-full bg-transparent text-white text-[14px] font-bold placeholder-gray-600 focus:outline-none" />
    </div>
    </div>

    {/* City + Price */}
    <div className="grid grid-cols-2 gap-3">
    <div>
     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">ქალაქი</p>
     <select value={tour.city} onChange={e => setTour(p => ({...p, city: e.target.value}))}
     className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[14px] text-gray-800 focus:outline-none cursor-pointer">
     {CITIES.map(c => <option key={c}>{c}</option>)}
     </select>
    </div>
    <div>
     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">ფასი</p>
     <div className="flex gap-1.5">
     <input value={tour.price} onChange={e => setTour(p => ({...p, price: e.target.value}))} placeholder="50"
      className="flex-1 bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-[14px] font-bold text-gray-800 placeholder-gray-400 focus:outline-none" />
     <select value={tour.currency} onChange={e => setTour(p => ({...p, currency: e.target.value}))}
      className="w-14 bg-white border border-gray-200 rounded-xl py-2.5 px-2 text-[13px] text-gray-700 focus:outline-none cursor-pointer">
      <option>₾</option><option>$</option><option>€</option>
     </select>
     </div>
    </div>
    </div>

    {/* Description */}
    <textarea rows={3} value={tour.description} onChange={e => setTour(p => ({...p, description: e.target.value}))}
    placeholder={tour.cat==='concerts'?'მხატვარი, ჟანრი, ვენიუ, სცენა...':tour.cat==='flights'?'ავიაკომპანია, კლასი, გაჩერებები...':tour.cat==='trains'?'ვაგონის ტიპი, მარშრუტი...':'ადგილის შესახებ — ისტორია, მარშრუტი, ტიპი...'}
    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-300 resize-none transition-colors" />

    {/* Phone */}
    <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px]">📞</span>
    <input value={tour.phone} onChange={e => setTour(p => ({...p, phone: e.target.value}))} placeholder="საკონტაქტო ტელეფონი"
     className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 text-[13px] placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors" />
    </div>

    <div className="flex gap-2 pt-1">
    <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-[13px] font-bold hover:bg-gray-50 cursor-pointer transition-colors">გაუქმება</button>
    <button type="submit" className={`flex-1 text-white py-3 rounded-xl text-[13px] font-bold cursor-pointer transition-colors ${
     tour.cat==='flights' ? 'bg-blue-600 hover:bg-blue-700' : tour.cat==='trains' ? 'bg-emerald-600 hover:bg-emerald-700' : tour.cat==='concerts' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-500 hover:bg-orange-600'
    }`}>გამოქვეყნება</button>
    </div>
   </div>
   </form>
  )}
  </div>
 </div>
 );
}
