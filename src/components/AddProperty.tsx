import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ImagePlus, MapPin, BedDouble, Ruler, Banknote, Phone, Home, Loader2, Send, MessageCircle, ArrowLeft, Map } from 'lucide-react';
import LocationPicker from './LocationPicker';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';

interface PropertyDraft {
 id: string;
 property_type: string | null;
 location: string | null;
 rooms: number | null;
 area_sqm: number | null;
 price: number | null;
 currency: string;
 images: string[];
 status: string;
 title: string | null;
 description: string | null;
 phone: string | null;
 floor: number | null;
 total_floors: number | null;
}

const BG_PHOTO = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80';

interface AddPropertyProps {
 onBack?: () => void;
}

export default function AddProperty({ onBack }: AddPropertyProps) {
 const { user, profile } = useAuth();
 const { uploadPropertyImage } = useProfile(user?.id);

 const [draft, setDraft] = useState<PropertyDraft | null>(null);
 const [isLive, setIsLive] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [submitError, setSubmitError] = useState<string | null>(null);
 const [submitted, setSubmitted] = useState(false);
 const [uploadedImages, setUploadedImages] = useState<string[]>([]);
 const [imageFiles, setImageFiles] = useState<File[]>([]);
 const photoInputRef = useRef<HTMLInputElement>(null);

 const [pickedLat, setPickedLat] = useState<number | null>(null);
 const [pickedLng, setPickedLng] = useState<number | null>(null);
 const [showMapPicker, setShowMapPicker] = useState(false);

 const [form, setForm] = useState({
 title: '',
 property_type: 'apartment',
 deal_type: 'sale',
 location: '',
 rooms: '',
 area_sqm: '',
 price: '',
 currency: 'GEL',
 description: '',
 phone: '',
 floor: '',
 total_floors: ''
 });

 useEffect(() => {
 if (!isSupabaseConfigured) return;

 const channel = supabase
  .channel('property-drafts')
  .on(
  'postgres_changes',
  {
   event: 'INSERT',
   schema: 'public',
   table: 'properties',
   filter: "status=eq.draft"
  },
  (payload) => {
   const newRow = payload.new as PropertyDraft;
   setDraft(newRow);
   setIsLive(true);

   setForm(prev => ({
   ...prev,
   title: newRow.title || prev.title,
   property_type: newRow.property_type || prev.property_type,
   deal_type: newRow.property_type === 'rent' ? 'rent' : newRow.property_type === 'pledge' ? 'pledge' : 'sale',
   location: newRow.location || prev.location,
   rooms: newRow.rooms?.toString() || prev.rooms,
   area_sqm: newRow.area_sqm?.toString() || prev.area_sqm,
   price: newRow.price?.toString() || prev.price,
   currency: newRow.currency || prev.currency,
   description: newRow.description || prev.description,
   phone: newRow.phone || prev.phone,
   floor: newRow.floor?.toString() || prev.floor,
   total_floors: newRow.total_floors?.toString() || prev.total_floors
   }));

   setTimeout(() => setIsLive(false), 2000);
  }
  )
  .subscribe((status) => {
  console.log('[realtime] subscription status:', status);
  });

 return () => {
  supabase.removeChannel(channel);
 };
 }, []);

 const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
 const files = Array.from(e.target.files || []) as File[];
 files.forEach((file: File) => {
  setImageFiles(prev => [...prev, file]);
  const reader = new FileReader();
  reader.onloadend = () => {
  if (typeof reader.result === 'string') {
   setUploadedImages(prev => [...prev, reader.result as string]);
  }
  };
  reader.readAsDataURL(file);
 });
 if (photoInputRef.current) photoInputRef.current.value = '';
 }, []);

 const handleRemovePhoto = useCallback((idx: number) => {
 setUploadedImages(prev => prev.filter((_, i) => i !== idx));
 setImageFiles(prev => prev.filter((_, i) => i !== idx));
 }, []);

 const updateField = (key: string, value: string) => {
 setForm(prev => ({ ...prev, [key]: value }));
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setSubmitError(null);
 if (!isSupabaseConfigured) {
  setSubmitError('Supabase კონფიგაცია არ არის — დაამატეთ .env.local ფაილი.');
  return;
 }
 if (!user) {
  setSubmitError('განცხადების დასამატებლად საჭიროა ავტორიზაცია.');
  return;
 }
 if (pickedLat == null || pickedLng == null) {
  setSubmitError('გთხოვთ მონიშნოთ მდებარეობა რუკაზე (აუცილებელია).');
  return;
 }
 setIsSubmitting(true);

 try {
  // Upload images to Supabase Storage (if configured), else keep base64
  let finalImages: string[] = uploadedImages;
  if (isSupabaseConfigured && imageFiles.length > 0) {
  const uploadedUrls: string[] = [];
  for (const file of imageFiles) {
   const { url } = await uploadPropertyImage(file);
   if (url) uploadedUrls.push(url);
  }
  if (uploadedUrls.length > 0) finalImages = uploadedUrls;
  }

  const payload = {
  user_id: user?.id ?? null,
  author_name: profile?.name || '',
  author_avatar: profile?.avatar_url || '',
  title: form.title,
  deal_type: form.deal_type,
  property_type: form.property_type,
  location: form.location,
  rooms: form.rooms ? parseInt(form.rooms) : null,
  area_sqm: form.area_sqm ? parseFloat(form.area_sqm) : null,
  price: form.price ? parseFloat(form.price) : null,
  currency: form.currency,
  description: form.description,
  phone: form.phone || profile?.phone || null,
  floor: form.floor ? parseInt(form.floor) : null,
  total_floors: form.total_floors ? parseInt(form.total_floors) : null,
  images: finalImages,
  lat: pickedLat,
  lng: pickedLng,
  status: 'live'
  };

  const { error } = await supabase.from('properties').insert(payload);
  if (error) throw error;

  setForm({
  title: '', property_type: 'apartment', deal_type: 'sale', location: '', rooms: '',
  area_sqm: '', price: '', currency: 'GEL', description: '', phone: '',
  floor: '', total_floors: ''
  });
  setUploadedImages([]);
  setImageFiles([]);
  setDraft(null);
  setPickedLat(null);
  setPickedLng(null);
  setShowMapPicker(false);
  setSubmitted(true);
 } catch (err: any) {
  const msg = err?.message || String(err);
  setSubmitError(
  msg.includes('row-level security') || msg.includes('42501')
   ? 'უფლებაა არ არის. გაიარეთ \u10d0ნგარიში და სცადეთ ხელახლა.'
   : 'შეცდომა: ' + msg
  );
  console.error('Submit error:', err);
 } finally {
  setIsSubmitting(false);
 }
 };

 if (submitted) {
 return (
  <div className="relative min-h-full w-full flex items-center justify-center p-8 font-sans">
  <div className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20" style={{ backgroundImage: `url(${BG_PHOTO})` }} />
  <div className="absolute inset-0 bg-stone-100/80 -z-10" />
  <div className="bg-white rounded-3xl p-10 text-center max-w-md w-full shadow-2xl relative z-10">
   <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
   <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
   </div>
   <h2 className="text-[22px] font-black text-gray-900 mb-2">განცხადება დაიდო!</h2>
   <p className="text-gray-500 text-[14px] mb-6">თქვენი განცხადება წარმატებით შეინახა ბაზაში.</p>
   <button
   onClick={onBack}
   className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-2xl cursor-pointer transition-colors"
   >
   მთავარ გვერდზე დაბრუნება
   </button>
  </div>
  </div>
 );
 }

 return (
 <div className="relative min-h-full w-full flex items-start justify-center p-4 sm:p-8 font-sans">
  {/* Background photo */}
  <div
  className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20"
  style={{ backgroundImage: `url(${BG_PHOTO})` }}
  />
  {/* Semi-transparent warm overlay — photo is visible behind */}
  <div className="absolute inset-0 bg-stone-100/80 -z-10" />

  <div className="w-full max-w-2xl space-y-6 relative z-10">

  {/* Header */}
  <div className="text-center space-y-2 pt-4 relative">
   {onBack && (
   <button
    onClick={onBack}
    className="absolute left-0 top-5 p-2 rounded-full hover:bg-white/50 transition-colors cursor-pointer"
   >
    <ArrowLeft size={20} className="text-gray-600" />
   </button>
   )}
   <h1 className="text-[28px] font-black text-gray-900 tracking-tight">განცხადების დამატება</h1>
   <p className="text-sm text-gray-500">ფორმა აივსება ავტომატურად Telegram/WhatsApp მესიჯიდან</p>
  </div>

  {/* Live Draft Badge */}
  {draft && (
   <div
   className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/40 border border-white/50 shadow-lg w-fit mx-auto transition-all duration-700 ${
    isLive ? 'scale-105 shadow-emerald-200/50' : 'scale-100'
   }`}
   >
   <span className="relative flex h-2.5 w-2.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
   </span>
   <span className="text-[13px] font-semibold text-gray-700">
    {isLive ? 'ახალი მონაცემები მიღებულია' : 'მონაცემები დამუშავებულია'}
   </span>
   </div>
  )}

  {/* Auto-fill from messaging apps */}
  <div className="grid grid-cols-2 gap-3">
   <a
   href="https://t.me/adjarahome_bot?start=property"
   target="_blank"
   rel="noopener noreferrer"
   className="flex items-center justify-center gap-2 backdrop-blur-xl bg-white/50 border border-white/60 rounded-2xl py-3 px-4 shadow-lg shadow-stone-300/10 hover:bg-white/70 hover:shadow-xl transition-all duration-300 cursor-pointer"
   >
   <MessageCircle size={18} className="text-sky-500" />
   <span className="text-[13px] font-semibold text-gray-800">Telegram-ით გაგზავნა</span>
   </a>
   <a
   href="https://wa.me/995599000000?text=განცხადების%20ტექსტი%20აქ"
   target="_blank"
   rel="noopener noreferrer"
   className="flex items-center justify-center gap-2 backdrop-blur-xl bg-white/50 border border-white/60 rounded-2xl py-3 px-4 shadow-lg shadow-stone-300/10 hover:bg-white/70 hover:shadow-xl transition-all duration-300 cursor-pointer"
   >
   <Phone size={18} className="text-emerald-500" />
   <span className="text-[13px] font-semibold text-gray-800">WhatsApp-ით გაგზავნა</span>
   </a>
  </div>

  {/* Main Form Card */}
  <form
   onSubmit={handleSubmit}
   className="backdrop-blur-2xl bg-white/60 border border-white/60 rounded-[32px] shadow-2xl shadow-stone-300/20 p-6 sm:p-8 space-y-5 transition-all"
  >

   {/* Photos */}
   <div>
   <div className="border-2 border-dashed border-stone-300/60 bg-white/30 rounded-2xl p-3 backdrop-blur-sm">
    <input
    ref={photoInputRef}
    type="file"
    accept="image/*"
    multiple
    onChange={handlePhotoUpload}
    className="hidden"
    />
    {uploadedImages.length === 0 ? (
    <button
     type="button"
     onClick={() => photoInputRef.current?.click()}
     className="w-full flex items-center justify-center gap-2 py-5 cursor-pointer text-sm text-gray-600 font-medium rounded-xl hover:bg-white/40 transition-all duration-300"
    >
     <ImagePlus size={20} strokeWidth={1.5} />
     აირჩიეთ ფოტოები
    </button>
    ) : (
    <div className="flex gap-2 overflow-x-auto pb-1">
     {uploadedImages.map((img, idx) => (
     <div
      key={idx}
      className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/60 shadow-sm shrink-0"
     >
      <img src={img} className="w-full h-full object-cover" alt="" />
      <button
      type="button"
      onClick={() => handleRemovePhoto(idx)}
      className="absolute top-1 right-1 w-5 h-5 bg-gray-900/80 text-white rounded-full text-[9px] flex items-center justify-center cursor-pointer backdrop-blur-sm"
      >
      <X size={10} />
      </button>
     </div>
     ))}
     {uploadedImages.length < 10 && (
     <button
      type="button"
      onClick={() => photoInputRef.current?.click()}
      className="w-20 h-20 rounded-2xl border-2 border-dashed border-stone-300/60 flex items-center justify-center cursor-pointer hover:border-stone-400 transition-all shrink-0"
     >
      <span className="text-lg text-stone-400">+</span>
     </button>
     )}
    </div>
    )}
   </div>
   </div>

   {/* Title */}
   <div className="space-y-1.5">
   <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">სათაური</label>
   <input
    type="text"
    value={form.title}
    onChange={e => updateField('title', e.target.value)}
    placeholder={form.property_type === 'land' ? "მაგ. 500 მ² მიწის ნაკვეთი ბათუმში" : "მაგ. 3 ოთახიანი ბინა ვაკეში"}
    className="w-full bg-white/70 border border-white/80 rounded-2xl py-3 px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:bg-white/90 focus:shadow-lg focus:shadow-stone-200/40 transition-all duration-300"
   />
   </div>

   {/* Property Type */}
   <div className="space-y-1.5">
   <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">ობიექტის ტიპი</label>
   <div className="flex gap-1.5 bg-stone-200/40 p-1.5 rounded-2xl backdrop-blur-sm">
    {[
    { id: 'apartment', label: 'ბინა' },
    { id: 'house', label: 'კერძო სახლი' },
    { id: 'cottage', label: 'აგარაკი' },
    { id: 'land', label: 'მიწის ნაკვეთი' },
    { id: 'commercial', label: 'კომერციული' },
    { id: 'hotel', label: 'სასტუმრო' },
    ].map(d => (
    <button
     key={d.id}
     type="button"
     onClick={() => updateField('property_type', d.id)}
     className={`flex-1 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
     form.property_type === d.id
      ? 'bg-white text-gray-900 shadow-md shadow-stone-300/20'
      : 'text-gray-500 hover:text-gray-700'
     }`}
     style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    >
     {d.label}
    </button>
    ))}
   </div>
   </div>

   {/* Deal Type */}
   <div className="space-y-1.5">
   <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">გარიგების ტიპი</label>
   <div className="flex gap-1.5 bg-stone-200/40 p-1.5 rounded-2xl backdrop-blur-sm">
    {[
    { id: 'sale', label: 'იყიდება' },
    { id: 'rent', label: 'ქირავდება' },
    { id: 'daily_rent', label: 'ქირავდება დღიურად' },
    { id: 'pledge', label: 'გირავდება' },
    ].map(d => (
    <button
     key={d.id}
     type="button"
     onClick={() => updateField('deal_type', d.id)}
     className={`flex-1 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
     form.deal_type === d.id
      ? 'bg-white text-gray-900 shadow-md shadow-stone-300/20'
      : 'text-gray-500 hover:text-gray-700'
     }`}
     style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    >
     {d.label}
    </button>
    ))}
   </div>
   </div>

   {/* Location */}
   <div className="space-y-2">
   <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1">
    <MapPin size={11} />მდებარეობა <span className="text-red-400">*</span>
   </label>
   <div className="flex gap-2">
    <input
    type="text"
    value={form.location}
    onChange={e => updateField('location', e.target.value)}
    placeholder="თბილისი, საბურთალო, ფალიაშვილის ქუჩა"
    className="flex-1 bg-white/70 border border-white/80 rounded-2xl py-3 px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:bg-white/90 focus:shadow-lg focus:shadow-stone-200/40 transition-all duration-300"
    />
    <button
    type="button"
    onClick={() => setShowMapPicker(v => !v)}
    className={`shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-2xl text-[13px] font-semibold border transition-all cursor-pointer ${
     showMapPicker || pickedLat
     ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200/50'
     : 'bg-white/70 border-white/80 text-gray-600 hover:bg-white/90'
    }`}
    >
    <Map size={14} />
    {pickedLat ? '✓ მონიშნულია' : 'რუკაზე'}
    </button>
   </div>
   {showMapPicker && (
    <LocationPicker
    onPick={(lat, lng, address) => {
     setPickedLat(lat);
     setPickedLng(lng);
     updateField('location', address);
    }}
    initialLat={pickedLat ?? undefined}
    initialLng={pickedLng ?? undefined}
    initialAddress={form.location}
    />
   )}
   </div>

   {/* Parameters Grid */}
   <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${form.property_type === 'land' ? 'sm:grid-cols-2' : ''}`}>
   {[
    { key: 'rooms', label: 'ოთახი', icon: <BedDouble size={12} />, placeholder: '3' },
    { key: 'area_sqm', label: 'ფართობი', icon: <Ruler size={12} />, placeholder: '85 მ²' },
    { key: 'floor', label: 'სართული', icon: <Home size={12} />, placeholder: '4' },
    { key: 'total_floors', label: 'სულ სართ.', icon: <Home size={12} />, placeholder: '12' },
   ].filter(field => form.property_type !== 'land' || field.key === 'area_sqm').map(field => (
    <div key={field.key} className="space-y-1.5">
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1">
     {field.icon}{field.label}
    </label>
    <input
     type="text"
     value={(form as any)[field.key]}
     onChange={e => updateField(field.key, e.target.value)}
     placeholder={field.placeholder}
     className="w-full bg-white/70 border border-white/80 rounded-2xl py-3 px-3 text-[14px] text-gray-900 placeholder-gray-400 outline-none text-center focus:bg-white/90 focus:shadow-lg focus:shadow-stone-200/40 transition-all duration-300"
    />
    </div>
   ))}
   </div>

   {/* Price */}
   <div className="grid grid-cols-2 gap-3">
   <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1">
    <Banknote size={11} />ფასი
    </label>
    <input
    type="text"
    value={form.price}
    onChange={e => updateField('price', e.target.value)}
    placeholder="240000"
    className="w-full bg-white/70 border border-white/80 rounded-2xl py-3 px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:bg-white/90 focus:shadow-lg focus:shadow-stone-200/40 transition-all duration-300"
    />
   </div>
   <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">ვალუტა</label>
    <select
    value={form.currency}
    onChange={e => updateField('currency', e.target.value)}
    className="w-full bg-white/70 border border-white/80 rounded-2xl py-3 px-4 text-[15px] text-gray-900 outline-none focus:bg-white/90 focus:shadow-lg focus:shadow-stone-200/40 transition-all duration-300 appearance-none text-center"
    >
    <option value="GEL">₾ GEL</option>
    <option value="USD">$ USD</option>
    <option value="EUR">€ EUR</option>
    </select>
   </div>
   </div>

   {/* Description */}
   <div className="space-y-1.5">
   <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">აღწერილობა</label>
   <textarea
    rows={4}
    value={form.description}
    onChange={e => updateField('description', e.target.value)}
    placeholder="ლოკაცია, უპირატესობები, ეზო..."
    className="w-full bg-white/70 border border-white/80 rounded-2xl py-3 px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none resize-none focus:bg-white/90 focus:shadow-lg focus:shadow-stone-200/40 transition-all duration-300"
   />
   </div>

   {/* Phone */}
   <div className="space-y-1.5">
   <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1">
    <Phone size={11} />ტელეფონი
   </label>
   <div className="relative">
    <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
    type="text"
    value={form.phone}
    onChange={e => updateField('phone', e.target.value)}
    placeholder="599 12 34 56"
    className="w-full bg-white/70 border border-white/80 rounded-2xl py-3 pl-10 pr-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:bg-white/90 focus:shadow-lg focus:shadow-stone-200/40 transition-all duration-300"
    />
   </div>
   </div>

   {/* Inline error */}
   {submitError && (
   <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-700 text-[13px] font-medium">
    <span className="shrink-0 mt-0.5">⚠</span>{submitError}
   </div>
   )}

   {/* Submit */}
   <button
   type="submit"
   disabled={isSubmitting || pickedLat == null || pickedLng == null}
   className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-4 rounded-2xl text-[15px] shadow-xl shadow-stone-400/30 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
   style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
   >
   {isSubmitting ? (
    <>
    <Loader2 size={18} className="animate-spin" />
    იტვირთება...
    </>
   ) : (
    <>
    <Send size={16} />
    გამოქვეყნება
    </>
   )}
   </button>
  </form>
  </div>
 </div>
 );
}
