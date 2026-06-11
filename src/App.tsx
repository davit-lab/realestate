import React, { useState, useMemo, useEffect } from 'react';
import { HelpCircle, Search, ChevronDown, Check, LayoutGrid, Map, MapPin } from 'lucide-react';
import { Listing, ListingType, PaymentCard, ActiveTab } from './types';
import { exchangeRate } from './data/mockData';
import { GEORGIAN_LOCATIONS } from './data/georgianLocations';
import Header from './components/Header';
import SidebarFilter from './components/SidebarFilter';
import ListingCard from './components/ListingCard';
import ListingDetail from './components/ListingDetail';
import ProfileView from './components/ProfileView';
import MessagesDrawer from './components/MessagesDrawer';
import AddListingModal from './components/AddListingModal';
import AddProperty from './components/AddProperty';
import MapView from './components/MapView';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import SmartSearchAI, { parseNaturalQuery, ParsedQuery } from './components/SmartSearchAI';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/admin/AdminPanel';
import QuickSearch from './components/QuickSearch';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import HelpWidget from './components/HelpWidget';
import HotelsPage, { type Hotel } from './components/HotelsPage';
import TourismPage from './components/TourismPage';
import { type TourismItem } from './components/TourismDetailModal';
import HotelDetailPage from './components/HotelDetailPage';
import TourismDetailPage from './components/TourismDetailPage';
import { useAuth } from './contexts/AuthContext';
import { useFavorites } from './hooks/useFavorites';
import { useSupabaseListings } from './hooks/useSupabaseListings';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export default function App() {
  const { user, profile, isAdmin, isAuthenticated, signOut } = useAuth();
  const { dbListings } = useSupabaseListings();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Navigation states
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  // Core collections — load from localStorage or start empty
  const [localListings, setLocalListings] = useState<Listing[]>(() => {
    try { const raw = localStorage.getItem('adjarahome_listings'); return raw ? JSON.parse(raw) : []; }
    catch { return []; }
  });

  // Merge: DB listings first, then local-only ones not already in DB
  const listings = [
    ...dbListings,
    ...localListings.filter(l => !dbListings.find(d => d.id === l.id)),
  ];
  const setListings = (fn: any) => setLocalListings(fn);
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>(() => {
    try { const raw = localStorage.getItem('adjarahome_cards'); return raw ? JSON.parse(raw) : []; }
    catch { return []; }
  });
  const [userProfile, setUserProfile] = useState(() => {
    try { const raw = localStorage.getItem('adjarahome_profile');
      return raw ? JSON.parse(raw) : {
        name: '', userId: '', avatar: '', balance: 0, rating: 0,
        reviewCount: 0, joinedDate: '', phone: '', smsEnabled: false
      };
    }
    catch { return { name: '', userId: '', avatar: '', balance: 0, rating: 0, reviewCount: 0, joinedDate: '', phone: '', smsEnabled: false }; }
  });
  const [chats, setChats] = useState<any[]>(() => {
    try { const raw = localStorage.getItem('adjarahome_chats'); return raw ? JSON.parse(raw) : []; }
    catch { return []; }
  });
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedTourismItem, setSelectedTourismItem] = useState<TourismItem | null>(null);


  // Search and Filter parameters
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all');
  const [searchArea, setSearchArea] = useState('');
  const [mainSearchBarQuery, setMainSearchBarQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [roomFilter, setRoomFilter] = useState('any');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Multi-selector Dropdowns states
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  // View mode: grid vs map
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Sort order
  const [sortOrder, setSortOrder] = useState<'vip' | 'newest' | 'price_asc' | 'price_desc'>('vip');

  // Currency & Language settings
  const [currency, setCurrency] = useState<'GEL' | 'USD'>('GEL');
  const [language, setLanguage] = useState<'ka' | 'en' | 'ru'>('ka');

  // Modal toggle
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync window page title with current tab/listing
  useEffect(() => {
    if (activeTab === 'profile') {
      document.title = 'ჩემი პროფილი • Adjarahome.ge';
    } else if (activeTab === 'favorites') {
      document.title = 'რჩეულები განცხადებები • Adjarahome.ge';
    } else if (activeTab === 'messages') {
      document.title = 'ჩემი მიმოწერები • Adjarahome.ge';
    } else if (activeTab === 'add_property') {
      document.title = 'განცხადების დამატება • Adjarahome.ge';
    } else if (activeTab === 'admin') {
      document.title = 'ადმინ პანელი • Adjarahome.ge';
    } else if (activeTab === 'detail' && selectedListingId) {
      const listing = listings.find((p) => p.id === selectedListingId);
      if (listing) document.title = `${listing.title} • Adjarahome.ge`;
    } else {
      document.title = 'უძრავი ქონება საქართველოში • Adjarahome.ge';
    }
  }, [activeTab, selectedListingId, listings]);

  // Persist user data to localStorage
  useEffect(() => { localStorage.setItem('adjarahome_listings', JSON.stringify(listings)); }, [listings]);
  useEffect(() => { localStorage.setItem('adjarahome_cards', JSON.stringify(paymentCards)); }, [paymentCards]);
  useEffect(() => { localStorage.setItem('adjarahome_profile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('adjarahome_chats', JSON.stringify(chats)); }, [chats]);

  // Derived Cities & Districts lists based on uploaded listings
  const citiesList = useMemo(() => {
    const list = new Set(listings.map((l) => l.city));
    return Array.from(list);
  }, [listings]);

  const districtsList = useMemo(() => {
    if (selectedCity === 'all') return [];
    const filtered = listings.filter((l) => l.city === selectedCity);
    const list = new Set(filtered.map((l) => l.district));
    return Array.from(list);
  }, [selectedCity, listings]);

  // Handle favorite clicking
  const handleFavoriteToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // halt bubbling trigger click cards
    void toggleFavorite(id);
  };

  // Handle bookings from Hotels/Tourism pages
  const handleBooking = (data: { type: 'hotel' | 'tourism'; itemId: string; itemName: string; itemImage: string; details: string; email: string; phone: string; guestName: string }) => {
    const now = new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
    const bookingEmoji = data.type === 'hotel' ? '🏨' : '🎟';
    const newChat = {
      id: `booking-${Date.now()}`,
      listingTitle: data.itemName,
      listingId: data.itemId,
      agentName: `${bookingEmoji} ჯავშნის დადასტურება`,
      agentAvatar: data.itemImage,
      lastMessage: `${data.guestName} · ${data.email}`,
      time: 'ახლახან',
      type: 'booking' as const,
      messages: [
        {
          sender: 'agent' as const,
          text: `✅ ჯავშანი დადასტურდა!\n\n${data.details}\n\n📧 დასტური გაიგზავნება: ${data.email}`,
          time: now,
        },
      ],
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    // Open mail client with booking confirmation
    const subject = encodeURIComponent(`ჯავშნის დადასტურება — ${data.itemName}`);
    const body = encodeURIComponent(data.details + '\n\nAdjarahome.ge');
    window.open(`mailto:${data.email}?subject=${subject}&body=${body}`);
    // Navigate to messages to show notification
    setTimeout(() => setActiveTab('messages'), 1200);
  };

  // Add new uploaded properties to arrays + Supabase
  const handleAddListing = async (newListing: Listing) => {
    setListings([newListing, ...listings]);
    setUserProfile((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - (newListing.vipStatus === 'super_vip' ? 25 : newListing.vipStatus === 'vip+' ? 10 : 0)),
    }));
    // Also insert into Supabase
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('properties').insert({
        title: newListing.title,
        deal_type: newListing.type,
        property_type: newListing.condition || 'apartment',
        location: newListing.location,
        city: newListing.city,
        district: newListing.district,
        rooms: parseInt(newListing.rooms) || null,
        area_sqm: newListing.area,
        price: newListing.priceLari,
        currency: 'GEL',
        description: newListing.descriptions.ka,
        phone: newListing.author.phone,
        images: newListing.images,
        status: newListing.status,
        vip_status: newListing.vipStatus,
        author_name: newListing.author.name,
        author_avatar: newListing.author.avatar,
        lat: newListing.lat ?? null,
        lng: newListing.lng ?? null,
        user_id: user?.id ?? null,
      });
      if (!error) {
        // Trigger refresh of dbListings
        window.dispatchEvent(new CustomEvent('adjarahome:refresh-listings'));
      }
    }
  };

  // Switch filter elements on clicking specific agents listings
  const handleAgentListingsFilter = (agentName: string) => {
    // Locate properties with this agent, set type and filter properly
    setSelectedType('all');
    setSelectedCity('all');
    setSelectedDistrict('all');
    setRoomFilter('any');
    setSearchArea(agentName);
    setMainSearchBarQuery('');
    setActiveTab('explore');
  };

  // Push new comments/messages generated directly inside housing detail comments list
  const handleDetailSendMessage = (listingId: string, messageText: string) => {
    // Find the listings title and author
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;

    // Check if chat conversation already exists
    const existingChat = chats.find((c) => c.listingId === listingId);

    if (existingChat) {
      const updatedChats = chats.map((c) => {
        if (c.id === existingChat.id) {
          return {
            ...c,
            lastMessage: messageText,
            time: 'ახლახან',
            messages: [
              ...c.messages,
              { sender: 'user', text: messageText, time: 'ახლახან' as string },
            ],
          };
        }
        return c;
      });
      setChats(updatedChats);
      setActiveChatId(existingChat.id);
    } else {
      // Create new chat
      const newChatId = `chat-new-${Date.now()}`;
      const newChat = {
        id: newChatId,
        listingTitle: listing.title,
        listingId: listing.id,
        agentName: listing.author.name,
        agentAvatar: listing.author.avatar,
        lastMessage: messageText,
        time: 'ახლახან',
        messages: [
          { sender: 'user' as const, text: messageText, time: 'ახლახან' },
        ],
      };
      setChats([newChat, ...chats]);
      setActiveChatId(newChatId);
    }
  };

  // Curate filtered announcements for the Explore Grid
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      // 1. Filter by mortgage/rent/sale/pledge category
      if (selectedType !== 'all' && l.type !== selectedType) return false;

      // 2. Filter by search query (combines districts, cities, locations and authors)
      if (searchArea.trim() !== '') {
        const query = searchArea.toLowerCase();
        const matchesLocation = l.location.toLowerCase().includes(query);
        const matchesDistrict = l.district.toLowerCase().includes(query);
        const matchesAuthor = l.author.name.toLowerCase().includes(query);
        const matchesCity = l.city.toLowerCase().includes(query);
        if (!matchesLocation && !matchesDistrict && !matchesAuthor && !matchesCity) return false;
      }

      // 3. Main top search bar typing query
      if (mainSearchBarQuery.trim() !== '') {
        const query = mainSearchBarQuery.toLowerCase();
        const matchesTitle = l.title.toLowerCase().includes(query);
        const matchesLocation = l.location.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLocation) return false;
      }

      // 3b. Status filter (building status)
      if (selectedStatus !== 'all' && l.status !== selectedStatus) return false;

      // 4. City selector
      if (selectedCity !== 'all' && l.city !== selectedCity) return false;

      // 5. District selector
      if (selectedDistrict !== 'all' && l.district !== selectedDistrict) return false;

      // 6. Rooms size selector
      if (roomFilter !== 'any') {
        if (roomFilter === '6+') {
          if (Number(l.rooms) < 6) return false;
        } else {
          if (l.rooms !== roomFilter) return false;
        }
      }

      // 7. Price range
      const price = currency === 'GEL' ? l.priceLari : l.priceUsd;
      if (priceMin !== '' && price < Number(priceMin)) return false;
      if (priceMax !== '' && price > Number(priceMax)) return false;

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'price_asc') {
        const pa = currency === 'GEL' ? a.priceLari : a.priceUsd;
        const pb = currency === 'GEL' ? b.priceLari : b.priceUsd;
        return pa - pb;
      }
      if (sortOrder === 'price_desc') {
        const pa = currency === 'GEL' ? a.priceLari : a.priceUsd;
        const pb = currency === 'GEL' ? b.priceLari : b.priceUsd;
        return pb - pa;
      }
      if (sortOrder === 'newest') {
        return b.id.localeCompare(a.id);
      }
      const boostRank = (vip: string | undefined) => {
        if (vip === 'super_vip') return 3;
        if (vip === 'vip+') return 2;
        if (vip === 'vip') return 1;
        return 0;
      };
      return boostRank(b.vipStatus) - boostRank(a.vipStatus);
    });
  }, [listings, selectedType, searchArea, mainSearchBarQuery, selectedCity, selectedDistrict, roomFilter, priceMin, priceMax, currency, sortOrder, selectedStatus]);

  // User uploaded listings subset helper
  const userListings = useMemo(() => {
    return user ? listings.filter((l) => l.user_id === user.id) : [];
  }, [listings, user]);

  // Favourited listings subset helper
  const favoritedListingsSubset = useMemo(() => {
    return listings.filter((l) => favorites.includes(l.id));
  }, [listings, favorites]);

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex flex-col justify-between" id="adjarahome-app">
      {/* Header bar component */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={favorites.length}
        unreadMessagesCount={chats.length > 0 ? 1 : 0}
        onAddListingClick={() => isAuthenticated ? setActiveTab('add_property') : setShowAuthModal(true)}
        userAvatar={profile?.avatar_url || userProfile.avatar}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onAuthClick={() => setShowAuthModal(true)}
        onLogout={signOut}
      />

      {/* Main Core View Area content render */}
      <main className="flex-1 pb-16">
        {activeTab === 'explore' && (
          <div className="w-full flex flex-col">

            {/* ── Hero ── */}
            <div className="relative overflow-hidden">
              {/* Background photo — visible */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80)' }}
              />
              {/* Content on solid card */}
              <div className="max-w-3xl mx-auto px-4 py-10 text-center relative z-10">
                <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 md:p-8">
                  {/* Heading */}
                  <h1 className="text-[34px] md:text-[42px] font-black text-gray-900 tracking-tight mb-3 leading-[1.1]">
                    იპოვე შენი<br className="md:hidden" />
                    <span className="text-ss-primary">ზუსტი სახლი</span>
                  </h1>
                  <p className="text-gray-500 text-[15px] mb-6 max-w-md mx-auto leading-relaxed">
                    ბათუმი, თბილისი, ქობულეთი და სხვა ქალაქები — ყველა ვარიანტი ერთ სივრცეში
                  </p>

                  {/* AI Smart Search */}
                  <div className="mb-4">
                    <SmartSearchAI
                      cities={citiesList}
                      districts={districtsList}
                      onSearch={(parsed: ParsedQuery) => {
                        if (parsed.type) setSelectedType(parsed.type);
                        if (parsed.city) setSelectedCity(parsed.city);
                        if (parsed.district) setSelectedDistrict(parsed.district);
                        if (parsed.rooms !== undefined) setRoomFilter(String(parsed.rooms));
                        if (parsed.maxPrice !== undefined) setPriceMax(String(parsed.maxPrice));
                        if (parsed.minPrice !== undefined) setPriceMin(String(parsed.minPrice));
                      }}
                    />
                  </div>

                  {/* Search card */}
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                    {/* Type tabs */}
                    <div className="flex gap-1 p-2 bg-white border-b border-gray-100">
                      {(['all','sale','rent','pledge','mortgage'] as const).map((v) => {
                        const labels: Record<string,string> = { all:'ყველა', sale:'იყიდება', rent:'ქირავდება', pledge:'გირაო', mortgage:'იპოთეკა' };
                        return (
                          <button key={v} onClick={() => setSelectedType(v)}
                            className={`flex-1 py-2 text-[12px] font-semibold rounded-lg transition-all cursor-pointer ${
                              selectedType === v
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                          >{labels[v]}</button>
                        );
                      })}
                    </div>

                    {/* Search row */}
                    <div className="flex items-stretch bg-white">
                      <div className="flex-1 flex items-center gap-3 px-5 py-4">
                        <Search size={15} className="text-gray-400 shrink-0" />
                        <input type="text" value={mainSearchBarQuery}
                          onChange={(e) => setMainSearchBarQuery(e.target.value)}
                          placeholder="ქუჩა, უბანი, ქალაქი..."
                          className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                        />
                        {mainSearchBarQuery && (
                          <button onClick={() => setMainSearchBarQuery('')} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                        )}
                      </div>

                      <div className="w-px bg-gray-200 self-stretch my-3" />

                      <div className="relative">
                        <button onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                          className="h-full flex items-center gap-2 px-5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors"
                        >
                          <MapPin size={14} className="text-gray-400" />
                          <span>{selectedCity === 'all' ? 'ყველა ქალაქი' : selectedCity}</span>
                          <ChevronDown size={14} className="text-gray-400" />
                        </button>
                        {isCityDropdownOpen && (
                          <div className="absolute left-0 top-full mt-1 min-w-[160px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
                            {[{ value: 'all', label: 'ყველა ქალაქი' }, ...GEORGIAN_LOCATIONS.popular.map(c => ({ value: c, label: c }))].map((opt) => (
                              <button key={opt.value}
                                onClick={() => { setSelectedCity(opt.value); setIsCityDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors ${
                                  selectedCity === opt.value ? 'text-ss-primary font-semibold bg-violet-50' : 'text-gray-700'
                                }`}
                              >
                                {opt.label}
                                {selectedCity === opt.value && <Check size={12} className="text-ss-primary" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="w-px bg-gray-200 self-stretch my-3" />

                      <button className="flex items-center gap-2 bg-ss-primary hover:bg-ss-primary-dark text-white font-semibold px-7 text-sm transition-colors cursor-pointer m-2 rounded-xl">
                        <Search size={15} />
                        <span>ძებნა</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>


            {/* ── Results ── */}
            <div id="results-section" className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* Sidebar */}
                <div className="lg:w-64 xl:w-72 shrink-0 w-full">
                  <SidebarFilter
                    selectedType={selectedType} setSelectedType={setSelectedType}
                    searchArea={searchArea} setSearchArea={setSearchArea}
                    currency={currency} toggleCurrency={() => setCurrency(p => p === 'GEL' ? 'USD' : 'GEL')}
                    language={language} setLanguage={setLanguage}
                    selectedCity={selectedCity} setSelectedCity={(city) => { setSelectedCity(city); setSelectedDistrict('all'); }}
                    selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict}
                    roomFilter={roomFilter} setRoomFilter={setRoomFilter}
                    cities={citiesList} districts={districtsList}
                    priceMin={priceMin} setPriceMin={setPriceMin}
                    priceMax={priceMax} setPriceMax={setPriceMax}
                    selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus}
                  />
                </div>

                {/* Grid / Map */}
                <div className="flex-1 min-w-0 space-y-4">
                  {/* Results bar with sort + view toggle */}
                  {(() => {
                    const typeGeo: Record<string,string> = { all:'ყველა', sale:'იყიდება', rent:'ქირავდება', mortgage:'იპოთეკა', pledge:'გირაო' };
                    return (
                      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-2.5 gap-2">
                        <p className="text-sm text-gray-700 shrink-0">
                          <span className="font-bold text-gray-900">{filteredListings.length}</span>
                          <span className="text-gray-400 ml-1 hidden sm:inline">{typeGeo[selectedType] ?? selectedType}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          {/* Sort */}
                          <select
                            value={sortOrder}
                            onChange={e => setSortOrder(e.target.value as typeof sortOrder)}
                            className="text-[12px] text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-ss-primary cursor-pointer"
                          >
                            <option value="vip">VIP → სტანდარტი</option>
                            <option value="newest">ახალი → ძველი</option>
                            <option value="price_asc">ფასი: დაბლა ↑</option>
                            <option value="price_desc">ფასი: მაღალა ↓</option>
                          </select>
                          {/* View toggle */}
                          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                            <button
                              onClick={() => setViewMode('grid')}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'
                              }`}
                            >
                              <LayoutGrid size={14} />
                            </button>
                            <button
                              onClick={() => setViewMode('map')}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'
                              }`}
                            >
                              <Map size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Map view */}
                  {viewMode === 'map' && (
                    <div className="h-[600px] rounded-xl overflow-hidden border border-gray-200">
                      <MapView
                        listings={filteredListings}
                        favorites={favorites}
                        currency={currency}
                        onListingClick={(id) => { setSelectedListingId(id); setActiveTab('detail'); }}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    </div>
                  )}

                  {viewMode === 'grid' && (
                    filteredListings.length === 0 ? (
                      <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
                        <HelpCircle size={36} className="mx-auto mb-4 text-gray-200" />
                        <h4 className="font-bold text-gray-900 text-sm mb-2">განცხადება ვერ მოიძებნა</h4>
                        <p className="text-sm text-gray-400 max-w-sm mx-auto mb-5">
                          სცადეთ სხვა პარამეტრები ან გაასუფთავეთ ფილტრი
                        </p>
                        <button
                          onClick={() => { setSelectedType('all'); setSearchArea(''); setMainSearchBarQuery(''); setSelectedCity('all'); setSelectedDistrict('all'); setRoomFilter('any'); setPriceMin(''); setPriceMax(''); setSelectedStatus('all'); }}
                          className="bg-ss-primary hover:bg-ss-primary-dark text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                        >
                          ფილტრების გასუფთავება
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredListings.map((listing) => (
                          <ListingCard
                            key={listing.id}
                            listing={listing}
                            isFavorited={favorites.includes(listing.id)}
                            onFavoriteToggle={handleFavoriteToggle}
                            currency={currency}
                            exchangeRate={exchangeRate}
                            onCardClick={() => { setSelectedListingId(listing.id); setActiveTab('detail'); }}
                          />
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* ── Quick Search bento ── */}
            <QuickSearch
              onSelect={(filter) => {
                setSelectedType('all');
                setRoomFilter('any');
                setSelectedStatus('all');
                setSearchArea('');
                if (filter.type) setSelectedType(filter.type as any);
                if (filter.rooms) setRoomFilter(filter.rooms);
                if (filter.status) setSelectedStatus(filter.status);
                if (filter.searchArea) setSearchArea(filter.searchArea);
                window.scrollTo({ top: document.getElementById('results-section')?.offsetTop ?? 400, behavior: 'smooth' });
              }}
            />

          </div>
        )}

        {/* Detailed Viewing Page */}
        {activeTab === 'detail' && selectedListingId && (
          (() => {
            const currentObj = listings.find((p) => p.id === selectedListingId);
            if (!currentObj) return (
              <div className="py-20 text-center font-sans text-xs font-bold text-red-500">
                სამწუხაროდ, განცხადება ვერ მოიძებნა!
              </div>
            );
            return (
              <ListingDetail
                listing={currentObj}
                onBackClick={() => setActiveTab('explore')}
                favorites={favorites}
                onFavoriteToggle={handleFavoriteToggle}
                currency={currency}
                exchangeRate={exchangeRate}
                onAgentClick={handleAgentListingsFilter}
                onSendMessage={handleDetailSendMessage}
              />
            );
          })()
        )}

        {/* Profile Payments Hub View Page */}
        {activeTab === 'profile' && (
          <ProfileView
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            paymentCards={paymentCards}
            setPaymentCards={setPaymentCards}
            myListings={userListings}
            onAddListingClick={() => setIsAddModalOpen(true)}
            currency={currency}
          />
        )}

        {/* Messaging Chat dialogue center Page */}
        {activeTab === 'messages' && (
          <MessagesDrawer
            chats={chats}
            setChats={setChats}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
          />
        )}

        {/* Favorites Listings Grid tab */}
        {activeTab === 'favorites' && (
          <div className="max-w-7xl mx-auto px-4 py-8 font-sans" id="favorites-tab-view">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-xl font-bold text-ss-charcoal mb-1">რჩეული განცხადებები</h2>
              <p className="text-xs text-ss-slate">თქვენს მიერ შენახული და მოწონებული უძრავი ქონებები</p>
            </div>

            {favoritedListingsSubset.length === 0 ? (
              <div className="bg-white border border-ss-border rounded-lg p-12 text-center text-ss-slate max-w-md mx-auto premium-card-shadow">
                <HelpCircle size={40} className="mx-auto mb-3 opacity-30 text-ss-primary" />
                <h4 className="font-bold text-ss-charcoal text-sm">რჩეულები ცარიელია</h4>
                <p className="text-xs text-ss-slate mt-1 max-w-xs mx-auto leading-relaxed">
                  მონიშნეთ განცხადებები გულის ხატულაზე მთავარ გვერდზე შესანახად
                </p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="bg-ss-primary hover:bg-ss-primary-dark text-white px-5 py-2.5 rounded-full font-bold text-xs mt-4 cursor-pointer"
                >
                  განცხადებების ნახვა
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {favoritedListingsSubset.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isFavorited={true}
                    onFavoriteToggle={handleFavoriteToggle}
                    currency={currency}
                    exchangeRate={exchangeRate}
                    onCardClick={() => {
                      setSelectedListingId(listing.id);
                      setActiveTab('detail');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Property page with Telegram/WhatsApp auto-fill */}
        {activeTab === 'add_property' && (
          <AddProperty onBack={() => setActiveTab('explore')} />
        )}

        {/* Admin Panel — admin only */}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel
            localListings={listings}
            onDeleteListing={(id) => setListings(prev => prev.filter(l => l.id !== id))}
          />
        )}

        {/* Hotels page */}
        {activeTab === 'hotels' && (
          <HotelsPage onSelectHotel={hotel => { setSelectedHotel(hotel); setActiveTab('hotel_detail'); }} />
        )}

        {/* Hotel detail page */}
        {activeTab === 'hotel_detail' && selectedHotel && (
          <HotelDetailPage
            hotel={selectedHotel}
            onBack={() => setActiveTab('hotels')}
          />
        )}

        {/* Tourism page */}
        {activeTab === 'tourism' && (
          <TourismPage onSelectItem={item => { setSelectedTourismItem(item); setActiveTab('tourism_detail'); }} />
        )}

        {/* Tourism detail page */}
        {activeTab === 'tourism_detail' && selectedTourismItem && (
          <TourismDetailPage
            item={selectedTourismItem}
            onBack={() => setActiveTab('tourism')}
          />
        )}

        {/* Terms page */}
        {activeTab === 'terms' && (
          <TermsPage onBack={() => setActiveTab('explore')} />
        )}

        {/* Privacy page */}
        {activeTab === 'privacy' && (
          <PrivacyPage onBack={() => setActiveTab('explore')} />
        )}
      </main>

      {/* Modal form for listing creation trigger */}
      <AddListingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddListing={handleAddListing}
      />

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}

      <HelpWidget />

      <Footer
        onTermsClick={() => setActiveTab('terms')}
        onPrivacyClick={() => setActiveTab('privacy')}
        onHelpClick={() => {}}
      />
    </div>
  );
}
