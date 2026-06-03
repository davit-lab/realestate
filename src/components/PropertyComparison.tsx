import React from 'react';
import { X, ArrowLeftRight, Check, Sparkles, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Listing } from '../types';

interface PropertyComparisonProps {
  compareIds: string[];
  listings: Listing[];
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
  currency: 'GEL' | 'USD';
  onCardClick: (id: string) => void;
  onDirectMessage: (listingId: string, authorName: string) => void;
  onClose: () => void;
}

export default function PropertyComparison({
  compareIds,
  listings,
  onRemoveFromCompare,
  onClearCompare,
  currency,
  onCardClick,
  onDirectMessage,
  onClose,
}: PropertyComparisonProps) {
  const compareListings = listings.filter((l) => compareIds.includes(l.id));

  const currencySymbol = currency === 'GEL' ? '₾' : '$';

  // Helper to format price
  const formatPrice = (listing: Listing) => {
    const val = currency === 'GEL' ? listing.priceLari : listing.priceUsd;
    return `${val.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${currencySymbol}`;
  };

  // Helper to calculate price per sq meter
  const formatPricePerSqM = (listing: Listing) => {
    const price = currency === 'GEL' ? listing.priceLari : listing.priceUsd;
    return `${Math.round(price / listing.area).toLocaleString()} ${currencySymbol}/მ²`;
  };

  // Identify best values for specs
  // e.g. lowest price, largest area
  const pricesLari = compareListings.map(l => l.priceLari);
  const minPriceLari = pricesLari.length > 0 ? Math.min(...pricesLari) : 0;

  const areas = compareListings.map(l => l.area);
  const maxArea = areas.length > 0 ? Math.max(...areas) : 0;

  return (
    <div className="bg-white rounded-lg border border-ss-border p-5 premium-card-shadow font-sans text-xs text-ss-slate" id="comparison-hub">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ss-border pb-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-ss-primary/10 text-ss-primary rounded-sm">
            <ArrowLeftRight size={16} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-ss-charcoal uppercase tracking-wider">განცხადებების შედარება</h4>
            <p className="text-[10px] text-ss-slate">შეადარეთ უძრავი ქონების პარამეტრები და ფასები გვერდიგვერდ</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onClearCompare}
            className="px-3.5 py-1.5 rounded-sm border border-ss-border hover:bg-ss-bg-pale text-[11px] font-bold text-ss-slate transition-all cursor-pointer"
          >
            სიის გასუფთავება
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-sm bg-ss-primary hover:bg-ss-primary-dark text-white text-[11px] font-bold transition-all cursor-pointer"
          >
            დაბრუნება
          </button>
        </div>
      </div>

      {compareListings.length === 0 ? (
        <div className="text-center py-16">
          <ArrowLeftRight size={44} className="mx-auto text-ss-primary mb-3.5 opacity-25" />
          <h5 className="font-bold text-ss-charcoal text-xs mb-1.5">შედარების პირველადი სია ცარიელია</h5>
          <p className="max-w-xs mx-auto text-[11px] text-ss-slate leading-relaxed">
            მონიშნეთ "შედარება" ღილაკი განცხადებებზე ძებნის გვერდიდან, რათა დაამატოთ ისინი შედარების ცხრილში.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <table className="w-full border-collapse" id="comparison-matrix-table">
            <thead>
              <tr>
                <th className="p-3 text-left font-bold text-ss-charcoal border-b border-ss-border bg-ss-bg-pale/50 w-44 rounded-tl-lg">
                  პარამეტრები
                </th>
                {compareListings.map((listing) => (
                  <th key={listing.id} className="p-3 text-left border-b border-ss-border bg-ss-bg-pale/35 relative min-w-[210px]">
                    <button
                      onClick={() => onRemoveFromCompare(listing.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-full transition-all cursor-pointer"
                      title="წაშლა შედარებიდან"
                    >
                      <X size={12} />
                    </button>
                    
                    <div className="flex gap-2.5 items-start pt-2">
                      <div className="w-12 h-12 rounded-sm overflow-hidden bg-ss-bg-light border border-ss-border shrink-0 cursor-pointer" onClick={() => onCardClick(listing.id)}>
                        <img src={listing.image} alt="Housing mini" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="pr-5">
                        <span className="text-[10px] font-bold text-ss-primary uppercase tracking-wide">{listing.district}</span>
                        <h5 
                          className="font-bold text-ss-charcoal line-clamp-2 leading-tight select-none cursor-pointer hover:text-ss-primary transition-all text-[11px] mt-0.5"
                          onClick={() => onCardClick(listing.id)}
                        >
                          {listing.title}
                        </h5>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ss-border text-ss-slate font-semibold">
              {/* Category / Type row */}
              <tr className="hover:bg-ss-bg-pale/30">
                <td className="p-3 bg-ss-bg-pale/60 text-ss-charcoal font-bold border-r border-ss-border">გარიგების ტიპი</td>
                {compareListings.map((listing) => (
                  <td key={listing.id} className="p-3 text-ss-charcoal font-bold uppercase text-[10px]">
                    {listing.type === 'sale' ? 'იყიდება' : listing.type === 'rent' ? 'ქირავდება' : listing.type === 'pledge' ? 'გირაოვდება' : 'იპოთეკა'}
                  </td>
                ))}
              </tr>

              {/* Price row */}
              <tr className="hover:bg-ss-bg-pale/30">
                <td className="p-3 bg-ss-bg-pale/60 text-ss-charcoal font-bold border-r border-ss-border">ფასი</td>
                {compareListings.map((listing) => {
                  const isBest = listing.priceLari === minPriceLari;
                  return (
                    <td key={listing.id} className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-bold ${isBest ? 'text-emerald-600' : 'text-ss-charcoal'}`}>
                          {formatPrice(listing)}
                        </span>
                        {isBest && (
                          <span className="bg-emerald-50 text-emerald-600 text-[9px] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-0.5">
                            <Sparkles size={10} />
                            <span>საუკეთესო ძებნაში</span>
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Price per SqM */}
              <tr className="hover:bg-ss-bg-pale/30">
                <td className="p-3 bg-ss-bg-pale/60 text-ss-charcoal font-bold border-r border-ss-border">კვადრატულის ფასი</td>
                {compareListings.map((listing) => (
                  <td key={listing.id} className="p-3 text-ss-charcoal font-mono text-[11px]">
                    {formatPricePerSqM(listing)}
                  </td>
                ))}
              </tr>

              {/* Area */}
              <tr className="hover:bg-ss-bg-pale/30">
                <td className="p-3 bg-ss-bg-pale/60 text-ss-charcoal font-bold border-r border-ss-border">ფართობი (მ²)</td>
                {compareListings.map((listing) => {
                  const isBest = listing.area === maxArea;
                  return (
                    <td key={listing.id} className="p-3">
                      <span className={`font-bold ${isBest ? 'text-ss-primary' : 'text-ss-charcoal'}`}>
                        {listing.area} მ²
                      </span>
                      {isBest && <span className="text-[10px] text-ss-primary ml-1">(ყველაზე დიდი)</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Rooms & Beds */}
              <tr className="hover:bg-ss-bg-pale/30">
                <td className="p-3 bg-ss-bg-pale/60 text-ss-charcoal font-bold border-r border-ss-border">ოთახები / საძინებელი</td>
                {compareListings.map((listing) => (
                  <td key={listing.id} className="p-3 text-ss-charcoal">
                    <span>{listing.rooms} ოთახი • {listing.beds} საძინებელი</span>
                  </td>
                ))}
              </tr>

              {/* Condition */}
              <tr className="hover:bg-ss-bg-pale/30">
                <td className="p-3 bg-ss-bg-pale/60 text-ss-charcoal font-bold border-r border-ss-border">სარემონტო მდგომარეობა</td>
                {compareListings.map((listing) => (
                  <td key={listing.id} className="p-3 font-semibold text-ss-charcoal text-[11px]">
                    {listing.condition}
                  </td>
                ))}
              </tr>

              {/* Status */}
              <tr className="hover:bg-ss-bg-pale/30">
                <td className="p-3 bg-ss-bg-pale/60 text-ss-charcoal font-bold border-r border-ss-border">შენობის ტიპი სტატუსი</td>
                {compareListings.map((listing) => (
                  <td key={listing.id} className="p-3 text-ss-slate text-[11px]">
                    {listing.status}
                  </td>
                ))}
              </tr>

              {/* Location Address */}
              <tr className="hover:bg-ss-bg-pale/30">
                <td className="p-3 bg-ss-bg-pale/60 text-ss-charcoal font-bold border-r border-ss-border">ადგილმდებარეობა</td>
                {compareListings.map((listing) => (
                  <td key={listing.id} className="p-3 text-[11px] leading-relaxed">
                    <span className="block font-bold text-ss-charcoal">{listing.city}</span>
                    <span className="block text-ss-slate opacity-85 mt-0.5">{listing.location}</span>
                  </td>
                ))}
              </tr>

              {/* Action and Contact row */}
              <tr className="bg-ss-bg-pale/40">
                <td className="p-4 bg-ss-bg-pale/60 text-ss-charcoal font-bold border-r border-ss-border rounded-bl-lg">მოქმედებები</td>
                {compareListings.map((listing) => (
                  <td key={listing.id} className="p-4">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => onCardClick(listing.id)}
                        className="w-full bg-ss-primary hover:bg-ss-primary-dark text-white py-1.5 rounded-sm font-bold text-[10px] text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        განცხადების ნახვა
                        <ArrowRight size={10} />
                      </button>
                      <button
                        onClick={() => onDirectMessage(listing.id, listing.author.name)}
                        className="w-full bg-ss-accent hover:bg-ss-accent-light text-ss-charcoal py-1.5 rounded-sm font-bold text-[10px] text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <MessageCircle size={10} />
                        დასვით კითხვა
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {compareListings.length > 0 && (
        <div className="mt-5 border-t border-ss-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-ss-slate">
          <div className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>საბაზისო მონაცემები სრულად შესაბამისია რეესტრის კატალოგებთან.</span>
          </div>
          <span className="font-semibold text-ss-primary">Adjarahome.ge შედარების ინსტრუმენტი 2026</span>
        </div>
      )}
    </div>
  );
}
