import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, Search, X, Wand2, Building2, Banknote, BedDouble, MapPin } from 'lucide-react';

interface ParsedQuery {
 city?: string;
 district?: string;
 rooms?: number;
 minPrice?: number;
 maxPrice?: number;
 type?: 'sale' | 'rent' | 'mortgage' | 'pledge';
 keywords: string[];
}

interface SmartSearchAIProps {
 cities: string[];
 districts: string[];
 onSearch: (parsed: ParsedQuery) => void;
}

const EXAMPLES = [
 '3 ოთახიანი ბათუმში 80000 ლარამდე',
 '2-ოთახიანი თბილისში ქირავდება',
 'იპოთეკა საბურთალოზე 100000 ლარამდე',
 '4 ოთახიანი ახალი რემონტით',
];

const CITY_NAMES = ['თბილისი', 'ბათუმი', 'ქობულეთი', 'ქუთაისი', 'გორი', 'რუსთავი', 'ზუგდიდი', 'ფოთი'];
const DISTRICT_NAMES = ['საბურთალო', 'ვაკე', 'დიდუბე', 'ნაძალადევი', 'სანზონა', 'გლდანი', 'ისანი', 'ოკრიბა', 'ბათუმი-ცენტრი', 'ახალსოფელი'];

function parseNaturalQuery(query: string): ParsedQuery {
 const q = query.toLowerCase().replace(/[₾$ლ]/g, '').trim();
 const result: ParsedQuery = { keywords: [] };

 // Type detection
 if (/ქირავ|ქირა|rent/i.test(q)) result.type = 'rent';
 else if (/იყიდ|ყიდვა|sale/i.test(q)) result.type = 'sale';
 else if (/იპოთეკ|იპოთ|mortgage/i.test(q)) result.type = 'mortgage';
 else if (/გირაო|pledge/i.test(q)) result.type = 'pledge';

 // City detection
 for (const city of CITY_NAMES) {
 if (q.includes(city.toLowerCase())) { result.city = city; break; }
 }

 // District detection
 for (const district of DISTRICT_NAMES) {
 if (q.includes(district.toLowerCase())) { result.district = district; break; }
 }

 // Rooms detection
 const roomMatch = q.match(/(\d)\s*ოთახ/i);
 if (roomMatch) result.rooms = parseInt(roomMatch[1], 10);

 // Price detection — handles various formats
 const pricePatterns = [
 /(\d{3,6})\s*ლარ/i,
 /(\d{3,6})\s*დოლ/i,
 /(\d{3,6})\s*დოლარ/i,
 /(\d{3,6})\s*მდე/i,
 /მაქს\s*(\d{3,6})/i,
 /დაბლა\s*(\d{3,6})/i,
 /(\d{3,6})\s*გელ/i,
 /(\d{3,6})\s*usd/i,
 ];
 for (const pattern of pricePatterns) {
 const match = q.match(pattern);
 if (match) {
  result.maxPrice = parseInt(match[1].replace(/\s/g, ''), 10);
  break;
 }
 }

 // Min price
 const minMatch = q.match(/მინ\s*(\d{3,6})/i) || q.match(/მინიმ\s*(\d{3,6})/i) || q.match(/ზემოთ\s*(\d{3,6})/i);
 if (minMatch) result.minPrice = parseInt(minMatch[1], 10);

 // Extract remaining meaningful words as keywords
 const stopWords = new Set(['მინდა', 'ვეძებ', 'მაქვს', 'გთხოვ', 'გთხოვთ', 'გთხოვთ', 'გთხოვ', 'თუ', 'რომ', 'და', 'ან', 'თუ', 'არის', 'რომელიც', 'ეს', 'ის', 'მე', 'შენ']);
 result.keywords = q.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w));

 return result;
}

export { parseNaturalQuery };
export type { ParsedQuery };

export default function SmartSearchAI({ cities, districts, onSearch }: SmartSearchAIProps) {
 const [query, setQuery] = useState('');
 const [parsed, setParsed] = useState<ParsedQuery | null>(null);
 const [showExamples, setShowExamples] = useState(false);
 const [focused, setFocused] = useState(false);
 const inputRef = useRef<HTMLInputElement>(null);

 const handleParse = useCallback(() => {
 if (!query.trim()) { setParsed(null); return; }
 const result = parseNaturalQuery(query);
 setParsed(result);
 }, [query]);

 useEffect(() => {
 const timer = setTimeout(handleParse, 300);
 return () => clearTimeout(timer);
 }, [handleParse]);

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!parsed) return;
 onSearch(parsed);
 setShowExamples(false);
 };

 const applyExample = (example: string) => {
 setQuery(example);
 setShowExamples(false);
 inputRef.current?.focus();
 };

 const hasFilters = parsed && (parsed.city || parsed.district || parsed.rooms || parsed.maxPrice || parsed.type);

 return (
 <div className="relative">
  <form onSubmit={handleSubmit} className="relative">
  {/* Main input — pill style, integrated with chips */}
  <div className={`flex items-center gap-2 bg-white rounded-full border transition-all ${
   focused ? 'border-ss-primary shadow-md' : 'border-gray-200'
  }`}>
   <div className="pl-4 shrink-0">
   <Wand2 size={16} className="text-ss-primary" />
   </div>

   {/* Inline chips appear inside input when parsed */}
   {hasFilters ? (
   <div className="flex items-center gap-1 flex-1 overflow-x-auto py-2.5 no-scrollbar">
    {parsed.type && (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-100 text-violet-700 shrink-0">
     <Building2 size={9} />
     {parsed.type === 'sale' ? 'იყიდება' : parsed.type === 'rent' ? 'ქირავდება' : parsed.type === 'mortgage' ? 'იპოთეკა' : 'გირაო'}
    </span>
    )}
    {parsed.city && (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700 shrink-0">
     <MapPin size={9} />
     {parsed.city}
    </span>
    )}
    {parsed.rooms && (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-100 text-sky-700 shrink-0">
     <BedDouble size={9} />
     {parsed.rooms} ოთახი
    </span>
    )}
    {parsed.maxPrice && (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-700 shrink-0">
     <Banknote size={9} />
     {parsed.maxPrice.toLocaleString()} ლარამდე
    </span>
    )}
    {/* Input after chips */}
    <input
    ref={inputRef}
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onFocus={() => { setFocused(true); setShowExamples(true); }}
    onBlur={() => setTimeout(() => setFocused(false), 200)}
    placeholder=""
    className="flex-1 min-w-[80px] text-sm text-gray-900 focus:outline-none bg-transparent py-1"
    />
   </div>
   ) : (
   <input
    ref={inputRef}
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onFocus={() => { setFocused(true); setShowExamples(true); }}
    onBlur={() => setTimeout(() => setFocused(false), 200)}
    placeholder="მაგ. 3 ოთახიანი ბათუმში 80000 ლარამდე..."
    className="flex-1 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
   />
   )}

   {query && (
   <button type="button" onClick={() => setQuery('')} className="p-1.5 text-gray-400 hover:text-gray-600 shrink-0">
    <X size={14} />
   </button>
   )}

   {/* Subtle submit */}
   <button
   type="submit"
   disabled={!hasFilters}
   className="mr-1.5 p-2 rounded-full bg-ss-primary hover:bg-ss-primary-dark disabled:bg-gray-200 text-white transition-colors cursor-pointer shrink-0"
   >
   <Sparkles size={14} />
   </button>
  </div>

  {/* Examples — horizontal chips */}
  {showExamples && !query && focused && (
   <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-3 z-50">
   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">სცადეთ ეს მაგალითები</p>
   <div className="flex flex-wrap gap-1.5">
    {EXAMPLES.map((ex, i) => (
    <button
     key={i}
     type="button"
     onMouseDown={(e) => e.preventDefault()}
     onClick={() => applyExample(ex)}
     className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-colors cursor-pointer"
    >
     {ex}
    </button>
    ))}
   </div>
   </div>
  )}
  </form>
 </div>
 );
}
