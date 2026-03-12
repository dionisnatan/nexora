const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/DIONIS/Downloads/nexora-dashboard/src/views/StorefrontView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const megaComponents = `
  const renderMegaHeader = () => {
    const isBlue = megaVariant === 'Blue';
    const topBarBg = isBlue ? 'bg-[#1868D5]' : 'bg-[var(--theme-primary)]';
    const headerBg = 'bg-white';
    const bottomNavBg = 'bg-white';
    
    return (
      <header className="w-full font-sans shadow-sm z-50 relative">
        {/* Top Bar */}
        <div className={cn("py-2 text-[11px] text-white flex justify-between items-center", topBarBg)}>
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center w-full">
            <span className="opacity-90">Tell a friends about {store.name} & get 30% off your next order.</span>
            <div className="flex items-center gap-6 opacity-90 hidden md:flex">
              <span className="cursor-pointer hover:opacity-100">Track Order</span>
              <span className="cursor-pointer hover:opacity-100">Help Center</span>
              <div className="flex items-center gap-1 cursor-pointer hover:opacity-100">
                <img src="https://flagcdn.com/w20/br.png" className="w-4 h-3 object-cover rounded-sm" />
                <span>Português</span>
                <ChevronDown size={12} />
              </div>
              <div className="flex items-center gap-1 cursor-pointer hover:opacity-100">
                <span>R$ BRL</span>
                <ChevronDown size={12} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className={cn("py-6 border-b border-gray-100", headerBg)}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => { setActiveCategory(null); setSearchQuery(''); }}>
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-10 object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className={cn("h-8 w-8 rounded bg-[var(--theme-primary)] flex items-center justify-center text-white font-black text-xl shadow-md", isBlue && "bg-[#1868D5]")}>
                    <Package size={20} />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-[#1a1a1a]">{store.name}</span>
                </div>
              )}
            </div>

            {/* Middle Search Bar */}
            <div className="flex-1 max-w-3xl hidden md:flex relative items-center border-2 border-slate-200 rounded-lg overflow-hidden h-[46px] group hover:border-[var(--theme-primary)] focus-within:border-[var(--theme-primary)] transition-colors" style={!isBlue ? { '--tw-ring-color': themeColor } as any : {}}>
              <div className="flex items-center bg-gray-50 h-full px-4 border-r border-gray-200 cursor-pointer text-xs font-bold text-gray-700 min-w-[140px] justify-between">
                All Categories <ChevronDown size={14} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search product here..."
                className="flex-1 h-full px-4 outline-none text-sm text-gray-700 placeholder:text-gray-400"
              />
              <button className={cn("h-full px-6 flex items-center justify-center transition-colors text-white", isBlue ? "bg-[#1868D5] hover:bg-blue-700" : "bg-[var(--theme-primary)] hover:brightness-90")}>
                <Search size={18} />
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-8 shrink-0">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => customerSession ? setShowOrders(true) : setIsAuthModalOpen(true)}>
                <User size={26} className="text-gray-700 group-hover:text-[var(--theme-primary)] transition-colors" />
                <div className="hidden lg:flex flex-col leading-tight">
                  <span className="text-gray-500 text-[10px] font-bold">Account</span>
                  <span className="text-gray-900 text-xs font-black">{customerSession ? 'Meu Perfil' : 'Log In'}</span>
                </div>
              </div>
              
              <div className="relative cursor-pointer group hover:text-[var(--theme-primary)] transition-colors hidden md:block">
                <Heart size={26} className="text-gray-700 group-hover:text-[var(--theme-primary)] transition-colors" />
                <span className={cn("absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center", isBlue ? "bg-[#1868D5]" : "bg-[var(--theme-primary)]")}>0</span>
              </div>

              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsCartOpen(true)}>
                <div className="relative">
                  <ShoppingCart size={26} className="text-gray-700 group-hover:text-[var(--theme-primary)] transition-colors" />
                  <span className={cn("absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center", isBlue ? "bg-[#1868D5]" : "bg-[var(--theme-primary)]")}>
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                </div>
                <div className="hidden lg:flex flex-col leading-tight">
                  <span className="text-gray-500 text-[10px] font-bold">My Cart</span>
                  <span className="text-gray-900 text-xs font-black">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Nav Bar */}
        <div className={cn("border-b border-gray-100 hidden md:block", bottomNavBg)}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-[52px]">
            <div className="flex items-center gap-8 h-full">
              {/* Categories Menu Button */}
              <button className="flex items-center gap-2 font-bold text-sm text-gray-800 hover:text-[var(--theme-primary)] transition-colors h-full border-b-[3px] border-[var(--theme-primary)]">
                <Menu size={18} />
                BROWSE ALL CATEGORY
              </button>

              {/* Nav Links */}
              <nav className="flex items-center gap-6 h-full">
                {['Home', 'Shop', 'Categories', 'Products', 'Top Deals', 'Elements'].map((item, i) => (
                  <button key={item} className="text-sm font-bold text-gray-700 hover:text-[var(--theme-primary)] transition-colors flex items-center gap-1">
                    {item}
                    {i !== 0 && <ChevronDown size={14} className="text-gray-400" />}
                    {(i === 2 || i === 3) && (
                      <span className={cn("ml-1 px-1.5 py-0.5 text-[8px] text-white rounded font-black uppercase", i === 2 ? "bg-emerald-500" : "bg-red-500")}>
                        {i === 2 ? "SALE" : "HOT"}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-2 font-bold text-sm text-[var(--theme-primary)] hover:opacity-80 transition-opacity cursor-pointer">
              <Zap size={16} />
              Today's Deal
            </div>
          </div>
        </div>
      </header>
    );
  };

  const renderMegaHero = () => {
    const isBlue = megaVariant === 'Blue';
    const btnColor = isBlue ? 'bg-[#1868D5]' : 'bg-[var(--theme-primary)]';
    
    // Fallback to top product if no banner available
    const fallbackProduct = products[0] || {};
    
    return (
      <div className="bg-[#eff5f9] pt-12 pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
          <div className="flex-1 w-full order-2 md:order-1 flex justify-center mt-8 md:mt-0 relative">
             <motion.img 
                initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
                src={fallbackProduct.image_url?.split(',')[0]} 
                className="max-w-xs md:max-w-md lg:max-w-lg object-contain relative z-10 drop-shadow-2xl" 
                style={{ mixBlendMode: 'multiply' }}
              />
          </div>
          <div className="flex-1 space-y-4 max-w-xl order-1 md:order-2 text-center md:text-left">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 font-bold tracking-wide">
              Flat 20% Discount
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1a1a1a] leading-[1.1] tracking-tight">
              {store.name} <br />
              Mega Oferta 
            </motion.h2>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 justify-center md:justify-start py-4">
              <span className="text-xl font-bold text-gray-500">From</span>
              <span className="text-4xl text-red-500 font-black tracking-tighter">R$ {Number(fallbackProduct.price || 149.99).toFixed(2).replace('.', ',')}</span>
            </motion.div>
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className={cn("text-white font-bold uppercase text-xs px-8 py-3 rounded shadow hover:brightness-110 transition-all", btnColor)}>
              SHOP NOW
            </motion.button>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            <div className={cn("w-2 h-2 rounded-full", isBlue ? "bg-[#1868D5]" : "bg-[var(--theme-primary)]")} />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
        </div>
      </div>
    );
  };

  const renderMegaCategories = () => {
    return (
      <section className="py-16 bg-white border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-xl font-black text-gray-900 border-b-2 border-gray-100 pb-2 mb-8 inline-block pr-6 relative after:absolute after:bottom-[-2px] after:left-0 after:w-16 after:h-0.5 after:bg-[#1868D5]" style={megaVariant !== 'Blue' ? { '--tw-after-bg': themeColor } as any : {}}>
            Shop By Category
          </h3>
          <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-4 items-start justify-start md:justify-center">
            {categories.map((cat, i) => (
              <div key={cat.id || i} onClick={() => setActiveCategory(cat.id)} className="flex flex-col items-center gap-4 cursor-pointer group min-w-[100px] shrink-0">
                <div className="w-24 h-24 rounded-full border border-gray-100 flex items-center justify-center p-4 bg-white group-hover:border-[var(--theme-primary)] group-hover:shadow-[0_0_20px_rgba(0,0,0,0.05)] transition-all">
                   <Package size={32} className="text-gray-300 group-hover:text-[var(--theme-primary)] transition-colors" />
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-[var(--theme-primary)] text-center w-full truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderMegaPromoBanners = () => {
    const isBlue = megaVariant === 'Blue';
    // Let's create 3 generic promo banners using actual products if possible
    const promos = [
      { prod: products[1] || products[0], bg: 'bg-[#ffebee]', linkColor: 'text-blue-600' },
      { prod: products[2] || products[0], bg: 'bg-[#e3f2fd]', linkColor: 'text-blue-600' },
      { prod: products[3] || products[0], bg: 'bg-[#ffebee]', linkColor: 'text-blue-600' }
    ];

    if (!promos[0]?.prod) return null;

    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promos.map((p, i) => (
              <div key={i} className={cn("rounded-sm flex items-center p-6 cursor-pointer group relative overflow-hidden transition-shadow hover:shadow-lg", p.bg)} onClick={() => p.prod && setSelectedProduct(p.prod)}>
                <div className="flex-1 space-y-2 relative z-10 pr-4">
                  <h4 className="text-base font-black text-gray-900 leading-tight">{p.prod?.name || 'Special Offer'}</h4>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-gray-500 font-bold">From</span>
                    <span className="text-red-500 font-black">R$ {Number(p.prod?.price || 59.99).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <button className={cn("flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-wider group-hover:underline", isBlue ? "text-[#1868D5]" : "text-[var(--theme-primary)]")}>
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-white", isBlue ? "bg-[#1868D5]" : "bg-[var(--theme-primary)]")}>
                      <ChevronRight size={12} strokeWidth={3} />
                    </div>
                    Shop Now
                  </button>
                </div>
                {p.prod?.image_url && (
                   <div className="w-28 h-28 shrink-0 relative z-10 group-hover:scale-105 transition-transform">
                      <img src={p.prod.image_url?.split(',')[0]} className="w-full h-full object-contain mix-blend-multiply drop-shadow-md" />
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderMegaProductCard = (product: any) => {
    const finalPrice = product.price;
    const oldPrice = finalPrice * 1.2;

    return (
      <div key={product.id} className="bg-white border text-center border-gray-100 rounded-sm hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col items-center p-5 relative group cursor-pointer" onClick={() => setSelectedProduct(product)}>
        {/* Discount Badge */}
        <div className="absolute top-4 left-4 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
          -10%
        </div>

        {/* Hover Quick View / Heart */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
           <button onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Heart size={14} className={favorites.some(f => f.id === product.id) ? 'fill-current text-red-500' : ''} />
           </button>
           <button onClick={(e) => { e.stopPropagation(); addToCart(product, null); }} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 transition-colors">
              <ShoppingCart size={14} />
           </button>
        </div>

        {/* Image */}
        <div className="w-full aspect-square mb-4">
          <img src={product.image_url?.split(',')[0]} className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500" alt={product.name} />
        </div>

        {/* Details */}
        <div className="w-full text-left space-y-1">
          <p className="text-[10px] font-medium text-gray-400 capitalize">{categories.find(c => c.id === product.category_id)?.name || 'Eletrônicos'}</p>
          <h4 className="text-xs font-bold text-[#1a1a1a] line-clamp-2 leading-snug group-hover:text-[var(--theme-primary)] transition-colors">{product.name}</h4>
          
          <div className="flex text-[#FFB300] gap-0.5">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill={i <= 4 ? "currentColor" : "none"} />)}
            <span className="text-[9px] font-medium text-gray-400 ml-1">(12)</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm font-black text-red-500 tracking-tight">R$ {Number(finalPrice).toFixed(2).replace('.', ',')}</span>
            <span className="text-[10px] font-medium text-gray-400 line-through">R$ {Number(oldPrice).toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMegaTrustSection = () => {
    return (
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border border-gray-100 rounded-sm grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100 p-6 md:p-8">
            {[
              { icon: Truck, title: "Free Shipping", subtitle: "For all Orders Over $100" },
              { icon: ShieldCheck, title: "30 Days Returns", subtitle: "For an Exchange Product" },
              { icon: CreditCard, title: "Secured Payment", subtitle: "Payment Cards Accepted" },
              { icon: Package, title: "Special Gifts", subtitle: "Perfect Gifts, Every Time" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-2 md:px-6 py-4 md:py-0 text-[#1a1a1a]">
                <item.icon size={32} strokeWidth={1.5} className="text-gray-400" />
                <div className="flex flex-col">
                   <h5 className="text-[11px] md:text-xs font-black uppercase mb-0.5">{item.title}</h5>
                   <p className="text-[9px] md:text-[10px] text-gray-500 font-medium">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderMegaFooter = () => {
    return (
      <footer className="bg-[#f8f9fa] pt-16 pb-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
           {/* Replace this with normal minimal footer or recreate the mega footer logic here */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
             <div className="space-y-4">
                <span className="text-2xl font-black text-[#1a1a1a]">{store.name}</span>
                <p className="text-xs text-gray-500 leading-relaxed">Sua melhor escolha em eletrônicos e tecnologia com entrega rápida e garantia total. Produtos que facilitam o seu dia a dia.</p>
                <div className="flex items-center gap-2">
                   {[Facebook, Twitter, Instagram].map((Icon, i) => (
                     <div key={i} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)] transition-all cursor-pointer">
                        <Icon size={14} />
                     </div>
                   ))}
                </div>
             </div>
             
             <div className="space-y-4">
                <h5 className="text-sm font-black text-[#1a1a1a]">Customer Care</h5>
                <ul className="space-y-2 text-xs text-gray-500 font-medium">
                  {['Contact Us', 'Returns & Exchanges', 'Shipping Information', 'Track Your Order', 'Store Locator'].map(l => (
                    <li key={l} className="hover:text-[var(--theme-primary)] cursor-pointer">{l}</li>
                  ))}
                </ul>
             </div>

             <div className="space-y-4">
                <h5 className="text-sm font-black text-[#1a1a1a]">Categories</h5>
                <ul className="space-y-2 text-xs text-gray-500 font-medium">
                  {categories.slice(0, 5).map(c => (
                    <li key={c.id} className="hover:text-[var(--theme-primary)] cursor-pointer">{c.name}</li>
                  ))}
                </ul>
             </div>

             <div className="space-y-4">
                <h5 className="text-sm font-black text-[#1a1a1a]">Our App</h5>
                <p className="text-xs text-gray-500 leading-relaxed">Download our app to get 10% discount on your first order. Available on App Store and Google Play.</p>
                <div className="flex gap-2">
                   <div className="bg-black text-white px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer">
                     <span className="text-[8px] font-bold">App Store</span>
                   </div>
                   <div className="bg-black text-white px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer">
                     <span className="text-[8px] font-bold">Google Play</span>
                   </div>
                </div>
             </div>
           </div>

           <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
             <p className="text-xs text-gray-500 font-medium">© {new Date().getFullYear()} {store.name} - Nexora. All Rights Reserved.</p>
             <div className="flex items-center gap-3 grayscale opacity-60">
                 <img src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/visa.svg" className="h-3" alt="Visa" />
                 <img src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/mastercard.svg" className="h-4" alt="Mastercard" />
                 <img src="https://logodownload.org/wp-content/uploads/2020/02/pix-logo-1.png" className="h-3" alt="Pix" />
             </div>
           </div>
        </div>
      </footer>
    );
  };
`;


// Insert functions after the main helper functions
content = content.replace(/(const getFontFamily = \(\) => \{[\s\S]*?return fonts\[fontFamily\] \|\| fonts\.Inter;\s*\};)/, '$1\n' + megaComponents);

// Now update the render logic where they are injected

// Update renderHeader
content = content.replace(/const renderHeader = \(\) => \{/, "const renderHeader = () => {\n    if (isMegaStore) return renderMegaHeader();\n");

// Update renderHero
content = content.replace(/const renderHero = \(\) => \{/, "const renderHero = () => {\n    if (isMegaStore) return renderMegaHero();\n");

// Update renderProducts
content = content.replace(/const renderProducts = \(\) => \{([\s\S]*?)if \(template === 'Luxury Dark'\)/, 
`const renderProducts = () => {
    if (filteredProducts.length === 0) {
      return (
        <div className="py-20 md:py-40 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200 mb-8 border border-gray-100 shadow-inner">
            <Package size={48} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2 italic">Nenhum produto encontrado</h3>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Tente outro termo ou limpe os filtros</p>
          <button onClick={() => { setSearchQuery(''); setActiveCategory(null); }} className={getButtonStyle("mt-8 px-8 py-3 bg-[#0b0b0b] text-white hover:bg-[var(--theme-primary)]")}>Limpar Busca</button>
        </div>
      );
    }
    
    if (isMegaStore) {
      return (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end border-b-2 border-gray-100 pb-2 mb-8 relative after:absolute after:bottom-[-2px] after:left-0 after:w-16 after:h-0.5 after:bg-[#1868D5]" style={megaVariant !== 'Blue' ? { '--tw-after-bg': themeColor } as any : {}}>
               <h3 className="text-xl font-black text-gray-900">Trending Products</h3>
               <div className="flex items-center gap-4 text-xs font-bold text-gray-500 hidden md:flex">
                 <span className="text-[var(--theme-primary)] border-b border-[var(--theme-primary)] pb-1 cursor-pointer">Electronics</span>
                 <span className="hover:text-gray-900 cursor-pointer">Gadgets</span>
                 <span className="hover:text-gray-900 cursor-pointer">Smart Devices</span>
               </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map(prod => renderMegaProductCard(prod))}
            </div>
          </div>
        </section>
      );
    }

    if (template === 'Luxury Dark')`);

// Reconstruct the main page Layout for Mega Store
content = content.replace(/<main className="min-h-\[80vh\]">[\s\n]*\{renderHero\(\)\}?(?:[\n\s]*\{isMegaStore && renderMegaCategories\(\)\})?/, `<main className="min-h-[80vh]">
        {renderHero()}
        {isMegaStore && renderMegaCategories()}
        {isMegaStore && renderMegaPromoBanners()}`);

// Append Trust section for Mega Store 
content = content.replace(/(\{renderProducts\(\)\}[\n\s]*?(?:\{renderTrustSection\(\)\})?)[\n\s]*?<\/main>[\n\s]*?(?:(?:\{renderMegaFooter\(\)\}?)|(?:<footer[\s\S]*?<\/footer>[\n\s]*?\}))/g,
`$1
        {isMegaStore && renderMegaTrustSection()}
      </main>
      
      {isMegaStore ? renderMegaFooter() : (
        <footer className={cn("py-12 border-t border-gray-200 mt-auto", template === 'Luxury Dark' ? "bg-black border-white/10" : "bg-white")}>
          <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
            <p className={cn("text-sm font-bold", template === 'Luxury Dark' ? "text-gray-500" : "text-gray-400")}>© {new Date().getFullYear()} {store.name} - Nexora. Todos os direitos reservados.</p>
          </div>
        </footer>
      )}`);


fs.writeFileSync(filePath, content, 'utf8');
console.log('Injected Mega Store components successfully.');
