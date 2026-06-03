import { UserProfile } from '../contexts/AuthContext';

export function getAgentDiscountedPrice(
  originalPrice: number,
  userProfile: UserProfile | null
): number {
  if (userProfile?.is_agent) {
    return originalPrice * 0.5; // 50% discount for agents
  }
  return originalPrice;
}

export function formatPrice(
  price: number,
  currency: 'GEL' | 'USD',
  userProfile: UserProfile | null
): string {
  const discountedPrice = getAgentDiscountedPrice(price, userProfile);
  const symbol = currency === 'GEL' ? '₾' : '$';
  
  if (discountedPrice >= 1000000) {
    return `${(discountedPrice / 1000000).toFixed(1)}M${symbol}`;
  }
  if (discountedPrice >= 1000) {
    return `${Math.round(discountedPrice / 1000)}K${symbol}`;
  }
  return `${discountedPrice}${symbol}`;
}
