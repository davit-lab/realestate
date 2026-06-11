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
  user_id?: string; // Auth user id who created the listing
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

export type ActiveTab = 'explore' | 'detail' | 'profile' | 'favorites' | 'messages' | 'add_property' | 'admin' | 'terms' | 'privacy' | 'tourism' | 'hotels' | 'hotel_detail' | 'tourism_detail';
export type ProfileSubTab = 'balance_view' | 'balance_refill' | 'payment_methods' | 'my_listings';

// ── Admin Panel Types ──
export type AdminSubTab = 'dashboard' | 'listings' | 'users' | 'transactions' | 'packages' | 'chats' | 'support' | 'templates' | 'site';

export type TransactionType = 'refill' | 'deduct' | 'package_purchase' | 'package_refund' | 'listing_fee';

export interface AdminTransaction {
  id: string;
  user_id: string;
  user_name?: string;
  amount: number;
  type: TransactionType;
  description: string;
  admin_id?: string;
  created_at: string;
}

export interface UserPackage {
  id: string;
  user_id: string;
  user_name?: string;
  package_type: 'vip' | 'vip_plus' | 'super_vip';
  listings_remaining: number;
  total_listings: number;
  assigned_by?: string;
  expires_at?: string;
  created_at: string;
}

export interface SupportTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  content: string;
  is_active: boolean;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
}

export interface AdminAuditEntry {
  id: string;
  admin_id: string;
  action: string;
  target_user_id?: string;
  details: string;
  created_at: string;
}

export interface AdminUserExtended {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  phone: string;
  balance: number;
  is_admin: boolean;
  is_agent: boolean;
  created_at: string;
  last_sign_in_at?: string;
  user_created_at?: string;
}

export interface AdminChat {
  id: string;
  participant_ids: string[];
  participant_names: string[];
  last_message: string;
  last_sent_at: string;
  unread_count: number;
  type: 'user_chat' | 'support' | 'ai_chat';
}

export interface AdminStats {
  totalListings: number;
  totalUsers: number;
  totalBalance: number;
  recentListings: number;
  totalRevenue: number;
  totalTransactions: number;
  openTickets: number;
  activePackages: number;
}

// ── Profile System Types ──
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type DocType = 'id_card' | 'passport' | 'license';

export interface ProfileVerification {
  id: string;
  user_id: string;
  doc_type: DocType;
  front_image_url: string;
  back_image_url: string;
  status: VerificationStatus;
  admin_note: string;
  submitted_at: string;
  reviewed_at: string;
  reviewed_by: string;
}

export interface PaymentCardDB {
  id: string;
  user_id: string;
  last4: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'standard_pay';
  expiry_month: string;
  expiry_year: string;
  cardholder_name: string;
  is_default: boolean;
  created_at: string;
}

export interface ProfileViewEntry {
  id: string;
  viewed_profile_id: string;
  viewer_id: string | null;
  viewer_ip_hash: string | null;
  viewed_at: string;
  viewer_name?: string;
  viewer_avatar?: string;
}

export interface ListingViewEntry {
  id: string;
  listing_id: string;
  viewer_id: string | null;
  viewer_ip_hash: string | null;
  viewed_at: string;
}

export interface ProfileActivity {
  user_id: string;
  date: string;
  profile_views_count: number;
  listings_views_count: number;
  new_messages: number;
}

export interface ViewStats {
  totalProfileViews: number;
  totalListingViews: number;
  todayProfileViews: number;
  todayListingViews: number;
  recentViewers: ProfileViewEntry[];
  activityData: ProfileActivity[];
}

// ── Booking Types ──
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  user_id: string;
  item_id: string;
  item_type: 'hotel' | 'tourism';
  item_name: string;
  item_image?: string;
  guest_name: string;
  email?: string;
  phone?: string;
  check_in?: string;
  check_out?: string;
  guests: number;
  details?: string;
  status: BookingStatus;
  created_at: string;
}
