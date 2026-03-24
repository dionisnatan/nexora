import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'index.html',
  'metadata.json',
  'src/App.tsx',
  'src/views/StorefrontView.tsx',
  'supabase/functions/mp-oauth-callback/index.ts',
  'supabase/functions/me-oauth-callback/index.ts',
  'supabase/functions/calculate-shipping/index.ts'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Perform exact replacements to match capitalization variants
    content = content.replace(/NEXORA/g, 'NEXLYRA');
    content = content.replace(/Nexora/g, 'Nexlyra');
    content = content.replace(/nexora/g, 'nexlyra');
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  } else {
    console.warn(`File not found: ${file}`);
  }
});
