import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Palette,
  Globe,
  Store,
  CreditCard,
  LogOut,
  ExternalLink,
  Bell,
  Plus,
  Search,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Box,
  ArrowRight,
  Check,
  Zap,
  Info,
  Share2,
  ShieldCheck,
  User,
  Lock,
  ChevronDown,
  HelpCircle,
  Trash2,
  Users,
  BarChart3,
  MoreVertical,
  Calendar,
  Layers,
  Menu,
  X,
  BookOpen,
  AlertCircle,
  Edit3,
  Clock
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { ProductsView } from './views/ProductsView';
import { CatalogView } from './views/CatalogView';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StorefrontView } from './views/StorefrontView';

/**
 * Utility for tailwind class merging
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type View = 'dashboard' | 'produtos' | 'pedidos' | 'aparencia' | 'dominio' | 'minha-loja' | 'plano' | 'checkout' | 'admin-assinaturas' | 'admin-dashboard' | 'admin-users' | 'admin-stores' | 'admin-access' | 'catalogo' | 'minhas-lojas';

interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  plan: string;
  expires_at: string | null;
}

// --- Mock Data ---

const chartData = [
  { date: '01/03', sales: 2 },
  { date: '02/03', sales: 2 },
  { date: '03/03', sales: 2 },
  { date: '04/03', sales: 2 },
  { date: '05/03', sales: 6 },
  { date: '06/03', sales: 28 },
  { date: '07/03', sales: 4 },
];

const recentOrders = [
  { id: 1, name: 'teste', email: 'dionis natan silva lopes', date: '06 mar', value: 'R$ 29,90', status: 'Cancelado' },
  { id: 2, name: 'teste', email: 'dionis natan silva lopes', date: '06 mar', value: 'R$ 29,90', status: 'Cancelado' },
  { id: 3, name: 'print', email: '', date: '06 mar', value: 'R$ 29,90', status: 'Pago' },
];

const bestSellers = [
  { name: 'teste', sales: 2, percentage: 80, image: 'https://picsum.photos/seed/teste/40/40' },
  { name: 'print', sales: 1, percentage: 40, image: 'https://picsum.photos/seed/print/40/40' },
];

// --- Components ---

const Toast = ({ message, visible, onHide }: { message: string, visible: boolean, onHide: () => void }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
      >
        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
          <Check size={12} strokeWidth={4} />
        </div>
        <span className="text-sm font-bold tracking-tight">{message}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick
}: {
  icon: any,
  label: string,
  active?: boolean,
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 group",
      active
        ? "bg-[#EEF2FF] text-[#5551FF]"
        : "text-[#6B7280] hover:bg-gray-50 hover:text-gray-900"
    )}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={cn(active ? "text-[#5551FF]" : "text-[#9CA3AF] group-hover:text-gray-600")} />
      <span className="text-sm font-medium">{label}</span>
    </div>
    {active && <div className="w-1.5 h-1.5 rounded-full bg-[#5551FF]" />}
  </button>
);

const StatCard = ({ icon: Icon, label, value, subtext, color }: { icon: any, label: string, value: string, subtext: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", color)}>
      <Icon size={20} className="text-current" />
    </div>
    <div className="space-y-1">
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-xs text-gray-400">{subtext}</p>
    </div>
  </div>
);

// --- Views ---

const DashboardView = ({ onAction, onNavigate, storeId }: { onAction: (msg: string) => void; onNavigate: (view: View) => void; storeId: string | null }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex flex-col sm:items-center sm:flex-row justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Bem-vindo de volta 👋</p>
      </div>
      <button
        onClick={() => onNavigate('produtos')}
        className="w-full sm:w-auto bg-[#5551FF] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-[#4440FF] transition-colors shadow-sm"
      >
        <Plus size={18} />
        Novo produto
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={DollarSign}
        label="Faturamento"
        value="R$ 29,90"
        subtext="Pedidos pagos"
        color="bg-blue-50 text-blue-600"
      />
      <StatCard
        icon={ShoppingCart}
        label="Pedidos"
        value="3"
        subtext="0 hoje"
        color="bg-indigo-50 text-indigo-600"
      />
      <StatCard
        icon={Box}
        label="Produtos"
        value="2"
        subtext="2 ativos"
        color="bg-purple-50 text-purple-600"
      />
      <StatCard
        icon={TrendingUp}
        label="Pendentes"
        value="0"
        subtext="Aguardando ação"
        color="bg-orange-50 text-orange-600"
      />
    </div>

    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Vendas</h2>
          <p className="text-sm text-gray-500">Últimos 7 dias</p>
        </div>
        <span className="bg-[#EEF2FF] text-[#5551FF] text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
          Esta semana
        </span>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5551FF" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#5551FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              dx={-10}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#5551FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pedidos recentes</h2>
            <p className="text-sm text-gray-500">3 pedido(s) no total</p>
          </div>
          <button
            onClick={() => onNavigate('pedidos')}
            className="text-[#5551FF] text-sm font-bold flex items-center gap-1 hover:underline"
          >
            Ver todos <ArrowRight size={14} />
          </button>
        </div>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#5551FF] font-bold text-sm shrink-0">
                  {order.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{order.name}</h4>
                  <p className="text-xs text-gray-400 truncate">{order.email} • {order.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-900">{order.value}</span>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                  order.status === 'Cancelado' ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                )}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Mais vendidos</h2>
        <p className="text-sm text-gray-500 mb-6">Por quantidade de pedidos</p>
        <div className="space-y-6">
          {bestSellers.map((product) => (
            <div key={product.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                  <span className="text-sm font-bold text-gray-900">{product.name}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">{product.sales} vendas</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${product.percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#5551FF] rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { title: 'Gerenciar produtos', desc: 'Adicionar, editar ou remover', action: 'produtos' },
        { title: 'Ver pedidos', desc: 'Acompanhar e atualizar status', action: 'pedidos' },
        { title: 'Editar loja', desc: 'Logo, cores e informações', action: 'minha-loja' }
      ].map((action) => (
        <button
          key={action.title}
          onClick={() => onNavigate(action.action as View)}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <h3 className="text-sm font-bold text-gray-900 mb-1">{action.title}</h3>
          <p className="text-xs text-gray-400 mb-4">{action.desc}</p>
          <ArrowRight size={16} className="text-gray-300 group-hover:text-[#5551FF] transition-colors" />
        </button>
      ))}
    </div>
  </div>
);

const AppearanceView = ({ onAction, session, storeId }: { onAction: (msg: string) => void, session: any, storeId: string | null }) => {
  const [loading, setLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState('Modern Shop');
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#4f46e5');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [buttonStyle, setButtonStyle] = useState('rounded'); // rounded, squared, pill, glass
  const [backgroundType, setBackgroundType] = useState('solid'); // solid, gradient, mesh
  const [checkoutStyle, setCheckoutStyle] = useState('default'); // default, minimal, premium
  const [images, setImages] = useState<{ logo: string | null, banner: string | null, favicon: string | null }>({ logo: null, banner: null, favicon: null });
  const [featuredProductId, setFeaturedProductId] = useState<string>('');
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<{ logo: File | null, banner: File | null, favicon: File | null }>({ logo: null, banner: null, favicon: null });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchStore = async () => {
      if (!storeId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();

      if (data) {
        if (data.template) setActiveTemplate(data.template);
        if (data.featured_product_id) setFeaturedProductId(data.featured_product_id);
        if (data.theme_color) setThemeColor(data.theme_color);
        if (data.appearance_settings) {
          const settings = data.appearance_settings;
          if (settings.secondaryColor) setSecondaryColor(settings.secondaryColor);
          if (settings.fontFamily) setFontFamily(settings.fontFamily);
          if (settings.buttonStyle) setButtonStyle(settings.buttonStyle);
          if (settings.backgroundType) setBackgroundType(settings.backgroundType);
          if (settings.checkoutStyle) setCheckoutStyle(settings.checkoutStyle);
        }
        setImages({
          logo: data.logo_url || null,
          banner: data.banner_url || null,
          favicon: data.favicon_url || null
        });

        // Now fetch products using the store's ID
        const fetchProducts = async (storeId: string) => {
          const { data: products } = await supabase
            .from('products')
            .select('id, name')
            .eq('store_id', storeId)
            .order('name');
          if (products) setStoreProducts(products);
        };
        fetchProducts(data.id);
      }
      setLoading(false);
    };

    fetchStore();
  }, [session]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFiles(prev => ({ ...prev, [type]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => ({ ...prev, [type]: reader.result as string }));
        onAction(`${type} selecionado com sucesso!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToStorage = async (file: File, type: string) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${session.user.id}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('store_assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('store_assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let logoUrl = images.logo;
      let bannerUrl = images.banner;
      let faviconUrl = images.favicon;

      if (newImageFiles.logo) logoUrl = await uploadToStorage(newImageFiles.logo, 'logo');
      if (newImageFiles.banner) bannerUrl = await uploadToStorage(newImageFiles.banner, 'banner');
      if (newImageFiles.favicon) faviconUrl = await uploadToStorage(newImageFiles.favicon, 'favicon');

      const updateData = {
        template: activeTemplate,
        theme_color: themeColor,
        featured_product_id: featuredProductId || null,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        favicon_url: faviconUrl,
        appearance_settings: {
          secondaryColor,
          fontFamily,
          buttonStyle,
          backgroundType,
          checkoutStyle
        }
      };

      let error;
      if (storeId) {
        ({ error } = await supabase
          .from('stores')
          .update(updateData)
          .eq('id', storeId));
      } else {
        ({ error } = await supabase
          .from('stores')
          .insert({ ...updateData, user_id: session.user.id }));
      }
      if (error) throw error;

      onAction("Configurações de aparência salvas com sucesso!");
    } catch (err: any) {
      alert("Erro ao salvar aparência: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="py-12 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-[#5551FF] animate-spin" /></div>;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aparência da loja</h1>
        <p className="text-gray-500">Personalize o visual da sua loja</p>
      </div>

      <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[#5551FF] font-bold text-sm mb-2">
          <Palette size={18} />
          Escolher template
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Modern Shop', desc: 'Minimalista, inspirado na Apple Store', tags: ['Hero grande', 'Grid elegante', 'Botão comprar'], premium: false },
            { name: 'Luxury Dark', desc: 'Elegância em preto e dourado', tags: ['Dark mode', 'Serif fonts', 'Visual Premium'], premium: true },
            { name: 'Tech Glow', desc: 'Futurista com glassmorphism', tags: ['Efeito vidro', 'Neon borders', 'Interativo'], premium: true },
            { name: 'Pure Minimal', desc: 'O poder do vazio e espaçamento', tags: ['Clean', 'High-end', 'Tipografia'], premium: true },
            { name: 'Bold Fashion', desc: 'Impacto visual e moda urbana', tags: ['Grid alternativo', 'Bold texts', 'Dinâmico'], premium: true },
            { name: 'Eco Soft', desc: 'Tons naturais e formas orgânicas', tags: ['Suave', 'Eco-friendly', 'Arredondado'], premium: true },
            { name: 'Mega Store Blue', desc: 'Foco em grande volume de produtos', tags: ['Navigation mega', 'E-commerce', 'Completo'], premium: true },
            { name: 'Mega Store Custom', desc: 'Layout Mega Store com cores adaptáveis ao seu tema', tags: ['Customizável', 'Cores dinâmicas', 'Flexível'], premium: true }
          ].map((template) => (
            <div
              key={template.name}
              onClick={() => setActiveTemplate(template.name)}
              className={cn(
                "group p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden",
                activeTemplate === template.name ? "border-[#5551FF] bg-indigo-50/30 ring-4 ring-indigo-50" : "border-gray-100 hover:border-gray-200 bg-white"
              )}
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Palette size={40} />
              </div>

              {template.premium && (
                <div className="absolute -top-6 -right-6 bg-amber-400 text-amber-900 text-[8px] font-black px-8 py-1 rotate-45 flex items-center justify-center shadow-lg">
                  PREMIUM
                </div>
              )}

              {activeTemplate === template.name && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-[#5551FF] rounded-full flex items-center justify-center text-white shadow-lg z-10">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}

              <div className="flex gap-1.5 mb-4">
                <div className={cn("w-4 h-4 rounded-full", template.name === 'Luxury Dark' ? 'bg-gray-900' : 'bg-indigo-500')} />
                <div className={cn("w-4 h-4 rounded-full", template.name === 'Luxury Dark' ? 'bg-amber-500' : 'bg-pink-500')} />
                <div className="w-4 h-4 rounded-full bg-gray-100" />
              </div>

              <h4 className="text-base font-bold text-gray-900 mb-1">{template.name}</h4>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">{template.desc}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {template.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#5551FF] bg-white px-2.5 py-1 rounded-lg shadow-sm border border-indigo-100">
                  {template.name === 'Modern Shop' ? 'Clássico' : 'Novo Design'}
                </span>
                <div className="flex -space-x-1 opacity-40">
                  <div className="w-5 h-5 rounded-full bg-gray-200 border-2 border-white" />
                  <div className="w-5 h-5 rounded-full bg-gray-300 border-2 border-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-[#5551FF] font-bold text-sm mb-2">
            <Palette size={18} />
            Cores da marca
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cor Primária</label>
              <label className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="sr-only"
                />
                <div className="w-10 h-10 rounded-lg shadow-inner flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{themeColor.toUpperCase()}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-black">Cor de destaque principal</p>
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cor Secundária</label>
              <label className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="sr-only"
                />
                <div className="w-10 h-10 rounded-lg shadow-inner flex items-center justify-center text-white" style={{ backgroundColor: secondaryColor }}>
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{secondaryColor.toUpperCase()}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-black">Cor auxiliar e hovers</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-[#5551FF] font-bold text-sm mb-2">
            <LayoutDashboard size={18} />
            Estilo do Site
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipografia (Fonte)</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 appearance-none"
              >
                <option value="Inter">Inter (Sanson e Rápido)</option>
                <option value="Montserrat">Montserrat (Moderno e Bold)</option>
                <option value="Playfair Display">Playfair (Luxo e Serifado)</option>
                <option value="Roboto">Roboto (Clássico Tech)</option>
                <option value="Outfit">Outfit (Clean e Premium)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estilo de Botão</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'rounded', label: 'Arredondado', style: 'rounded-xl' },
                  { id: 'squared', label: 'Quadrado', style: 'rounded-none' },
                  { id: 'pill', label: 'Cápsula', style: 'rounded-full' },
                  { id: 'glass', label: 'Vidro', style: 'rounded-xl backdrop-blur-md bg-white/20 border-white/30' }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setButtonStyle(style.id)}
                    className={cn(
                      "p-3 text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                      buttonStyle === style.id ? "border-[#5551FF] bg-indigo-50 text-[#5551FF]" : "border-gray-50 bg-white text-gray-400 hover:border-gray-100",
                      style.style
                    )}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estilo do Checkout</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'default', label: 'Padrão Clássico', desc: 'Duas colunas, visual clássico.' },
                  { id: 'gamer', label: 'Gamer Pro Dark', desc: 'Focado em detalhes e alta convenção. Alta densidade.' },
                  { id: 'offer', label: 'Oferta Express', desc: 'Foco puro em desconto, tempo e convencimento em versão clara.' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setCheckoutStyle(type.id)}
                    className={cn(
                      "p-3 text-left border-2 transition-all rounded-xl flex items-center justify-between",
                      checkoutStyle === type.id ? "border-[#5551FF] bg-indigo-50" : "border-gray-50 bg-white hover:border-gray-100"
                    )}
                  >
                    <div>
                      <p className={cn("text-xs font-black uppercase tracking-widest", checkoutStyle === type.id ? "text-[#5551FF]" : "text-gray-900")}>
                        {type.label}
                      </p>
                      <p className="text-[10px] font-medium text-gray-400 mt-0.5">{type.desc}</p>
                    </div>
                    {checkoutStyle === type.id && <Check size={16} className="text-[#5551FF]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-[#5551FF] font-bold text-sm">
          <Store size={18} />
          Imagens da loja
        </div>
        <div className="space-y-4">
          {[
            { id: 'logo', label: 'Logo', size: '200x200px recomendado' },
            { id: 'banner', label: 'Banner', size: '1200x400px recomendado' },
            { id: 'favicon', label: 'Favicon', size: '32x32px recomendado' }
          ].map((item) => (
            <div key={item.id} className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300 overflow-hidden relative">
                {images[item.id as keyof typeof images] ? (
                  <img src={images[item.id as keyof typeof images]!} alt={item.label} className="w-full h-full object-cover" />
                ) : (
                  <Store size={24} />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900">{item.label}</h4>
                <p className="text-xs text-gray-400">{item.size}</p>
              </div>
              <label className="text-xs font-bold text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, item.id as 'logo' | 'banner' | 'favicon')}
                />
                {images[item.id as keyof typeof images] ? <Check size={14} className="text-emerald-500" /> : <Plus size={14} />}
                {images[item.id as keyof typeof images] ? 'Trocado' : 'Enviar'}
              </label>
            </div>
          ))}
        </div>
      </div>

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
        disabled={isSaving}
        className="w-full bg-[#5551FF] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4440FF] transition-all shadow-lg shadow-indigo-100 disabled:opacity-70"
      >
        <CreditCard size={18} />
        {isSaving ? 'Salvando...' : 'Salvar configurações'}
      </button>
    </div>
  );
};

const MinhaLojaView = ({ onAction, session, storeId }: { onAction: (msg: string) => void, session: any, storeId: string | null }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<any>({
    name: '',
    slug: '',
    description: '',
    whatsapp: '',
    pix_key: '',
    theme_color: '#6366f1',
    email: '',
    address: '',
    instagram_url: '',
    facebook_url: '',
    youtube_url: '',
    telegram_url: '',
    x_url: '',
    discord_url: '',
    razao_social: '',
    cnpj: '',
    business_hours: '',
    footer_note: ''
  });

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchStore = async () => {
      if (!storeId) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();

      if (data) {
        setStore(data);
      }
      setLoading(false);
    };

    fetchStore();
  }, [session, storeId]);

  const handleSave = async () => {
    if (!storeId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('stores')
        .upsert({ ...store, id: storeId, user_id: session.user.id });
      if (error) throw error;
      onAction("Loja salva com sucesso!");
    } catch (err: any) {
      alert("Erro ao salvar loja: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-[#5551FF] animate-spin" /></div>;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minha loja</h1>
        <p className="text-gray-500">Configure as informações públicas da sua loja</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[#5551FF] font-bold text-sm">
            <Store size={18} />
            Identidade visual
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-8">
            <div className="w-24 h-24 rounded-3xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300 overflow-hidden relative shrink-0">
              {store.logo_url ? (
                <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Store size={32} />
              )}
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Logo da loja</h4>
                <p className="text-xs text-gray-400">Upload de imagens será na aba Aparência</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-50" />

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[#5551FF] font-bold text-sm">
            <Globe size={18} />
            Informações da loja
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome da loja</label>
              <input
                type="text"
                value={store.name || ''}
                onChange={e => setStore({ ...store, name: e.target.value })}
                placeholder="Ex: Loja da Maria"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slug (URL)</label>
              <div className="flex">
                <span className="px-4 py-3 bg-gray-50 border border-r-0 border-gray-100 rounded-l-xl text-sm text-gray-400">/loja/</span>
                <input
                  type="text"
                  value={store.slug || ''}
                  onChange={e => setStore({ ...store, slug: e.target.value })}
                  placeholder="nome-da-loja"
                  className="flex-1 px-4 py-3 bg-white border border-gray-100 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição</label>
              <textarea
                placeholder="Descreva sua loja..."
                value={store.description || ''}
                onChange={e => setStore({ ...store, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-50" />

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[#5551FF] font-bold text-sm">
            <CreditCard size={18} />
            Contato e pagamento
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp</label>
              <input
                type="text"
                value={store.whatsapp || ''}
                onChange={e => setStore({ ...store, whatsapp: e.target.value })}
                placeholder="5511999999999"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <p className="text-[10px] text-gray-400">Com DDI e DDD, sem espaços</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail de Contato</label>
              <input
                type="email"
                value={store.email || ''}
                onChange={e => setStore({ ...store, email: e.target.value })}
                placeholder="contato@sualoja.com"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Endereço Físico</label>
              <input
                type="text"
                value={store.address || ''}
                onChange={e => setStore({ ...store, address: e.target.value })}
                placeholder="Rua Exemplo, 123 - Cidade, Estado"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chave PIX</label>
              <input
                type="text"
                value={store.pix_key || ''}
                onChange={e => setStore({ ...store, pix_key: e.target.value })}
                placeholder="CPF, e-mail ou chave aleatória"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-50" />

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[#5551FF] font-bold text-sm">
            <ShieldCheck size={18} />
            Informações Legais e Atendimento
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Razão Social</label>
              <input
                type="text"
                value={store.razao_social || ''}
                onChange={e => setStore({ ...store, razao_social: e.target.value })}
                placeholder="Ex: TERABYTE ATACADO E VAREJO DE PRODUTOS..."
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CNPJ</label>
              <input
                type="text"
                value={store.cnpj || ''}
                onChange={e => setStore({ ...store, cnpj: e.target.value })}
                placeholder="00.000.000/0001-00"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Horário de Atendimento</label>
              <input
                type="text"
                value={store.business_hours || ''}
                onChange={e => setStore({ ...store, business_hours: e.target.value })}
                placeholder="Ex: Seg a Sex das 8:30 às 18:00"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nota do Rodapé (Extra)</label>
              <input
                type="text"
                value={store.footer_note || ''}
                onChange={e => setStore({ ...store, footer_note: e.target.value })}
                placeholder="Ex: SOMOS E-COMMERCE - NÃO TEMOS ATENDIMENTO LOCAL"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-50" />

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[#5551FF] font-bold text-sm">
            <Share2 size={18} />
            Redes Sociais
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instagram URL</label>
              <input
                type="text"
                value={store.instagram_url || ''}
                onChange={e => setStore({ ...store, instagram_url: e.target.value })}
                placeholder="https://instagram.com/perfil"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Facebook URL</label>
              <input
                type="text"
                value={store.facebook_url || ''}
                onChange={e => setStore({ ...store, facebook_url: e.target.value })}
                placeholder="https://facebook.com/pagina"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">YouTube URL</label>
              <input
                type="text"
                value={store.youtube_url || ''}
                onChange={e => setStore({ ...store, youtube_url: e.target.value })}
                placeholder="https://youtube.com/@canal"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Telegram URL</label>
              <input
                type="text"
                value={store.telegram_url || ''}
                onChange={e => setStore({ ...store, telegram_url: e.target.value })}
                placeholder="https://t.me/username"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">X (Twitter) URL</label>
              <input
                type="text"
                value={store.x_url || ''}
                onChange={e => setStore({ ...store, x_url: e.target.value })}
                placeholder="https://x.com/username"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discord URL</label>
              <input
                type="text"
                value={store.discord_url || ''}
                onChange={e => setStore({ ...store, discord_url: e.target.value })}
                placeholder="https://discord.gg/invite"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#5551FF] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4440FF] transition-all shadow-lg shadow-indigo-100 disabled:opacity-70"
        >
          <Plus size={18} />
          {saving ? 'Salvando...' : 'Salvar loja'}
        </button>
      </div>
    </div>
  );
};

const EmptyState = ({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 animate-in fade-in duration-700">
    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
      <Icon size={32} />
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-400 max-w-xs mx-auto">{desc}</p>
    </div>
  </div>
);

const CheckoutView = ({ plan, onAction, onBack, session }: { plan: any, onAction: (msg: string) => void, onBack: () => void, session: any }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: session?.user?.email || '',
    phone: '',
    taxId: '', // CPF/CNPJ
    paymentMethod: 'card' as 'card' | 'pix',
    cardNumber: '',
    cvv: '',
    expiry: '',
    cardholderName: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.paymentMethod === 'card') {
        // Update subscription in DB
        const renewalDate = new Date();
        if (plan.billing_cycle === 'monthly') {
          renewalDate.setMonth(renewalDate.getMonth() + 1);
        } else {
          renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        }
        await supabase.from('subscriptions').upsert({
          user_id: session.user.id,
          plan_name: plan.name,
          price: plan.priceValue,
          billing_cycle: plan.billing_cycle,
          payment_gateway: 'manual',
          status: 'active',
          renewal_date: renewalDate.toISOString()
        }, { onConflict: 'user_id' });

        setShowSuccess(true);
        onAction(`Assinatura do plano ${plan.name} ativada com sucesso!`);
      } else if (formData.paymentMethod === 'pix') {
        // Fake PIX for now until new payment gateway is integrated
        setPixQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5913Loja%20Exemplo6008SAO%20PAULO62070503***6304EDCF');
        setPixCode('00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5913Loja Exemplo6008SAO PAULO62070503***6304EDCF');
        setShowSuccess(true);
        onAction('Código PIX gerado! Pague para ativar sua assinatura.');
      }
    } catch (err: any) {
      onAction('Erro no pagamento: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronDown className="rotate-90 text-gray-400" size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500">Finalize sua assinatura do plano {plan.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {showSuccess ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={40} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900">Pagamento em Processamento!</h2>
                <p className="text-gray-500">Sua assinatura será ativada automaticamente assim que o pagamento for confirmado.</p>
              </div>

              {formData.paymentMethod === 'pix' && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                  {pixQrCode ? (
                    <img src={pixQrCode} alt="QR Code PIX" className="w-48 h-48 mx-auto rounded-xl border border-gray-200" />
                  ) : (
                    <div className="w-48 h-48 bg-white border border-gray-200 rounded-xl mx-auto flex flex-col items-center justify-center gap-2">
                      <Zap size={40} className="text-indigo-400 opacity-30" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">QR CODE PIX</span>
                    </div>
                  )}
                  {pixCode && (
                    <button
                      className="text-xs font-bold text-[#5551FF] hover:underline"
                      onClick={() => { navigator.clipboard.writeText(pixCode); onAction('Código PIX copiado!'); }}
                    >
                      Copiar código PIX Copia e Cola
                    </button>
                  )}
                </div>
              )}



              <button
                onClick={onBack}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all"
              >
                Voltar ao Painel
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <User size={18} className="text-[#5551FF]" /> Informações Pessoais
              </h3>
              <form onSubmit={handleCheckout} className="space-y-4">
                {/* ... existing form ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome Completo</label>
                    <input type="text" required placeholder="Ex: João Silva"
                      value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail</label>
                    <input type="email" required readOnly value={formData.email}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm opacity-60 cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp / Celular</label>
                    <input type="text" required placeholder="(11) 99999-9999"
                      value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CPF ou CNPJ (Brasil)</label>
                    <input type="text" required placeholder="000.000.000-00"
                      value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 transition-all" />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <CreditCard size={18} className="text-[#5551FF]" /> Método de Pagamento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {[
                      { id: 'card', label: 'Cartão', icon: CreditCard },
                      { id: 'pix', label: 'Pix', icon: Zap }
                    ].map((method) => (
                      <button type="button" key={method.id}
                        onClick={() => setFormData({ ...formData, paymentMethod: method.id as any })}
                        className={cn(
                          "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                          formData.paymentMethod === method.id ? "border-[#5551FF] bg-indigo-50/50" : "border-gray-100 hover:bg-gray-50"
                        )}>
                        <method.icon size={20} className={formData.paymentMethod === method.id ? "text-[#5551FF]" : "text-gray-400"} />
                        <span className={cn("text-xs font-bold", formData.paymentMethod === method.id ? "text-[#5551FF]" : "text-gray-500")}>
                          {method.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {formData.paymentMethod === 'card' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-top-2 duration-300">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Número do Cartão</label>
                        <input type="text" required placeholder="0000 0000 0000 0000"
                          value={formData.cardNumber} onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Validade (MM/AA)</label>
                        <input type="text" required placeholder="12/28"
                          value={formData.expiry} onChange={e => setFormData({ ...formData, expiry: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CVV</label>
                        <input type="text" required placeholder="123"
                          value={formData.cvv} onChange={e => setFormData({ ...formData, cvv: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 transition-all" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-8">
                  <button type="submit" disabled={loading}
                    className="w-full bg-[#111827] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-100 disabled:opacity-70">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck size={20} />
                        {formData.paymentMethod === 'card' ? 'Pagar agora com Cartão' : 'Gerar código Pix'}
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-500" /> Checkout Seguro
                    </span>
                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">SSL Encrypted</span>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-gray-900 p-8 rounded-[2rem] text-white space-y-6 sticky top-8">
            <h3 className="text-xl font-black italic tracking-tight">Resumo do Plano</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Plano selecionado</span>
                <span className="font-bold">{plan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Ciclo</span>
                <span className="font-bold uppercase text-xs tracking-widest">{plan.billing_cycle === 'monthly' ? 'Mensal' : 'Anual'}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-300 text-lg">Total</span>
                <span className="text-2xl font-black italic">R$ {plan.priceValue.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Incluso no seu plano:</p>
              {plan.features.slice(0, 4).map((f: string) => (
                <div key={f} className="flex items-center gap-2 text-xs font-medium text-gray-300">
                  <Check size={14} className="text-emerald-500" /> {f}
                </div>
              ))}
            </div>

            <div className="pt-6">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Lock size={18} className="text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold">Compra 100% Segura</p>
                  <p className="text-[10px] text-gray-500">Seus dados estão protegidos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminGlobalDashboard = ({ onAction }: { onAction: (msg: string) => void }) => {
  const [stats, setStats] = useState({
    users: 0,
    stores: 0,
    activeSubs: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: storeCount } = await supabase.from('stores').select('*', { count: 'exact', head: true });
        const { data: subs } = await supabase.from('subscriptions').select('price, status');
        
        const active = subs?.filter(s => s.status === 'active').length || 0;
        const totalRevenue = subs?.reduce((acc, s) => acc + Number(s.price), 0) || 0;

        setStats({
          users: userCount || 0,
          stores: storeCount || 0,
          activeSubs: active,
          revenue: totalRevenue
        });
      } catch (err) {
        console.error('Erro ao buscar stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-[#5551FF] animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-gray-900 italic uppercase">Visão Geral do Sistema</h1>
        <p className="text-gray-500">Métricas consolidadas da plataforma Nexora.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total de Usuários" value={stats.users.toString()} subtext="Base cadastrada" color="bg-blue-50 text-blue-600" />
        <StatCard icon={Store} label="Lojas Criadas" value={stats.stores.toString()} subtext="Vitrines ativas" color="bg-purple-50 text-purple-600" />
        <StatCard icon={ShieldCheck} label="Assinaturas" value={stats.activeSubs.toString()} subtext="Planos ativos" color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={DollarSign} label="Faturamento" value={`R$ ${stats.revenue.toFixed(2)}`} subtext="Receita bruta" color="bg-orange-50 text-orange-600" />
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <BarChart3 size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Desempenho da Plataforma</h2>
        </div>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl">
          <p className="text-gray-400 text-sm italic">Gráfico de crescimento em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

const AdminUserList = ({ onAction }: { onAction: (msg: string) => void }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', id);
    if (!error) {
      onAction(`Usuário ${newStatus === 'blocked' ? 'bloqueado' : 'desbloqueado'} com sucesso!`);
      fetchUsers();
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-[#5551FF] animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 italic uppercase tracking-tight">Gerenciar Usuários</h1>
          <p className="text-gray-500">Visualize e controle o acesso de todos os clientes.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">E-mail</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Cargo</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Plano</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Status</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5">
                  <p className="font-bold text-gray-900">{u.email}</p>
                  <p className="text-[10px] text-gray-400">{new Date(u.created_at).toLocaleDateString()}</p>
                </td>
                <td className="px-8 py-5">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                    u.role === 'admin' ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"
                  )}>
                    {u.role}
                  </span>
                </td>
                <td className="px-8 py-5 font-bold text-gray-600">{u.plan || 'Free'}</td>
                <td className="px-8 py-5 text-center">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                    u.status === 'active' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-500 border border-red-100"
                  )}>
                    {u.status === 'active' ? 'Ativo' : 'Bloqueado'}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button 
                    onClick={() => toggleStatus(u.id, u.status)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      u.status === 'active' ? "text-red-400 hover:bg-red-50" : "text-emerald-400 hover:bg-emerald-50"
                    )}
                  >
                    {u.status === 'active' ? <Lock size={16} /> : <ShieldCheck size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminStoreList = ({ onAction }: { onAction: (msg: string) => void }) => {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
      if (data) setStores(data);
      setLoading(false);
    };
    fetchStores();
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-[#5551FF] animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-sm">
      <div>
        <h1 className="text-2xl font-black text-gray-900 italic uppercase tracking-tight">Lojas Criadas</h1>
        <p className="text-gray-500">Acompanhe todas as vitrines hospedadas na plataforma.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((s) => (
          <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/20 transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                {s.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{s.name}</h3>
                <p className="text-[10px] text-gray-400 font-medium truncate">{s.slug}.nexora.app</p>
              </div>
              <button onClick={() => window.open(`/loja/${s.slug}`, '_blank')} className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
                <ExternalLink size={16} />
              </button>
            </div>
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{s.template}</span>
              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Ativa</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminAccessControl = ({ onAction }: { onAction: (msg: string) => void }) => {
  const [formData, setFormData] = useState({
    email: '',
    plan: 'Profissional',
    days: 30
  });
  const [loading, setLoading] = useState(false);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Find user by email in profiles
      const { data: userProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      if (fetchError || !userProfile) throw new Error('Usuário não encontrado com este e-mail.');

      // 2. Calculate expiry
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + formData.days);

      // 3. Update subscription (upsert)
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userProfile.id,
          plan_name: formData.plan,
          price: 0, // Manual grant is free
          billing_cycle: 'monthly',
          payment_gateway: 'manual',
          status: 'active',
          renewal_date: expiryDate.toISOString()
        }, { onConflict: 'user_id' });

      if (subError) throw subError;

      // 4. Update profile plan
      await supabase.from('profiles').update({ plan: formData.plan, expires_at: expiryDate.toISOString() }).eq('id', userProfile.id);

      onAction(`Acesso concedido com sucesso para ${formData.email}!`);
      setFormData({ email: '', plan: 'Profissional', days: 30 });
    } catch (err: any) {
      onAction('Erro ao conceder acesso: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 py-12 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900 italic uppercase">Controle de Acesso</h1>
        <p className="text-gray-500">Libere planos manualmente para clientes especiais.</p>
      </div>

      <form onSubmit={handleGrantAccess} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-indigo-100/20 space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">E-mail do Cliente</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="cliente@email.com"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Plano</label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <select 
                  value={formData.plan}
                  onChange={e => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold appearance-none bg-no-repeat"
                >
                  <option value="free">FREE</option>
                  <option value="pro">PRO – R$39,90</option>
                  <option value="loja">LOJA – R$99,90</option>
                  <option value="ultra">ULTRA – R$139</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Duração (Dias)</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="number" 
                  required 
                  value={formData.days}
                  onChange={e => setFormData({ ...formData, days: parseInt(e.target.value) })}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#5551FF] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#4440FF] transition-all shadow-xl shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-3"
        >
          {loading ? 'Processando...' : <><ShieldCheck size={20} /> Liberar Acesso Agora</>}
        </button>

        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Esta ação será registrada no histórico do sistema.
        </p>
      </form>
    </div>
  );
};

const AdminSubscribersView = ({ onAction, session }: { onAction: (msg: string) => void, session: any }) => {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubscribers = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*, users:user_id(email)')
        .order('created_at', { ascending: false });

      if (data) setSubscribers(data);
      setLoading(false);
    };
    fetchSubscribers();
  }, []);

  if (loading) return <div className="py-12 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-[#5551FF] animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Assinantes</h1>
        <p className="text-gray-500">Acompanhe todos os usuários ativos e receita.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Métricas</p>
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-black text-gray-900">R$ {subscribers.reduce((acc, s) => acc + Number(s.price), 0).toFixed(2)}</p>
              <p className="text-xs text-gray-500">Receita Total Bruta</p>
            </div>
            <div>
              <p className="text-2xl font-black text-indigo-600">{subscribers.filter(s => s.status === 'active').length}</p>
              <p className="text-xs text-gray-500">Assinantes Ativos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Usuário</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Plano</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Ciclo</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Valor</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {subscribers.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-gray-900">{sub.users?.email || 'N/A'}</p>
                  <p className="text-[10px] text-gray-400">{new Date(sub.created_at).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-600">{sub.plan_name}</td>
                <td className="px-6 py-4 text-sm uppercase text-[10px] font-black text-gray-400">{sub.billing_cycle === 'monthly' ? 'Mensal' : 'Anual'}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-gray-900">R$ {Number(sub.price).toFixed(2).replace('.', ',')}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                    sub.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                  )}>
                    {sub.status === 'active' ? 'Ativo' : sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm">Nenhum assinante encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PlanView = ({ onAction, onSelectPlan, session }: { onAction: (msg: string) => void, onSelectPlan: (plan: any) => void, session: any }) => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSub = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data) setCurrentSubscription(data);
      setLoading(false);
    };
    fetchSub();
  }, [session]);

  const plans = [
    {
      name: 'FREE',
      planKey: 'free',
      priceMonthly: 0,
      priceYearly: 0,
      features: ['Até 10 produtos', '1 catálogo digital', 'Link público do catálogo', 'Sem loja online'],
      color: 'bg-white',
      kiwifyLink: null,
      maxStores: 0
    },
    {
      name: 'PRO',
      planKey: 'pro',
      priceMonthly: 39.90,
      priceYearly: 399.00,
      features: ['Produtos ilimitados', 'Catálogo profissional', '2 lojas online', 'Todos os templates', 'Suporte'],
      color: 'bg-white',
      badge: 'POPULAR',
      kiwifyLink: 'https://pay.kiwify.com.br/5U7m01m',
      maxStores: 2
    },
    {
      name: 'LOJA',
      planKey: 'loja',
      priceMonthly: 99.90,
      priceYearly: 999.00,
      features: ['Loja online completa', 'Checkout integrado', 'Catálogo ilimitado', 'Domínio próprio', 'Relatórios avançados'],
      color: 'bg-white',
      badge: 'MAIS VENDIDO',
      kiwifyLink: 'https://pay.kiwify.com.br/bKuzC2f',
      maxStores: 1
    },
    {
      name: 'ULTRA',
      planKey: 'ultra',
      priceMonthly: 139.00,
      priceYearly: 1390.00,
      features: ['Multi-lojas (até 5)', 'Loja online completa', 'Automações inteligentes', 'Inteligência Artificial (em breve)', 'Suporte prioritário VIP'],
      color: 'bg-gray-900',
      kiwifyLink: '#',
      maxStores: 5
    }
  ];

  if (loading) return <div className="py-12 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-[#5551FF] animate-spin" /></div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Escolha o plano ideal para seu negócio</h1>
        <p className="text-lg text-gray-500 leading-relaxed">Assine e tenha acesso imediato a todas as ferramentas premium da Nexora.</p>

        <div className="flex items-center justify-center pt-4">
          <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center shadow-inner">
            <button
              onClick={() => setActiveTab('monthly')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-black transition-all",
                activeTab === 'monthly' ? "bg-white text-gray-900 shadow-lg" : "text-gray-400 hover:text-gray-600"
              )}>
              Mensal
            </button>
            <button
              onClick={() => setActiveTab('yearly')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2",
                activeTab === 'yearly' ? "bg-[#5551FF] text-white shadow-lg shadow-indigo-100" : "text-gray-400 hover:text-gray-600"
              )}>
              Anual <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-widest", activeTab === 'yearly' ? "bg-white/20" : "bg-emerald-50 text-emerald-600")}>-15% OFF</span>
            </button>
          </div>
        </div>
      </div>

      {currentSubscription && currentSubscription.status === 'active' && (
        <div className="max-w-4xl mx-auto bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shadow-emerald-100 shrink-0">
              <Check size={24} strokeWidth={3} />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Assinatura Ativa</p>
              <h4 className="text-xl font-bold text-gray-900">Plano {currentSubscription.plan_name}</h4>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Próxima renovação</p>
            <p className="text-sm font-bold text-gray-900">{new Date(currentSubscription.renewal_date).toLocaleDateString()}</p>
          </div>
        </div>
      )}

      <div className="bg-white/40 backdrop-blur-3xl border border-white/60 p-4 md:p-6 rounded-[2.5rem] max-w-6xl mx-auto shadow-xl shadow-gray-200/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isActive = currentSubscription?.plan_name?.toLowerCase() === plan.planKey || currentSubscription?.plan_name === plan.name;
            const price = activeTab === 'monthly' ? plan.priceMonthly : plan.priceYearly;
            const isUltra = plan.planKey === 'ultra';
            const isFree = plan.planKey === 'free';

            return (
              <div key={plan.name} className={cn(
                "p-7 rounded-[2rem] transition-all duration-300 flex flex-col h-full relative group",
                isActive ? 'border-2 border-[#10b981] shadow-xl' : isUltra ? 'border-2 border-transparent hover:-translate-y-1 hover:shadow-2xl' : 'border-0 hover:-translate-y-1 hover:shadow-xl',
                isUltra ? 'bg-[#0a0f1c] text-white' : 'bg-white'
              )}>
                {plan.badge && (
                  <div className={cn("absolute -top-3 left-6 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg",
                    plan.badge === 'POPULAR' ? 'bg-[#5551FF]' : 'bg-[#10b981]'
                  )}>
                    {plan.badge}
                  </div>
                )}
                {isActive && (
                  <div className="absolute -top-3 right-6 bg-[#10b981] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg flex items-center gap-1">
                    <Check size={8} strokeWidth={4} /> Ativo
                  </div>
                )}

                <div className="mb-5">
                  <h3 className={cn("text-lg font-black uppercase tracking-tight mt-2", isUltra ? 'text-white' : 'text-gray-900')}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    {!isFree && <span className={cn("text-xs font-bold opacity-60", isUltra ? 'text-gray-400' : 'text-gray-500')}>R$</span>}
                    <span className={cn("text-4xl font-black italic tracking-tighter", isUltra ? 'text-white' : 'text-gray-900')}>
                      {isFree ? 'Grátis' : price.toFixed(2).replace('.', ',')}
                    </span>
                    {!isFree && <span className={cn("text-[10px] font-bold opacity-40 uppercase ml-1", isUltra ? 'text-gray-400' : 'text-gray-500')}>/{activeTab === 'monthly' ? 'mês' : 'ano'}</span>}
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2 text-xs font-medium">
                      <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        isUltra ? 'bg-white/10' : 'bg-[#10b981]/10'
                      )}>
                        <Check size={10} className={isUltra ? 'text-white/80' : 'text-[#10b981]'} strokeWidth={4} />
                      </div>
                      <span className={isUltra ? 'text-gray-300' : 'text-gray-600'}>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (isFree || isActive) return;
                    if (plan.kiwifyLink && plan.kiwifyLink !== '#') {
                      const emailParam = session?.user?.email ? `&email=${encodeURIComponent(session.user.email)}` : '';
                      const userIdParam = session?.user?.id ? `&user_id=${session.user.id}` : '';
                      window.open(`${plan.kiwifyLink}?utm_source=nexora${emailParam}${userIdParam}`, '_blank');
                      onAction(`Redirecionando para o checkout do plano ${plan.name}...`);
                    } else {
                      onAction('Em breve disponível!');
                    }
                  }}
                  disabled={isActive || isFree}
                  className={cn(
                    "w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group/btn active:scale-95",
                    isActive || isFree
                      ? isUltra ? "bg-white/10 text-white/40 cursor-not-allowed" : "bg-gray-100/50 text-gray-400 cursor-not-allowed"
                      : isUltra
                        ? "bg-white text-[#0a0f1c] hover:bg-gray-100 shadow-xl"
                        : "bg-[#0a0f1c] text-white hover:bg-black shadow-xl shadow-gray-200"
                  )}>
                  {isActive ? 'Plano Atual' : isFree ? 'Plano Atual' : 'Assinar Agora'}
                  {!isActive && !isFree && <ChevronDown className="-rotate-90 group-hover/btn:translate-x-1 transition-transform" size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
        <div className="p-8 bg-white rounded-3xl border border-gray-100 space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle size={18} className="text-[#5551FF]" /> Dúvidas frequentes
          </h4>
          <div className="space-y-4">
            <details className="group cursor-pointer">
              <summary className="list-none text-sm font-bold text-gray-600 flex items-center justify-between">
                Posso cancelar quando quiser? <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs text-gray-400 mt-2">Sim, você pode cancelar sua assinatura a qualquer momento diretamente no painel. Seu acesso continuará ativo até o fim do período pago.</p>
            </details>
            <details className="group cursor-pointer">
              <summary className="list-none text-sm font-bold text-gray-600 flex items-center justify-between">
                Como funciona o domínio próprio? <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-xs text-gray-400 mt-2">Nos planos Profissional e Premium, você pode conectar seu próprio domínio (.com.br, .com, etc.) e nós configuramos o SSL (cadeado de segurança) automaticamente.</p>
            </details>
          </div>
        </div>

        <div className="p-8 bg-gray-900 rounded-3xl text-white space-y-4">
          <h4 className="font-bold flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-400" /> Garantia Nexora
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">Oferecemos 7 dias de garantia incondicional. Se não gostar da plataforma, devolvemos 100% do seu investimento sem perguntas.</p>
          <div className="flex gap-4 pt-2">
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#5551FF]">Suporte 24/7</p>
              <p className="text-[10px] text-gray-500">Estamos aqui para ajudar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Minhas Lojas View ---

const MinhasLojasView = ({ session, onAction, stores, activeStoreId, onSelectStore, onUpdateStores, userProfile }: { session: any, onAction: (msg: string) => void, stores: any[], activeStoreId: string | null, onSelectStore: (id: string) => void, onUpdateStores: () => void, userProfile: any }) => {
  const [loading, setLoading] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');

  const getMaxStores = () => {
    const plan = userProfile?.plan || 'free';
    if (plan === 'free') return 0; // Wait, plan features list 0 for free but the instructions say free has 0 online store, only catalog. Let's return 0. (Actually free can't open online store).
    if (plan === 'pro') return 2;
    if (plan === 'loja') return 1;
    if (plan === 'ultra') return 5;
    return 1; // Default
  };

  const maxStores = getMaxStores();

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stores.length >= maxStores) {
      alert(`Seu plano permite até ${maxStores} loja(s). Faça upgrade para criar mais.`);
      return;
    }

    setLoading(true);
    try {
      const slug = newStoreName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
      const { error } = await supabase.from('stores').insert([{
        user_id: session.user.id,
        name: newStoreName,
        slug: slug,
        theme_color: '#5551FF',
        template: 'Modern Shop',
        is_primary: stores.length === 0
      }]);

      if (error) throw error;
      onAction('Loja criada com sucesso!');
      setShowNewModal(false);
      setNewStoreName('');
      onUpdateStores();
    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Lojas</h1>
          <p className="text-gray-500">Gerencie todas as suas lojas (Limite: {stores.length}/{maxStores})</p>
        </div>
        <button
          onClick={() => {
            if (stores.length >= maxStores) {
              alert(`Seu plano permite até ${maxStores} loja(s). Faça upgrade na aba "Meu Plano" para criar mais lojas.`);
            } else {
              setShowNewModal(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#5551FF] text-white rounded-xl text-sm font-bold hover:bg-[#4440FF] transition-colors"
        >
          <Plus size={16} /> Nova Loja
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stores.map(store => (
          <div key={store.id} className={cn("bg-white p-6 rounded-3xl border-2 transition-all", activeStoreId === store.id ? "border-[#5551FF] shadow-lg shadow-indigo-100" : "border-gray-100 shadow-sm")}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                  {store.logo_url ? <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <Store size={20} className="text-gray-400" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {store.name}
                    {activeStoreId === store.id && <span className="bg-[#5551FF] text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Ativa</span>}
                  </h3>
                  <p className="text-xs text-gray-400">/{store.slug}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
              <button
                onClick={() => onSelectStore(store.id)}
                disabled={activeStoreId === store.id}
                className={cn("flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2", activeStoreId === store.id ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-indigo-50 text-[#5551FF] hover:bg-indigo-100")}
              >
                {activeStoreId === store.id ? <><Check size={14} /> Selecionada</> : 'Selecionar Lojas'}
              </button>
              <button onClick={() => window.open(store.custom_domain ? `https://${store.custom_domain}` : `/loja/${store.slug}`, '_blank')} className="p-2.5 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        ))}
        {stores.length === 0 && (
          <div className="col-span-1 md:col-span-2 py-12 text-center bg-white border border-gray-100 rounded-3xl">
            <Store size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-bold">Nenhuma loja criada</p>
            <p className="text-sm text-gray-400">Crie sua primeira loja para começar a vender.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showNewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Criar Nova Loja</h3>
                <button onClick={() => setShowNewModal(false)} className="p-2 text-gray-400 hover:text-gray-900 rounded-xl bg-gray-50"><X size={16} /></button>
              </div>
              <form onSubmit={handleCreateStore} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome da Loja</label>
                  <input type="text" required value={newStoreName} onChange={e => setNewStoreName(e.target.value)} placeholder="Ex: Minha Loja" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <button type="submit" disabled={loading || !newStoreName} className="w-full py-3 bg-[#5551FF] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4440FF] disabled:opacity-50">
                  {loading ? 'Criando...' : <><Plus size={16}/> Criar Loja</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Auth View ---

const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          // No longer auto-creating store for FREE users.
          // They will only have access to the Catalog until they upgrade or create a store manually (if plan allows).
        }

        alert('Conta criada com sucesso! Faça login para começar.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-indigo-100/20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 bg-[#5551FF] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Zap size={28} fill="currentColor" />
          </div>
          <span className="text-2xl font-black tracking-tight text-gray-900">NEXORA</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-sm text-gray-500">
            {isLogin ? 'Faça login para gerenciar sua loja.' : 'Comece a vender em minutos.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 focus:border-[#5551FF] transition-all"
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 focus:border-[#5551FF] transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5551FF] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4440FF] transition-all shadow-lg shadow-indigo-100 disabled:opacity-70 mt-6"
          >
            {loading ? 'Aguarde...' : isLogin ? 'Entrar na conta' : 'Criar minha loja'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-sm font-medium text-gray-500 hover:text-[#5551FF] transition-colors"
          >
            {isLogin ? 'Não tem uma conta? Crie agora' : 'Já tem uma conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedPlan, setSelecionadoPlan] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });
  const [orderTab, setOrderTab] = useState('Todos');
  const [storeData, setStoreData] = useState<any>(null);
  const [storesList, setStoresList] = useState<any[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(localStorage.getItem('nexora_active_store_id'));
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, title: 'Novo pedido recebido!', time: 'há 5 min', unread: true },
    { id: 2, title: 'Produto atualizado com sucesso', time: 'há 2 horas', unread: false },
    { id: 3, title: 'Boas-vindas à Nexora!', time: 'há 1 dia', unread: false },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('bypass') === 'true') {
      const mockSession = {
        user: {
          id: '5b03aab0-0098-4fd2-aa0e-e3db2e2da4fc',
          email: 'dionesnatan54@gmail.com'
        }
      };
      setSession(mockSession);
      setIsInitializing(false);
      fetchUserProfile(mockSession.user);
      fetchStoreData(mockSession.user.id);
      return;
    }

    // Basic Routing Logic
    const path = window.location.pathname;
    if (path.startsWith('/loja/')) {
      const slug = path.split('/loja/')[1];
      if (slug) {
        setStoreSlug(slug);
        setIsInitializing(false);
        return;
      }
    } else if (path.startsWith('/catalogo/')) {
      const slug = path.split('/catalogo/')[1];
      if (slug) {
        setStoreSlug(slug);
        setIsInitializing(false);
        return;
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
      if (session) {
        fetchUserProfile(session.user);
        fetchStoreData(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user);
        fetchStoreData(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (user: any) => {
    try {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!profile) {
        // Auto-create profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            role: user.email === 'dionesnatan54@gmail.com' ? 'admin' : 'user', // Hardcoded admin for specific email as request
            status: 'active',
            plan: 'free'
          }])
          .select()
          .single();

        if (createError) throw createError;
        profile = newProfile;
      }

      if (profile) {
        // Double check admin role for the master email even if profile already exists
        if (user.email === 'dionesnatan54@gmail.com' && profile.role !== 'admin') {
          profile.role = 'admin';
          // Try to persist this to DB as well
          supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id).then();
        }
      }

      setUserProfile(profile as UserProfile);
      
      // Auto-navigate to admin dashboard if admin
      if (profile.role === 'admin' && currentView === 'dashboard') {
        setCurrentView('admin-dashboard');
      }
    } catch (err: any) {
      console.error('Erro ao buscar perfil:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStoreData = async (userId: string) => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (data && data.length > 0) {
      setStoresList(data);
      if (!activeStoreId || !data.find(s => s.id === activeStoreId)) {
        const defaultStoreId = data[0].id;
        setActiveStoreId(defaultStoreId);
        localStorage.setItem('nexora_active_store_id', defaultStoreId);
        setStoreData(data[0]);
        if (data[0].custom_domain) setCustomDomain(data[0].custom_domain);
      }
    } else {
      setStoresList([]);
      setStoreData(null);
    }
  };

  useEffect(() => {
    if (storesList.length > 0 && activeStoreId) {
      const active = storesList.find(s => s.id === activeStoreId) || storesList[0];
      setStoreData(active);
      if (active.custom_domain) setCustomDomain(active.custom_domain);
    }
  }, [activeStoreId, storesList]);

  const notify = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><div className="w-10 h-10 border-4 border-indigo-100 border-t-[#5551FF] rounded-full animate-spin" /></div>;
  }

  if (storeSlug) {
    const isCatalog = window.location.pathname.startsWith('/catalogo/');
    return <StorefrontView slug={storeSlug} isCatalog={isCatalog} />;
  }

  if (!session) {
    return <AuthView />;
  }

  if (userProfile?.status === 'blocked') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-red-100/50 border border-red-50 text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
            <Lock size={40} strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900 italic uppercase">Conta Bloqueada</h1>
            <p className="text-gray-500 text-sm">Sua conta foi temporariamente desativada pelo administrador do sistema.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Motivo</p>
            <p className="text-xs font-bold text-gray-600 italic">Violação dos termos de uso ou pendência financeira.</p>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> Sair da conta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-gray-900 overflow-hidden">
      <Toast message={toast.message} visible={toast.visible} onHide={() => setToast(prev => ({ ...prev, visible: false }))} />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 bg-white border-r border-gray-100 flex flex-col shrink-0 z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:block w-72",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5551FF] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">NEXORA</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-900 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 mb-8">
          <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3 border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center overflow-hidden">
              {storeData?.logo_url ? (
                <img src={storeData.logo_url} alt="Store" className="w-full h-full object-cover" />
              ) : (
                <Store size={16} className="text-gray-400" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Loja ativa</p>
              <p className="text-xs font-bold text-gray-900 truncate">{storeData?.name || 'MINHA LOJA'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {userProfile?.role === 'admin' || session?.user?.email === 'dionesnatan54@gmail.com' ? (
            <>
              <SidebarItem icon={LayoutDashboard} label="Admin Dashboard" active={currentView === 'admin-dashboard'} onClick={() => { setCurrentView('admin-dashboard'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={User} label="Usuários" active={currentView === 'admin-users'} onClick={() => { setCurrentView('admin-users'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={Store} label="Lojas do Sistema" active={currentView === 'admin-stores'} onClick={() => { setCurrentView('admin-stores'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={ShieldCheck} label="Controle de Acesso" active={currentView === 'admin-access'} onClick={() => { setCurrentView('admin-access'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={CreditCard} label="Assinantes" active={currentView === 'admin-assinaturas'} onClick={() => { setCurrentView('admin-assinaturas'); setIsSidebarOpen(false); }} />
            </>
          ) : (
            <>
              <p className="px-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Menu</p>
              <SidebarItem icon={LayoutDashboard} label="Dashboard" active={currentView === 'dashboard'} onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }} />
              
              {/* Only show Store options if user is not on FREE plan or has a store */}
              {userProfile?.plan !== 'free' && (
                <>
                  <SidebarItem icon={Package} label="Produtos" active={currentView === 'produtos'} onClick={() => { setCurrentView('produtos'); setIsSidebarOpen(false); }} />
                  <SidebarItem icon={ShoppingBag} label="Pedidos" active={currentView === 'pedidos'} onClick={() => { setCurrentView('pedidos'); setIsSidebarOpen(false); }} />
                </>
              )}

              <SidebarItem icon={BookOpen} label="Catálogo" active={currentView === 'catalogo'} onClick={() => { setCurrentView('catalogo'); setIsSidebarOpen(false); }} />
              
              {userProfile?.plan !== 'free' && (
                <>
                  <SidebarItem icon={Palette} label="Aparência da loja" active={currentView === 'aparencia'} onClick={() => { setCurrentView('aparencia'); setIsSidebarOpen(false); }} />
                  <SidebarItem icon={Globe} label="Domínio" active={currentView === 'dominio'} onClick={() => { setCurrentView('dominio'); setIsSidebarOpen(false); }} />
                  <SidebarItem icon={Layers} label="Minhas lojas" active={currentView === 'minhas-lojas'} onClick={() => { setCurrentView('minhas-lojas'); setIsSidebarOpen(false); }} />
                  <SidebarItem icon={Store} label="Loja ativa (Editar)" active={currentView === 'minha-loja'} onClick={() => { setCurrentView('minha-loja'); setIsSidebarOpen(false); }} />
                </>
              )}

              <SidebarItem icon={CreditCard} label="Meu Plano" active={currentView === 'plano'} onClick={() => { setCurrentView('plano'); setIsSidebarOpen(false); }} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all group"
          >
            <LogOut size={18} className="group-hover:text-red-500" />
            <span className="text-sm font-medium">Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-900 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-bold text-gray-900 lg:text-gray-400 lg:font-medium truncate max-w-[150px] sm:max-w-none">
              {storeData?.name || 'Painel de Controle'}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                if (storeData?.custom_domain) {
                  window.open(`https://${storeData.custom_domain}`, '_blank');
                } else if (storeData?.slug) {
                  window.open(`/loja/${storeData.slug}`, '_blank');
                } else {
                  notify("Configure o link da sua loja em 'Minha Loja' primeiro.");
                }
              }}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors border border-gray-100 px-3 py-1.5 rounded-lg"
            >
              <ExternalLink size={14} />
              Ver loja
            </button>
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-gray-400 hover:text-gray-900 transition-colors relative"
              >
                <Bell size={20} />
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Notificações</h3>
                      <span className="text-[10px] font-black text-[#5551FF] bg-indigo-50 px-2 py-0.5 rounded-full">3 Novas</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                          <div className="flex items-center justify-between mb-1">
                            <p className={cn("text-xs font-bold", n.unread ? "text-gray-900" : "text-gray-500")}>{n.title}</p>
                            {n.unread && <div className="w-1.5 h-1.5 bg-[#5551FF] rounded-full" />}
                          </div>
                          <p className="text-[10px] text-gray-400">{n.time}</p>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#5551FF] transition-colors border-t border-gray-50">
                      Ver todas as notificações
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative group">
              <button
                className="flex items-center gap-3 pl-6 border-l border-gray-100 cursor-pointer group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-none group-hover:text-[#5551FF] transition-colors">
                    {session.user?.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium truncate w-32">{session.user?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#5551FF] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform uppercase">
                  {session.user?.email?.charAt(0) || 'U'}
                </div>
              </button>

              {/* Profile Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-xs font-bold text-gray-900">{session.user?.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-gray-400 truncate">{session.user?.email}</p>
                </div>
                <button
                  onClick={() => setCurrentView('plano')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <CreditCard size={14} /> Meu Plano
                </button>
                {session?.user?.email === 'admin@nexora.app' && (
                  <button
                    onClick={() => setCurrentView('admin-assinaturas')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <ShieldCheck size={14} /> Admin Assinaturas
                  </button>
                )}
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <LogOut size={14} /> Sair da conta
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable View */}
        <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
          <div className="max-w-7xl mx-auto p-4 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {currentView === 'dashboard' && <DashboardView onAction={notify} onNavigate={setCurrentView} storeId={activeStoreId} />}
                {currentView === 'admin-dashboard' && <AdminGlobalDashboard onAction={notify} />}
                {currentView === 'admin-users' && <AdminUserList onAction={notify} />}
                {currentView === 'admin-stores' && <AdminStoreList onAction={notify} />}
                {currentView === 'admin-access' && <AdminAccessControl onAction={notify} />}
                {currentView === 'catalogo' && <CatalogView session={session} onAction={notify} userProfile={userProfile} />}
                {currentView === 'minhas-lojas' && (
                  <MinhasLojasView
                    session={session}
                    onAction={notify}
                    stores={storesList}
                    activeStoreId={activeStoreId}
                    onSelectStore={(id) => {
                      setActiveStoreId(id);
                      localStorage.setItem('nexora_active_store_id', id);
                    }}
                    onUpdateStores={() => fetchStoreData(session.user.id)}
                    userProfile={userProfile}
                  />
                )}
                {currentView === 'aparencia' && <AppearanceView onAction={notify} session={session} storeId={activeStoreId} />}
                {currentView === 'plano' && (
                  <PlanView
                    onAction={notify}
                    session={session}
                    onSelectPlan={(plan) => {
                      setSelecionadoPlan(plan);
                      setCurrentView('checkout');
                    }}
                  />
                )}
                {currentView === 'checkout' && selectedPlan && (
                  <CheckoutView
                    plan={selectedPlan}
                    onAction={notify}
                    onBack={() => setCurrentView('plano')}
                    session={session}
                  />
                )}
                {currentView === 'admin-assinaturas' && <AdminSubscribersView onAction={notify} session={session} />}
                {currentView === 'pedidos' && (() => {
                  const filteredOrders = recentOrders.filter(order => orderTab === 'Todos' || order.status === orderTab);
                  return (
                    <div className="space-y-8">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
                        <p className="text-gray-500">{filteredOrders.length} pedido(s) no total</p>
                      </div>
                      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        {['Todos', 'Pendente', 'Pago', 'Enviado', 'Entregue', 'Cancelado'].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setOrderTab(tab)}
                            className={cn(
                              "px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                              orderTab === tab ? "bg-[#5551FF] text-white" : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                            )}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm min-h-[400px] flex flex-col p-6">
                        {filteredOrders.length > 0 ? (
                          <div className="space-y-4 w-full">
                            {filteredOrders.map((order) => (
                              <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#5551FF] font-bold text-sm shrink-0">
                                    {order.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 truncate">{order.name}</h4>
                                    <p className="text-xs text-gray-400 truncate">{order.email} • {order.date}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-bold text-gray-900">{order.value}</span>
                                  <span className={cn(
                                    "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                                    order.status === 'Cancelado' ? "bg-red-50 text-red-500" :
                                      order.status === 'Pago' ? "bg-emerald-50 text-emerald-500" :
                                        "bg-blue-50 text-blue-500"
                                  )}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <EmptyState
                              title="Nenhum pedido encontrado."
                              desc={`Você não tem pedidos com o status ${orderTab}.`}
                              icon={ShoppingCart}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
                {currentView === 'produtos' && <ProductsView onAction={notify} session={session} storeId={activeStoreId} />}
                {currentView === 'dominio' && (
                  <div className="max-w-2xl mx-auto space-y-12 py-12">
                    <div className="text-center space-y-2">
                      <h1 className="text-3xl font-black text-gray-900">Domínio da Loja</h1>
                      <p className="text-gray-500">Configure um domínio personalizado para sua vitrine.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#5551FF] font-bold text-sm">
                            <Globe size={18} />
                            Endereço padrão da sua loja
                          </div>
                          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Check size={10} strokeWidth={4} /> Ativo
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <span className="flex-1 font-mono text-sm text-gray-600">
                            {customDomain || (storeData?.slug ? `${storeData.slug}.nexora.app` : 'suaLoja.nexora.app')}
                          </span>
                          <button
                            onClick={() => {
                              const url = customDomain ? `https://${customDomain}` : (storeData?.slug ? `${window.location.origin}/loja/${storeData.slug}` : '');
                              if (url) {
                                navigator.clipboard.writeText(url);
                                notify("Link copiado!");
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-[#5551FF] transition-colors"
                          >
                            <Plus size={18} className="rotate-45" />
                          </button>
                          <button
                            onClick={() => {
                              const url = customDomain ? `https://${customDomain}` : (storeData?.slug ? `/loja/${storeData.slug}` : '');
                              if (url) window.open(url, '_blank');
                            }}
                            className="p-2 text-gray-400 hover:text-[#5551FF] transition-colors"
                          >
                            <ExternalLink size={18} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">Este endereço sempre funcionará, independente de domínio personalizado.</p>
                      </div>

                      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gray-50/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
                           <div className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2">
                             <Clock size={16} />
                             Funcionamento em breve
                           </div>
                        </div>
                        <div className="flex items-center justify-between opacity-80">
                          <div className="flex items-center gap-2 text-[#5551FF] font-bold text-sm">
                            <Globe size={18} />
                            Domínio personalizado
                          </div>
                        </div>
                        <div className="flex gap-3 opacity-80">
                          <input
                            type="text"
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                            placeholder="minhaloja.com"
                            disabled
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none transition-all font-bold cursor-not-allowed text-gray-400"
                          />
                          <button
                            disabled
                            className="bg-gray-200 text-gray-400 px-8 py-3 rounded-2xl font-bold cursor-not-allowed"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {currentView === 'minha-loja' && <MinhaLojaView onAction={notify} session={session} storeId={activeStoreId} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
