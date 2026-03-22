const fs = require('fs');
const file = 'c:/Users/DIONIS/Downloads/nexora-dashboard/src/views/StorefrontView.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Replace standard JSX expressions: R$ { value.toFixed(2).replace('.', ',') }
txt = txt.replace(/R\$\s*\{([^}]+?)\.toFixed\(2\)\.replace\(['\"]\.\['\"], ['\"],['\"]\)\}/g, (m, p1) => {
  return '{(' + p1.trim() + ').toLocaleString(\'pt-BR\', { style: \'currency\', currency: \'BRL\' })}';
});

// Replace template literals: R$ ${ value.toFixed(2).replace('.', ',') }
txt = txt.replace(/R\$\s*\$\{([^}]+?)\.toFixed\(2\)\.replace\(['\"]\.\['\"], ['\"],['\"]\)\}/g, (m, p1) => {
  return '${(' + p1.trim() + ').toLocaleString(\'pt-BR\', { style: \'currency\', currency: \'BRL\' })}';
});

fs.writeFileSync(file, txt);
console.log('Script ran successfully!');
