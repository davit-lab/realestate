import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Search, MapPin, Loader2, X, CheckCircle } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;

const pinIcon = L.divIcon({
 className: '',
 html: `<div style="position:relative;width:28px;height:36px">
 <div style="width:24px;height:24px;background:#6D28D9;border-radius:50%;border:3px solid white;box-shadow:0 3px 10px rgba(109,40,217,0.5);position:absolute;top:0;left:2px"></div>
 <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:13px solid #6D28D9"></div>
 </div>`,
 iconAnchor: [14, 36],
 iconSize: [28, 36],
});

interface NominatimResult {
 place_id: number;
 display_name: string;
 lat: string;
 lon: string;
 address?: {
 road?: string;
 suburb?: string;
 city?: string;
 town?: string;
 village?: string;
 county?: string;
 };
}

interface LocationPickerProps {
 onPick: (lat: number, lng: number, address: string) => void;
 initialLat?: number;
 initialLng?: number;
 initialAddress?: string;
}

function FlyTo({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
 const map = useMap();
 const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
 useEffect(() => {
 map.flyTo([lat, lng], zoom, { duration: 0.8 });
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [key]);
 return null;
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
 useMapEvents({
 click(e) {
  onMapClick(e.latlng.lat, e.latlng.lng);
 },
 });
 return null;
}

export default function LocationPicker({ onPick, initialLat, initialLng, initialAddress }: LocationPickerProps) {
 const defaultCenter: [number, number] = [41.7151, 44.8271];

 const [query, setQuery] = useState('');
 const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
 const [loading, setLoading] = useState(false);
 const [marker, setMarker] = useState<[number, number] | null>(
 initialLat != null && initialLng != null ? [initialLat, initialLng] : null
 );
 const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number } | null>(
 initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng, zoom: 15 } : null
 );
 const [pickedAddress, setPickedAddress] = useState(initialAddress || '');
 const [reverseLoading, setReverseLoading] = useState(false);

 const searchNominatim = async () => {
 const q = query.trim();
 if (!q) return;
 setLoading(true);
 setSuggestions([]);
 try {
  const res = await fetch(
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&accept-language=ka,en&countrycodes=ge`,
  { headers: { 'Accept': 'application/json' } }
  );
  const data: NominatimResult[] = await res.json();
  setSuggestions(data);
 } catch {
  // network error
 } finally {
  setLoading(false);
 }
 };

 const handleSelect = (result: NominatimResult) => {
 const lat = parseFloat(result.lat);
 const lng = parseFloat(result.lon);
 const parts = result.display_name.split(',').slice(0, 3).join(',');
 setMarker([lat, lng]);
 setFlyTo({ lat, lng, zoom: 16 });
 setPickedAddress(parts);
 setSuggestions([]);
 setQuery(parts);
 onPick(lat, lng, parts);
 };

 const handleMapClick = async (lat: number, lng: number) => {
 setMarker([lat, lng]);
 setReverseLoading(true);
 try {
  const res = await fetch(
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ka,en`,
  { headers: { 'Accept': 'application/json' } }
  );
  const data = await res.json();
  const addr = data.address;
  const short = [addr?.road, addr?.suburb, addr?.city || addr?.town || addr?.village || addr?.county]
  .filter(Boolean).join(', ');
  const display = short || data.display_name?.split(',').slice(0, 2).join(',') || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  setPickedAddress(display);
  setQuery(display);
  onPick(lat, lng, display);
 } catch {
  const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  setPickedAddress(fallback);
  setQuery(fallback);
  onPick(lat, lng, fallback);
 } finally {
  setReverseLoading(false);
 }
 };

 return (
 <div className="space-y-2">
  {/* Search bar */}
  <div className="relative">
  <div className="flex gap-2">
   <div className="relative flex-1">
   <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
   <input
    type="text"
    value={query}
    onChange={e => { setQuery(e.target.value); if (!e.target.value) setSuggestions([]); }}
    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); searchNominatim(); } }}
    placeholder="ეძებეთ მისამართი..."
    className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-8 text-[13px] text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-ss-primary/20 transition-all"
   />
   {query && (
    <button
    type="button"
    onClick={() => { setQuery(''); setSuggestions([]); }}
    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
    >
    <X size={11} />
    </button>
   )}
   </div>
   <button
   type="button"
   onClick={searchNominatim}
   disabled={loading}
   className="bg-gray-900 hover:bg-gray-800 text-white text-[12px] font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-60"
   >
   {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
   ძებნა
   </button>
  </div>

  {/* Suggestions dropdown */}
  {suggestions.length > 0 && (
   <div className="absolute left-0 right-10 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-[2000] overflow-hidden">
   {suggestions.map((s) => (
    <button
    key={s.place_id}
    type="button"
    onClick={() => handleSelect(s)}
    className="w-full text-left px-3.5 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-start gap-2 cursor-pointer transition-colors"
    >
    <MapPin size={11} className="text-ss-primary mt-0.5 shrink-0" />
    <span className="line-clamp-2 leading-relaxed">{s.display_name}</span>
    </button>
   ))}
   </div>
  )}
  </div>

  {/* Map */}
  <div
  className="rounded-xl overflow-hidden border border-gray-200/80 shadow-inner"
  style={{ height: 300 }}
  >
  <MapContainer
   center={marker ?? defaultCenter}
   zoom={marker ? 15 : 11}
   style={{ height: '100%', width: '100%' }}
   scrollWheelZoom
   zoomControl
  >
   <TileLayer
   url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
   attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; CARTO'
   subdomains="abcd"
   maxZoom={19}
   />
   {flyTo && <FlyTo lat={flyTo.lat} lng={flyTo.lng} zoom={flyTo.zoom} />}
   <ClickHandler onMapClick={handleMapClick} />
   {marker && <Marker position={marker} icon={pinIcon} />}
  </MapContainer>
  </div>

  {/* Picked address display */}
  {marker && (
  <div className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-[12px] transition-all ${
   reverseLoading
   ? 'bg-gray-50 border border-gray-200 text-gray-500'
   : 'bg-purple-50 border border-purple-200 text-ss-primary'
  }`}>
   {reverseLoading
   ? <Loader2 size={13} className="animate-spin shrink-0 mt-0.5 text-gray-400" />
   : <CheckCircle size={13} className="shrink-0 mt-0.5 text-ss-primary" />
   }
   <span className="font-medium leading-relaxed">
   {reverseLoading ? 'მისამართი იძებნება...' : pickedAddress || `${marker[0].toFixed(5)}, ${marker[1].toFixed(5)}`}
   </span>
  </div>
  )}

  {/* Hint */}
  {!marker && (
  <p className="text-[11px] text-gray-400 text-center py-1">
   🗺️ ეძებეთ მისამართი ან დააწკაპუნეთ რუკაზე პინის მისათითებლად
  </p>
  )}
 </div>
 );
}
