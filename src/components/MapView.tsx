import React, { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Listing } from '../types';
import { getListingCoords, getCityCoords } from '../utils/geocode';
import { useAuth } from '../contexts/AuthContext';
import { getAgentDiscountedPrice } from '../utils/pricing';

delete (L.Icon.Default.prototype as any)._getIconUrl;

const TYPE_COLORS: Record<string, { bg: string; label: string }> = {
  sale:       { bg: '#6D28D9', label: 'იყიდება' },
  rent:       { bg: '#047857', label: 'ქირავდება' },
  daily_rent: { bg: '#0891B2', label: 'დღიურად' },
  mortgage:   { bg: '#0369A1', label: 'იპოთეკა' },
  pledge:     { bg: '#B45309', label: 'გირავდება' },
};

interface MapViewProps {
  listings: Listing[];
  favorites: string[];
  currency: 'GEL' | 'USD';
  onListingClick: (id: string) => void;
  onFavoriteToggle: (id: string, e: React.MouseEvent) => void;
}

function priceLabel(listing: Listing, currency: 'GEL' | 'USD', userProfile: any): string {
  const basePrice = currency === 'GEL' ? listing.priceLari : listing.priceUsd;
  const price = getAgentDiscountedPrice(basePrice, userProfile);
  const sym = currency === 'GEL' ? '₾' : '$';
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M${sym}`;
  if (price >= 1000)    return `${Math.round(price / 1000)}K${sym}`;
  return `${price}${sym}`;
}

function AutoFit({ listings }: { listings: Listing[] }) {
  const map = useMap();
  const key = listings.map(l => l.id).join(',');
  useEffect(() => {
    if (!listings.length) return;
    const coords = listings.map(l => getListingCoords(l.city, l.id));
    if (coords.length === 1) {
      map.setView(coords[0], 14);
    } else {
      map.fitBounds(coords as [number, number][], { padding: [60, 60], maxZoom: 15 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export default function MapView({
  listings,
  currency,
  onListingClick,
}: MapViewProps) {
  const { profile } = useAuth();
  const [filterType, setFilterType] = React.useState('all');
  const visible = filterType === 'all' ? listings : listings.filter(l => l.type === filterType);
  const defaultCenter: [number, number] = [41.7151, 44.8271];

  return (
    <div className="w-full h-full relative">
      {/* Type filter pills — float above map */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-1 shadow-md">
        {([
          { v: 'all',        l: 'ყველა' },
          { v: 'sale',       l: 'იყიდება' },
          { v: 'rent',       l: 'ქირავდება' },
          { v: 'daily_rent', l: 'დღიურად' },
          { v: 'mortgage',   l: 'იპოთეკა' },
          { v: 'pledge',     l: 'გირავდება' },
        ] as const).map(({ v, l }) => (
          <button
            key={v}
            onClick={() => setFilterType(v)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
              filterType === v
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Count badge */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm border border-gray-200 shadow-md rounded-full px-3 py-1.5 text-[11px] font-semibold text-gray-600">
        📍 {visible.length} განცხადება
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        zoomControl
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        <AutoFit listings={visible} />

        {visible.map(listing => {
          const coords = getListingCoords(listing.city, listing.id, listing.lat, listing.lng);
          const color = TYPE_COLORS[listing.type]?.bg ?? '#6D28D9';
          const label = priceLabel(listing, currency, profile);
          const icon = L.divIcon({
            className: '',
            html: `<div style="background:${color};color:#fff;padding:4px 9px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid rgba(255,255,255,0.4);cursor:pointer">${label}</div>`,
            iconAnchor: [label.length * 3.8 + 10, 14],
          });

          return (
            <Marker key={listing.id} position={coords} icon={icon}>
              <Popup
                maxWidth={260}
                minWidth={220}
                closeButton={false}
                className="leaflet-listing-popup"
              >
                <div style={{ fontFamily: 'system-ui, sans-serif', padding: 0 }}>
                  <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
                    <img
                      src={listing.image}
                      alt={listing.title}
                      referrerPolicy="no-referrer"
                      style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', top: 6, left: 6, background: color, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6 }}>
                      {TYPE_COLORS[listing.type]?.label}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 3, lineHeight: 1.3 }}>{listing.title}</div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 8 }}>
                    {[listing.district, listing.city].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: color, lineHeight: 1 }}>{label}</div>
                      {listing.area > 0 && (
                        <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
                          {Math.round((currency === 'GEL' ? listing.priceLari : listing.priceUsd) / listing.area).toLocaleString()}{currency === 'GEL' ? '₾' : '$'}/მ²
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onListingClick(listing.id)}
                      style={{ background: color, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      ნახვა →
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, borderTop: '1px solid #F3F4F6', paddingTop: 8, fontSize: 11, color: '#6B7280' }}>
                    <span>{listing.rooms} ოთახი</span>
                    <span>{listing.area} მ²</span>
                    <span>{listing.condition}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
