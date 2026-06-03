import React from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import { Listing } from '../types';
import { getListingCoords } from '../utils/geocode';

delete (L.Icon.Default.prototype as any)._getIconUrl;

interface ListingMapProps {
  listing: Listing;
  currency: 'GEL' | 'USD';
}

export default function ListingMap({ listing, currency }: ListingMapProps) {
  const coords = getListingCoords(listing.city, listing.id, listing.lat, listing.lng);
  const price = currency === 'GEL' ? listing.priceLari : listing.priceUsd;
  const sym = currency === 'GEL' ? '₾' : '$';
  const priceStr =
    price >= 1_000_000
      ? `${(price / 1_000_000).toFixed(1)}M${sym}`
      : price >= 1_000
        ? `${Math.round(price / 1_000)}K${sym}`
        : `${price}${sym}`;

  const pin = L.divIcon({
    className: '',
    html: `<div style="background:#6D28D9;color:#fff;padding:5px 11px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 3px 10px rgba(109,40,217,0.45);border:2px solid rgba(255,255,255,0.5)">${priceStr}</div>`,
    iconAnchor: [priceStr.length * 4 + 8, 16],
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
          <MapPin size={14} className="text-ss-primary" />
          ადგილმდებარეობა
        </h4>
        <span className="text-[11px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
          {[listing.district, listing.city].filter(Boolean).join(', ')}
        </span>
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 280 }}>
        <MapContainer
          center={coords}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl
          scrollWheelZoom={false}
          dragging
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
          <Marker position={coords} icon={pin}>
            <Popup closeButton={false} maxWidth={220}>
              <div style={{ fontFamily: 'system-ui, sans-serif', minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#111', marginBottom: 4 }}>{listing.title}</div>
                {listing.location && (
                  <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>{listing.location}</div>
                )}
                <div style={{ fontSize: 16, fontWeight: 900, color: '#6D28D9' }}>{priceStr}</div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <p className="text-[10px] text-gray-400 mt-2 text-center">
        * ადგილმდებარეობა სავარაუდოა — ზუსტი მისამართი გამყიდველთან
      </p>
    </div>
  );
}
