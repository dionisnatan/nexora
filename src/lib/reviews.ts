/**
 * Generates a deterministic rating and review count based on a product ID.
 * This ensures consistency across the store while providing variety.
 */
export const getProductRating = (id: string) => {
  if (!id) return { rating: 5.0, count: 12 };

  // Simple numeric seed from the ID (UUIDs are common)
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Rating between 4.7 and 5.0 (high ratings for social proof)
  const rating = (4.7 + (seed % 4) / 10).toFixed(1);
  
  // Count between 8 and 148 (varied but realistic)
  const count = 8 + (seed % 141);

  // Sales count (usually higher than reviews)
  const salesCount = count * 2 + (seed % 50);
  
  return { 
    rating: parseFloat(rating), 
    count,
    salesCount
  };
};
