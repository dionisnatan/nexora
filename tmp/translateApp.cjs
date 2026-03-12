const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/DIONIS/Downloads/nexora-dashboard/src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const translations = [
  ['Choose Your Store Template', 'Escolha o Tema da sua Loja'],
  ['Select a pre-designed template to define the look and feel of your store.', 'Selecione um modelo pré-desenhado para definir a aparência da sua loja.'],
  ['Select Theme', 'Selecionar Tema'],
  ['Selected', 'Selecionado'],
  ['Clean, modern, and high value', 'Limpo, moderno e de alto valor'],
  ['Classic retail layout', 'Layout clássico de varejo'],
  ['Dark theme with neon accents', 'Tema escuro com toques neon'],
  ['Focus on big images and lifestyle', 'Foco em grandes imagens e estilo de vida'],
  ['Special offer landing page style', 'Estilo landing page para ofertas especiais'],
  ['High conversion checkout style', 'Estilo focado em alta conversão']
];

let modified = 0;
for (const [en, pt] of translations) {
  if (content.includes(en)) {
    content = content.split(en).join(pt);
    modified++;
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Translated ${modified} phrases successfully in App.tsx.`);
