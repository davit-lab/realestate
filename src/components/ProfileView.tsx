import React, { useState, useRef } from 'react';
import {
  Wallet,
  PlusCircle,
  CreditCard,
  Layers,
  ChevronRight,
  ShieldCheck,
  User,
  Plus,
  TrendingUp,
  CheckCircle,
  Zap,
  Star,
  Crown,
  MapPin,
  ArrowRight,
  Check,
  Camera,
  Loader2,
  Save
} from 'lucide-react';
import { PaymentCard, Listing } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';

interface ProfileViewProps {
  userProfile: {
    name: string;
    userId: string;
    avatar: string;
    balance: number;
    notificationsEnabled: boolean;
    smsEnabled: boolean;
  };
  setUserProfile: React.Dispatch<React.SetStateAction<any>>;
  paymentCards: PaymentCard[];
  setPaymentCards: React.Dispatch<React.SetStateAction<PaymentCard[]>>;
  myListings: Listing[];
  onAddListingClick: () => void;
  currency: 'GEL' | 'USD';
}

export default function ProfileView({
  userProfile,
  setUserProfile,
  paymentCards,
  setPaymentCards,
  myListings,
  onAddListingClick,
  currency,
}: ProfileViewProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { updateProfile, uploadAvatar, saving, uploadingAvatar } = useProfile(user?.id);

  const [editName, setEditName] = useState(profile?.name || userProfile.name || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    const { error } = await updateProfile({ name: editName, phone: editPhone });
    if (error) { setProfileFeedback('შეცდომა: ' + error); }
    else {
      setUserProfile((prev: any) => ({ ...prev, name: editName }));
      await refreshProfile();
      setProfileFeedback('პროფილი განახლდა!');
    }
    setTimeout(() => setProfileFeedback(null), 3000);
  };

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { url, error } = await uploadAvatar(file);
    if (error) { setProfileFeedback('ავატარის შეცდომა: ' + error); }
    else if (url) {
      setUserProfile((prev: any) => ({ ...prev, avatar: url }));
      await refreshProfile();
      setProfileFeedback('ავატარი განახლდა!');
    }
    setTimeout(() => setProfileFeedback(null), 3000);
  };

  const [activeSubTab, setActiveSubTab] = useState<'balance_refill' | 'payment_methods' | 'my_listings' | 'balance_view' | 'boost' | 'edit_profile'>('my_listings');
  const [activatedBoost, setActivatedBoost] = useState<string | null>(null);
  const [boostFeedback, setBoostFeedback] = useState<string | null>(null);
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [refillAmount, setRefillAmount] = useState('50');
  const [selectedCardId, setSelectedCardId] = useState(paymentCards[0]?.id || '');
  const [formFeedback, setFormFeedback] = useState<string | null>(null);

  const currencySymbol = currency === 'GEL' ? '₾' : '$';

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || '';
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    let formatted = raw;
    if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    if (formatted.length <= 5) {
      setCardExpiry(formatted);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 3) {
      setCardCvc(raw);
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 19 || cardExpiry.length < 5 || cardCvc.length < 3) {
      setFormFeedback('გთხოვთ შეავსოთ ბარათის მონაცემები სრულყოფილად!');
      return;
    }

    const brand: 'visa' | 'mastercard' | 'amex' = cardNumber.startsWith('4')
      ? 'visa'
      : cardNumber.startsWith('5')
      ? 'mastercard'
      : 'amex';

    const newCard: PaymentCard = {
      id: `card-${Date.now()}`,
      number: `•••• •••• •••• ${cardNumber.slice(-4)}`,
      expiry: cardExpiry,
      cvc: cardCvc,
      type: brand,
      cardholder: cardholder || 'SABA KUNCHUASHVILI',
      colorTheme: 'silver-classic',
    };

    setPaymentCards([newCard, ...paymentCards]);
    setSelectedCardId(newCard.id);
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardholder('');
    setFormFeedback('ბარათი წარმატებით დაემატა!');
    setTimeout(() => setFormFeedback(null), 3000);
  };

  const handleRefillDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(refillAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormFeedback('გთხოვთ შეიყვანოთ სწორი თანხა!');
      return;
    }

    setUserProfile((prev: any) => ({
      ...prev,
      balance: prev.balance + amountNum,
    }));

    setFormFeedback(`ბალანსი შეივსო ${amountNum} ₾-ით წარმატებით!`);
    setTimeout(() => setFormFeedback(null), 3500);
  };

  const boostPlans = [
    {
      id: 'pro',
      name: 'PRO',
      price: 150,
      badge: <Crown size={16} />,
      color: 'bg-gray-900',
      textColor: 'text-white',
      borderColor: 'border-gray-900',
      bgLight: 'bg-gray-100',
      features: [
        'განცხადება საძიებო შედეგების სათავეში',
        'მთავარ გვერდზე ფიჩერირება',
        'PRO BOOST ბეიჯი ყველა სიაში',
        'პრიორიტეტული კონტაქტის ვიჯეტი',
        'განცხადება ელ-ფოსტის განმახლებელში',
        '30 დღე სრული ხილვადობა',
      ],
    },
    {
      id: 'normal',
      name: 'NORMAL',
      price: 60,
      badge: <Star size={16} />,
      color: 'bg-violet-600',
      textColor: 'text-white',
      borderColor: 'border-violet-500',
      bgLight: 'bg-violet-50',
      features: [
        'BOOST ბეიჯი განცხადებაზე',
        'გამოყოფილი პოზიცია ძიებაში',
        'განცხადება კვირის Top სიაში',
        'გაზრდილი ხილვადობა',
        '30 დღე',
      ],
    },
    {
      id: 'basic',
      name: 'BASIC',
      price: 25,
      badge: <Zap size={16} />,
      color: 'bg-slate-700',
      textColor: 'text-white',
      borderColor: 'border-slate-400',
      bgLight: 'bg-slate-50',
      features: [
        'მცირე ხილვადობის გაუმჯობესება',
        'ძიებაში ოდნავ მაღალი პოზიცია',
        '30 დღე',
      ],
    },
  ];

  return (
    <div className="min-h-full w-full font-sans bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 mb-2">
                  <img src={userProfile.avatar || ''} alt={userProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <h3 className="font-semibold text-gray-900 text-[14px]">{userProfile.name || 'უცნობი'}</h3>
                <span className="text-gray-400 text-[11px] mb-3">ID: {userProfile.userId || '—'}</span>

                <div className="bg-gray-800 rounded-lg py-2.5 px-3 w-full flex items-center justify-between text-white">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-gray-300">
                    <Wallet size={13} />
                    <span>ბალანსი</span>
                  </div>
                  <span className="text-[16px] font-bold">
                    {userProfile.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-[11px] text-gray-400">₾</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1.5">
              {[
                { id: 'edit_profile', label: 'პროფილის რედაქტირება', icon: <User size={14} /> },
                { id: 'my_listings', label: 'ჩემი განცხადებები', count: myListings.length, icon: <Layers size={14} /> },
                { id: 'boost', label: 'განცხადების გაბუსთება', icon: <Zap size={14} /> },
                { id: 'balance_refill', label: 'ბალანსის შევსება', icon: <PlusCircle size={14} /> },
                { id: 'balance_view', label: 'ტრანზაქციები', icon: <TrendingUp size={14} /> },
                { id: 'payment_methods', label: 'საბანკო ბარათები', icon: <CreditCard size={14} /> },
              ].map((sub) => {
                const isActive = activeSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubTab(sub.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer text-[12px] font-medium ${
                      isActive ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">{sub.icon}<span>{sub.label}</span></div>
                    {'count' in sub && sub.count > 0 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {sub.count}
                      </span>
                    )}
                    <ChevronRight size={13} className={isActive ? 'text-white/50' : 'text-gray-300'} />
                  </button>
                );
              })}
            </div>

            {/* Settings */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 space-y-2">
              <p className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">შეტყობინებები</p>
              {[
                { key: 'notificationsEnabled', label: 'Push შეტყობინებები' },
                { key: 'smsEnabled', label: 'SMS შეტყობინებები' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-gray-700">{label}</span>
                  <button
                    onClick={() => setUserProfile((prev: any) => ({ ...prev, [key]: !prev[key] }))}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                      userProfile[key as keyof typeof userProfile] ? 'bg-gray-800' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 mt-0.5 ml-0.5 transform rounded-full bg-white shadow transition duration-200 ${
                      userProfile[key as keyof typeof userProfile] ? 'translate-x-3.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-9 flex flex-col gap-5">

          {/* Subtab: Edit Profile */}
          {activeSubTab === 'edit_profile' && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h4 className="font-semibold text-[14px] text-gray-900 mb-4 border-b border-gray-100 pb-3">პროფილის რედაქტირება</h4>

              {/* Avatar picker */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                    {(profile?.avatar_url || userProfile.avatar) ? (
                      <img src={profile?.avatar_url || userProfile.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <User size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center shadow cursor-pointer transition-colors disabled:opacity-60"
                  >
                    {uploadingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-[13px]">{profile?.name || userProfile.name || 'სახელი'}</p>
                  <p className="text-gray-400 text-[11px]">{user?.email || '—'}</p>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="text-[11px] text-blue-600 hover:underline cursor-pointer mt-1"
                  >
                    ფოტოს შეცვლა
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">სახელი და გვარი</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="სახელი გვარი"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-[13px] text-gray-900 focus:outline-none focus:border-gray-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">ტელეფონი</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="599 XX XX XX"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-[13px] text-gray-900 focus:outline-none focus:border-gray-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">ელ-ფოსტა</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-[13px] text-gray-400 cursor-not-allowed"
                  />
                </div>

                {profileFeedback && (
                  <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-medium ${
                    profileFeedback.startsWith('შეცდომა') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  }`}>
                    {profileFeedback.startsWith('შეცდომა') ? '✕' : '✓'} {profileFeedback}
                  </div>
                )}

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg text-[12px] cursor-pointer transition-colors disabled:opacity-60"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  შენახვა
                </button>
              </div>
            </div>
          )}

          {/* Subtab: My Listings */}
          {activeSubTab === 'my_listings' && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div>
                  <h4 className="font-semibold text-[14px] text-gray-900">ჩემი განცხადებები</h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">პორტალზე განთავსებული ქონება</p>
                </div>
                <button
                  onClick={onAddListingClick}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md font-medium text-[11px] flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus size={12} />
                  <span>განცხადება</span>
                </button>
              </div>

              {myListings.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Layers size={32} className="mx-auto mb-2 opacity-20 text-gray-700" />
                  <p className="font-medium text-[12px] text-gray-900">განცხადება არ არის</p>
                  <p className="text-[11px] mt-1">დაამატეთ პირველი განცხადება</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myListings.map((listing) => {
                    const priceFormatted = (currency === 'GEL' ? listing.priceLari : listing.priceUsd).toLocaleString();
                    return (
                      <div key={listing.id} className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:border-gray-300 hover:bg-gray-50/50 transition-all">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-50 border border-gray-200">
                          <img src={listing.image} alt="housing" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 text-[12px] line-clamp-1">{listing.title}</h5>
                          <span className="text-gray-700 font-semibold text-[13px]">{priceFormatted} {currencySymbol}</span>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                            <MapPin size={9} />
                            <span>{listing.district}, {listing.city}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Subtab: Boost Post */}
          {activeSubTab === 'boost' && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="mb-5">
                  <h4 className="font-bold text-[15px] text-gray-900">განცხადების გაბუსთება</h4>
                  <p className="text-[12px] text-gray-500 mt-1">30 დღის განმავლობაში გაზარდეთ თქვენი განცხადების ხილვადობა. ყველა პაკეტი ძალაში შედის გადახდის დღიდან.</p>
                </div>

                {boostFeedback && (
                  <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-[12px] font-semibold">
                    <CheckCircle size={15} />
                    {boostFeedback}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {boostPlans.map((plan) => {
                    const isActive = activatedBoost === plan.id;
                    const canAfford = userProfile.balance >= plan.price;
                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-xl border-2 p-5 flex flex-col transition-all ${
                          isActive
                            ? `${plan.borderColor} shadow-lg`
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {plan.id === 'pro' && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow">
                            პოპულარული
                          </div>
                        )}

                        <div className={`w-10 h-10 rounded-xl ${plan.color} flex items-center justify-center text-white mb-3`}>
                          {plan.badge}
                        </div>

                        <div className="mb-1">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{plan.name}</span>
                        </div>
                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-[28px] font-black text-gray-900 leading-none">{plan.price}</span>
                          <span className="text-gray-700 font-bold text-sm">₾</span>
                          <span className="text-gray-500 text-[11px] font-medium">/ 30 დღე</span>
                        </div>

                        <ul className="space-y-2 mb-5 flex-1">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-[11px] text-gray-900 font-medium">
                              <Check size={12} className="text-gray-700 mt-0.5 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => {
                            if (!canAfford) {
                              setBoostFeedback(`ბალანსი არ არის საკმარისი. საჭიროა ${plan.price} ₾`);
                              setTimeout(() => setBoostFeedback(null), 3500);
                              return;
                            }
                            setUserProfile((prev: any) => ({ ...prev, balance: prev.balance - plan.price }));
                            setActivatedBoost(plan.id);
                            setBoostFeedback(`${plan.name} პაკეტი წარმატებით გააქტიურდა! 30 დღე.`);
                            setTimeout(() => setBoostFeedback(null), 4000);
                          }}
                          disabled={isActive}
                          className={`w-full py-2.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                              : canAfford
                              ? `${plan.color} ${plan.textColor} hover:opacity-90`
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isActive ? (
                            <><CheckCircle size={14} /> გააქტიურებულია</>
                          ) : (
                            <><ArrowRight size={14} /> {plan.price} ₾ — გააქტიურება</>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 text-[11px] text-gray-500 flex items-start gap-3">
                <ShieldCheck size={16} className="text-gray-700 shrink-0 mt-0.5" />
                <span>ბუსთი ავტომატურად გამოირთვება 30 დღის შემდეგ. თანხა ჩამოიჭრება თქვენი პორტალის ბალანსიდან. ბალანსი შეგიძლიათ შეავსოთ «ბალანსის შევსება» სექციაში.</span>
              </div>
            </div>
          )}

          {/* Subtab: Refill balance */}
          {activeSubTab === 'balance_refill' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-[15px] text-gray-900 mb-4 border-b border-gray-200 pb-3">ბალანსის შევსება</h4>

                <form onSubmit={handleRefillDeposit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5" htmlFor="amount-input">თანხა (₾)</label>
                    <input
                      id="amount-input"
                      type="number" min="5" max="5000"
                      value={refillAmount}
                      onChange={(e) => setRefillAmount(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-900 text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5" htmlFor="card-refill-select">ბარათი</label>
                    <select
                      id="card-refill-select"
                      value={selectedCardId}
                      onChange={(e) => setSelectedCardId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 font-semibold text-gray-900 focus:outline-none focus:border-gray-900 text-[13px]"
                    >
                      {paymentCards.map((card) => (
                        <option key={card.id} value={card.id}>{card.type.toUpperCase()}: {card.number}</option>
                      ))}
                    </select>
                  </div>

                  {formFeedback && (
                    <p className="text-[12px] font-semibold p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">{formFeedback}</p>
                  )}

                  <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <Wallet size={14} />
                    <span>შევსება</span>
                  </button>
                </form>

                <div className="mt-4 flex items-center gap-2 justify-center text-[11px] text-gray-500 border-t border-gray-200 pt-3">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  <span>SSL დაცული გადახდა</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">ბარათები ({paymentCards.length})</p>
                {paymentCards.map((card) => (
                  <div key={card.id} className="bg-white border border-gray-200 rounded-xl p-3.5 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg">💳</div>
                      <div>
                        <div className="font-bold text-gray-900 text-[12px]">{card.number}</div>
                        <div className="text-[10px] text-gray-500 uppercase">{card.cardholder}</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-bold uppercase">{card.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab: Add Payment Cards */}
          {activeSubTab === 'payment_methods' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-[15px] text-gray-900 mb-4 border-b border-gray-200 pb-3">საბანკო ბარათის დამატება</h4>
              
              <form onSubmit={handleAddCard} className="space-y-4 max-w-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5" htmlFor="profile-card-number">ბარათის ნომერი</label>
                    <input id="profile-card-number" type="text" value={cardNumber} onChange={handleCardNumberChange}
                      placeholder="4242 4242 •••• ••••"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 font-semibold text-gray-900 text-[13px] focus:outline-none focus:border-gray-900" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5" htmlFor="profile-cardholder">ბარათის მფლობელი</label>
                    <input id="profile-cardholder" type="text" value={cardholder} onChange={(e) => setCardholder(e.target.value)}
                      placeholder="FULL NAME"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 font-semibold text-gray-900 text-[13px] focus:outline-none focus:border-gray-900 uppercase" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5" htmlFor="profile-card-expiry">ვადა (MM/YY)</label>
                    <input id="profile-card-expiry" type="text" value={cardExpiry} onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 font-semibold text-gray-900 text-[13px] text-center focus:outline-none focus:border-gray-900" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5" htmlFor="profile-card-cvc">CVC</label>
                    <input id="profile-card-cvc" type="password" value={cardCvc} onChange={handleCvcChange}
                      placeholder="•••"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 font-semibold text-gray-900 text-[13px] text-center focus:outline-none focus:border-gray-900" />
                  </div>
                </div>

                {formFeedback && <p className="text-[12px] font-semibold p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">{formFeedback}</p>}

                <button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-bold text-[13px] transition-all cursor-pointer">
                  ბარათის დამატება
                </button>
              </form>
            </div>
          )}

          {/* Subtab: Transaction History */}
          {activeSubTab === 'balance_view' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <h4 className="font-bold text-[15px] text-gray-900">ტრანზაქციების ისტორია</h4>
                <p className="text-gray-500 text-[11px] mt-0.5">ბალანსის შევსებისა და ბუსთის ოპერაციები</p>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'ბალანსის შევსება — VISA', sub: 'დღეს 12:40 • VISA *4242', amount: '+50.00 ₾', positive: true },
                  { label: 'სისტემური საწყისი კრედიტი', sub: '28 მაისი • INITIAL', amount: '+300.50 ₾', positive: true },
                ].map((tx, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        tx.positive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                      }`}>{tx.positive ? '↑' : '↓'}</div>
                      <div>
                        <p className="font-semibold text-gray-900 text-[12px]">{tx.label}</p>
                        <p className="text-[10px] text-gray-500">{tx.sub}</p>
                      </div>
                    </div>
                    <span className={`font-black text-[13px] font-mono ${
                      tx.positive ? 'text-emerald-600' : 'text-red-500'
                    }`}>{tx.amount}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-100 border border-gray-200 rounded-xl p-3.5 text-[12px] text-gray-500">
                ბალანსი გამოიყენება <span className="font-bold text-gray-700">PRO</span>, <span className="font-bold text-gray-700">NORMAL</span> ან <span className="font-bold text-gray-700">BASIC</span> ბუსთ-პაკეტების შესაძენად.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  </div>
  );
}
