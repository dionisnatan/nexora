const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/DIONIS/Downloads/nexora-dashboard/src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state variables
content = content.replace(
  "const [images, setImages] = useState<{ logo: string | null, banner: string | null, favicon: string | null }>({ logo: null, banner: null, favicon: null });",
  "const [images, setImages] = useState<{ logo: string | null, banner: string | null, favicon: string | null }>({ logo: null, banner: null, favicon: null });\n  const [featuredProductId, setFeaturedProductId] = useState<string>('');\n  const [storeProducts, setStoreProducts] = useState<any[]>([]);"
);

// 2. Add product fetching and featured_product_id setup inside useEffect
const useEffectStart = `
    const fetchStore = async () => {`;
const useEffectEnd = `
      if (data) {
        if (data.template) setActiveTemplate(data.template);
        if (data.featured_product_id) setFeaturedProductId(data.featured_product_id);`;

content = content.replace(
  "if (data.template) setActiveTemplate(data.template);",
  "if (data.template) setActiveTemplate(data.template);\n        if (data.featured_product_id) setFeaturedProductId(data.featured_product_id);"
);

// add fetchProducts
content = content.replace(
  "fetchStore();",
  `fetchStore();\n\n    const fetchProducts = async () => {\n      const { data } = await supabase.from('products').select('id, name').eq('user_id', session.user.id);\n      if (data) setStoreProducts(data);\n    };\n    fetchProducts();`
);

// 3. Update handleSave
content = content.replace(
  "theme_color: themeColor,",
  "theme_color: themeColor,\n        featured_product_id: featuredProductId || null,"
);

// 4. Inject the UI before the Save button
const uiBlock = `
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[#5551FF] font-bold text-sm mb-2">
          <Store size={18} />
          Produto em Destaque (HomePage)
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Produto Destaque Banner</label>
          <select
            value={featuredProductId}
            onChange={(e) => setFeaturedProductId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 appearance-none"
          >
            <option value="">Nenhum - Usar padrão/mais recente</option>
            {storeProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">Selecione o produto que será destacado no topo principal das templates Mega Store.</p>
        </div>
      </div>

      <button
        onClick={handleSave}
`;

content = content.replace(
  /<button\s+onClick={handleSave}/,
  uiBlock.trim()
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Featured product injected in dashboard');
