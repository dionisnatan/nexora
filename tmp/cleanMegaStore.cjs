const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/DIONIS/Downloads/nexora-dashboard/src/views/StorefrontView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log("Original content length:", content.length);

// Remove isMegaStore and megaVariant
content = content.replace(/const template = store\?\.template \|\| 'Modern Shop';\s+const isMegaStore = template\.includes\('Mega Store'\);\s+const megaVariant = template\.split\('Mega Store '\)\[1\] \|\| 'Blue';/, `const template = store?.template || 'Modern Shop';`);

// Remove renderMegaHero
content = content.replace(/const renderMegaHero = \(\) => \{[\s\S]*?const renderHero = \(\) => \{/, 'const renderHero = () => {');
// Remove renderMegaProductCard
content = content.replace(/const renderMegaProductCard = \(product: any\) => \{[\s\S]*?const renderMegaCategories = \(\) => \(/, 'const renderMegaCategories = () => (');
// Remove renderMegaCategories
content = content.replace(/const renderMegaCategories = \(\) => \([\s\S]*?const renderMegaFooter = \(\) => \{/, 'const renderMegaFooter = () => {');
// Remove renderMegaFooter
content = content.replace(/const renderMegaFooter = \(\) => \{[\s\S]*?};[\s\n]*const renderProducts = \(\) => \{/, 'const renderProducts = () => {');
// Remove renderMegaHeader
content = content.replace(/const renderMegaHeader = \(\) => \{[\s\S]*?const renderHeader = \(\) => \{/, 'const renderHeader = () => {');

// Remove Hero usage
content = content.replace(/if \(isMegaStore\) return renderMegaHero\(\);[\s\n]*/, '');
// Remove Product usage
content = content.replace(/if \(isMegaStore\) \{[\s\S]*?return \([\s\S]*?<div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">[\s\S]*?\{filteredProducts.map\(prod => renderMegaProductCard\(prod\)\)\}[\s\S]*?<\/div>[\s\S]*?\);[\s\S]*?\}[\s\n]*/, '');
// Remove Header usage
content = content.replace(/if \(isMegaStore\) return renderMegaHeader\(\);[\s\n]*/, '');

// Remove {isMegaStore && renderMegaCategories()}
content = content.replace(/\{isMegaStore && renderMegaCategories\(\)\}[\s\n]*/, '');

console.log("New content length:", content.length);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleaned up StorefrontView.tsx');
