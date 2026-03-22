import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/imageCompression';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Link2,
  Check,
  Plus,
  Store,
  Palette,
  Globe,
  Copy,
  Eye,
  Share2,
  MessageCircle,
  X,
  ExternalLink,
  Instagram,
  Pencil,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  onAction: (msg: string) => void;
  session: any;
  userProfile: any;
}

export const CatalogView = ({ onAction, session, userProfile }: Props) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [savingProduct, setSavingProduct] = useState(false);
  const [catalog, setCatalog] = useState<any>({
    title: 'Meu Catálogo',
    description: '',
    logo_url: '',
    theme_color: '#5551FF',
    slug: '',
    whatsapp: '',
    instagram_url: '',
  });

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchData();
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch catalog
      let { data: catData } = await supabase
        .from('catalogs')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!catData) {
        // Generate default slug from email
        const emailPrefix = session.user.email?.split('@')[0] || 'catalogo';
        const defaultSlug = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.random().toString(36).substring(2, 6);
        
        const { data: newCat } = await supabase.from('catalogs').insert({
          user_id: session.user.id,
          title: 'Meu Catálogo',
          slug: defaultSlug
        }).select().single();
        
        catData = newCat;
      }

      if (catData) {
        setCatalog(catData);
        // Fetch products from catalog_products
        const { data: productsData } = await supabase
          .from('catalog_products')
          .select('id, catalog_id, name, description, price, compare_at_price, image_url, is_active, created_at, updated_at, estoque')
          .eq('catalog_id', catData.id)
          .order('created_at', { ascending: false });

        if (productsData) setProducts(productsData);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (file: File) => {
    onAction("Otimizando logo...");
    const optimizedFile = await compressImage(file);
    const sizeRed = Math.round((1 - optimizedFile.size / file.size) * 100);
    const msg = sizeRed > 0 ? `Otimizando logo... (${sizeRed}% reduzido)` : "Otimizando logo...";
    onAction(msg);
    const fileExt = optimizedFile.type.split('/')[1] || 'webp';
    const filePath = `${session.user.id}/catalog-logo-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('store_assets').upload(filePath, optimizedFile, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('store_assets').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const uploadProductImages = async (files: File[]) => {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      onAction(`Otimizando imagem ${i + 1} de ${files.length}...`);
      const optimizedFile = await compressImage(files[i]);
      const sizeRed = Math.round((1 - optimizedFile.size / files[i].size) * 100);
      const msg = sizeRed > 0 ? `Otimizando imagem ${i + 1}... (${sizeRed}% reduzido)` : `Otimizando imagem ${i + 1}...`;
      onAction(msg);
      const fileExt = optimizedFile.type.split('/')[1] || 'webp';
      const filePath = `${session.user.id}/catalog-product-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error } = await supabase.storage.from('store_assets').upload(filePath, optimizedFile);
      if (error) throw error;
      const { data } = supabase.storage.from('store_assets').getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catalog?.id) {
       alert('Catálogo não encontrado. Salve a página e tente novamente.');
       return;
    }
    if (!editingProduct.id && userProfile?.plan === 'free' && products.length >= 10) {
      alert('No plano FREE você pode cadastrar até 10 produtos no catálogo. Faça upgrade para cadastrar produtos ilimitados!');
      setSavingProduct(false);
      return;
    }

    if (!editingProduct.name || !editingProduct.price) {
      alert('Preencha nome e preço');
      setSavingProduct(false);
      return;
    }

    setSavingProduct(true);
    try {
      let uploadedUrls: string[] = [];
      if (productImages.length > 0) {
        uploadedUrls = await uploadProductImages(productImages);
      }
      
      const finalImages = [...existingImages, ...uploadedUrls].slice(0, 5);

      const payload = {
        catalog_id: catalog.id,
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price,
        compare_at_price: editingProduct.compare_at_price || null,
        sku: editingProduct.sku || '',
        estoque: parseInt(editingProduct.estoque || '0'),
        image_url: finalImages.join(','),
        is_active: editingProduct.is_active !== false,
        updated_at: new Date().toISOString()
      };

      if (editingProduct.id) {
        const { error } = await supabase.from('catalog_products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('catalog_products').insert(payload);
        if (error) throw error;
      }

      setEditingProduct(null);
      setProductImages([]);
      setExistingImages([]);
      fetchData();
      onAction('Produto salvo com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar produto: ' + err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if(!confirm('Tem certeza que deseja excluir?')) return;
    try {
       const { error } = await supabase.from('catalog_products').delete().eq('id', id);
       if (error) throw error;
       fetchData();
       onAction('Produto excluído');
    } catch (err: any) {
       alert('Erro:' + err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let logoUrl = catalog.logo_url;
      if (newLogoFile) {
        logoUrl = await uploadLogo(newLogoFile);
      }

      const payload = {
        ...catalog,
        logo_url: logoUrl,
        user_id: session.user.id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('catalogs')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      setCatalog({ ...catalog, logo_url: logoUrl });
      setNewLogoFile(null);
      onAction('Catálogo salvo com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar catálogo: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const catalogUrl = `${window.location.origin}/catalogo/${catalog.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(catalogUrl);
    onAction('Link do catálogo copiado!');
  };

  if (loading)
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-[#5551FF] animate-spin" />
      </div>
    );

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Catálogo</h1>
          <p className="text-gray-500">Sua vitrine digital simples para compartilhar com clientes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
          >
            <Eye size={16} /> Preview
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-[#5551FF] rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors"
          >
            <Copy size={16} /> Copiar Link
          </button>
        </div>
      </div>

      {/* Link card */}
      <div className="bg-gradient-to-r from-[#5551FF] to-[#7C79FF] p-6 rounded-2xl text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <BookOpen size={16} />
          </div>
          <p className="text-sm font-bold opacity-80">Link do seu catálogo</p>
        </div>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-sm bg-white/10 px-4 py-2 rounded-xl truncate font-mono">
            {catalogUrl}
          </code>
          <button
            onClick={handleCopyLink}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      {/* Catalog settings */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[#5551FF] font-bold text-sm">
          <BookOpen size={18} />
          Informações do catálogo
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo */}
          <div className="md:col-span-2 flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 overflow-hidden shrink-0">
              {catalog.logo_url ? (
                <img src={catalog.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Store size={28} />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">Logo do catálogo</p>
              <p className="text-xs text-gray-400 mb-3">PNG ou JPG, 200x200px recomendado</p>
              <label className="cursor-pointer text-xs font-bold text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors flex items-center gap-2 w-fit">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewLogoFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setCatalog((p: any) => ({ ...p, logo_url: reader.result as string }));
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {catalog.logo_url ? <Check size={14} className="text-emerald-500" /> : <Plus size={14} />}
                {catalog.logo_url ? 'Trocar logo' : 'Enviar logo'}
              </label>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título do Catálogo</label>
            <input
              type="text"
              value={catalog.title || ''}
              onChange={e => setCatalog({ ...catalog, title: e.target.value })}
              placeholder="Ex: Catálogo da Maria"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL do Catálogo</label>
            <div className="flex">
              <span className="px-3 py-3 bg-gray-50 border border-r-0 border-gray-100 rounded-l-xl text-xs text-gray-400 whitespace-nowrap">/catalogo/</span>
              <input
                type="text"
                value={catalog.slug || ''}
                onChange={e => setCatalog({ ...catalog, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="meu-catalogo"
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição</label>
            <textarea
              value={catalog.description || ''}
              onChange={e => setCatalog({ ...catalog, description: e.target.value })}
              placeholder="Uma breve descrição do que você vende..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp</label>
            <div className="relative">
              <MessageCircle size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                value={catalog.whatsapp || ''}
                onChange={e => setCatalog({ ...catalog, whatsapp: e.target.value })}
                placeholder="5511999999999"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instagram URL</label>
            <div className="relative">
              <Instagram size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                value={catalog.instagram_url || ''}
                onChange={e => setCatalog({ ...catalog, instagram_url: e.target.value })}
                placeholder="https://instagram.com/perfil"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Theme color */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cor do Catálogo</label>
            <label className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="color"
                value={catalog.theme_color || '#5551FF'}
                onChange={e => setCatalog({ ...catalog, theme_color: e.target.value })}
                className="sr-only"
              />
              <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: catalog.theme_color || '#5551FF' }} />
              <span className="text-sm font-bold text-gray-700">{(catalog.theme_color || '#5551FF').toUpperCase()}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Products in catalog */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#5551FF] font-bold text-sm">
            <Store size={18} /> Produtos no catálogo ({products.length})
          </div>
          <button 
             onClick={() => {
                setEditingProduct({ name: '', price: '', description: '', compare_at_price: '', is_active: true });
                setProductImages([]);
                setExistingImages([]);
             }}
             className="px-4 py-2 bg-[#5551FF] text-white rounded-xl text-xs font-bold hover:bg-[#4440FF] flex items-center gap-2"
          >
            <Plus size={16} /> Adicionar Produto
          </button>
        </div>

        {products.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Store size={28} />
            </div>
            <p className="text-gray-500 font-medium">Nenhum produto ativo encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Adicione produtos às suas lojas para que apareçam no catálogo</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.slice(0, 50).map((product) => (
              <div key={product.id} className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all">
                <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => {
                      setEditingProduct(product);
                      setExistingImages(product.image_url ? product.image_url.split(',') : []);
                      setProductImages([]);
                   }} className="p-1.5 bg-white text-gray-700 rounded-lg shadow-sm hover:text-[#5551FF]">
                      <Pencil size={14} />
                   </button>
                   <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 bg-white text-red-500 rounded-lg shadow-sm hover:text-red-700">
                      <X size={14} />
                   </button>
                </div>
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {product.image_url ? (
                    <img src={product.image_url.split(',')[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Store size={24} />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-[#5551FF] font-black">
                    R$ {Number(product.price).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            ))}
            {products.length > 50 && (
              <div className="aspect-square bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                <p className="text-xs font-bold text-indigo-500 text-center">+{products.length - 50}<br/>produtos</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[#5551FF] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4440FF] transition-all shadow-lg shadow-indigo-100 disabled:opacity-70"
      >
        <Check size={18} />
        {saving ? 'Salvando...' : 'Salvar Catálogo'}
      </button>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Preview header */}
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Preview do Catálogo</span>
                <button onClick={() => setShowPreview(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
              {/* Preview content */}
              <div className="overflow-y-auto max-h-[70vh]">
                {/* Hero section */}
                <div className="p-6 text-center" style={{ backgroundColor: (catalog.theme_color || '#5551FF') + '15' }}>
                  {catalog.logo_url ? (
                    <img src={catalog.logo_url} alt="Logo" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 shadow-lg" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: catalog.theme_color || '#5551FF' }}>
                      <Store size={24} />
                    </div>
                  )}
                  <h2 className="text-lg font-black text-gray-900">{catalog.title || 'Meu Catálogo'}</h2>
                  {catalog.description && <p className="text-xs text-gray-500 mt-1">{catalog.description}</p>}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    {catalog.whatsapp && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <MessageCircle size={10} /> WhatsApp
                      </div>
                    )}
                    {catalog.instagram_url && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded-full">
                        <Instagram size={10} /> Instagram
                      </div>
                    )}
                  </div>
                </div>
                {/* Products */}
                <div className="p-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Produtos</p>
                  <div className="grid grid-cols-2 gap-3">
                    {products.slice(0, 6).map(p => (
                      <div key={p.id} className="rounded-xl overflow-hidden border border-gray-100">
                        <div className="aspect-square bg-gray-100 overflow-hidden">
                          {p.image_url ? <img src={p.image_url.split(',')[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><Store size={16} /></div>}
                        </div>
                        <div className="p-2">
                          <p className="text-[10px] font-bold text-gray-900 truncate">{p.name}</p>
                          <p className="text-[10px] font-black" style={{ color: catalog.theme_color || '#5551FF' }}>R$ {Number(p.price).toFixed(2).replace('.', ',')}</p>
                        </div>
                        <button className="w-full py-1.5 text-[9px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: catalog.theme_color || '#5551FF' }}>
                          Pedir via WhatsApp
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* View button */}
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => window.open(catalogUrl, '_blank')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ backgroundColor: catalog.theme_color || '#5551FF' }}
                >
                  <ExternalLink size={16} /> Abrir catálogo real
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editing Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">{editingProduct.id ? 'Editar Produto' : 'Novo Produto'}</h3>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Nome do Produto</label>
                  <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Preço (R$)</label>
                    <input required type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value ? parseFloat(e.target.value) : ''})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Estoque</label>
                    <input type="number" value={editingProduct.estoque || '0'} onChange={e => setEditingProduct({...editingProduct, estoque: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">SKU</label>
                    <input type="text" value={editingProduct.sku || ''} onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" placeholder="Opcional" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Preço Antigo (De R$)</label>
                    <input type="number" step="0.01" value={editingProduct.compare_at_price || ''} onChange={e => setEditingProduct({...editingProduct, compare_at_price: e.target.value ? parseFloat(e.target.value) : null})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Descrição</label>
                  <textarea rows={3} value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm resize-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Imagens (Até 5)</label>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden group">
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={16} /></button>
                      </div>
                    ))}
                    {productImages.map((img, i) => (
                      <div key={'new'+i} className="relative w-16 h-16 rounded-xl overflow-hidden group">
                        <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setProductImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={16} /></button>
                      </div>
                    ))}
                    {(existingImages.length + productImages.length) < 5 && (
                      <label className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-[#5551FF] hover:border-[#5551FF] cursor-pointer transition-colors">
                        <input type="file" multiple accept="image/*" onChange={e => {
                          if (e.target.files) {
                            const newFiles = Array.from(e.target.files);
                            const spaceLeft = 5 - (existingImages.length + productImages.length);
                            setProductImages(prev => [...prev, ...newFiles.slice(0, spaceLeft)]);
                          }
                        }} className="hidden" />
                        <Plus size={20} />
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProduct}
                  className="w-full py-4 mt-4 bg-[#5551FF] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4440FF] transition-all disabled:opacity-70"
                >
                  <Check size={18} /> {savingProduct ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
