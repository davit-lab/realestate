import React, { useMemo, useState } from 'react';
import { RefreshCw, Trash2, Loader2, Plus, Eye, EyeOff, Pencil, Star, Compass, X, Search } from 'lucide-react';
import type { Hotel } from '../HotelDetailModal';
import type { TourismItem, TourismCategory } from '../TourismDetailModal';
import { fmtDate, _flash } from './AdminPanel';

interface Props {
  hotels: Hotel[];
  tourismItems: TourismItem[];
  loading: boolean;
  onRefresh: () => void;
  onSaveHotel: (hotel: Partial<Hotel>) => void;
  onSaveTourism: (item: Partial<TourismItem>) => void;
  onDeleteHotel: (id: string) => void;
  onDeleteTourism: (id: string) => void;
  onToggleHotel: (id: string, active: boolean) => void;
  onToggleTourism: (id: string, active: boolean) => void;
  isDark: boolean;
  txtMain: string;
  txtSub: string;
  bgCard: string;
  brdCard: string;
  search: string;
  setSearch: (s: string) => void;
  setFeedback: React.Dispatch<React.SetStateAction<string | null>>;
}

type ServicesSubTab = 'hotels' | 'tourism';

export default function ServicesTab({
  hotels,
  tourismItems,
  loading,
  onRefresh,
  onSaveHotel,
  onSaveTourism,
  onDeleteHotel,
  onDeleteTourism,
  onToggleHotel,
  onToggleTourism,
  isDark,
  txtMain,
  txtSub,
  bgCard,
  brdCard,
  search,
  setSearch,
  setFeedback,
}: Props) {
  const [sub, setSub] = useState<ServicesSubTab>('hotels');
  const [editingHotel, setEditingHotel] = useState<Partial<Hotel> | null>(null);
  const [editingTourism, setEditingTourism] = useState<Partial<TourismItem> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredHotels = useMemo(() => {
    if (!search) return hotels;
    const s = search.toLowerCase();
    return hotels.filter((h) =>
      (h.name || '').toLowerCase().includes(s) ||
      (h.city || '').toLowerCase().includes(s) ||
      (h.district || '').toLowerCase().includes(s)
    );
  }, [hotels, search]);

  const filteredTourism = useMemo(() => {
    if (!search) return tourismItems;
    const s = search.toLowerCase();
    return tourismItems.filter((t) =>
      (t.title || '').toLowerCase().includes(s) ||
      (t.city || '').toLowerCase().includes(s) ||
      (t.category || '').toLowerCase().includes(s)
    );
  }, [tourismItems, search]);

  const startNewHotel = () =>
    setEditingHotel({
      id: '',
      name: '',
      stars: 3,
      rating: 8.0,
      reviewCount: 0,
      pricePerNight: 100,
      city: '',
      district: '',
      image: '',
      images: [],
      amenities: [],
      description: '',
      phone: '',
      tags: [],
      featured: false,
    });

  const startNewTourism = () =>
    setEditingTourism({
      id: '',
      category: 'attractions',
      title: '',
      subtitle: '',
      image: '',
      city: '',
      price: 0,
      currency: '₾',
      rating: 8.0,
      reviewCount: 0,
      tags: [],
      featured: false,
      badge: '',
    });

  const submitHotel = () => {
    if (!editingHotel?.name || !editingHotel.city) {
      _flash('სახელი და ქალაქი სავალდებულოა', setFeedback);
      return;
    }
    onSaveHotel(editingHotel);
    setEditingHotel(null);
    _flash(editingHotel.id ? 'სასტუმრო განახლდა' : 'სასტუმრო დამატებულია', setFeedback);
  };

  const submitTourism = () => {
    if (!editingTourism?.title || !editingTourism.city) {
      _flash('სათაური და ქალაქი სავალდებულოა', setFeedback);
      return;
    }
    onSaveTourism(editingTourism);
    setEditingTourism(null);
    _flash(editingTourism.id ? 'ტურისტული ობიექტი განახლდა' : 'ტურისტული ობიექტი დამატებულია', setFeedback);
  };

  const hotelFields = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          value={editingHotel?.name || ''}
          onChange={(e) => setEditingHotel((p) => ({ ...p!, name: e.target.value }))}
          placeholder="სასტუმროს სახელი"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
        <input
          value={editingHotel?.city || ''}
          onChange={(e) => setEditingHotel((p) => ({ ...p!, city: e.target.value }))}
          placeholder="ქალაქი"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input
          value={editingHotel?.district || ''}
          onChange={(e) => setEditingHotel((p) => ({ ...p!, district: e.target.value }))}
          placeholder="უბანი"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
        <input
          type="number"
          value={editingHotel?.stars || 0}
          onChange={(e) => setEditingHotel((p) => ({ ...p!, stars: Number(e.target.value) as any }))}
          placeholder="ვარსკვლავები"
          min={1}
          max={5}
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
        <input
          type="number"
          value={editingHotel?.pricePerNight || 0}
          onChange={(e) => setEditingHotel((p) => ({ ...p!, pricePerNight: Number(e.target.value) }))}
          placeholder="ფასი/ღამე"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input
          type="number"
          step="0.1"
          value={editingHotel?.rating || 0}
          onChange={(e) => setEditingHotel((p) => ({ ...p!, rating: Number(e.target.value) }))}
          placeholder="რეიტინგი"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
        <input
          type="number"
          value={editingHotel?.reviewCount || 0}
          onChange={(e) => setEditingHotel((p) => ({ ...p!, reviewCount: Number(e.target.value) }))}
          placeholder="შეფასებები"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
        <input
          value={editingHotel?.phone || ''}
          onChange={(e) => setEditingHotel((p) => ({ ...p!, phone: e.target.value }))}
          placeholder="ტელეფონი"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
      </div>
      <input
        value={editingHotel?.image || ''}
        onChange={(e) => setEditingHotel((p) => ({ ...p!, image: e.target.value }))}
        placeholder="მთავარი სურათის URL"
        className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
      />
      <textarea
        value={editingHotel?.description || ''}
        onChange={(e) => setEditingHotel((p) => ({ ...p!, description: e.target.value }))}
        placeholder="აღწერა"
        rows={3}
        className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
      />
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={editingHotel?.featured || false}
          onChange={(e) => setEditingHotel((p) => ({ ...p!, featured: e.target.checked }))}
          className="rounded"
        />
        <span className={`text-xs ${txtSub}`}>რეკომენდირებული</span>
      </div>
    </div>
  );

  const tourismFields = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          value={editingTourism?.title || ''}
          onChange={(e) => setEditingTourism((p) => ({ ...p!, title: e.target.value }))}
          placeholder="სათაური"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
        <input
          value={editingTourism?.city || ''}
          onChange={(e) => setEditingTourism((p) => ({ ...p!, city: e.target.value }))}
          placeholder="ქალაქი"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <select
          value={editingTourism?.category || 'attractions'}
          onChange={(e) => setEditingTourism((p) => ({ ...p!, category: e.target.value as TourismCategory }))}
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        >
          <option value="attractions">ადგილები</option>
          <option value="flights">ფრენები</option>
          <option value="trains">მატარებელი</option>
          <option value="concerts">კონცერტები</option>
        </select>
        <input
          type="number"
          value={editingTourism?.price || 0}
          onChange={(e) => setEditingTourism((p) => ({ ...p!, price: Number(e.target.value) }))}
          placeholder="ფასი"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
        <input
          value={editingTourism?.currency || '₾'}
          onChange={(e) => setEditingTourism((p) => ({ ...p!, currency: e.target.value }))}
          placeholder="ვალუტა"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input
          type="number"
          step="0.1"
          value={editingTourism?.rating || 0}
          onChange={(e) => setEditingTourism((p) => ({ ...p!, rating: Number(e.target.value) }))}
          placeholder="რეიტინგი"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
        <input
          type="number"
          value={editingTourism?.reviewCount || 0}
          onChange={(e) => setEditingTourism((p) => ({ ...p!, reviewCount: Number(e.target.value) }))}
          placeholder="შეფასებები"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
        <input
          value={editingTourism?.duration || ''}
          onChange={(e) => setEditingTourism((p) => ({ ...p!, duration: e.target.value }))}
          placeholder="ხანგრძლივობა"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
      </div>
      <input
        value={editingTourism?.subtitle || ''}
        onChange={(e) => setEditingTourism((p) => ({ ...p!, subtitle: e.target.value }))}
        placeholder="ქვესათაური"
        className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
      />
      <input
        value={editingTourism?.image || ''}
        onChange={(e) => setEditingTourism((p) => ({ ...p!, image: e.target.value }))}
        placeholder="სურათის URL"
        className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          value={editingTourism?.date_info || ''}
          onChange={(e) => setEditingTourism((p) => ({ ...p!, date_info: e.target.value }))}
          placeholder="თარიღი (მაგ: 15 ივნ - 22 ივნ)"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
        <input
          value={editingTourism?.time_info || ''}
          onChange={(e) => setEditingTourism((p) => ({ ...p!, time_info: e.target.value }))}
          placeholder="დრო (მაგ: 21:00)"
          className={`text-sm rounded-xl border px-3 py-2 w-full ${bgCard} ${brdCard} ${txtMain} outline-none focus:border-violet-400`}
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={editingTourism?.featured || false}
            onChange={(e) => setEditingTourism((p) => ({ ...p!, featured: e.target.checked }))}
            className="rounded"
          />
          <span className={`text-xs ${txtSub}`}>რეკომენდირებული</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center gap-2">
        {([
          { id: 'hotels', label: 'სასტუმროები', icon: Star },
          { id: 'tourism', label: 'ტურიზმი', icon: Compass },
        ] as { id: ServicesSubTab; label: string; icon: any }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => { setSub(t.id); setSearch(''); setEditingHotel(null); setEditingTourism(null); }}
            className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer ${
              sub === t.id
                ? 'bg-violet-600 text-white'
                : isDark
                ? 'bg-[#1A1A1E] text-gray-400 hover:bg-[#25252B]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + Add */}
      <div className={`rounded-2xl border p-3 ${bgCard} ${brdCard} flex items-center gap-2`}>
        <Search className={txtSub} size={15} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={sub === 'hotels' ? 'სასტუმროს ძებნა...' : 'ტურისტული ობიექტის ძებნა...'}
          className={`flex-1 bg-transparent text-sm outline-none ${txtMain} placeholder-gray-400`}
        />
        <button
          onClick={() => {
            if (sub === 'hotels') startNewHotel();
            else startNewTourism();
          }}
          className="flex items-center gap-1 text-[11px] font-semibold bg-violet-600 text-white px-3 py-1.5 rounded-xl hover:bg-violet-700 cursor-pointer transition-colors"
        >
          <Plus size={12} /> დამატება
        </button>
        <button
          onClick={onRefresh}
          className={`flex items-center gap-1 text-[11px] ${txtSub} hover:text-gray-900 cursor-pointer`}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          განახლება
        </button>
      </div>

      {/* Edit form */}
      {(editingHotel || editingTourism) && (
        <div className={`rounded-2xl border p-4 ${bgCard} ${brdCard} space-y-3`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-bold ${txtMain}`}>
              {editingHotel?.id ? 'სასტუმროს რედაქტირება' : 'ახალი სასტუმრო'}
              {editingTourism?.id ? 'ტურისტული ობიექტის რედაქტირება' : 'ახალი ტურისტული ობიექტი'}
            </h4>
            <button
              onClick={() => { setEditingHotel(null); setEditingTourism(null); }}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
          {editingHotel && hotelFields}
          {editingTourism && tourismFields}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => { setEditingHotel(null); setEditingTourism(null); }}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
            >
              გაუქმება
            </button>
            <button
              onClick={() => { if (editingHotel) submitHotel(); if (editingTourism) submitTourism(); }}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 cursor-pointer transition-colors font-semibold"
            >
              შენახვა
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`rounded-2xl border ${bgCard} ${brdCard} overflow-hidden`}>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={22} className="animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`text-[10px] font-bold uppercase tracking-wider ${txtSub} border-b ${isDark ? 'border-[#2A2A32]' : 'border-gray-100'}`}>
                  <th className="px-5 py-2.5">სახელი/სათაური</th>
                  <th className="px-5 py-2.5">ქალაქი</th>
                  <th className="px-5 py-2.5">კატეგორია</th>
                  <th className="px-5 py-2.5">ფასი</th>
                  <th className="px-5 py-2.5">სტატუსი</th>
                  <th className="px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {sub === 'hotels'
                  ? filteredHotels.map((h) => (
                      <tr
                        key={h.id}
                        className={`border-b last:border-0 ${isDark ? 'border-[#2A2A32]' : 'border-gray-50'} hover:${isDark ? 'bg-[#25252B]' : 'bg-gray-50/50'} transition-colors`}
                      >
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-2">
                            {h.image && (
                              <img src={h.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            )}
                            <div>
                              <span className={`text-xs font-semibold ${txtMain}`}>{h.name}</span>
                              {h.featured && <span className="ml-1 text-[10px] text-amber-500">★</span>}
                              <div className={`text-[10px] ${txtSub}`}>{h.stars}★ · {h.rating}</div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{h.city}{h.district ? `, ${h.district}` : ''}</td>
                        <td className={`px-5 py-2.5 text-xs ${txtSub}`}>სასტუმრო</td>
                        <td className={`px-5 py-2.5 text-xs ${txtMain} font-semibold`}>₾{h.pricePerNight}</td>
                        <td className="px-5 py-2.5">
                          <button
                            onClick={() => onToggleHotel(h.id, true)}
                            className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                              (h as any).is_active !== false
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {(h as any).is_active !== false ? 'აქტიური' : 'გამორთული'}
                          </button>
                        </td>
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingHotel(h)}
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="რედაქტირება"
                            >
                              <Pencil size={13} />
                            </button>
                            {confirmDelete === h.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="text-[10px] px-2 py-1 rounded-lg bg-gray-100 text-gray-600 cursor-pointer"
                                >
                                  გაუქმება
                                </button>
                                <button
                                  onClick={() => { onDeleteHotel(h.id); setConfirmDelete(null); }}
                                  className="text-[10px] px-2 py-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600 cursor-pointer"
                                >
                                  წაშლა
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(h.id)}
                                className="text-rose-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="წაშლა"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  : filteredTourism.map((t) => (
                      <tr
                        key={t.id}
                        className={`border-b last:border-0 ${isDark ? 'border-[#2A2A32]' : 'border-gray-50'} hover:${isDark ? 'bg-[#25252B]' : 'bg-gray-50/50'} transition-colors`}
                      >
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-2">
                            {t.image && (
                              <img src={t.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            )}
                            <div>
                              <span className={`text-xs font-semibold ${txtMain}`}>{t.title}</span>
                              {t.featured && <span className="ml-1 text-[10px] text-amber-500">★</span>}
                              <div className={`text-[10px] ${txtSub}`}>{t.rating ? `★ ${t.rating}` : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{t.city}</td>
                        <td className={`px-5 py-2.5 text-xs ${txtSub}`}>{t.category}</td>
                        <td className={`px-5 py-2.5 text-xs ${txtMain} font-semibold`}>
                          {t.price === 0 ? 'უფასო' : `${t.currency || '₾'}${t.price}`}
                        </td>
                        <td className="px-5 py-2.5">
                          <button
                            onClick={() => onToggleTourism(t.id, true)}
                            className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                              (t as any).is_active !== false
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {(t as any).is_active !== false ? 'აქტიური' : 'გამორთული'}
                          </button>
                        </td>
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingTourism(t)}
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="რედაქტირება"
                            >
                              <Pencil size={13} />
                            </button>
                            {confirmDelete === t.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="text-[10px] px-2 py-1 rounded-lg bg-gray-100 text-gray-600 cursor-pointer"
                                >
                                  გაუქმება
                                </button>
                                <button
                                  onClick={() => { onDeleteTourism(t.id); setConfirmDelete(null); }}
                                  className="text-[10px] px-2 py-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600 cursor-pointer"
                                >
                                  წაშლა
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(t.id)}
                                className="text-rose-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="წაშლა"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                {sub === 'hotels' && filteredHotels.length === 0 && (
                  <tr>
                    <td colSpan={6} className={`text-xs ${txtSub} text-center py-8`}>
                      სასტუმრო არ არის
                    </td>
                  </tr>
                )}
                {sub === 'tourism' && filteredTourism.length === 0 && (
                  <tr>
                    <td colSpan={6} className={`text-xs ${txtSub} text-center py-8`}>
                      ტურისტული ობიექტი არ არის
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
