import { useEffect } from 'react';

const VIEWED_LISTINGS_KEY = 'adjarahome_viewed_listings';

export function useViewTracker(listingId: string) {
  useEffect(() => {
    // Get previously viewed listings from localStorage
    const viewedListings = JSON.parse(localStorage.getItem(VIEWED_LISTINGS_KEY) || '[]');
    
    // Check if this listing has already been viewed by this user
    if (!viewedListings.includes(listingId)) {
      // Add to viewed list
      viewedListings.push(listingId);
      localStorage.setItem(VIEWED_LISTINGS_KEY, JSON.stringify(viewedListings));
      
      // Increment view count in listings storage
      const listings = JSON.parse(localStorage.getItem('adjarahome_listings') || '[]');
      const updatedListings = listings.map((listing: any) => {
        if (listing.id === listingId) {
          return {
            ...listing,
            viewCount: (listing.viewCount || 0) + 1
          };
        }
        return listing;
      });
      localStorage.setItem('adjarahome_listings', JSON.stringify(updatedListings));
    }
  }, [listingId]);
}

export function getViewCount(listingId: string): number {
  const listings = JSON.parse(localStorage.getItem('adjarahome_listings') || '[]');
  const listing = listings.find((l: any) => l.id === listingId);
  return listing?.viewCount || 0;
}
