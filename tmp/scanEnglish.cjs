const fs = require('fs');
const content = fs.readFileSync('c:/Users/DIONIS/Downloads/nexora-dashboard/src/views/StorefrontView.tsx', 'utf8');

// Looking for common UI copy
const searchWords = [
  'Search', 'Cart', 'Checkout', 'Loading', 'Contact', 'Home', 'Shop', 'Categories', 'Products',
  'Total', 'Price', 'Quantity', 'Empty', 'Buy', 'Sign In', 'Sign Up', 'Password', 'Email',
  'Menu', 'Welcome', 'Language', 'Currency', 'Dashboard', 'Profile', 'Orders', 'Logout',
  'Favorites', 'Wishlist', 'Support', 'FAQ'
];

searchWords.forEach(word => {
  // Try to find the word inside JSX text or quotes
  // This is a naive check just to see if the word appears
  if (content.includes(word)) {
    console.log(`Found: ${word}`);
  }
});
