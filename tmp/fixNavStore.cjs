const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/DIONIS/Downloads/nexora-dashboard/src/views/StorefrontView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Inject handleNavClick function
const navFunc = `
  const handleNavClick = (section: string) => {
    if (section === 'Início' || section === 'Loja') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'Categorias' || section === 'NAVEGAR CATEGORIAS') {
      document.getElementById('mega-categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (section === 'Produtos') {
      document.getElementById('mega-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (section === 'Ofertas') {
      document.getElementById('mega-promos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (section === 'Contato') {
      document.getElementById('mega-footer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
`;

content = content.replace(/(const getFontFamily = \(\) => \{[\s\S]*?return fonts\[fontFamily\] \|\| fonts\.Inter;\s*\};)/, '$1\n' + navFunc);

// 2. Update navigation menu buttons
content = content.replace(
  /<button className="flex items-center gap-2 font-bold text-sm text-gray-800 hover:text-\[var\(--theme-primary\)\] transition-colors h-full border-b-\[3px\] border-\[var\(--theme-primary\)\]">/g,
  '<button onClick={() => handleNavClick("Categorias")} className="flex items-center gap-2 font-bold text-sm text-gray-800 hover:text-[var(--theme-primary)] transition-colors h-full border-b-[3px] border-[var(--theme-primary)]">'
);

content = content.replace(
  /<button key={item} className="text-sm font-bold/g,
  '<button key={item} onClick={() => handleNavClick(item)} className="text-sm font-bold'
);

// 3. Add IDs to sections
content = content.replace(
  /const renderMegaCategorias = \(\) => \{\s*return \(\s*<section className="py-16 bg-white border-b border-gray-50">/g,
  'const renderMegaCategorias = () => {\n    return (\n      <section id="mega-categories" className="py-16 bg-white border-b border-gray-50">'
);

content = content.replace(
  /const renderMegaPromoBanners = \(\) => \{[\s\S]*?return \(\s*<section className="py-12 bg-white">/g,
  `const renderMegaPromoBanners = () => {\n    const isBlue = megaVariant === 'Blue';\n    const promos = [\n      { prod: products[1] || products[0], bg: 'bg-[#ffebee]', linkColor: 'text-blue-600' },\n      { prod: products[2] || products[0], bg: 'bg-[#e3f2fd]', linkColor: 'text-blue-600' },\n      { prod: products[3] || products[0], bg: 'bg-[#ffebee]', linkColor: 'text-blue-600' }\n    ];\n\n    if (!promos[0]?.prod) return null;\n\n    return (\n      <section id="mega-promos" className="py-12 bg-white">`
);

content = content.replace(
  /if \(isMegaStore\) \{\s*return \(\s*<section className="py-12 bg-white">/g,
  'if (isMegaStore) {\n      return (\n        <section id="mega-products" className="py-12 bg-white">'
);

content = content.replace(
  /const renderMegaFooter = \(\) => \{\s*return \(\s*<footer className="bg-\[#f8f9fa\] pt-16 pb-8 border-t border-gray-200">/g,
  'const renderMegaFooter = () => {\n    return (\n      <footer id="mega-footer" className="bg-[#f8f9fa] pt-16 pb-8 border-t border-gray-200">'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Nav logic injected');
