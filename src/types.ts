export type ListingType = 'mortgage' | 'pledge' | 'rent' | 'daily_rent' | 'sale'; // იპოთეკა, გირავდება, ქირავდება, ქირავდება დღიურად, იყიდება
export type VipStatus = 'vip+' | 'super_vip' | 'standard';

export interface Author {
  name: string;
  phone: string;
  avatar: string;
  isAgent: boolean;
  listingCount: number;
}

export interface Comment {
  id: string;
  property_id?: string;
  user_id?: string;
  author: string;
  avatar?: string;
  text: string;
  date: string;
}

export interface Listing {
  id: string;
  title: string;
  type: ListingType;
  priceLari: number;
  priceUsd: number;
  location: string; // ე.გ. საჭილაოს ქუჩა
  district: string; // ე.გ. ნაძალადევი
  city: string; // ე.გ. თბილისი, ბათუმი
  rooms: string; // "10+", "4", "3"
  beds: number;
  area: number; // in m²
  vipStatus: VipStatus;
  image: string;
  images: string[];
  time: string; // e.g. "5 აგვ 9:17"
  author: Author;
  condition: string; // "ახალი რემონტით"
  status: string; // "ახალი აშენებული"
  descriptions: {
    ka: string;
    en: string;
    ru: string;
  };
  priceLevel: 'low' | 'cheap' | 'average' | 'high' | 'very_high'; // Gauge position
  comments: Comment[];
  coordinates: { x: number; y: number }; // Simulated map coordinates (percentages or visual points)
  lat?: number; // Real WGS-84 latitude (from map picker)
  lng?: number; // Real WGS-84 longitude (from map picker)
  viewCount?: number; // Number of unique views
}

export interface PaymentCard {
  id: string;
  number: string;
  expiry: string;
  cvc: string;
  type: 'visa' | 'mastercard' | 'amex' | 'standard_pay';
  cardholder: string;
  colorTheme: 'red-dark' | 'purple-dark' | 'bronze-glow' | 'silver-classic';
}

export type ActiveTab = 'explore' | 'detail' | 'profile' | 'favorites' | 'messages' | 'compare' | 'add_property' | 'admin' | 'terms' | 'privacy' | 'tourism' | 'hotels' | 'hotel_detail' | 'tourism_detail';
export type ProfileSubTab = 'balance_view' | 'balance_refill' | 'payment_methods' | 'my_listings';
