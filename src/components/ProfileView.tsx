
import React, { useState, useRef, useEffect } from 'react';
import { Wallet, PlusCircle, CreditCard, Layers, ChevronRight, ShieldCheck, User, Plus, TrendingUp, CheckCircle, Zap, Star, Crown, MapPin, ArrowRight, Check, Camera, Loader2, Save, LayoutDashboard, Eye, BadgeCheck, AlertCircle, Clock, FileText, Trash2, Settings, Bell, Phone, Mail, BarChart3, Upload, CalendarDays, Ticket, XCircle } from 'lucide-react';
import { PaymentCard, Listing, PaymentCardDB, ProfileVerification, DocType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useViewStats } from '../hooks/useViewStats';
import { useVerification } from '../hooks/useVerification';
import { usePaymentCards } from '../hooks/usePaymentCards';
import { useUserPackages } from '../hooks/useUserPackages';
import { useBookings } from '../hooks/useBookings';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Props { userProfile: any; setUserProfile: any; paymentCards: PaymentCard[]; setPaymentCards: any; myListings: Listing[]; onAddListingClick: () => void; currency: 'GEL' | 'USD'; }

type TabId = 'dashboard' | 'my_listings' | 'bookings' | 'boost' | 'wallet' | 'verification' | 'settings';

export default function ProfileView({ userProfile, setUserProfile, myListings, onAddListingClick, currency }: Props) {
 const { user, profile, refreshProfile } = useAuth();
 const { updateProfile, uploadAvatar, saving, uploadingAvatar } = useProfile(user?.id);
 const { stats } = useViewStats(user?.id);
 const { getVerification, uploadDoc } = useVerification(user?.id);
 const { fetchCards, addCard, deleteCard } = usePaymentCards(user?.id);
 const { packages: userPkgs, hasActivePackage, activePackage } = useUserPackages(user?.id);
 const { bookings, loading: bookingsLoading, cancelBooking } = useBookings(user?.id);

 const [activeTab, setActiveTab] = useState<TabId>('dashboard');
 const [editName, setEditName] = useState(profile?.name || userProfile.name || '');
 const [editPhone, setEditPhone] = useState(profile?.phone || '');
 const [editBio, setEditBio] = useState(profile?.bio || '');
 const [pfFb, setPfFb] = useState<string | null>(null);
 const avatarRef = useRef<HTMLInputElement>(null);

 const [verif, setVerif] = useState<ProfileVerification | null>(null);
 const [docType, setDocType] = useState<DocType>('id_card');
 const [frontFile, setFrontFile] = useState<File | null>(null);
 const [backFile, setBackFile] = useState<File | null>(null);
 const [vFb, setVFb] = useState<string | null>(null);

 const [dbCards, setDbCards] = useState<PaymentCardDB[]>([]);
 const [cNum, setCNum] = useState('');
 const [cExp, setCExp] = useState('');
 const [cCvc, setCCvc] = useState('');
 const [cHold, setCHold] = useState('');
 const [cFb, setCFb] = useState<string | null>(null);

 const [refAmt, setRefAmt] = useState('50');
 const [rFb, setRFb] = useState<string | null>(null);
 const [actBoost, setActBoost] = useState<string | null>(null);
 const [bFb, setBFb] = useState<string | null>(null);
 const [selectedBoostListingId, setSelectedBoostListingId] = useState<string | null>(null);

 const sym = currency === 'GEL' ? '₾' : '$';

 useEffect(() => { if (user?.id) { getVerification().then(({data}) => setVerif(data)); fetchCards().then(({data}) => setDbCards(data || [])); } }, [user?.id]);

 const savePf = async () => { const {error} = await updateProfile({name: editName, phone: editPhone, bio: editBio}); if (error) setPfFb('შეცდომა: '+error); else { setUserProfile((p:any)=>({...p, name: editName})); await refreshProfile(); setPfFb('პროფილი განახლდა!'); } setTimeout(()=>setPfFb(null),3000); };
 const pickAvatar = async (e: any) => { const f = e.target.files?.[0]; if (!f) return; const {url, error} = await uploadAvatar(f); if (error) setPfFb('ავატარის შეცდომა: '+error); else if (url) { setUserProfile((p:any)=>({...p, avatar: url})); await refreshProfile(); setPfFb('ავატარი განახლდა!'); } setTimeout(()=>setPfFb(null),3000); };

 const fmtCard = (e: any) => { const r = e.target.value.replace(/\D/g,''); const f = r.match(/.{1,4}/g)?.join(' ') || ''; if (f.length<=19) setCNum(f); };
 const fmtExp = (e: any) => { const r = e.target.value.replace(/\D/g,''); let f=r; if (r.length>2) f = r.slice(0,2)+'/'+r.slice(2,4); if (f.length<=5) setCExp(f); };
 const fmtCvc = (e: any) => { const r = e.target.value.replace(/\D/g,''); if (r.length<=3) setCCvc(r); };

 const addDbCard = async (e: any) => { e.preventDefault(); if (cNum.replace(/\s/g,'').length<13||cExp.length<5||cCvc.length<3) { setCFb('შეავსეთ ბარათის მონაცემები'); return; } const brand = cNum.startsWith('4')?'visa':cNum.startsWith('5')?'mastercard':'amex'; const {data,error} = await addCard({last4:cNum.slice(-4),brand,expiryMonth:cExp.split('/')[0],expiryYear:cExp.split('/')[1],cardholderName:cHold||'Cardholder'}); if (error) setCFb('შეცდომა: '+error); else { setCNum('');setCExp('');setCCvc('');setCHold(''); setCFb('ბარათი დაემატა!'); if(data) setDbCards(p=>[data,...p]); } setTimeout(()=>setCFb(null),3000); };
 const delCard = async (id: string) => { const {error} = await deleteCard(id); if (!error) setDbCards(p=>p.filter(c=>c.id!==id)); };
 const refill = (e: any) => { e.preventDefault(); const n=parseFloat(refAmt); if (isNaN(n)||n<=0) { setRFb('სწორი თანხა'); return; } setUserProfile((p:any)=>({...p,balance:p.balance+n})); setRFb(); setTimeout(()=>setRFb(null),3500); };
 const submitVerif = async () => { if (!frontFile) { setVFb('ატვირთეთ ფოტო'); return; } setVFb(null); const {data,error} = await uploadDoc(docType,frontFile,backFile||undefined); if (error) setVFb('შეცდომა: '+error); else { setVerif(data); setVFb('დოკუმენტი აიტვირთა!'); setFrontFile(null); setBackFile(null); } setTimeout(()=>setVFb(null),5000); };

 const nav: {id:TabId;label:string;icon:any;badge?:number}[] = [
 {id:'dashboard',label:'დაფა',icon:<LayoutDashboard size={15}/>},
 {id:'my_listings',label:'ჩემი განცხადებები',icon:<Layers size={15}/>},
 {id:'bookings',label:'ჯავშნები',icon:<Ticket size={15}/>, badge: bookings.filter(b => b.status === 'pending').length},
 {id:'boost',label:'გაბუსთება',icon:<Zap size={15}/>},
 {id:'wallet',label:'საფულე',icon:<Wallet size={15}/>},
 {id:'verification',label:'ვერიფიკაცია',icon:<BadgeCheck size={15}/>},
 {id:'settings',label:'პროფილი',icon:<Settings size={15}/>},
 ];

 const boosts = [
 {id:'premium',name:'პრემიუმი',price:8,badge:'PREMIUM',color:'bg-amber-600',text:'text-white',border:'border-amber-500',features:['1 განცხადების დადება','საძიებო შედეგების სათავეში','PREMIUM ბეიჯი']},
 {id:'super',name:'სუპერი',price:3,badge:'SUPER',color:'bg-emerald-600',text:'text-white',border:'border-emerald-500',features:['1 განცხადების დადება','გამოყოფილი პოზიცია','SUPER ბეიჯი']},
 {id:'basic',name:'ბეისიქი',price:1,badge:'BASIC',color:'bg-slate-600',text:'text-white',border:'border-slate-500',features:['1 განცხადების დადება','სტანდარტული ხილვადობა','BASIC ბეიჯი']},
 ];

 return (
 <div className="min-h-full w-full font-sans bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
   <div className="lg:col-span-3 flex flex-col gap-4">
   <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
    <div className="flex flex-col items-center text-center">
    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 mb-3">
     <img src={profile?.avatar_url||userProfile.avatar||''} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
     {profile?.is_verified && <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5"><BadgeCheck size={14}/></div>}
    </div>
    <h3 className="font-bold text-gray-900 text-[15px]">{profile?.name||userProfile.name||'უცნობი'}</h3>
    <p className="text-gray-400 text-[11px] mb-1">{user?.email||''}</p>
    {profile?.is_verified ? <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-semibold border border-emerald-100">ვერიფიცირებული</span> : profile?.verification_status==='pending' ? <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-semibold border border-amber-100">მიმდინარეობს</span> : null}
    </div>
   </div>
   <div className="grid grid-cols-2 gap-2">
    <div className="bg-white rounded-xl border border-gray-200 p-3 text-center"><Eye size={16} className="mx-auto mb-1 text-gray-400"/><p className="text-[18px] font-black">{stats.totalProfileViews}</p><p className="text-[10px] text-gray-500">პროფილის ნახვა</p></div>
    <div className="bg-white rounded-xl border border-gray-200 p-3 text-center"><BarChart3 size={16} className="mx-auto mb-1 text-gray-400"/><p className="text-[18px] font-black">{stats.totalListingViews}</p><p className="text-[10px] text-gray-500">განცხადების ნახვა</p></div>
   </div>
   <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1.5">
    {nav.map(sub=>{const a=activeTab===sub.id; return (
    <button key={sub.id} onClick={()=>setActiveTab(sub.id)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all cursor-pointer text-[12px] font-medium ${a?'bg-gray-900 text-white shadow-sm':'text-gray-600 hover:bg-gray-50'}`}>
     <div className="flex items-center gap-2">{sub.icon}<span>{sub.label}</span>{sub.badge ? <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{sub.badge}</span> : null}</div>
     <ChevronRight size={13} className={a?'text-white/50':'text-gray-300'} />
    </button>
    );})}
   </div>
   </div>

   <div className="lg:col-span-9 flex flex-col gap-5">
   {activeTab==='dashboard' && (
    <div className="space-y-5">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
     {[{l:'დღევანდელი ნახვები',v:stats.todayProfileViews+stats.todayListingViews,i:<Eye size={16}/>},{l:'განცხადებები',v:myListings.length,i:<Layers size={16}/>},{l:'ბალანსი',v:userProfile.balance.toFixed(2)+' ₾',i:<Wallet size={16}/>},{l:'შეტყობინებები',v:0,i:<Bell size={16}/>}].map((s,i)=>(
     <div key={i} className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-2 text-gray-400 mb-2">{s.i}<span className="text-[11px] font-medium">{s.l}</span></div><p className="text-[20px] font-black">{s.v}</p></div>
     ))}
    </div>

    {hasActivePackage && activePackage && (
     <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-center justify-between">
     <div className="flex items-center gap-3">
      <Crown size={20} className="text-violet-600" />
      <div>
      <p className="font-bold text-[13px] text-violet-800">{activePackage.package_type.toUpperCase()} პაკეტი</p>
      <p className="text-[11px] text-violet-600">განცხადებები: {activePackage.listings_remaining}/{activePackage.total_listings} • ვადა: {new Date(activePackage.expires_at).toLocaleDateString('ka-GE')}</p>
      </div>
     </div>
     <span className="text-[10px] bg-violet-200 text-violet-800 px-2 py-1 rounded-full font-bold">აქტიური</span>
     </div>
    )}
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
     <h4 className="font-bold text-[14px] mb-4">ბოლო მნახველები</h4>
     {stats.recentViewers.length===0 ? <p className="text-[12px] text-gray-400">ჯერ არავინ გინახავთ</p> : (
     <div className="flex flex-wrap gap-3">
      {stats.recentViewers.slice(0,10).map((v,i)=>(
      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
       <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">{v.viewer_avatar?<img src={v.viewer_avatar} className="w-full h-full object-cover"/>:<User size={12} className="m-1 text-gray-400"/>}</div>
       <span className="text-[11px] font-medium">{v.viewer_name||'უცნობი'}</span>
       <span className="text-[10px] text-gray-400">{new Date(v.viewed_at).toLocaleDateString('ka-GE')}</span>
      </div>
      ))}
     </div>
     )}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
     <button onClick={onAddListingClick} className="bg-gray-900 text-white rounded-xl p-4 text-left hover:bg-gray-800 cursor-pointer"><Plus size={20} className="mb-2"/><p className="font-bold text-[13px]">განცხადების დამატება</p><p className="text-[11px] text-gray-300 mt-0.5">ახალი უძრავი ქონება</p></button>
     <button onClick={()=>setActiveTab('wallet')} className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-gray-400 cursor-pointer"><Wallet size={20} className="mb-2 text-gray-400"/><p className="font-bold text-[13px]">ბალანსის შევსება</p></button>
     <button onClick={()=>setActiveTab('boost')} className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-gray-400 cursor-pointer"><Zap size={20} className="mb-2 text-gray-400"/><p className="font-bold text-[13px]">განცხადების ბუსთი</p></button>
    </div>
    </div>
   )}

   {activeTab==='my_listings' && (
    <div className="space-y-4">
    <div className="flex items-center justify-between">
     <div>
     <h4 className="font-bold text-[16px] text-gray-900">ჩემი განცხადებები</h4>
     <p className="text-gray-500 text-[12px] mt-0.5">{myListings.length} განცხადება პორტალზე</p>
     </div>
     <button onClick={onAddListingClick} className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-medium text-[12px] flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm">
     <Plus size={14}/><span>დამატება</span>
     </button>
    </div>
    {myListings.length===0 ? (
     <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
      <Layers size={28} className="text-gray-300" />
     </div>
     <p className="font-bold text-[14px] text-gray-700 mb-1">განცხადება არ არის</p>
     <p className="text-gray-400 text-[12px] mb-4">თქვენი უძრავი ქონება გამოჩნდება აქ</p>
     <button onClick={onAddListingClick} className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium text-[12px] cursor-pointer transition-colors">განცხადების დამატება</button>
     </div>
    ) : (
     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
     {myListings.map(l => {
      const p = (currency==='GEL' ? l.priceLari : l.priceUsd).toLocaleString();
      return (
      <div key={l.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all group">
       <div className="relative h-40 bg-gray-100">
       <img src={l.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={l.title} />
       {l.vipStatus !== 'standard' && (
        <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full text-white shadow-sm ${
         l.vipStatus==='premium'?'bg-amber-600':l.vipStatus==='super'?'bg-emerald-600':'bg-slate-500'
        }`}>
        {l.vipStatus.toUpperCase()}
        </span>
       )}
       <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded-lg">{l.type==='sale'?'იყიდება':l.type==='rent'?'ქირავდება':l.type==='mortgage'?'იპოთეკა':l.type==='pledge'?'გირაო':'ქირავდება დღიურად'}</span>
       </div>
       <div className="p-4">
       <h5 className="font-bold text-[13px] text-gray-900 line-clamp-1 mb-1">{l.title}</h5>
       <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2">
        <MapPin size={11} />
        <span>{l.district}, {l.city}</span>
       </div>
       <div className="flex items-center justify-between">
        <span className="text-[15px] font-black text-gray-900">{p} {sym}</span>
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
        <Eye size={12} />
        <span>{l.viewCount||0}</span>
        </div>
       </div>
       <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500 border-t border-gray-100 pt-3">
        <span>{l.rooms} ოთახი</span>
        <span>{l.area} მ²</span>
       </div>
       </div>
      </div>
      );
     })}
     </div>
    )}
    </div>
   )}

   {activeTab==='bookings' && (
    <div className="space-y-4">
    <div className="flex items-center justify-between">
     <div>
     <h4 className="font-bold text-[16px] text-gray-900">ჯავშნები</h4>
     <p className="text-gray-500 text-[12px] mt-0.5">{bookings.length} ჯავშანი</p>
     </div>
    </div>
    {bookingsLoading ? (
     <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
     <Loader2 size={28} className="animate-spin mx-auto text-gray-300 mb-3" />
     <p className="text-gray-400 text-[12px]">იტვირთება...</p>
     </div>
    ) : bookings.length === 0 ? (
     <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
      <Ticket size={28} className="text-gray-300" />
     </div>
     <p className="font-bold text-[14px] text-gray-700 mb-1">ჯავშანი არ არის</p>
     <p className="text-gray-400 text-[12px] mb-4">სასტუმროების და ტურიზმის დაჯავშნები გამოჩნდება აქ</p>
     </div>
    ) : (
     <div className="space-y-3">
     {bookings.map(b => {
      const statusColors = {
      pending: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'მიმდინარე' },
      confirmed: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: 'დადასტურებული' },
      cancelled: { bg: 'bg-red-50',  border: 'border-red-200',  text: 'text-red-700',  label: 'გაუქმებული' },
      };
      const sc = statusColors[b.status] || statusColors.pending;
      return (
      <div key={b.id} className={`bg-white border rounded-2xl p-4 shadow-sm flex items-start gap-4 ${sc.border}`}>
       <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
       {b.item_image ? <img src={b.item_image} className="w-full h-full object-cover" alt={b.item_name} /> : <Ticket size={20} className="m-5 text-gray-300" />}
       </div>
       <div className="flex-1 min-w-0">
       <div className="flex items-center justify-between mb-1">
        <h5 className="font-bold text-[13px] text-gray-900 line-clamp-1">{b.item_name}</h5>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text} border ${sc.border}`}>{sc.label}</span>
       </div>
       <p className="text-[11px] text-gray-500 mb-1">👤 {b.guest_name}</p>
       {b.check_in && (
        <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1">
        <CalendarDays size={11} />
        <span>{b.check_in}{b.check_out ? ` → ${b.check_out}` : ''}</span>
        </div>
       )}
       {b.guests > 1 && <p className="text-[11px] text-gray-500">{b.guests} სტუმარი</p>}
       </div>
       {b.status === 'pending' && (
       <button
        onClick={async () => { const { error } = await cancelBooking(b.id); if (error) alert('შეცდომა: ' + error); }}
        className="shrink-0 text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
        title="გაუქმება"
       >
        <XCircle size={18} />
       </button>
       )}
      </div>
      );
     })}
     </div>
    )}
    </div>
   )}

   {activeTab==='boost' && (
    <div className="space-y-4">
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
     <div className="mb-5">
      <h4 className="font-bold text-[15px]">განცხადების ბუსთი</h4>
      <p className="text-[12px] text-gray-500 mt-1">{selectedBoostListingId ? 'აირჩიეთ პაკეტი განცხადების გასაუმჯობესებლად.' : 'აირჩიეთ თქვენი განცხადება, რომლის გაუმჯობესებაც გინდათ.'}</p>
     </div>
     {bFb && <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-[12px] font-semibold"><CheckCircle size={15}/>{bFb}</div>}

     {!selectedBoostListingId ? (
      myListings.length === 0 ? (
       <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">
        <Layers size={28} className="mx-auto mb-3 text-gray-300" />
        <p className="font-bold text-[14px] text-gray-700 mb-1">განცხადება არ არის</p>
        <p className="text-gray-400 text-[12px] mb-4">ჯერ დაამატეთ განცხადება ბუსთისთვის</p>
        <button onClick={onAddListingClick} className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium text-[12px] cursor-pointer transition-colors">განცხადების დამატება</button>
       </div>
      ) : (
       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {myListings.map(l => {
         const p = (currency==='GEL' ? l.priceLari : l.priceUsd).toLocaleString();
         return (
          <button key={l.id} onClick={()=>setSelectedBoostListingId(l.id)} className="text-left bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-900 hover:shadow-md transition-all cursor-pointer group">
           <div className="relative h-32 bg-gray-100">
            <img src={l.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={l.title} />
            {l.vipStatus !== 'standard' && (
             <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm ${l.vipStatus==='premium'?'bg-amber-600':l.vipStatus==='super'?'bg-emerald-600':'bg-slate-500'}`}>
              {l.vipStatus.toUpperCase()}
             </span>
            )}
           </div>
           <div className="p-3">
            <h5 className="font-bold text-[13px] text-gray-900 line-clamp-1 mb-1">{l.title}</h5>
            <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2">
             <MapPin size={11} />
             <span>{l.district}, {l.city}</span>
            </div>
            <div className="flex items-center justify-between">
             <span className="text-[14px] font-black text-gray-900">{p} {sym}</span>
             <span className="text-[11px] text-gray-400">აირჩიე</span>
            </div>
           </div>
          </button>
         );
        })}
       </div>
      )
     ) : (
      <div className="space-y-4">
       {(() => {
        const sel = myListings.find(l => l.id === selectedBoostListingId);
        if (!sel) return null;
        return (
         <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
          <img src={sel.image} className="w-12 h-12 rounded-lg object-cover border border-gray-200" referrerPolicy="no-referrer" alt={sel.title} />
          <div className="flex-1 min-w-0">
           <p className="font-bold text-[13px] text-gray-900 truncate">{sel.title}</p>
           <p className="text-[11px] text-gray-500">{sel.district}, {sel.city}</p>
          </div>
          <button onClick={()=>{setSelectedBoostListingId(null); setActBoost(null); setBFb(null);}} className="text-gray-400 hover:text-gray-700 cursor-pointer text-[11px] font-medium shrink-0">შეცვლა</button>
         </div>
        );
       })()}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {boosts.map(plan => {
         const sel = myListings.find(l => l.id === selectedBoostListingId);
         const already = sel?.vipStatus === plan.id;
         const ok = userProfile.balance >= plan.price;
         return (
          <div key={plan.id} className={`relative rounded-xl border-2 p-5 flex flex-col transition-all ${already ? plan.border + ' shadow-lg' : 'border-gray-200 hover:border-gray-400'}`}>
           {plan.id==='premium' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow">პოპულარული</div>}
           <div className={`w-10 h-10 rounded-xl ${plan.color} flex items-center justify-center text-white mb-3 text-[9px] font-black`}>{plan.badge}</div>
           <div className="mb-1"><span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{plan.name}</span></div>
           <div className="flex items-baseline gap-1 mb-4"><span className="text-[28px] font-black leading-none">{plan.price}</span><span className="font-bold text-sm">₾</span><span className="text-gray-500 text-[11px]">/განცხადება</span></div>
           <ul className="space-y-2 mb-5 flex-1">{plan.features.map((f,i)=>(<li key={i} className="flex items-start gap-2 text-[11px] font-medium"><Check size={12} className="mt-0.5 shrink-0"/>{f}</li>))}</ul>
           <button
            onClick={async () => {
             if (!ok) { setBFb(`ბალანსი არ არის. საჭიროა ${plan.price} ₾`); setTimeout(()=>setBFb(null),3500); return; }
             if (!selectedBoostListingId) return;
             setActBoost(plan.id);
             setBFb('იტვირთება...');
             try {
              // Update localStorage listings (fallback / local-only listings)
              try {
               const raw = localStorage.getItem('adjarahome_listings');
               if (raw) {
                const arr = JSON.parse(raw) as any[];
                const next = arr.map((l: any) => l.id === selectedBoostListingId ? { ...l, vipStatus: plan.id } : l);
                localStorage.setItem('adjarahome_listings', JSON.stringify(next));
               }
              } catch (e) { /* ignore localStorage errors */ }
              // Update Supabase
              if (isSupabaseConfigured) {
               await supabase.from('properties').update({ vip_status: plan.id }).eq('id', selectedBoostListingId);
               if (user?.id) {
                const { data: prof } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
                const newBal = Math.max(0, (prof?.balance ?? userProfile.balance) - plan.price);
                await supabase.from('profiles').update({ balance: newBal }).eq('id', user.id);
               }
               window.dispatchEvent(new CustomEvent('adjarahome:refresh-listings'));
              }
              setUserProfile((p:any)=>({...p, balance: Math.max(0, p.balance - plan.price)}));
              setBFb(`${plan.name} გააქტიურდა!`);
              setTimeout(()=>setBFb(null),4000);
             } catch (e) {
              setBFb('შეცდომა დამუშავებისას');
              setTimeout(()=>setBFb(null),4000);
             }
            }}
            disabled={already}
            className={`w-full py-2.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${already ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default' : ok ? plan.color + ' ' + plan.text + ' hover:opacity-90' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
           >
            {already ? <><CheckCircle size={14}/> გააქტიურებულია</> : <><ArrowRight size={14}/> {plan.price} ₾</>}
           </button>
          </div>
         );
        })}
       </div>
      </div>
     )}
    </div>
    <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 text-[11px] text-gray-500 flex items-start gap-3"><ShieldCheck size={16} className="shrink-0 mt-0.5"/><span>პაკეტი ერთ განცხადებაზე მოქმედებს.</span></div>
    </div>
   )}

   {activeTab==='wallet' && (
    <div className="space-y-5">
    <div className="bg-gray-900 rounded-2xl p-6 text-white">
     <p className="text-gray-400 text-[12px] font-medium mb-1">მიმდინარე ბალანსი</p>
     <p className="text-[36px] font-black tracking-tight">{userProfile.balance.toLocaleString('en-US',{minimumFractionDigits:2})} ₾</p>
     <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-[12px] font-bold mt-4 cursor-pointer">შევსება</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
     <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
     <h4 className="font-bold text-[14px] mb-4">ბალანსის შევსება</h4>
     <form onSubmit={refill} className="space-y-4">
      <div><label className="block text-[11px] font-semibold text-gray-500 mb-1.5">თანხა (₾)</label><input type="number" min="5" max="5000" value={refAmt} onChange={e=>setRefAmt(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 font-semibold text-[13px] focus:outline-none focus:border-gray-900"/></div>
      {rFb && <p className="text-[12px] font-semibold p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">{rFb}</p>}
      <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer"><Wallet size={14}/><span>შევსება</span></button>
     </form>
     </div>
     <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
     <h4 className="font-bold text-[14px] mb-4">საბანკო ბარათები ({dbCards.length})</h4>
     <div className="space-y-2 mb-4">
      {dbCards.map(card=>(
      <div key={card.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-100">
       <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center text-lg">💳</div><div><p className="font-bold text-[12px]">•••• {card.last4}</p><p className="text-[10px] text-gray-500 uppercase">{card.cardholder_name}</p></div></div>
       <div className="flex items-center gap-2"><span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold uppercase">{card.brand}</span><button onClick={()=>delCard(card.id)} className="text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={14}/></button></div>
      </div>
      ))}
      {dbCards.length===0 && <p className="text-[12px] text-gray-400 text-center py-3">ბარათები არ არის</p>}
     </div>
     <form onSubmit={addDbCard} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
      <input type="text" value={cNum} onChange={fmtCard} placeholder="4242 4242 4242 4242" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-[12px] focus:outline-none focus:border-gray-900"/>
      <input type="text" value={cHold} onChange={e=>setCHold(e.target.value)} placeholder="მფლობელი" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-[12px] focus:outline-none focus:border-gray-900"/>
      </div>
      <div className="grid grid-cols-2 gap-2">
      <input type="text" value={cExp} onChange={fmtExp} placeholder="MM/YY" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-[12px] text-center focus:outline-none focus:border-gray-900"/>
      <input type="password" value={cCvc} onChange={fmtCvc} placeholder="CVC" className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-[12px] text-center focus:outline-none focus:border-gray-900"/>
      </div>
      {cFb && <p className="text-[11px] font-semibold p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">{cFb}</p>}
      <button type="submit" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-lg font-bold text-[12px] cursor-pointer">+ ბარათის დამატება</button>
     </form>
     </div>
    </div>
    </div>
   )}

   {activeTab==='verification' && (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
    <h4 className="font-bold text-[14px] mb-4">ID ვერიფიკაცია</h4>
    {verif?.status==='approved' ? (
     <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4"><BadgeCheck size={24} className="text-emerald-600"/><div><p className="font-bold text-[13px] text-emerald-700">ვერიფიცირებული</p><p className="text-[11px] text-emerald-600">ანგარიში წარმატებით დადასტურებულია.</p></div></div>
    ) : verif?.status==='pending' ? (
     <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4"><Clock size={24} className="text-amber-600"/><div><p className="font-bold text-[13px] text-amber-700">მიმდინარეობს შემოწმება</p><p className="text-[11px] text-amber-600">დოკუმენტი გადაგზავნილია. დაელოდეთ.</p></div></div>
    ) : (
     <div className="space-y-4">
     <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4"><AlertCircle size={24} className="text-gray-400"/><div><p className="font-bold text-[13px]">ვერიფიკაცია არ არის</p><p className="text-[11px] text-gray-500">ატვირთეთ პირადობის დოკუმენტი.</p></div></div>
     <div><label className="block text-[11px] font-semibold text-gray-500 mb-1.5">დოკუმენტის ტიპი</label>
      <select value={docType} onChange={e=>setDocType(e.target.value as DocType)} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-[13px] focus:outline-none focus:border-gray-900">
      <option value="id_card">პირადობის მოწმობა</option><option value="passport">პასპორტი</option><option value="license">მართვის მოწმობა</option>
      </select>
     </div>
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div><label className="block text-[11px] font-semibold text-gray-500 mb-1.5">წინა მხარე</label>
      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-500 bg-gray-50">
       {frontFile?<div className="text-center"><FileText size={20} className="mx-auto mb-1 text-gray-600"/><span className="text-[11px] text-gray-700">{frontFile.name}</span></div>:<div className="text-center"><Upload size={20} className="mx-auto mb-1 text-gray-400"/><span className="text-[11px] text-gray-400">ატვირთე ფოტო</span></div>}
       <input type="file" accept="image/*" className="hidden" onChange={e=>setFrontFile(e.target.files?.[0]||null)}/>
      </label>
      </div>
      <div><label className="block text-[11px] font-semibold text-gray-500 mb-1.5">უკანა მხარე</label>
      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-500 bg-gray-50">
       {backFile?<div className="text-center"><FileText size={20} className="mx-auto mb-1 text-gray-600"/><span className="text-[11px] text-gray-700">{backFile.name}</span></div>:<div className="text-center"><Upload size={20} className="mx-auto mb-1 text-gray-400"/><span className="text-[11px] text-gray-400">ატვირთე ფოტო</span></div>}
       <input type="file" accept="image/*" className="hidden" onChange={e=>setBackFile(e.target.files?.[0]||null)}/>
      </label>
      </div>
     </div>
     {vFb && <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-medium ${vFb.startsWith('შეცდომა')?'bg-red-50 border border-red-200 text-red-700':'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>{vFb.startsWith('შეცდომა')?'✕':'✓'} {vFb}</div>}
     <button onClick={submitVerif} disabled={!frontFile} className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-bold text-[13px] cursor-pointer">დოკუმენტის გაგზავნა</button>
     </div>
    )}
    </div>
   )}

   {activeTab==='settings' && (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
    <h4 className="font-bold text-[14px] mb-4">პროფილის რედაქტირება</h4>
    <div className="flex items-center gap-4 mb-5">
     <div className="relative">
     <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
      {(profile?.avatar_url||userProfile.avatar)?<img src={profile?.avatar_url||userProfile.avatar} className="w-full h-full object-cover"/>:<div className="w-full h-full bg-gray-100 flex items-center justify-center"><User size={24} className="text-gray-400"/></div>}
     </div>
     <button onClick={()=>avatarRef.current?.click()} disabled={uploadingAvatar} className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center shadow cursor-pointer disabled:opacity-60">{uploadingAvatar?<Loader2 size={12} className="animate-spin"/>:<Camera size={12}/>}</button>
     <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={pickAvatar}/>
     </div>
     <div><p className="font-medium text-[13px]">{profile?.name||userProfile.name||'სახელი'}</p><p className="text-gray-400 text-[11px]">{user?.email||'—'}</p></div>
    </div>
    <div className="space-y-3 max-w-md">
     <div><label className="block text-[11px] font-medium text-gray-500 mb-1">სახელი</label><input type="text" value={editName} onChange={e=>setEditName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-[13px] focus:outline-none focus:border-gray-800"/></div>
     <div><label className="block text-[11px] font-medium text-gray-500 mb-1">ტელეფონი</label><input type="tel" value={editPhone} onChange={e=>setEditPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-[13px] focus:outline-none focus:border-gray-800"/></div>
     <div><label className="block text-[11px] font-medium text-gray-500 mb-1">ბიოგრაფია</label><textarea value={editBio} onChange={e=>setEditBio(e.target.value)} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-[13px] focus:outline-none focus:border-gray-800 resize-none"></textarea></div>
     <div><label className="block text-[11px] font-medium text-gray-500 mb-1">ელ-ფოსტა</label><input type="email" value={user?.email||''} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-[13px] text-gray-400 cursor-not-allowed"/></div>
     {pfFb && <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-medium ${pfFb.startsWith('შეცდომა')?'bg-red-50 border border-red-200 text-red-700':'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>{pfFb.startsWith('შეცდომა')?'✕':'✓'} {pfFb}</div>}
     <button onClick={savePf} disabled={saving} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-lg text-[12px] cursor-pointer disabled:opacity-60">{saving?<Loader2 size={14} className="animate-spin"/>:<Save size={14}/>}შენახვა</button>
    </div>
    </div>
   )}

   </div>
  </div>
  </div>
 </div>
 );
}
