import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, ChevronDown, Check, X, Image as ImageIcon, Edit, Trash2, Upload, Sparkles, Wand2, Smartphone, Laptop, Watch, Headphones, Gamepad2, Camera, Tv, Speaker, Shirt, Baby, Activity, Home, Car, Wrench, Heart, Grape, Coffee, Zap, Star, Gift, ShoppingBag } from 'lucide-react';

const CATEGORY_ICONS = [
  { name: 'Smartphone', Icon: Smartphone },
  { name: 'Laptop', Icon: Laptop },
  { name: 'Watch', Icon: Watch },
  { name: 'Headphones', Icon: Headphones },
  { name: 'Gamepad2', Icon: Gamepad2 },
  { name: 'Camera', Icon: Camera },
  { name: 'Tv', Icon: Tv },
  { name: 'Speaker', Icon: Speaker },
  { name: 'Shirt', Icon: Shirt },
  { name: 'Baby', Icon: Baby },
  { name: 'Activity', Icon: Activity },
  { name: 'Home', Icon: Home },
  { name: 'Car', Icon: Car },
  { name: 'Wrench', Icon: Wrench },
  { name: 'Heart', Icon: Heart },
  { name: 'Grape', Icon: Grape },
  { name: 'Coffee', Icon: Coffee },
  { name: 'Zap', Icon: Zap },
  { name: 'Star', Icon: Star },
  { name: 'Gift', Icon: Gift },
  { name: 'ShoppingBag', Icon: ShoppingBag },
  { name: 'Package', Icon: Package }
];
import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/imageCompression';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ProductsView = ({ onAction, session, storeId }: { onAction: (msg: string) => void, session: any, storeId: string | null }) => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // form state
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOption, setSortOption] = useState('name-az');

  // Category Management State
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('Package');
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiImagePrompt, setAiImagePrompt] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    compare_at_price: '',
    estoque: '0',
    description: '',
    is_active: true,
    category_id: '',
    sku: '',
    warranty: '12 meses',
    pix_discount_percent: '',
    weight: '',
    width: '',
    height: '',
    length: '',
    variations: [] as any[],
    extra_info: {
      technical: '',
      informative: ''
    }
  });

  const generateSKU = (name: string) => {
    const prefix = name.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
  };

  useEffect(() => {
    if (!session?.user?.id || !storeId) {
      setLoading(false);
      return;
    }

    const fetchCategoriesAndProducts = async () => {
      setLoading(true);
      
      // Fetch Categories
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', storeId)
        .order('name');
      
      if (cats) setCategories(cats);
      
      // Then get products
      const { data: prods } = await supabase
        .from('products')
        .select('id, store_id, name, price, compare_at_price, estoque, description, is_active, category_id, sku, warranty, pix_discount_percent, weight, width, height, length, image_url, extra_info, updated_at, categories(name)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
        
      if (prods) setProducts(prods);
      
      setLoading(false);
    };

    fetchCategoriesAndProducts();
  }, [session, storeId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 5 - imagePreviews.length;
    const newFiles = files.slice(0, remainingSlots);
    
    setImageFiles(prev => [...prev, ...newFiles]);
    
    // Create previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file as Blob));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    // Also remove from files if it was a newly selected file
    // Note: this logic is slightly simplified; strictly we'd track which preview belongs to which file
    setImageFiles(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const uploadImage = async (file: File) => {
    if (!session?.user?.id) return null;
    
    onAction("Otimizando imagem...");
    const optimizedFile = await compressImage(file);
    
    const sizeRed = Math.round((1 - optimizedFile.size / file.size) * 100);
    const msg = sizeRed > 0 ? `Otimizando imagem... (${sizeRed}% reduzido)` : "Otimizando imagem...";
    onAction(msg);

    const fileExt = optimizedFile.type.split('/')[1] || 'webp';
    const filePath = `${session.user.id}/prod-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('store_assets')
      .upload(filePath, optimizedFile, { upsert: true });
      
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('store_assets')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !newCategoryName.trim()) return;

    setCategorySaving(true);
    try {
      let finalImageUrl = null;
      if (categoryImageFile) {
        finalImageUrl = await uploadImage(categoryImageFile);
      }

      const slug = newCategoryName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      const { data, error } = await supabase
        .from('categories')
        .insert([{ 
          store_id: storeId, 
          name: newCategoryName.trim(), 
          slug,
          icon: selectedIcon,
          image_url: finalImageUrl
        }])
        .select();

      if (error) throw error;
      if (data) setCategories([...categories, data[0]]);
      
      // Reset form
      setNewCategoryName('');
      setSelectedIcon('Package');
      setCategoryImageFile(null);
      setCategoryImagePreview(null);
      setShowIconPicker(false);
      
      onAction("Categoria criada com sucesso!");
    } catch (err: any) {
      onAction("Erro ao criar categoria: " + err.message);
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
      onAction("Categoria excluída com sucesso!");
    } catch (err: any) {
      onAction("Erro ao excluir categoria: " + err.message);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      onAction("Digite algo para a IA gerar o produto.");
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('product-ai-assistant', {
        body: { prompt: aiPrompt }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      if (data) {
        setNewProduct(prev => ({
          ...prev,
          name: data.name || prev.name,
          description: data.description || prev.description,
          price: data.suggested_price ? data.suggested_price.toString() : prev.price,
          extra_info: {
            technical: data.technical_info || prev.extra_info.technical,
            informative: data.informative_info || prev.extra_info.informative
          }
        }));
        if (data.image_prompt) {
          setAiImagePrompt(data.image_prompt);
        }
        onAction("Produto gerado com Inteligência Artificial! ✨");
        setAiPrompt('');
      }
    } catch (err: any) {
      onAction("Erro ao gerar com IA: " + err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const useAIImage = async () => {
    if (!aiImagePrompt) return;
    
    try {
      onAction("Baixando imagem da IA...");
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiImagePrompt)}?width=1024&height=1024&nologo=true`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const file = new File([blob], `ai-product-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      if (imagePreviews.length < 5) {
        setImageFiles(prev => [...prev, file]);
        setImagePreviews(prev => [...prev, URL.createObjectURL(file)]);
        onAction("Imagem da IA adicionada ao produto! ✨");
        setAiImagePrompt(''); // Reset to close the preview section
      } else {
        onAction("Limite de 5 imagens atingido.");
      }
    } catch (err: any) {
      onAction("Erro ao usar imagem da IA: " + err.message);
    }
  };

  const handleEditProduct = (prod: any) => {
    setEditingProductId(prod.id);
    setNewProduct({
      name: prod.name || '',
      price: prod.price?.toString() || '',
      compare_at_price: prod.compare_at_price?.toString() || '',
      estoque: prod.estoque?.toString() || '0',
      description: prod.description || '',
      is_active: prod.is_active !== undefined ? prod.is_active : true,
      category_id: prod.category_id || '',
      sku: prod.sku || '',
      warranty: prod.warranty || '12 meses',
      pix_discount_percent: prod.pix_discount_percent?.toString() || '',
      weight: prod.weight?.toString() || '',
      width: prod.width?.toString() || '',
      height: prod.height?.toString() || '',
      length: prod.length?.toString() || '',
      variations: [],
      extra_info: prod.extra_info || { technical: '', informative: '' }
    });
    
    if (prod.image_url) {
      setImagePreviews(prod.image_url.split(','));
    } else {
      setImagePreviews([]);
    }
    setImageFiles([]);
    
    // Fetch variations for this product
    const fetchVariations = async () => {
      const { data } = await supabase
        .from('product_variations')
        .select('id, product_id, name, value, price, estoque, sku, image_url, created_at')
        .eq('product_id', prod.id);
      
      if (data) {
        setNewProduct(prev => ({
          ...prev,
          variations: data
        }));
      }
    };
    
    fetchVariations();
    setIsAdding(true);
  };

  const handleDeleteProduct = (id: string) => {
    setProductToDelete(id);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete);

      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== productToDelete));
      onAction("Produto excluído com sucesso!");
    } catch (err: any) {
      onAction("Erro ao excluir produto: " + err.message);
    } finally {
      setProductToDelete(null);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) {
      onAction("Crie sua loja primeiro acessando a aba 'Minha Loja'.");
      return;
    }

    setSaving(true);
    try {
      // 1. Handle image uploads
      let currentUrls = [...imagePreviews].filter(url => url.startsWith('http')); // Keep existing public URLs
      
      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          onAction(`Otimizando imagem ${i + 1} de ${imageFiles.length}...`);
          const url = await uploadImage(imageFiles[i]);
          if (url) currentUrls.push(url);
        }
      }
      
      const finalImageUrl = currentUrls.join(',');

      const parsedWeight = newProduct.weight ? parseFloat(newProduct.weight) : null;
      const parsedWidth = newProduct.width ? parseFloat(newProduct.width) : null;
      const parsedHeight = newProduct.height ? parseFloat(newProduct.height) : null;
      const parsedLength = newProduct.length ? parseFloat(newProduct.length) : null;
      const hasShippingData = Boolean(parsedWeight && parsedWidth && parsedHeight && parsedLength);

      const productData = {
        store_id: storeId,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        compare_at_price: newProduct.compare_at_price ? parseFloat(newProduct.compare_at_price) : null,
        estoque: parseInt(newProduct.estoque),
        description: newProduct.description,
        is_active: newProduct.is_active,
        category_id: newProduct.category_id || null, 
        sku: newProduct.sku || generateSKU(newProduct.name),
        warranty: newProduct.warranty,
        pix_discount_percent: newProduct.pix_discount_percent ? parseFloat(newProduct.pix_discount_percent) : null,
        weight: parsedWeight,
        width: parsedWidth,
        height: parsedHeight,
        length: parsedLength,
        has_shipping_data: hasShippingData,
        image_url: finalImageUrl,
        extra_info: newProduct.extra_info,
        updated_at: new Date().toISOString()
      };

      let productId = editingProductId;

      if (editingProductId) {
        // Update existing product
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProductId)
          .select('id, store_id, name, price, compare_at_price, estoque, description, is_active, category_id, sku, warranty, pix_discount_percent, weight, width, height, length, image_url, extra_info, updated_at, categories(name)');

        if (error) throw error;
        if (data && data.length > 0) {
          setProducts(products.map(p => p.id === editingProductId ? data[0] : p));
        }
      } else {
        // Insert new product
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select('id, store_id, name, price, compare_at_price, estoque, description, is_active, category_id, sku, warranty, pix_discount_percent, weight, width, height, length, image_url, extra_info, updated_at, categories(name)');

        if (error) throw error;
        if (data && data.length > 0) {
          productId = data[0].id;
          setProducts([data[0], ...products]);
        }
      }

      // Handle Variations
      if (productId) {
        // Simple strategy: delete existing and re-insert
        if (editingProductId) {
          await supabase.from('product_variations').delete().eq('product_id', productId);
        }

        if (newProduct.variations.length > 0) {
          const variationsToInsert = newProduct.variations.map(v => ({
            product_id: productId,
            name: v.name,
            value: v.value,
            price: v.price ? parseFloat(v.price) : null,
            estoque: parseInt(v.estoque) || 0,
            sku: v.sku || null
          }));
          await supabase.from('product_variations').insert(variationsToInsert);
        }
      }

      onAction(editingProductId ? "Produto atualizado com sucesso!" : "Produto adicionado com sucesso!");

      setIsAdding(false);
      setEditingProductId(null);
      // reset form
      setNewProduct({ name: '', price: '', compare_at_price: '', estoque: '0', description: '', is_active: true, category_id: '', sku: '', warranty: '12 meses', pix_discount_percent: '', weight: '', width: '', height: '', length: '', variations: [], extra_info: { technical: '', informative: '' } });
      setImageFiles([]);
      setImagePreviews([]);
      
    } catch (err: any) {
      onAction("Erro ao salvar produto: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prod.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || prod.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortOption === 'name-az') return a.name.localeCompare(b.name);
    if (sortOption === 'name-za') return b.name.localeCompare(a.name);
    if (sortOption === 'price-high') return Number(b.price) - Number(a.price);
    if (sortOption === 'price-low') return Number(a.price) - Number(b.price);
    if (sortOption === 'estoque-high') return (b.estoque || 0) - (a.estoque || 0);
    return 0;
  });

  if (loading) return <div className="py-12 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-[#5551FF] animate-spin" /></div>;

  if (isAdding) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-500">{products.length} produto(s) cadastrado(s)</p>
          </div>
          <button 
            onClick={() => {
              if (!storeId) {
                onAction("Crie sua loja na aba 'Minha Loja' antes de adicionar produtos.");
              } else {
                setIsAdding(true);
              }
            }}
            className="bg-[#5551FF] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-[#4440FF] transition-colors shadow-sm"
          >
            <Plus size={18} />
            Adicionar
          </button>
        </div>
        
        {/* Background List Placeholder */}
        <div className="opacity-50 pointer-events-none">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Buscar produto..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm" disabled />
            </div>
          </div>
          <div className="bg-white/50 rounded-3xl border border-gray-100 shadow-sm min-h-[400px] mt-8" />
        </div>

        {/* Modal Overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 flex items-center justify-between border-b border-gray-50">
              <h2 className="text-xl font-bold text-slate-800">{editingProductId ? 'Editar produto' : 'Novo produto'}</h2>
              <button 
                onClick={() => {
                  setIsAdding(false);
                  setEditingProductId(null);
                  setNewProduct({ name: '', price: '', compare_at_price: '', estoque: '0', description: '', is_active: true, category_id: '', sku: '', warranty: '12 meses', pix_discount_percent: '', weight: '', width: '', height: '', length: '', variations: [], extra_info: { technical: '', informative: '' } });
                  setImagePreviews([]);
                  setImageFiles([]);
                  setAiPrompt('');
                  setAiImagePrompt('');
                }}
                className="text-gray-400 hover:text-gray-900 transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
              
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Imagens ({imagePreviews.length}/5)</label>
                <div className="flex gap-4">
                   {imagePreviews.map((preview, idx) => (
                     <div key={idx} className="w-24 h-24 border border-gray-200 rounded-xl relative overflow-hidden group">
                       <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                       <button 
                         type="button" 
                         onClick={() => removeImage(idx)} 
                         className="absolute top-1 right-1 bg-white/90 backdrop-blur rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500 shadow-sm"
                       >
                         <X size={14} />
                       </button>
                     </div>
                   ))}

                   {imagePreviews.length < 5 && (
                     <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center relative overflow-hidden bg-gray-50 hover:border-[#5551FF] hover:bg-[#5551FF]/5 transition-colors cursor-pointer group">
                        <div className="text-gray-400 group-hover:text-[#5551FF] transition-colors">
                           <Upload size={20} />
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple
                          onChange={handleImageSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        />
                     </div>
                   )}
                   
                   {/* Ghost placeholders for remaining slots up to 4 */}
                   {Array.from({ length: Math.max(0, 4 - imagePreviews.length) }).map((_, idx) => (
                     <div key={`ghost-${idx}`} className="w-24 h-24 border border-dashed border-gray-200 rounded-xl bg-gray-50/50" />
                   ))}
                </div>
              </div>

              {/* AI Assistant Section */}
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 space-y-3 shadow-inner">
                <div className="flex items-center gap-2 text-indigo-700">
                  <Sparkles size={18} className="animate-pulse" />
                  <span className="text-sm font-bold">Assistente Mágico com IA</span>
                </div>
                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: Fone bluetooth preto com cancelamento de ruído..."
                    className="flex-1 px-4 py-2.5 bg-white border border-indigo-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-indigo-300 transition-all"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGenerateAI(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI || !aiPrompt.trim()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] active:scale-95"
                  >
                    {isGeneratingAI ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Wand2 size={16} />
                    )}
                    Gerar
                  </button>
                </div>
                {aiImagePrompt && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95">
                    <div className="p-3 bg-white/60 rounded-xl border border-indigo-100/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                          <ImageIcon size={12}/> Prompt da Imagem
                        </p>
                        <button 
                          type="button" 
                          onClick={() => {
                            navigator.clipboard.writeText(aiImagePrompt);
                            onAction("Prompt copiado! ✨");
                          }}
                          className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full hover:bg-indigo-200 transition-colors font-bold"
                        >
                          Copiar
                        </button>
                      </div>
                      <p className="text-[11px] text-indigo-900 font-mono select-all bg-white p-2.5 rounded-lg border border-indigo-50 leading-relaxed italic">{aiImagePrompt}</p>
                    </div>

                    <div className="relative group rounded-2xl overflow-hidden border-2 border-indigo-100 bg-indigo-50 aspect-video flex items-center justify-center shadow-lg">
                      <img 
                        src={`https://image.pollinations.ai/prompt/${encodeURIComponent(aiImagePrompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000)}`} 
                        alt="AI Preview" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onLoad={() => onAction("Imagem gerada com sucesso! ✨")}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-white text-[10px] font-medium italic">Pré-visualização gerada por IA</p>
                      </div>
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                        <Sparkles size={10} /> Preview
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button
                         type="button"
                         onClick={useAIImage}
                         className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                       >
                         <Check size={14} /> Usar esta Imagem
                       </button>
                    </div>
                    <p className="text-[10px] text-center text-indigo-400 italic">Dica: Se gostar da imagem, clique em "Usar esta Imagem" para adicioná-la ao produto.</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome</label>
                <input 
                  type="text" 
                  required
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Nome do produto" 
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 focus:border-[#5551FF] transition-all" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Descrição</label>
                <textarea 
                  rows={4}
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Descrição do produto" 
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 focus:border-[#5551FF] transition-all resize-none" 
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Informações Extras</label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Especificações Técnicas</label>
                    <textarea 
                      rows={3}
                      value={newProduct.extra_info.technical}
                      onChange={e => setNewProduct({...newProduct, extra_info: { ...newProduct.extra_info, technical: e.target.value }})}
                      placeholder="Ex: Peso: 1kg, Dimensões: 20x20x20cm, Material: Aço..." 
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Informações Adicionais</label>
                    <textarea 
                      rows={3}
                      value={newProduct.extra_info.informative}
                      onChange={e => setNewProduct({...newProduct, extra_info: { ...newProduct.extra_info, informative: e.target.value }})}
                      placeholder="Ex: Garantia de 1 ano, Envio imediato, Produto original..." 
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preço (R$)</label>
                  <input 
                    type="number" step="0.01"
                    required
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="0.00" 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 focus:border-[#5551FF] transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preço Promo (R$)</label>
                  <input 
                    type="number" step="0.01"
                    value={newProduct.compare_at_price}
                    onChange={e => setNewProduct({...newProduct, compare_at_price: e.target.value})}
                    placeholder="opcional" 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 focus:border-[#5551FF] transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Desconto Adicional no PIX (%)</label>
                <div className="relative">
                  <input 
                    type="number" step="0.1"
                    value={newProduct.pix_discount_percent}
                    onChange={e => setNewProduct({...newProduct, pix_discount_percent: e.target.value})}
                    placeholder="Ex: 10" 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 focus:border-[#5551FF] transition-all" 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold select-none">%</div>
                </div>
                <p className="text-[10px] text-gray-400">Este desconto será aplicado automaticamente ao selecionar PIX no checkout.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categoria</label>
                  <div className="relative">
                    <select 
                      value={newProduct.category_id}
                      onChange={e => setNewProduct({...newProduct, category_id: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 focus:border-[#5551FF] appearance-none text-slate-700"
                    >
                      <option value="">Selecione</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Garantia</label>
                  <input 
                    type="text" 
                    value={newProduct.warranty}
                    onChange={e => setNewProduct({...newProduct, warranty: e.target.value})}
                    placeholder="Ex: 12 meses" 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 focus:border-[#5551FF] transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">SKU (Auto-gerado)</label>
                  <input 
                    type="text" 
                    value={newProduct.sku}
                    onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                    placeholder="Código" 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 focus:border-[#5551FF] transition-all" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estoque Total</label>
                <input 
                  type="number" 
                  value={newProduct.estoque}
                  onChange={e => setNewProduct({...newProduct, estoque: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 focus:border-[#5551FF] transition-all" 
                />
              </div>

              {/* Shipping Dimensions UI */}
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <Package className="text-[#5551FF]" size={18} />
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dados de Envio (Opcional)</label>
                </div>
                <p className="text-[11px] text-gray-400">
                  Para habilitar o cálculo de frete automático no checkout, preencha todos os 4 campos abaixo. Caso deixe em branco, o produto ficará restrito à "Retirada em mãos".
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Peso (kg)</label>
                    <input 
                      type="number" step="0.01"
                      placeholder="0.00" 
                      className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs focus:ring-1 focus:ring-indigo-200 focus:outline-none"
                      value={newProduct.weight}
                      onChange={e => setNewProduct({...newProduct, weight: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Largura (cm)</label>
                    <input 
                      type="number" step="0.1"
                      placeholder="0.0" 
                      className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs focus:ring-1 focus:ring-indigo-200 focus:outline-none"
                      value={newProduct.width}
                      onChange={e => setNewProduct({...newProduct, width: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Altura (cm)</label>
                    <input 
                      type="number" step="0.1"
                      placeholder="0.0" 
                      className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs focus:ring-1 focus:ring-indigo-200 focus:outline-none"
                      value={newProduct.height}
                      onChange={e => setNewProduct({...newProduct, height: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Compr. (cm)</label>
                    <input 
                      type="number" step="0.1"
                      placeholder="0.0" 
                      className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs focus:ring-1 focus:ring-indigo-200 focus:outline-none"
                      value={newProduct.length}
                      onChange={e => setNewProduct({...newProduct, length: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Variations UI */}
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Variações (Tamanho, Cor, etc)</label>
                  <button 
                    type="button"
                    onClick={() => setNewProduct({
                      ...newProduct, 
                      variations: [...newProduct.variations, { name: '', value: '', price: '', estoque: '0', sku: '' }]
                    })}
                    className="text-xs font-bold text-[#5551FF] hover:underline"
                  >
                    + Adicionar Variação
                  </button>
                </div>
                
                {newProduct.variations.length > 0 && (
                  <div className="space-y-3">
                    {newProduct.variations.map((v, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-2 gap-3 relative">
                        <button 
                          type="button"
                          onClick={() => {
                            const updated = [...newProduct.variations];
                            updated.splice(i, 1);
                            setNewProduct({...newProduct, variations: updated});
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors"
                        >
                          <X size={12}/>
                        </button>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Nome</label>
                          <input 
                            placeholder="ex: Tamanho" 
                            className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs"
                            value={v.name}
                            onChange={e => {
                              const updated = [...newProduct.variations];
                              updated[i].name = e.target.value;
                              setNewProduct({...newProduct, variations: updated});
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Valor</label>
                          <input 
                            placeholder="ex: XL" 
                            className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs"
                            value={v.value}
                            onChange={e => {
                              const updated = [...newProduct.variations];
                              updated[i].value = e.target.value;
                              setNewProduct({...newProduct, variations: updated});
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Preço (Opcional)</label>
                          <input 
                            placeholder="R$ 0,00" 
                            className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs"
                            value={v.price}
                            onChange={e => {
                              const updated = [...newProduct.variations];
                              updated[i].price = e.target.value;
                              setNewProduct({...newProduct, variations: updated});
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Estoque</label>
                          <input 
                            type="number"
                            placeholder="0" 
                            className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs"
                            value={v.estoque}
                            onChange={e => {
                              const updated = [...newProduct.variations];
                              updated[i].estoque = e.target.value;
                              setNewProduct({...newProduct, variations: updated});
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label htmlFor="active" className="text-sm font-bold text-slate-800">
                  Produto ativo
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="active"
                    checked={newProduct.is_active}
                    onChange={e => setNewProduct({...newProduct, is_active: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5551FF]"></div>
                </label>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 rounded-xl font-bold text-white bg-[#5551FF] hover:bg-[#4440FF] transition-colors shadow-lg shadow-indigo-100 disabled:opacity-70 flex justify-center items-center"
                >
                  {saving ? 'Salvando...' : (editingProductId ? 'Salvar alterações' : 'Criar produto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-500">{products.length} produto(s) cadastrado(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsManagingCategories(true)}
            className="flex-1 sm:flex-initial px-4 py-2 border border-gray-200 text-gray-600 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            Categorias
          </button>
          <button 
            onClick={() => {
              if (!storeId) {
                onAction("Crie sua loja na aba 'Minha Loja' antes de adicionar produtos.");
              } else {
                setIsAdding(true);
              }
            }}
            className="flex-1 sm:flex-initial bg-[#5551FF] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-[#4440FF] transition-colors shadow-sm text-sm"
          >
            <Plus size={18} />
            Adicionar
          </button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar produto ou SKU..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 transition-all font-medium"
          />
        </div>
        <div className="flex gap-2 sm:gap-4">
          <div className="relative flex-1 sm:flex-initial">
            <select 
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-100 pl-4 pr-10 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#5551FF]/20 cursor-pointer"
            >
              <option value="">Todas Categorias</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
          <div className="relative flex-1 sm:flex-initial">
            <select 
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-100 pl-4 pr-10 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#5551FF]/20 cursor-pointer"
            >
              <option value="name-az">Nome A-Z</option>
              <option value="name-za">Nome Z-A</option>
              <option value="price-high">Preço Maior</option>
              <option value="price-low">Preço Menor</option>
              <option value="estoque-high">Estoque</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 h-full text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
              <Package size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhum produto cadastrado.</h3>
              <p className="text-sm text-gray-500">Adicione seu primeiro produto para começar a vender.</p>
            </div>
            <button 
              onClick={() => {
                if (!storeId) onAction("Por favor, crie sua loja primeiro!"); else setIsAdding(true);
              }}
              className="px-6 py-2.5 bg-[#5551FF] text-white font-bold rounded-lg mt-2 shadow shadow-indigo-100 hover:bg-[#4440FF]"
            >
              Adicionar Produto
            </button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[800px] lg:min-w-full">
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-6 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/30">
                <div className="w-12 text-center">Imagem</div>
                <div>Produto</div>
                <div className="text-right w-24">Preço</div>
                <div className="text-right w-16">Estoque</div>
                <div className="text-center w-20">Status</div>
                <div className="text-right w-20">Ações</div>
              </div>
            <div className="divide-y divide-gray-50">
              {filteredProducts.map(prod => (
                <div key={prod.id} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-6 px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                    {prod.image_url ? (
                      <img src={prod.image_url.split(',')[0]} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-800 text-sm truncate">{prod.name}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1 truncate">
                      <Package size={12}/> {prod.categories?.name || 'Sem Categoria'}
                    </span>
                  </div>
                  <div className="text-right font-bold text-slate-800 text-sm">
                    {Number(prod.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-right text-xs font-bold text-slate-800">
                    {prod.estoque}<br/>
                    <span className="text-[10px] text-gray-400">un.</span>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${prod.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      {prod.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="text-right flex items-center justify-end gap-2 text-gray-400 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditProduct(prod)} className="p-2 hover:text-[#5551FF] transition-colors" title="Editar">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteProduct(prod.id)} className="p-2 hover:text-red-500 transition-colors" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Excluir Produto</h3>
            <p className="text-sm text-gray-500 text-center mb-8">
              Tem certeza que deseja excluir este produto? Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Category Management Modal */}
      {isManagingCategories && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Gerenciar Categorias</h3>
              <button onClick={() => setIsManagingCategories(false)} className="text-gray-400 hover:text-gray-900"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#5551FF] transition-all hover:border-[#5551FF]/30"
                    >
                      {categoryImagePreview ? (
                        <img src={categoryImagePreview} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        React.createElement(CATEGORY_ICONS.find(i => i.name === selectedIcon)?.Icon || Package, { size: 24 })
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {showIconPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-[60]"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Escolha um Ícone</span>
                            <label className="cursor-pointer text-[10px] font-black uppercase text-[#5551FF] hover:underline">
                              Upload Foto
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setCategoryImageFile(file);
                                    setCategoryImagePreview(URL.createObjectURL(file));
                                    setShowIconPicker(false);
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {CATEGORY_ICONS.map(({ name, Icon }) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => {
                                  setSelectedIcon(name);
                                  setCategoryImageFile(null);
                                  setCategoryImagePreview(null);
                                  setShowIconPicker(false);
                                }}
                                className={cn(
                                  "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
                                  selectedIcon === name && !categoryImagePreview ? "bg-indigo-50 text-[#5551FF]" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                                )}
                              >
                                <Icon size={18} />
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <form onSubmit={handleSaveCategory} className="flex-1 flex gap-2">
                    <input 
                      type="text" 
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      placeholder="Nome da categoria..."
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#5551FF]/20 outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={categorySaving}
                      className="bg-[#5551FF] text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 hover:brightness-110 transition-all flex items-center justify-center min-w-[44px]"
                    >
                      {categorySaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={18}/>}
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Categorias Atuais</span>
                {categories.length === 0 ? (
                  <p className="text-center py-8 text-gray-400 text-sm italic">Nenhuma categoria criada.</p>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group transition-colors hover:bg-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          {cat.image_url ? (
                            <img src={cat.image_url} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            React.createElement(CATEGORY_ICONS.find(i => i.name === cat.icon)?.Icon || Package, { size: 16 })
                          )}
                        </div>
                        <span className="font-medium text-slate-700">{cat.name}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setIsManagingCategories(false)}
                className="px-6 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
