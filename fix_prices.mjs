import { readFileSync, writeFileSync } from 'fs';

const filePath = 'c:/Users/DIONIS/Downloads/nexora-dashboard/src/views/StorefrontView.tsx';
let txt = readFileSync(filePath, 'utf8');
let count = 0;

// Matches JSX expressions: R$ {someExpr.toFixed(2).replace('.', ',')}
const jsxPattern = /R\$\s*\{((?:[^{}]|\{[^{}]*\})+?)\.toFixed\(2\)\.replace\(["']\.["']\s*,\s*["'],["']\)\}/g;
// Matches template literals: R$ ${someExpr.toFixed(2).replace('.', ',')}
const tmplPattern = /R\$\s*\$\{((?:[^{}]|\{[^{}]*\})+?)\.toFixed\(2\)\.replace\(["']\.["']\s*,\s*["'],["']\)\}/g;

txt = txt.replace(jsxPattern, (m, expr) => {
  count++;
  return `{(${expr.trim()}).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
});

txt = txt.replace(tmplPattern, (m, expr) => {
  count++;
  return `\${(${expr.trim()}).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
});

writeFileSync(filePath, txt, 'utf8');
console.log(`Done! Replaced ${count} occurrences.`);
