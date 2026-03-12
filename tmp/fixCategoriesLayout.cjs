const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/DIONIS/Downloads/nexora-dashboard/src/views/StorefrontView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add useRef for Categories scroll
content = content.replace(
  "const [activeCategory, setActiveCategory] = useState<string | null>(null);",
  "const [activeCategory, setActiveCategory] = useState<string | null>(null);\n  const categoriesScrollRef = React.useRef<HTMLDivElement>(null);\n\n  const scrollCategories = (direction: 'left' | 'right') => {\n    if (categoriesScrollRef.current) {\n      const scrollAmount = 300;\n      categoriesScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });\n    }\n  };\n"
);
content = content.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';"
);

// 2. Modify Categories Section to include arrows
const categoriesStart = `
    return (
      <section id="mega-categories" className="py-16 bg-white border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-xl font-black text-gray-900 border-b-2 border-gray-100 pb-2 mb-8 inline-block pr-6 relative after:absolute after:bottom-[-2px] after:left-0 after:w-16 after:h-0.5 after:bg-[#1868D5]" style={megaVariant !== 'Blue' ? { '--tw-after-bg': themeColor } as any : {}}>
            Comprar por Categoria
          </h3>
          <div className="relative group">
            <button onClick={() => scrollCategories('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:text-[var(--theme-primary)] hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:outline-none">
              <ChevronDown size={20} className="rotate-90" />
            </button>
            <div ref={categoriesScrollRef} className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-4 items-start justify-start snap-x scroll-px-4">
`;
const categoriesEnd = `
            </div>
            <button onClick={() => scrollCategories('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:text-[var(--theme-primary)] hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:outline-none">
              <ChevronDown size={20} className="-rotate-90" />
            </button>
          </div>
        </div>
      </section>
    );`;

// We use regex to carefully replace just the inner part
content = content.replace(
  /<div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-4 items-start justify-start md:justify-center">/,
  `          <div className="relative group">
            <button onClick={() => scrollCategories('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] rounded-full flex items-center justify-center text-gray-600 hover:text-[#1868D5] hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:outline-none" style={megaVariant !== 'Blue' ? { color: themeColor } as any : {}}>
              <ChevronDown size={20} className="rotate-90" />
            </button>
            <div ref={categoriesScrollRef} className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-4 items-start justify-start scroll-smooth">`
);
content = content.replace(
  /<\/div>\n        <\/div>\n      <\/section>\n    \);/g,
  `            </div>
            <button onClick={() => scrollCategories('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] rounded-full flex items-center justify-center text-gray-600 hover:text-[#1868D5] hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:outline-none" style={megaVariant !== 'Blue' ? { color: themeColor } as any : {}}>
              <ChevronDown size={20} className="-rotate-90" />
            </button>
          </div>
        </div>
      </section>
    );`
);


// 3. Main layout structural swap in generic main render
// We need to swap the Promos with Products, and rename "Produtos em Alta"

// The main layout area has this logic:
/*
        {isMegaStore && renderMegaCategorias()}
        {renderHero()}
        {isMegaStore && renderMegaPromoBanners()}
        {/* Main Store Content *\/}
*/

content = content.replace(
  "{isMegaStore && renderMegaPromoBanners()}",
  "" // remove from top
);

content = content.replace(
  "{/* Main Store Content */}",
  "{/* Main Store Content */}\n        {isMegaStore && renderMegaPromoBanners()}" // move below hero before main content
);

// We want to physically swap the content of what's shown as "Produtos em Alta" and Promos, basically Promos IS Produtos em Alta now, and Products IS just Products.
// So let's rename the Title inside Promos to "Produtos em Alta" implicitly by adding a title to PromoBanners
content = content.replace(
  /<div className="grid grid-cols-1 md:grid-cols-3 gap-6">/g,
  `          <h3 className="text-xl font-black text-[#1a1a1a] border-b-2 border-gray-100 pb-2 mb-8 inline-block pr-6 relative after:absolute after:bottom-[-2px] after:left-0 after:w-16 after:h-0.5 after:bg-[#1868D5]" style={megaVariant !== 'Blue' ? { '--tw-after-bg': themeColor } as any : {}}>
            Produtos em Alta
          </h3>\n          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">`
);

// Rename "Produtos em Alta" inside the main grid to "Produtos"
// We'll target the text "Produtos em Alta"
content = content.replace( // This might match in multiple places, but we want the one in the main section title
  /Produtos em Alta/g,
  "Produtos em Alta_TEMP"
);
content = content.replace( // Fix the one we just injected to be the real name
  /Produtos em Alta_TEMP\n          <\/h3>/g,
  "Produtos em Alta\n          </h3>"
);
// The other one is the title of the grid section
content = content.replace(
  /Produtos em Alta_TEMP/g,
  "Produtos"
);

// 4. Remove category filters from the products grid.
// Find the block:
/*
            <div className="flex gap-4">
              <button className="text-[13px] font-bold text-[var(--theme-primary)] mb-[-2px] border-b-2 border-[var(--theme-primary)] pb-2">Eletrônicos</button>
              <button className="text-[13px] font-bold text-gray-400 hover:text-gray-900 transition-colors pb-2 hover:border-b-2 border-gray-900 mb-[-2px]">Acessórios</button>
              <button className="text-[13px] font-bold text-gray-400 hover:text-gray-900 transition-colors pb-2 hover:border-b-2 border-gray-900 mb-[-2px]">Smartphones</button>
            </div>
*/
content = content.replace(
  /<div className="flex gap-4">\s*<button className="text-\[13px\] font-bold text-\[var\(--theme-primary\)\] mb-\[-2px\] border-b-2 border-\[var\(--theme-primary\)\] pb-2">Eletrônicos<\/button>[\s\S]*?<\/div>/g,
  ""
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Categories layout and Promo section swap injected');
