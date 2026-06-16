import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, Sliders, X } from 'lucide-react';
import { ListingType } from '../types';
import { GEORGIAN_LOCATIONS } from '../data/georgianLocations';
import { ALL_GEORGIA_LOCATIONS, ALL_CITIES, searchLocations, getSuburbs } from '../data/allGeorgianLocations';
import SearchHistory from './SearchHistory';
import RecentlyViewed from './RecentlyViewed';
import MortgageCalculator from './MortgageCalculator';
import { SearchHistoryItem } from '../hooks/useSearchHistory';
import { RecentViewItem } from '../hooks/useRecentViews';

interface SidebarFilterProps {
 selectedType: ListingType | 'all';
 setSelectedType: (type: ListingType | 'all') => void;
 searchArea: string;
 setSearchArea: (area: string) => void;
 currency: 'GEL' | 'USD';
 toggleCurrency: () => void;
 language: 'ka' | 'en' | 'ru';
 setLanguage: (lang: 'ka' | 'en' | 'ru') => void;
 selectedCity: string;
 setSelectedCity: (city: string) => void;
 selectedDistrict: string;
 setSelectedDistrict: (district: string) => void;
 roomFilter: string;
 setRoomFilter: (rooms: string) => void;
 cities: string[];
 districts: string[];
 priceMin: string;
 setPriceMin: (v: string) => void;
 priceMax: string;
 setPriceMax: (v: string) => void;
 areaMin: string;
 setAreaMin: (v: string) => void;
 areaMax: string;
 setAreaMax: (v: string) => void;
 selectedStatus: string;
 setSelectedStatus: (status: string) => void;
 floorTypeFilter: string;
 setFloorTypeFilter: (v: string) => void;
 bathroomsFilter: string;
 setBathroomsFilter: (v: string) => void;
 balconiesFilter: string;
 setBalconiesFilter: (v: string) => void;
 buildingStatusFilter: string;
 setBuildingStatusFilter: (v: string) => void;
 buildingConditionFilter: string;
 setBuildingConditionFilter: (v: string) => void;
 buildingTypeFilter: string;
 setBuildingTypeFilter: (v: string) => void;
 searchHistory?: SearchHistoryItem[];
 onSearchHistorySelect?: (item: SearchHistoryItem) => void;
 onSearchHistoryRemove?: (id: string) => void;
 onSearchHistoryClear?: () => void;
 recentViews?: RecentViewItem[];
 onRecentViewSelect?: (id: string) => void;
 onRecentViewRemove?: (id: string) => void;
 onRecentViewsClear?: () => void;
 showMortgageCalc?: boolean;
 mortgagePropertyPrice?: number;
}

export default function SidebarFilter({
 selectedType, setSelectedType,
 searchArea, setSearchArea,
 currency, toggleCurrency,
 language, setLanguage,
 selectedCity, setSelectedCity,
 selectedDistrict, setSelectedDistrict,
 roomFilter, setRoomFilter,
 cities, districts,
 priceMin, setPriceMin,
 priceMax, setPriceMax,
 areaMin, setAreaMin,
 areaMax, setAreaMax,
 selectedStatus, setSelectedStatus,
 floorTypeFilter, setFloorTypeFilter,
 bathroomsFilter, setBathroomsFilter,
 balconiesFilter, setBalconiesFilter,
 buildingStatusFilter, setBuildingStatusFilter,
 buildingConditionFilter, setBuildingConditionFilter,
 buildingTypeFilter, setBuildingTypeFilter,
 searchHistory,
 onSearchHistorySelect,
 onSearchHistoryRemove,
 onSearchHistoryClear,
 recentViews,
 onRecentViewSelect,
 onRecentViewRemove,
 onRecentViewsClear,
 showMortgageCalc,
 mortgagePropertyPrice,
}: SidebarFilterProps) {
 const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
 const [locationSearch, setLocationSearch] = useState('');
 const dropdownRef = useRef<HTMLDivElement>(null);

 // Close dropdown when clicking outside
 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
  setLocationDropdownOpen(false);
  }
 };

 if (locationDropdownOpen) {
  document.addEventListener('mousedown', handleClickOutside);
 }

 return () => {
  document.removeEventListener('mousedown', handleClickOutside);
 };
 }, [locationDropdownOpen]);

 // Full location search across all cities, suburbs, and villages
 const locationResults = locationSearch.trim()
 ? searchLocations(locationSearch)
 : ALL_GEORGIA_LOCATIONS.filter(l => l.type === 'city').slice(0, 12); // show top cities when empty

 const typeLabels: { value: ListingType | 'all'; label: string }[] = [
 { value: 'all',  label: 'ყველა' },
 { value: 'sale',  label: 'იყიდება' },
 { value: 'rent',  label: 'ქირავდება' },
 { value: 'mortgage', label: 'იპოთეკა' },
 { value: 'pledge', label: 'გირაო' },
 ];

 const langs: ('ka' | 'en' | 'ru')[] = ['ka', 'en', 'ru'];
 const sym = currency === 'GEL' ? '₾' : '$';

 const hasActiveFilters = selectedCity !== 'all' || selectedDistrict !== 'all' ||
 roomFilter !== 'any' || searchArea !== '' || priceMin !== '' || priceMax !== '' ||
 areaMin !== '' || areaMax !== '' || selectedType !== 'all' || selectedStatus !== 'all' ||
 floorTypeFilter !== 'all' || bathroomsFilter !== 'all' || balconiesFilter !== 'all' ||
 buildingStatusFilter !== 'all' || buildingConditionFilter !== 'all' || buildingTypeFilter !== 'all';

 const clearAll = () => {
 setSelectedCity('all'); setSelectedDistrict('all'); setRoomFilter('any');
 setSearchArea(''); setSelectedType('all'); setPriceMin(''); setPriceMax('');
 setAreaMin(''); setAreaMax(''); setSelectedStatus('all'); setLocationSearch(''); setLocationDropdownOpen(false);
 setFloorTypeFilter('all'); setBathroomsFilter('all'); setBalconiesFilter('all');
 setBuildingStatusFilter('all'); setBuildingConditionFilter('all'); setBuildingTypeFilter('all');
 };

 const lbl = 'block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5';
 const inp = 'w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-[9px] text-sm text-gray-800 focus:outline-none focus:border-ss-primary focus:bg-white transition-colors';

 // Grouped location results
 const cityResults = locationResults.filter(l => l.type === 'city');
 const suburbResults = locationResults.filter(l => l.type === 'suburb');
 const villageResults = locationResults.filter(l => l.type === 'village');

 return (
 <div className="w-full lg:w-64 xl:w-72 flex flex-col gap-3">

  {/* ── Type ── */}
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
  <div className="px-4 pt-3 pb-2.5 border-b border-gray-100 ">
   <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">განცხადების ტიპი</span>
  </div>
  <div className="p-2 flex flex-col gap-1">
   <button onClick={() => setSelectedType('all')}
   className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer text-center ${
    selectedType === 'all' ? 'bg-ss-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
   }`}
   >
   ყველა განცხადება
   </button>
   <div className="grid grid-cols-2 gap-1">
   {typeLabels.filter(t => t.value !== 'all').map(({ value, label }) => (
    <button key={value} onClick={() => setSelectedType(value)}
    className={`py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-center ${
     selectedType === value ? 'bg-ss-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
    >
    {label}
    </button>
   ))}
   </div>
  </div>
  </div>

  {/* ── Location text search ── */}
  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 relative" ref={dropdownRef}>
  <label className={lbl} htmlFor="area-search">მდებარეობა</label>
  <div className="relative">
   <input
   id="area-search"
   type="text"
   value={searchArea}
   onChange={(e) => {
    setSearchArea(e.target.value);
    setLocationSearch(e.target.value);
    setLocationDropdownOpen(e.target.value.length > 0);
   }}
   onFocus={() => { if (searchArea) setLocationDropdownOpen(true); }}
   placeholder="ჩაწერე რაიონი, ქალაქი, უბანი ან ქუჩა"
   className={inp + ' pr-8'}
   />
   <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>

  {locationDropdownOpen && (
   <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-[320px] overflow-y-auto">
   <div className="p-3">
    {(cityResults.length > 0 || suburbResults.length > 0 || villageResults.length > 0) ? (
    <div className="space-y-3">
     {cityResults.length > 0 && (
     <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">ქალაქები</p>
      <div className="space-y-0.5">
      {cityResults.map(l => (
       <button key={l.name} onClick={() => { setSearchArea(l.name); setSelectedCity(l.city); setLocationDropdownOpen(false); setLocationSearch(''); }}
       className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between">
       <span>{l.name}</span><span className="text-[10px] text-gray-400">{l.region}</span>
       </button>
      ))}
      </div>
     </div>
     )}
     {suburbResults.length > 0 && (
     <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">უბნები</p>
      <div className="space-y-0.5">
      {suburbResults.map(l => (
       <button key={l.name} onClick={() => { setSearchArea(l.name); setSelectedCity(l.city); setLocationDropdownOpen(false); setLocationSearch(''); }}
       className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between">
       <span>{l.name}</span><span className="text-[10px] text-gray-400">{l.city}</span>
       </button>
      ))}
      </div>
     </div>
     )}
     {villageResults.length > 0 && (
     <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">სოფლები / კურორტები</p>
      <div className="space-y-0.5">
      {villageResults.map(l => (
       <button key={l.name} onClick={() => { setSearchArea(l.name); setSelectedCity(l.city); setLocationDropdownOpen(false); setLocationSearch(''); }}
       className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between">
       <span>{l.name}</span><span className="text-[10px] text-gray-400">{l.city}</span>
       </button>
      ))}
      </div>
     </div>
     )}
    </div>
    ) : (
    <p className="text-sm text-gray-400 text-center py-4">შედეგი არ მოიძებნა</p>
    )}
   </div>
   </div>
  )}
  </div>

  {/* ── Detailed filters ── */}
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
  <div className="px-4 pt-3 pb-2.5 border-b border-gray-100 flex items-center gap-1.5">
   <Sliders size={11} className="text-gray-400" />
   <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">ფილტრი</span>
  </div>

  <div className="px-4 py-4 flex flex-col gap-4">
   <div>
   <label className={lbl} htmlFor="city-sel">ქალაქი</label>
   <select id="city-sel" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className={inp}>
    <option value="all">ყველა ქალაქი</option>
    {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
   </select>
   </div>

   <div>
   <label className={lbl} htmlFor="district-sel">უბანი</label>
   <select id="district-sel" value={selectedDistrict}
    onChange={(e) => setSelectedDistrict(e.target.value)}
    disabled={selectedCity === 'all'}
    className={inp + ' disabled:opacity-40 disabled:cursor-not-allowed'}
   >
    <option value="all">ყველა უბანი</option>
    {/* Use getSuburbs for the selected city, fall back to prop districts */}
    {selectedCity !== 'all' ? (
    getSuburbs(selectedCity).map(s => <option key={s.name} value={s.name}>{s.name}</option>)
    ) : (
    districts.map(d => <option key={d} value={d}>{d}</option>)
    )}
   </select>
   </div>

   <div>
   <label className={lbl}>ფასი ({sym})</label>
   <div className="flex items-center gap-2">
    <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
    placeholder="მინ." min={0} className={inp}
    />
    <span className="text-gray-300 font-light shrink-0">—</span>
    <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
    placeholder="მაქს." min={0} className={inp}
    />
   </div>
   </div>

   <div>
   <label className={lbl}>ფართი (მ²)</label>
   <div className="flex items-center gap-2">
    <input type="number" value={areaMin} onChange={(e) => setAreaMin(e.target.value)}
    placeholder="მინ." min={0} className={inp}
    />
    <span className="text-gray-300 font-light shrink-0">—</span>
    <input type="number" value={areaMax} onChange={(e) => setAreaMax(e.target.value)}
    placeholder="მაქს." min={0} className={inp}
    />
   </div>
   </div>

   <div>
   <label className={lbl}>ოთახები</label>
   <div className="grid grid-cols-4 gap-1">
    {['ყვ.', '1', '2', '3', '4', '5', '6+', ''].map((r, i) => {
    const val = ['any','1','2','3','4','5','6+',''][i];
    if (!val) return <div key={i} />;
    return (
     <button key={val} onClick={() => setRoomFilter(val)}
     className={`py-[7px] text-[12px] font-medium rounded-lg transition-colors cursor-pointer ${
      roomFilter === val ? 'bg-ss-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
     }`}
     >
     {r}
     </button>
    );
    })}
   </div>
   </div>

   <div>
   <label className={lbl}>სტატუსი</label>
   <div className="grid grid-cols-2 gap-1">
    {[
    { val: 'all', label: 'ყველა' },
    { val: 'ახალი აშენებული', label: 'ახალი' },
    { val: 'ძველი აშენებული', label: 'ძველი' },
    { val: 'მშენებარე', label: 'მშენებარე' },
    ].map(({ val, label }) => (
    <button key={val} onClick={() => setSelectedStatus(val)}
     className={`py-[7px] text-[12px] font-medium rounded-lg transition-colors cursor-pointer ${
     selectedStatus === val ? 'bg-ss-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
     }`}
    >
     {label}
    </button>
    ))}
   </div>
   </div>
  </div>
  </div>

  {/* ── Detailed Filters ── */}
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
  <div className="px-4 pt-3 pb-2.5 border-b border-gray-100">
   <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">დეტალური ფილტრები</span>
  </div>
  <div className="px-4 py-4 flex flex-col gap-4">
   <div>
   <label className={lbl}>სართულის ტიპი</label>
   <select value={floorTypeFilter} onChange={(e) => setFloorTypeFilter(e.target.value)} className={inp}>
    <option value="all">ყველა</option>
    <option value="დუპლექსი">დუპლექსი</option>
    <option value="ტრიპლექსი">ტრიპლექსი</option>
    <option value="სხვენი">სხვენი</option>
   </select>
   </div>
   <div>
   <label className={lbl}>სველი წერტილი</label>
   <select value={bathroomsFilter} onChange={(e) => setBathroomsFilter(e.target.value)} className={inp}>
    <option value="all">ყველა</option>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3+</option>
   </select>
   </div>
   <div>
   <label className={lbl}>აივანი</label>
   <select value={balconiesFilter} onChange={(e) => setBalconiesFilter(e.target.value)} className={inp}>
    <option value="all">ყველა</option>
    <option value="yes">აქვს</option>
    <option value="no">არ აქვს</option>
   </select>
   </div>
   <div>
   <label className={lbl}>პროექტი</label>
   <select value={buildingTypeFilter} onChange={(e) => setBuildingTypeFilter(e.target.value)} className={inp}>
    <option value="all">ყველა</option>
    <option value="ლენინგრადის">ლენინგრადის</option>
    <option value="ლვოვის">ლვოვის</option>
    <option value="კიევი">კიევი</option>
    <option value="თბილისური ეზო">თბილისური ეზო</option>
    <option value="მოსკოვის">მოსკოვის</option>
    <option value="ქალაქური">ქალაქური</option>
    <option value="ჩეხური">ჩეხური</option>
    <option value="ხრუშჩოვის">ხრუშჩოვის</option>
    <option value="თუხარელის">თუხარელის</option>
    <option value="ვეძისი">ვეძისი</option>
    <option value="იუგოსლავიის">იუგოსლავიის</option>
    <option value="მეტრომშენის">მეტრომშენის</option>
    <option value="არასტანდარტული">არასტანდარტული</option>
    <option value="ყავლაშვილის">ყავლაშვილის</option>
   </select>
   </div>
   <div>
   <label className={lbl}>მდგომარეობა</label>
   <select value={buildingConditionFilter} onChange={(e) => setBuildingConditionFilter(e.target.value)} className={inp}>
    <option value="all">ყველა</option>
    <option value="ახალი რემონტით">ახალი რემონტით</option>
    <option value="ძველი რემონტით">ძველი რემონტით</option>
    <option value="სარემონტო">სარემონტო</option>
    <option value="პრესტიჟული">პრესტიჟული</option>
    <option value="მწვანე კარკასი">მწვანე კარკასი</option>
    <option value="თეთრი კარკასი">თეთრი კარკასი</option>
    <option value="შავი კარკასი">შავი კარკასი</option>
   </select>
   </div>
  </div>
  </div>

  {/* ── Search History ── */}
  {searchHistory && searchHistory.length > 0 && onSearchHistorySelect && onSearchHistoryRemove && onSearchHistoryClear && (
  <SearchHistory
   history={searchHistory}
   onSelect={onSearchHistorySelect}
   onRemove={onSearchHistoryRemove}
   onClear={onSearchHistoryClear}
  />
  )}

  {/* ── Recently Viewed ── */}
  {recentViews && recentViews.length > 0 && onRecentViewSelect && onRecentViewRemove && onRecentViewsClear && (
  <RecentlyViewed
   items={recentViews}
   currency={currency}
   onSelect={onRecentViewSelect}
   onRemove={onRecentViewRemove}
   onClear={onRecentViewsClear}
  />
  )}

  {/* ── Mortgage Calculator ── */}
  {showMortgageCalc && mortgagePropertyPrice && mortgagePropertyPrice > 0 && (
  <MortgageCalculator
   propertyPrice={mortgagePropertyPrice}
   currency={currency}
  />
  )}

  {/* ── Currency + Language ── */}
  <div className="grid grid-cols-2 gap-2">
  <button onClick={toggleCurrency}
   className="bg-white border border-gray-200 rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
  >
   <span className="text-[15px] leading-none">{currency === 'GEL' ? '₾' : '$'}</span>
   <span>{currency}</span>
  </button>
  <button
   onClick={() => { setLanguage(langs[(langs.indexOf(language) + 1) % langs.length]); }}
   className="bg-white border border-gray-200 rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
  >
   <Globe size={13} className="text-gray-400" />
   <span>{language === 'ka' ? 'ქართ.' : language === 'en' ? 'Eng' : 'Рус'}</span>
  </button>
  </div>

  {/* ── Clear ── */}
  {hasActiveFilters && (
  <button onClick={clearAll}
   className="flex items-center justify-center gap-1.5 w-full text-[12px] font-medium text-gray-500 hover:text-red-600 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 py-2.5 rounded-xl transition-colors cursor-pointer"
  >
   <X size={12} />
   ფილტრების გასუფთავება
  </button>
  )}
 </div>
 );
}
