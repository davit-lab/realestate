import React, { useState, useEffect } from 'react';
import PhotoGallery from './PhotoGallery';
import ListingMap from './ListingMap';
import MortgageCalculator from './MortgageCalculator';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../contexts/AuthContext';
import { useViewTracker } from '../hooks/useViewTracker';
import { useRecentViews } from '../hooks/useRecentViews';
import { getAgentDiscountedPrice } from '../utils/pricing';
import {
 Phone,
 User,
 Heart,
 MessageCircle,
 MapPin,
 Maximize2,
 Send,
 Sparkles,
 ArrowLeft,
 Share2,
 CheckCircle,
 Eye,
} from 'lucide-react';
import { Listing } from '../types';

interface ListingDetailProps {
 listing: Listing;
 onBackClick: () => void;
 favorites: string[];
 onFavoriteToggle: (id: string, e: React.MouseEvent) => void;
 currency: 'GEL' | 'USD';
 exchangeRate: number;
 onAgentClick: (agentName: string) => void;
 onSendMessage: (listingId: string, messageText: string) => void;
}

export default function ListingDetail({
 listing,
 onBackClick,
 favorites,
 onFavoriteToggle,
 currency,
 exchangeRate,
 onAgentClick,
 onSendMessage,
}: ListingDetailProps) {
 const isFavorited = favorites.includes(listing.id);
 const [activeImage, setActiveImage] = useState(listing.image);
 const [phoneRevealed, setPhoneRevealed] = useState(false);
 const [selectedLanguage, setSelectedLanguage] = useState<'ka' | 'en' | 'ru'>('ka');
 const [commentText, setCommentText] = useState('');
 const [messageSentFeedback, setMessageSentFeedback] = useState(false);
 const [showToast, setShowToast] = useState(false);
 const [galleryOpen, setGalleryOpen] = useState(false);

 const { user, profile } = useAuth();
 const { comments, addComment } = useComments(listing.id);
 const [galleryIndex, setGalleryIndex] = useState(0);
 const { addRecentView } = useRecentViews();

 // Track unique views and add to recent views
 useViewTracker(listing.id);
 useEffect(() => {
 addRecentView(listing);
 }, [listing.id]);

 const openGallery = (idx: number) => { setGalleryIndex(idx); setGalleryOpen(true); };

 const handleShare = (e: React.MouseEvent) => {
 e.stopPropagation();
 navigator.clipboard.writeText(window.location.href)
  .then(() => {
  setShowToast(true);
  setTimeout(() => setShowToast(false), 3000);
  })
  .catch((err) => {
  console.error('Failed to copy text: ', err);
  });
 };

 // Convert prices
 const basePrice = currency === 'GEL' ? listing.priceLari : listing.priceUsd;
 const displayPrice = getAgentDiscountedPrice(basePrice, profile);
 const formattedPrice = displayPrice.toLocaleString('en-US', { maximumFractionDigits: 0 });
 const currencySymbol = currency === 'GEL' ? '₾' : '$';
 const isAgentDiscount = profile?.is_agent && displayPrice !== basePrice;

 // Area price estimation helper
 const areaPrice = Math.round(displayPrice / listing.area);
 const estimationText = `${currencySymbol} ${areaPrice.toLocaleString()}/მ²`;

 // Comments submit
 const handleCommentSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!commentText.trim()) return;

 const authorName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'მომხმარებელი';
 const authorAvatar = user?.user_metadata?.avatar_url;

 const newComment = await addComment(commentText, authorName, authorAvatar);
 if (newComment) {
  onSendMessage(listing.id, commentText);
  setMessageSentFeedback(true);
  setCommentText('');
  setTimeout(() => {
  setMessageSentFeedback(false);
  }, 3000);
 }
 };

 return (
 <div className="font-sans max-w-7xl mx-auto px-4 py-6" id="listing-detail-view-container">
  {/* Full screen photo gallery */}
  {galleryOpen && (
  <PhotoGallery
   images={listing.images}
   initialIndex={galleryIndex}
   title={listing.title}
   onClose={() => setGalleryOpen(false)}
  />
  )}
  {/* Actions Header */}
  <div className="flex flex-wrap items-center justify-between gap-3 mb-6" id="detail-actions-header">
  <button
   onClick={onBackClick}
   className="flex items-center gap-2 text-gray-500 hover:text-ss-primary transition-colors cursor-pointer group text-sm font-medium"
  >
   <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
   <span>უკან დაბრუნება</span>
  </button>

  <div className="flex items-center gap-2">
   <button
   onClick={handleShare}
   className="flex items-center gap-1.5 text-gray-600 bg-white border border-gray-200 hover:border-ss-primary font-medium px-3.5 py-2 rounded-xl transition-colors text-sm cursor-pointer"
   >
   <Share2 size={13} className="text-ss-primary" />
   <span>გაზიარება</span>
   </button>
   <button
   onClick={(e) => onFavoriteToggle(listing.id, e)}
   className={`flex items-center gap-1.5 font-medium px-3.5 py-2 rounded-xl transition-all text-sm cursor-pointer border ${
    isFavorited
    ? 'bg-rose-50 text-rose-600 border-rose-200'
    : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:text-rose-600'
   }`}
   >
   <Heart size={13} className={isFavorited ? 'fill-rose-500 text-rose-500' : 'text-gray-400'} />
   <span>{isFavorited ? 'რჩეულებშია' : 'შენახვა'}</span>
   </button>
  </div>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
  {/* LEFT COLUMN */}
  <div className="lg:col-span-8 space-y-6">
   {/* Gallery */}
   <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50" id="photo-gallery-grid">
   <div className="aspect-[16/9] relative overflow-hidden cursor-pointer group"
    onClick={() => openGallery(listing.images.indexOf(activeImage) >= 0 ? listing.images.indexOf(activeImage) : 0)}
   >
    <img
    src={activeImage}
    alt={listing.title}
    className="w-full h-full object-cover"
    referrerPolicy="no-referrer"
    />
    {/* Solid overlay badges */}
    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
    <Maximize2 size={11} />
    <span>{listing.images.length} ფოტო</span>
    </div>
    <div className="absolute bottom-3 right-3 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
    ყველა ფოტო
    </div>
   </div>
   <div className="grid grid-cols-5 gap-1.5 p-2">
    {listing.images.slice(0, 5).map((thumb, idx) => {
    const isActive = activeImage === thumb;
    const isLast = idx === 4 && listing.images.length > 5;
    return (
     <button
     key={idx}
     onClick={() => { setActiveImage(thumb); openGallery(idx); }}
     className={`aspect-[4/3] rounded-xl overflow-hidden transition-all duration-200 relative ${
      isActive ? 'ring-2 ring-ss-primary ring-offset-1' : 'border-2 border-gray-200 hover:border-gray-400'
     }`}
     >
     <img src={thumb} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
     {isLast && (
      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center rounded-xl">
      <span className="text-white text-xs font-bold">+{listing.images.length - 4}</span>
      </div>
     )}
     </button>
    );
    })}
   </div>
   </div>

   {/* Description */}
   <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" id="descriptions-container-block">
   <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
    <h4 className="font-semibold text-sm text-gray-900">განცხადების აღწერა</h4>
    <div className="flex items-center gap-1.5" id="language-flags-picker">
    {[{lang:'ka',src:'https://flagcdn.com/w40/ge.png',alt:'GE'},{lang:'ru',src:'https://flagcdn.com/w40/ru.png',alt:'RU'},{lang:'en',src:'https://flagcdn.com/w40/gb.png',alt:'GB'}].map(f => (
     <button key={f.lang} onClick={() => setSelectedLanguage(f.lang as 'ka'|'en'|'ru')}
     className={`w-7 h-5 rounded-md overflow-hidden transition-all cursor-pointer ${
      selectedLanguage === f.lang ? 'ring-2 ring-ss-primary ring-offset-1' : 'grayscale'
     }`}>
     <img src={f.src} alt={f.alt} className="w-full h-full object-cover" />
     </button>
    ))}
    </div>
   </div>
   <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
    {selectedLanguage === 'ka' ? listing.descriptions.ka : selectedLanguage === 'en' ? listing.descriptions.en : listing.descriptions.ru}
   </p>
   </div>

   {/* Specs */}
   <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" id="specs-container-block">
   <h4 className="font-semibold text-sm text-gray-900 mb-4 border-b border-gray-100 pb-3">ძირითადი პარამეტრები</h4>
   <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
    {[
    { label: 'ფართი', value: `${listing.area} მ²` },
    { label: 'ოთახები', value: listing.rooms },
    { label: 'საძინებლები', value: listing.beds },
    { label: 'მდგომარეობა', value: listing.condition },
    { label: 'სტატუსი', value: listing.status },
    { label: 'ქალაქი', value: listing.city },
    { label: 'უბანი', value: listing.district },
    { label: 'ტიპი', value: listing.type === 'sale' ? 'იყიდება' : listing.type === 'rent' ? 'ქირავდება' : listing.type },
    ].filter(spec => listing.property_type !== 'land' || spec.label === 'ფართი' || spec.label === 'ქალაქი' || spec.label === 'უბანი' || spec.label === 'ტიპი').map((spec) => (
    <div key={spec.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
     <div className="text-xs text-gray-400 mb-1">{spec.label}</div>
     <div className="text-sm font-semibold text-gray-900">{spec.value}</div>
    </div>
    ))}
   </div>
   </div>

   {/* Detailed fields — shown for apartment/house/cottage */}
   {listing.property_type && ['apartment', 'house', 'cottage'].includes(listing.property_type) && (
    (listing.kitchen_area_sqm || listing.floor_type || listing.balconies != null || listing.bathrooms != null || listing.building_type || listing.building_condition || (listing.additional_info && listing.additional_info.length > 0)) ? (
   <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
    <h4 className="font-semibold text-sm text-gray-900 mb-4 border-b border-gray-100 pb-3">დეტალური ინფორმაცია</h4>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
     {listing.kitchen_area_sqm != null && (
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
       <div className="text-xs text-gray-400 mb-1">სამზარეულოს ფართი</div>
       <div className="text-sm font-semibold text-gray-900">{listing.kitchen_area_sqm} მ²</div>
      </div>
     )}
     {listing.floor_type && (
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
       <div className="text-xs text-gray-400 mb-1">სართულის ტიპი</div>
       <div className="text-sm font-semibold text-gray-900">{listing.floor_type}</div>
      </div>
     )}
     {listing.balconies != null && (
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
       <div className="text-xs text-gray-400 mb-1">აივანი / ლოჯია</div>
       <div className="text-sm font-semibold text-gray-900">{listing.balconies === 0 ? 'არ აქვს' : listing.balconies}</div>
      </div>
     )}
     {listing.bathrooms != null && (
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
       <div className="text-xs text-gray-400 mb-1">სველი წერტილი</div>
       <div className="text-sm font-semibold text-gray-900">{listing.bathrooms === 0 ? 'არ აქვს' : listing.bathrooms}</div>
      </div>
     )}
     {listing.building_type && (
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
       <div className="text-xs text-gray-400 mb-1">პროექტი</div>
       <div className="text-sm font-semibold text-gray-900">{listing.building_type}</div>
      </div>
     )}
     {listing.building_condition && (
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
       <div className="text-xs text-gray-400 mb-1">მდგომარეობა</div>
       <div className="text-sm font-semibold text-gray-900">{listing.building_condition}</div>
      </div>
     )}
    </div>
    {listing.additional_info && listing.additional_info.length > 0 && (
     <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs text-gray-400 mb-2">სხვა ინფორმაცია</p>
      <div className="flex flex-wrap gap-1.5">
       {listing.additional_info.map((tag) => (
        <span key={tag} className="bg-violet-50 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-violet-100">{tag}</span>
       ))}
      </div>
     </div>
    )}
   </div>
   ) : null
   )}

   <ListingMap listing={listing} currency={currency} />

   <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" id="comment-box-block">
   <div className="flex items-center gap-2 mb-4">
    <MessageCircle size={15} className="text-ss-primary" />
    <h4 className="font-semibold text-sm text-gray-900">შეტყობინება / კომენტარი</h4>
   </div>
   <form onSubmit={handleCommentSubmit} className="space-y-3">
    <textarea
    value={commentText}
    onChange={(e) => setCommentText(e.target.value)}
    placeholder="ჩაწერეთ შეტყობინება..."
    rows={4}
    className="w-full bg-white text-gray-900 rounded-xl p-3.5 text-sm border border-gray-200 focus:border-ss-primary focus:outline-none transition-all resize-none"
    />
    <div className="flex items-center justify-between">
    {messageSentFeedback ? (
     <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm">
     <CheckCircle size={14} />
     <span>გაგზავნა!</span>
     </div>
    ) : (
     <span className="text-gray-400 text-xs">* პირად შეტყობინებებში</span>
    )}
    <button type="submit"
     className="bg-ss-primary hover:bg-ss-primary-dark text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer">
     <Send size={13} />
     <span>გაგზავნა</span>
    </button>
    </div>
   </form>
   {comments.length > 0 && (
    <div className="mt-5 border-t border-gray-100 pt-4">
    <h5 className="text-xs font-semibold text-gray-500 mb-3">კომენტარები ({comments.length})</h5>
    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
     {comments.map((comm) => (
     <div key={comm.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex gap-3">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
      {comm.avatar ? (
       <img src={comm.avatar} alt={comm.author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      ) : (
       <div className="w-full h-full flex items-center justify-center text-ss-primary font-semibold text-xs">{comm.author[0]}</div>
      )}
      </div>
      <div className="flex-1">
      <div className="flex items-center justify-between font-semibold text-gray-900 text-sm mb-0.5">
       <span>{comm.author}</span>
       <span className="text-xs text-gray-400 font-normal">{comm.date}</span>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{comm.text}</p>
      </div>
     </div>
     ))}
    </div>
    </div>
   )}
   </div>
  </div>

  {/* RIGHT COLUMN */}
  <div className="lg:col-span-4 space-y-4">
   <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm" id="price-card-box">
   {/* Clean price header */}
   <div className="p-5 border-b border-gray-100">
    <p className="text-[12px] text-gray-400 font-medium mb-2 line-clamp-1">{listing.title}</p>
    <div className="flex items-baseline gap-2 mb-3">
     <span className="text-[34px] font-black leading-none tracking-tight text-gray-900">{formattedPrice}</span>
     <span className="text-xl font-bold text-gray-500">{currencySymbol}</span>
    </div>
    <div className="flex items-center gap-2">
     <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-lg">
      {estimationText}
     </span>
     <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-lg">
      {listing.area} მ²
     </span>
    </div>
   </div>
   <div className="p-5">
    <div className="flex items-center gap-2 flex-wrap mb-3">
     <span className="bg-purple-50 text-ss-primary text-xs font-semibold px-2.5 py-1 rounded-xl border border-purple-100">
     {listing.type === 'sale' ? 'იყიდება' : listing.type === 'rent' ? 'ქირავდება' : listing.type === 'mortgage' ? 'იპოთეკა' : 'გირაო'}
     </span>
     {listing.vipStatus !== 'standard' && (
      <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
       listing.vipStatus === 'premium' ? 'bg-amber-600 text-white' :
       listing.vipStatus === 'super' ? 'bg-emerald-600 text-white' :
       'bg-slate-500 text-white'
      }`}>
       {listing.vipStatus === 'premium' ? 'PREMIUM' : listing.vipStatus === 'super' ? 'SUPER' : 'BASIC'}
      </span>
     )}
     <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1 border border-emerald-100">
     <Sparkles size={10} />
     {listing.priceLevel === 'cheap' || listing.priceLevel === 'low' ? 'კარგი ფასი' : listing.priceLevel === 'average' ? 'საბაზრო ფასი' : 'პრემიუმ ფასი'}
     </span>
    </div>
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
     <Eye size={12} />
     <span>{listing.viewCount || 0} ნახვა</span>
    </div>
   </div>
   </div>

   <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm" id="phone-revealer-card">
   <p className="text-xs text-gray-500 mb-3">გამყიდველთან დასაკავშირებლად:</p>
   <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100 mb-3">
    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
    <Phone size={15} className="text-ss-primary" />
    </div>
    <span className="text-lg font-black text-gray-900 font-mono tracking-wide">
    {phoneRevealed ? listing.author.phone : listing.author.phone.slice(0, 6) + ' ···'}
    </span>
   </div>
   <button onClick={() => setPhoneRevealed(!phoneRevealed)}
    className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
    phoneRevealed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-ss-primary hover:bg-ss-primary-dark text-white shadow-sm'
    }`}>
    {phoneRevealed ? <CheckCircle size={14} /> : <Phone size={14} />}
    <span>{phoneRevealed ? 'ნომერი გამოჩნდა' : 'ნომრის ჩვენება'}</span>
   </button>
   </div>

   <MortgageCalculator
   propertyPrice={currency === 'GEL' ? listing.priceLari : listing.priceUsd}
   currency={currency}
   />

   <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm" id="agent-profile-card">
   <div className="flex items-center gap-3 mb-4">
    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 ring-2 ring-gray-200 shrink-0">
    <img src={listing.author.avatar} alt={listing.author.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
    </div>
    <div>
    <h5 className="font-semibold text-gray-900 text-sm">{listing.author.name}</h5>
    <span className="inline-flex items-center gap-1 bg-purple-50 text-ss-primary text-xs font-medium px-2 py-0.5 rounded-xl mt-0.5">
     <User size={10} />აგენტი
    </span>
    </div>
   </div>
   <button onClick={() => onAgentClick(listing.author.name)}
    className="w-full border border-gray-200 hover:border-ss-primary text-gray-600 hover:text-ss-primary hover:bg-purple-50 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer">
    ყველა განცხადება ({listing.author.listingCount}+)
   </button>
   </div>
  </div>
  </div>

  {showToast && (
  <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50 text-sm font-medium">
   <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
   <span>ბმული დაკოპირდა!</span>
  </div>
  )}

 </div>
 );
}
