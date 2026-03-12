const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/DIONIS/Downloads/nexora-dashboard/src/views/StorefrontView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // Gamer Pro Dark checkout English labels
  ['PREMIUM SELECTION', 'SELECAO PREMIUM'],
  ['Total Amount', 'Valor Total'],
  ['Credit Card', 'Cartao de Credito'],
  ['High Performance', 'Alto Desempenho'],
  ['Premium Grade', 'Qualidade Premium'],
  ['System Integrated', 'Sistema Integrado'],
  ['Select Configuration', 'Selecione Config.'],
  ['Price Terminal', 'Valor Final'],
  ['Level Up', 'Subir Nivel'],
  ['Pix Discount', 'Desconto Pix'],
  ['Shop Collection', 'Ver Colecao'],
  ['Signature Items', 'Itens Exclusivos'],
  ['Marketplace Premium', 'Marketplace Premium'],
  ['Essential collections for your', 'Colecoes essenciais para o seu'],
  ['daily life', 'dia a dia'],
];

let modifiedCount = 0;
replacements.forEach(function(pair) {
  var search = pair[0];
  var replace = pair[1];
  var idx = content.indexOf(search);
  if (idx !== -1) {
    content = content.split(search).join(replace);
    modifiedCount++;
    console.log('Translated: ' + search + ' => ' + replace);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('\nFinished. Translated ' + modifiedCount + ' English strings in StorefrontView.tsx');
