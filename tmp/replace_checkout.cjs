const fs = require('fs');
const file = 'c:/Users/DIONIS/Downloads/nexora-dashboard/src/views/StorefrontView.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Insert useEffect for scroll lock
if (!content.includes('document.body.style.overflow =')) {
  const insertHook = `

  useEffect(() => {
    if (selectedProduct || isCartOpen || isAuthModalOpen || showLightbox) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedProduct, isCartOpen, isAuthModalOpen, showLightbox]);

`;
  
  // Find the exact spot. The user's code has:
  //   useEffect(() => {
  //     const script = document.createElement('script');
  content = content.replace('  // Load Mercado Pago SDK', insertHook + '  // Load Mercado Pago SDK');
}

// 2. Replace performance-killing blurs in main modal backgrounds
// bg-white/80 backdrop-blur-2xl
content = content.replace(/bg-white\/80 backdrop-blur-2xl/g, 'bg-white/95 backdrop-blur-sm');
// bg-[#050505]/95 backdrop-blur-3xl
content = content.replace(/bg-\[#050505\]\/95 backdrop-blur-3xl/g, 'bg-[#050505]/95 backdrop-blur-sm');
// bg-white/95 backdrop-blur-xl
content = content.replace(/bg-white\/95 backdrop-blur-xl/g, 'bg-white/95 backdrop-blur-sm');
// bg-black/40 backdrop-blur-md -> Wait, we saw this at line 3195
content = content.replace(/bg-black\/40 backdrop-blur-md/g, 'bg-black/60 backdrop-blur-sm');
// Also bg-[#1a1a1a]/80 backdrop-blur-xl (Floating checkout) 
content = content.replace(/backdrop-blur-xl/g, 'backdrop-blur-sm');
content = content.replace(/backdrop-blur-3xl/g, 'backdrop-blur-sm');
content = content.replace(/backdrop-blur-2xl/g, 'backdrop-blur-sm');

// 3. Fix scroll chaining on modals
// renderMinimalCheckoutModal/renderPremiumCheckoutModal etc
content = content.replace(/overflow-y-auto md:overflow-hidden/g, 'overflow-y-auto overscroll-contain md:overflow-hidden');
content = content.replace(/overflow-y-auto md:overflow-visible/g, 'overflow-y-auto overscroll-contain md:overflow-visible');
content = content.replace(/overflow-y-auto lg:overflow-hidden/g, 'overflow-y-auto overscroll-contain lg:overflow-hidden');
// Replace touch-none in Lightbox if it's there
// Actually, touch-none in Lightbox is intended for the drag functionality. Let's leave touch-none in Lightbox intact.

// Let's also check if 'overscroll-contain' was properly injected
// And check if there are any other 'backdrop-blur-md' in modals that should be downgraded.
content = content.replace(/bg-black\/60 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm/g, 'bg-black/60 flex items-end sm:items-center justify-center sm:p-4'); // Catalog modal maybe?

fs.writeFileSync(file, content);
console.log('Replacements completed successfully');
