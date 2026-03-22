const fs = require('fs');
const filePath = 'c:/Users/DIONIS/Downloads/nexora-dashboard/src/views/StorefrontView.tsx';

let txt = fs.readFileSync(filePath, 'utf8');
let count = 0;

// Matches things like: R$ {someExpr.toFixed(2).replace('.', ',')} in JSX
// and: R$ ${someExpr.toFixed(2).replace('.', ',')} in template literals
// We handle both single and double quotes around the replace args

const jsxPattern = /R\$\s*\{((?:[^{}]|\{[^{}]*\})+?)\.toFixed\(2\)\.replace\(["']\.["']\s*,\s*["'],["']\)\}/g;
const tmplPattern = /R\$\s*\$\{((?:[^{}]|\{[^{}]*\})+?)\.toFixed\(2\)\.replace\(["']\.["']\s*,\s*["'],["']\)\}/g;

txt = txt.replace(jsxPattern, (m, expr) => {
  count++;
  return `{(${expr.trim()}).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
});

txt = txt.replace(tmplPattern, (m, expr) => {
  count++;
  return `\${(${expr.trim()}).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
});

fs.writeFileSync(filePath, txt, 'utf8');
console.log(`Done! Replaced ${count} occurrences.`);
