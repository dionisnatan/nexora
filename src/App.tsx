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
  AlertTriangle,
  Edit3,
  Clock,
  Wallet,
  Link,
  Unlink,
  RefreshCw
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
import { getPlanConfig } from './lib/plans';

/**
 * Utility for tailwind class merging
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type View = 'dashboard' | 'produtos' | 'pedidos' | 'aparencia' | 'dominio' | 'minha-loja' | 'plano' | 'checkout' | 'admin-assinaturas' | 'admin-dashboard' | 'admin-users' | 'admin-stores' | 'admin-access' | 'catalogo' | 'minhas-lojas' | 'pagamentos';

interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  plan: string;
  expires_at: string | null;
}



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
  onClick,
  badge
}: {
  icon: any,
  label: string,
  active?: boolean,
  onClick: () => void,
  badge?: number
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all relative group",
      active
        ? "bg-indigo-50 text-indigo-600"
        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
    )}
  >
    <div className="flex items-center gap-3 relative z-10">
      <Icon size={18} className={cn(
        "transition-colors",
        active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
      )} />
      <span className={cn(
        "text-sm font-semibold transition-colors",
        active ? "text-indigo-600" : "text-gray-500"
      )}>
        {label}
      </span>
    </div>

    {active && (
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-sm" />
    )}

    {badge !== undefined && badge > 0 && (
      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {badge}
      </span>
    )}
  </button>
);

const StatCard = ({ icon: Icon, label, value, subtext, color, isFeatured }: { icon: any, label: string, value: string, subtext: string, color: string, isFeatured?: boolean }) => (
  <div className={cn(
    "relative overflow-hidden p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md group",
    isFeatured ? "ring-2 ring-indigo-500/20" : ""
  )}>

    <div className="relative z-10 flex flex-col gap-6">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center border border-transparent transition-transform group-hover:scale-105",
        color
      )}>
        <Icon size={22} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-gray-400 capitalize mb-4">{label}</p>
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight leading-none mb-2">{value}</h3>
        <div className="flex items-center gap-2 mt-4">
          {subtext.length > 0 && (
            <span className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5",
              subtext.includes('hoje') || subtext.includes('ativos') || subtext.includes('1,37%')
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-gray-100 text-gray-500 border border-gray-200"
            )}>
              {(subtext.includes('1,37%') || subtext.includes('▲')) && <TrendingUp size={10} />}
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

// --- Views ---


// ============================================================
// PaymentSettingsView  — Mercado Pago OAuth per-user connection
// ============================================================
const MP_CLIENT_ID = import.meta.env.VITE_MP_CLIENT_ID || '7586811358422236';
const SUPABASE_FUNCTIONS_URL = `https://zgnwqxcjdbjpzniemrdy.supabase.co/functions/v1`;

const PaymentSettingsView = ({ session, storeId, onAction }: { session: any, storeId: string | null, onAction: (msg: string) => void }) => {
  const [integration, setIntegration] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchIntegration() {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('payment_integrations')
          .select('id, mp_email, mp_nickname, mp_user_id, expires_at, created_at, provider')
          .eq('user_id', session?.user?.id)
          .eq('provider', 'mercadopago')
          .maybeSingle();
        if (isMounted) setIntegration(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    if (session?.user?.id) fetchIntegration();
    // Check for OAuth callback result in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('mp_connected') === '1') {
      onAction('✅ Mercado Pago conectado com sucesso!');
      window.history.replaceState({}, '', window.location.pathname);
      fetchIntegration();
    } else if (params.get('mp_error')) {
      onAction('❌ Erro ao conectar: ' + params.get('mp_error'));
      window.history.replaceState({}, '', window.location.pathname);
    }
    return () => { isMounted = false; };
  }, [session?.user?.id]);

  const handleConnect = () => {
    if (!MP_CLIENT_ID) {
      onAction('Configure a variável VITE_MP_CLIENT_ID no .env com o Client ID do seu App Mercado Pago.');
      return;
    }
    const redirectUri = encodeURIComponent(`${SUPABASE_FUNCTIONS_URL}/mp-oauth-callback`);
    const state = `${session?.user?.id}|${storeId || ''}`;
    const mpOauthUrl = `https://auth.mercadopago.com.br/authorization?client_id=${MP_CLIENT_ID}&response_type=code&platform_id=mp&redirect_uri=${redirectUri}&state=${state}`;
    window.location.href = mpOauthUrl;
  };

  const handleDisconnect = async () => {
    setShowConfirmModal(false);
    setIsDisconnecting(true);
    try {
      await supabase
        .from('payment_integrations')
        .delete()
        .eq('user_id', session?.user?.id)
        .eq('provider', 'mercadopago');
      setIntegration(null);
      onAction('Mercado Pago desconectado.');
    } catch (e: any) {
      onAction('Erro ao desconectar: ' + e.message);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-gray-900">Desconectar Mercado Pago?</h3>
                <p className="text-sm text-gray-500">Sua loja não poderá mais processar pagamentos através desta conta. Tem certeza?</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Sim, Desconectar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
        <p className="text-gray-500">Conecte sua conta Mercado Pago para receber pagamentos diretamente.</p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* MP Logo Badge */}
            <div className="w-12 h-12 rounded-xl bg-[#009EE3] flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-black text-xs">MP</span>
            </div>
            <div>
              <h2 className="font-black text-gray-900">Mercado Pago</h2>
              <p className="text-xs text-gray-400">Receba via PIX, Cartão, Boleto</p>
            </div>
          </div>
          {!isLoading && (
            <span className={cn(
              "flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest",
              integration ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"
            )}>
              <span className={cn(
                "w-2 h-2 rounded-full",
                integration ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
              )} />
              {integration ? 'Conectado' : 'Não conectado'}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-indigo-100 border-t-[#5551FF] rounded-full animate-spin" />
          </div>
        ) : integration ? (
          <div className="space-y-4">
            {/* Account Info */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Conta vinculada</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-0.5">E-mail</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{integration.mp_email || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-0.5">Apelido</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{integration.mp_nickname || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-0.5">MP User ID</p>
                  <p className="text-sm font-bold text-gray-900 font-mono">{integration.mp_user_id || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-0.5">Conectado em</p>
                  <p className="text-sm font-bold text-gray-900">{integration.created_at ? new Date(integration.created_at).toLocaleDateString('pt-BR') : '—'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-all"
              >
                <RefreshCw size={14} />
                Reconectar
              </button>
              <button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-all disabled:opacity-50"
              >
                <Unlink size={14} />
                {isDisconnecting ? 'Desconectando...' : 'Desconectar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              Conecte sua conta do Mercado Pago para que seus clientes possam pagar diretamente na sua loja.
              Os valores são creditados na <strong>sua conta pessoal</strong> do Mercado Pago.
            </p>
            <button
              onClick={handleConnect}
              className="w-full h-12 bg-[#009EE3] hover:bg-[#0088CC] text-white rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300"
            >
              <Link size={18} />
              Conectar com Mercado Pago
            </button>
            <p className="text-[10px] text-gray-400 text-center">Você será redirecionado para autorizar o acesso à sua conta MP</p>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
          <HelpCircle size={16} className="text-[#5551FF]" />
          Como funciona?
        </h3>
        <div className="space-y-3">
          {[
            { num: '1', text: 'Clique em "Conectar com Mercado Pago" e autorize o acesso' },
            { num: '2', text: 'Seu token é salvo de forma segura no servidor (nunca exposto)' },
            { num: '3', text: 'Ao receber um pedido, o pagamento vai direto para a sua conta MP' },
            { num: '4', text: 'Você vê todos os pagamentos no painel do Mercado Pago' }
          ].map(step => (
            <div key={step.num} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#5551FF] text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{step.num}</div>
              <p className="text-sm text-gray-600">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Config Tip */}
      {!MP_CLIENT_ID && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
            <AlertCircle size={14} />
            Configuração necessária
          </p>
          <p className="text-sm text-amber-700 leading-relaxed">
            Para ativar, adicione no arquivo <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">.env</code>:
          </p>
          <pre className="mt-2 bg-amber-100 rounded-lg px-3 py-2 text-xs font-mono text-amber-800">
            VITE_MP_CLIENT_ID=TEST-93164719-407f-4a1b-9fae-97a89ee06bd5
          </pre>
          <p className="text-[10px] text-amber-600 mt-2">
            Obtenha o Client ID em: mercadopago.com.br/developers/panel/app
          </p>
        </div>
      )}

      {/* Melhor Envio Integration section */}
      <h2 className="text-2xl font-bold text-gray-900 pt-8 border-t border-gray-100 mt-8">Logística</h2>
      <p className="text-gray-500 mb-6">Conecte sua conta Melhor Envio para gerar etiquetas de frete.</p>
      <MelhorEnvioSettings storeId={storeId} onAction={onAction} />
    </div>
  );
};

const MercadoPagoSettings = ({ storeId, onAction }: { storeId: string | null, onAction: (msg: string) => void }) => {
  const [integration, setIntegration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [publicKey, setPublicKey] = useState('');

  const fetchIntegration = async () => {
    if (!storeId) return;
    setLoading(true);
    const { data } = await supabase
      .from('payment_integrations')
      .select('*')
      .eq('store_id', storeId)
      .eq('provider', 'mercadopago')
      .single();
    if (data) {
      setIntegration(data);
      setPublicKey(data.public_key || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIntegration();
  }, [storeId]);

  const handleSavePublicKey = async () => {
    if (!storeId || !integration) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('payment_integrations')
      .update({ public_key: publicKey })
      .eq('id', integration.id);

    if (error) {
      onAction('Erro ao salvar Public Key');
    } else {
      onAction('Public Key salva com sucesso!');
      fetchIntegration();
    }
    setIsSaving(false);
  };

  if (loading) return <div className="p-4 animate-pulse">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Mercado Pago</h3>
          <p className="text-xs text-gray-500 italic">Checkout transparente e Bricks</p>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
          integration ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-50 text-gray-400 border border-gray-100"
        )}>
          <div className={cn("w-2 h-2 rounded-full", integration ? "bg-emerald-500 animate-pulse" : "bg-gray-300")} />
          {integration ? "Conectado" : "Não configurado"}
        </div>
      </div>

      {integration ? (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 font-bold">MP</div>
              <div>
                <p className="text-sm font-bold text-gray-900">{integration.mp_nickname || 'Vendedor'}</p>
                <p className="text-[10px] text-gray-400">{integration.mp_email || '-'}</p>
              </div>
            </div>

            <div className="pt-2 space-y-2 border-t border-gray-200">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Public Key (Necessário para Checkout Interno)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="APP_USR-..."
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
                <button
                  onClick={handleSavePublicKey}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  {isSaving ? '...' : 'Salvar'}
                </button>
              </div>
              <p className="text-[9px] text-gray-500 leading-tight italic">
                Encontre na aba "Credenciais de Produção" no painel do Mercado Pago.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
          <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
            <AlertCircle size={14} />
            Configuração necessária
          </p>
          <p className="text-sm text-amber-700 leading-relaxed italic">
            Para ativar o checkout interno, conecte sua conta do Mercado Pago no dashboard principal.
          </p>
        </div>
      )}
    </div>
  );
};

const MelhorEnvioSettings = ({ storeId, onAction }: { storeId: string | null, onAction: (msg: string) => void }) => {
  const [integration, setIntegration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchIntegration = async () => {
    if (!storeId) return;
    setLoading(true);
    const { data } = await supabase
      .from('me_store_integrations')
      .select('*')
      .eq('store_id', storeId)
      .maybeSingle();
    setIntegration(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchIntegration();

    const params = new URLSearchParams(window.location.search);
    if (params.get('me_success')) {
      onAction('✅ Melhor Envio conectado com sucesso!');
      window.history.replaceState({}, '', window.location.pathname + '?tab=config');
    } else if (params.get('me_error')) {
      onAction('❌ Erro ao conectar Melhor Envio.');
      window.history.replaceState({}, '', window.location.pathname + '?tab=config');
    }
  }, [storeId]);

  const handleConnect = () => {
    if (!storeId) return;
    const ME_CLIENT_ID = '23351';
    const clientId = import.meta.env.VITE_MELHOR_ENVIO_CLIENT_ID || ME_CLIENT_ID;
    const redirectUri = encodeURIComponent(`https://zgnwqxcjdbjpzniemrdy.supabase.co/functions/v1/me-oauth-callback`);
    const meOauthUrl = `https://www.melhorenvio.com.br/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=shipping-calculate%20shipping-checkout%20shipping-generate%20users-read&state=${storeId}`;
    window.location.href = meOauthUrl;
  };

  const handleDisconnect = async () => {
    setShowConfirmModal(false);
    setIsDisconnecting(true);
    try {
      await supabase
        .from('me_store_integrations')
        .delete()
        .eq('store_id', storeId);
      setIntegration(null);
      onAction('Melhor Envio desconectado.');
    } catch (e: any) {
      onAction('Erro ao desconectar: ' + e.message);
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (loading) return <div className="p-4 animate-pulse">Carregando Melhor Envio...</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 relative">
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-gray-900">Desconectar Melhor Envio?</h3>
                <p className="text-sm text-gray-500">Tem certeza? Você não poderá mais gerar etiquetas automaticamente para esta loja.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Sim, Desconectar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-200/50">
            <Package className="text-white" size={24} />
          </div>
          <div>
            <h2 className="font-black text-gray-900">Melhor Envio</h2>
            <p className="text-xs text-gray-400">Geração de etiquetas automatizada</p>
          </div>
        </div>
        {!loading && (
          <span className={cn(
            "flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest",
            integration ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full",
              integration ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
            )} />
            {integration ? 'Conectado' : 'Não conectado'}
          </span>
        )}
      </div>

      {integration ? (
        <div className="space-y-4">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <ShieldCheck size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Conta vinculada</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-0.5">E-mail Melhor Envio</p>
                <p className="text-sm font-bold text-gray-900 truncate">{integration.me_email || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-0.5">Conectado em</p>
                <p className="text-sm font-bold text-gray-900">{integration.created_at ? new Date(integration.created_at).toLocaleDateString('pt-BR') : '—'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isDisconnecting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-all disabled:opacity-50"
          >
            <Unlink size={14} />
            {isDisconnecting ? 'Desconectando...' : 'Desconectar da loja'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            Conecte sua conta do Melhor Envio para gerar etiquetas diretamente do painel, utilizando os saldos já existentes na sua carteira.
          </p>
          <button
            onClick={handleConnect}
            className="w-full h-12 bg-amber-400 hover:bg-amber-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300"
          >
            <Link size={18} />
            Conectar com Melhor Envio
          </button>
        </div>
      )}
    </div>
  );
};

const STATUS_TRACKING_LABELS: Record<string, string> = {
  'Pendente': '📋 Pedido recebido e aguardando confirmação',
  'Pago': '✅ Pagamento confirmado com sucesso',
  'Preparando': '📦 Pedido em preparação',
  'Enviado': '🚚 Pedido saiu para entrega',
  'Entregue': '🎉 Pedido entregue ao cliente',
  'Cancelado': '❌ Pedido cancelado',
};

const OrdersView = ({ session, storeId, onAction }: { session: any, storeId: string | null, onAction: (msg: string) => void }) => {
  const [orderTab, setOrderTab] = useState('Todos');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [trackingLogs, setTrackingLogs] = useState<Record<string, any[]>>({});

  useEffect(() => {
    let isMounted = true;
    async function fetchOrders() {
      setIsLoading(true);
      try {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (storeId) {
          query = query.eq('store_id', storeId);
        }
        const { data } = await query;
        if (isMounted && data) {
          setOrders(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchOrders();

    // Subscribe to real-time order updates
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: storeId ? `store_id=eq.${storeId}` : undefined
      }, (payload) => {
        if (!isMounted) return;
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new, ...prev]);
          onAction('🔔 Novo pedido recebido!');
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id === payload.old.id));
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [storeId]);

  const filteredOrders = orders.filter(order => orderTab === 'Todos' || order.status === orderTab);

  const fetchTrackingLogs = async (orderId: string) => {
    const { data } = await supabase
      .from('order_tracking')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (data) {
      setTrackingLogs(prev => ({ ...prev, [orderId]: data }));
    }
  };

  const handleExpandOrder = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
      fetchTrackingLogs(orderId);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, items: any[]) => {
    try {
      // 1. Update the order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // 2. Insert tracking log entry
      await supabase.from('order_tracking').insert({
        order_id: orderId,
        status: newStatus,
        description: STATUS_TRACKING_LABELS[newStatus] || `Status alterado para ${newStatus}`,
      });

      // Refresh tracking logs for this order if expanded
      if (expandedOrderId === orderId) {
        fetchTrackingLogs(orderId);
      }

      // 3. If confirming (Pago/Aprovado), reduce stock
      if (newStatus === 'Pago' || newStatus === 'Aprovado') {
        for (const item of items) {
          const productId = item.id;
          const variationId = item.selectedVariation?.id;
          const quantity = Number(item.quantity) || 1;

          if (variationId) {
            const { data: variation } = await supabase
              .from('product_variations')
              .select('estoque')
              .eq('id', variationId)
              .single();

            if (variation) {
              const newEstoque = Math.max(0, (Number(variation.estoque) || 0) - quantity);
              await supabase
                .from('product_variations')
                .update({ estoque: newEstoque })
                .eq('id', variationId);
            }
          } else if (productId) {
            const { data: product } = await supabase
              .from('products')
              .select('estoque')
              .eq('id', productId)
              .single();

            if (product) {
              const newEstoque = Math.max(0, (Number(product.estoque) || 0) - quantity);
              await supabase
                .from('products')
                .update({ estoque: newEstoque })
                .eq('id', productId);
            }
          }
        }
      }

      // 4. Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      onAction(`Pedido ${newStatus.toLowerCase()} com sucesso!`);
    } catch (e: any) {
      console.error('Error updating order status:', e);
      onAction('Erro ao atualizar status: ' + e.message);
    }
  };

  const [isBuyingShipping, setIsBuyingShipping] = useState<Record<string, boolean>>({});

  const handleBuyShipping = async (order: any) => {
    try {
      if (!storeId) return;
      setIsBuyingShipping(prev => ({ ...prev, [order.id]: true }));
      onAction('Gerando etiqueta no Melhor Envio...');

      const { data, error } = await supabase.functions.invoke('buy-shipping', {
        body: { orderId: order.id, storeId }
      });

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === order.id ? {
        ...o,
        tracking_code: data.tracking_code,
        shipping_label_url: data.shipping_label_url
      } : o));

      onAction('Etiqueta gerada com sucesso!');

      if (data.tracking_code && order.status !== 'Enviado') {
        updateOrderStatus(order.id, 'Enviado', order.items || []);
      }
    } catch (e: any) {
      console.error('Buy Shipping Error:', e);
      let errorMsg = e.message || 'Erro desconhecido';

      // If it's a Supabase Edge Function error with a response
      if (e.context && typeof e.context.json === 'function') {
        try {
          const body = await e.context.json();
          errorMsg = body.error || errorMsg;
        } catch (parseError) {
          // Fallback if body is not JSON
        }
      }

      onAction('Erro ao processar frete: ' + errorMsg);
    } finally {
      setIsBuyingShipping(prev => ({ ...prev, [order.id]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-[#5551FF] animate-spin mb-4" />
        <span className="text-sm font-bold text-gray-500 animate-pulse">Carregando pedidos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500">{filteredOrders.length} pedido(s) no total</p>
      </div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {['Todos', 'Pendente', 'Pago', 'Preparando', 'Enviado', 'Entregue', 'Cancelado'].map((tab) => (
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
          <div className="space-y-3 w-full">
            {filteredOrders.map((order) => {
              const customerName = order.customer_name || 'Desconhecido';
              const isExpanded = expandedOrderId === order.id;
              const logs = trackingLogs[order.id] || [];
              const statusColor = (
                order.status === 'Cancelado' || order.status === 'Recusado' ? 'bg-red-50 text-red-600 border-red-100' :
                  order.status === 'Pago' || order.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    order.status === 'Entregue' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      order.status === 'Enviado' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                        order.status === 'Preparando' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          'bg-orange-50 text-orange-600 border-orange-100'
              );
              return (
                <div key={order.id} className="rounded-2xl border border-gray-100 hover:border-indigo-100 transition-all overflow-hidden">
                  {/* Order Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 sm:gap-0">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-[#5551FF] font-black text-lg shrink-0">
                        {customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-gray-900 truncate">{customerName}</h4>
                        <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">{order.customer_email || '-'} • {new Date(order.created_at).toLocaleDateString()}</p>
                        <p className="text-[9px] text-gray-400 mt-1 font-mono">{order.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-3">
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <span className="text-base font-black text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.total) || 0)}</span>
                        <span className={cn('text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border', statusColor)}>
                          {order.status || 'Pendente'}
                        </span>
                      </div>
                      {/* Status Action Buttons */}
                      <div className="flex items-center flex-wrap gap-2">
                        {order.status === 'Pendente' && (
                          <button onClick={() => updateOrderStatus(order.id, 'Pago', order.items || [])} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm">
                            ✅ Confirmar Pago
                          </button>
                        )}
                        {(order.status === 'Pago' || order.status === 'Aprovado') && (
                          <button onClick={() => updateOrderStatus(order.id, 'Preparando', order.items || [])} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-sm">
                            📦 Preparando
                          </button>
                        )}
                        {order.status === 'Preparando' && (
                          <button onClick={() => updateOrderStatus(order.id, 'Enviado', order.items || [])} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors shadow-sm">
                            🚚 Marcar Enviado
                          </button>
                        )}
                        {order.status === 'Enviado' && (
                          <button onClick={() => updateOrderStatus(order.id, 'Entregue', order.items || [])} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            🎉 Finalizar Entrega
                          </button>
                        )}
                        {order.status !== 'Cancelado' && order.status !== 'Entregue' && (
                          <button onClick={() => updateOrderStatus(order.id, 'Cancelado', order.items || [])} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border border-red-100 text-red-500 hover:bg-red-50 transition-colors rounded-lg">
                            Cancelar
                          </button>
                        )}
                        {/* Shipping Integration Buttons */}
                        {order.status === 'Pago' || order.status === 'Preparando' || order.status === 'Aprovado' ? (
                          !order.tracking_code ? (
                            <button
                              onClick={() => handleBuyShipping(order)}
                              disabled={isBuyingShipping[order.id]}
                              className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-amber-400 text-white rounded-lg hover:bg-amber-500 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                            >
                              <Package size={12} />
                              {isBuyingShipping[order.id] ? 'Gerando...' : 'Comprar Frete'}
                            </button>
                          ) : (
                            <a
                              href={order.shipping_label_url || `https://melhorenvio.com.br/painel/envios/aguardando-impressao`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-1"
                            >
                              <ExternalLink size={12} />
                              Imprimir Etiqueta
                            </a>
                          )
                        ) : null}
                        {/* Expand toggle */}
                        <button
                          onClick={() => handleExpandOrder(order.id)}
                          className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border border-gray-100 text-gray-500 hover:bg-gray-50 transition-colors rounded-lg flex items-center gap-1"
                        >
                          {isExpanded ? '▲ Ocultar' : '▼ Rastreio'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  {isExpanded && (
                    <div className="border-t border-gray-50 bg-gray-50/50 px-6 py-5">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">📍 Histórico do Pedido</p>
                        {order.tracking_code && (
                          <p className="text-[10px] font-black text-[#5551FF] uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">
                            Rastreio: {order.tracking_code}
                          </p>
                        )}
                      </div>
                      {logs.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Nenhum histórico registrado ainda.</p>
                      ) : (
                        <div className="relative pl-6">
                          <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />
                          {logs.map((log, idx) => (
                            <div key={log.id} className="relative mb-4 last:mb-0">
                              <div className={cn(
                                'absolute -left-[18px] w-4 h-4 rounded-full border-2 border-white flex items-center justify-center',
                                idx === logs.length - 1 ? 'bg-[#5551FF]' : 'bg-emerald-400'
                              )} />
                              <p className="text-[11px] font-black text-gray-800">{log.description || log.status}</p>
                              <p className="text-[9px] text-gray-400 mt-0.5">{new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <Package size={24} className="text-gray-300" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Nenhum pedido encontrado</h3>
            <p className="text-xs text-gray-400 max-w-[250px]">
              Os pedidos da sua loja aparecerão aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardView = ({ onAction, onNavigate, storeId }: { onAction: (msg: string) => void; onNavigate: (view: View) => void; storeId: string | null }) => {
  const [timeRange, setTimeRange] = useState<'Hoje' | '7 dias' | '30 dias' | '12 meses'>('7 dias');
  const [isLoading, setIsLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    faturamento: 'R$ 0,00',
    pedidos: '0',
    pedidosSub: '0 hoje',
    produtos: '0',
    produtosSub: '0 ativos',
    pendentes: '0',
    pendentesSub: 'Aguardando ação',
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setIsLoading(true);
      try {
        const now = new Date();
        const start = new Date();
        if (timeRange === 'Hoje') {
          start.setHours(0, 0, 0, 0);
        } else if (timeRange === '7 dias') {
          start.setDate(now.getDate() - 7);
        } else if (timeRange === '30 dias') {
          start.setDate(now.getDate() - 30);
        } else if (timeRange === '12 meses') {
          start.setMonth(now.getMonth() - 12);
        }

        if (!storeId) {
          setIsLoading(false);
          setMetrics({
            faturamento: 'R$ 0,00',
            pedidos: '0',
            pedidosSub: '0 hoje',
            produtos: '0',
            produtosSub: '0 ativos',
            pendentes: '0',
            pendentesSub: 'Aguardando ação'
          });
          setChartData([]);
          setRecentOrders([]);
          setBestSellers([]);
          return;
        }

        let ordersQuery = supabase.from('orders').select('*').gte('created_at', start.toISOString());
        let productsQuery = supabase.from('products').select('*');
        let todayOrdersQuery = supabase.from('orders').select('id, created_at');

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        todayOrdersQuery = todayOrdersQuery.gte('created_at', todayStart.toISOString());

        ordersQuery = ordersQuery.eq('store_id', storeId);
        productsQuery = productsQuery.eq('store_id', storeId);
        todayOrdersQuery = todayOrdersQuery.eq('store_id', storeId);

        const [ordersRes, productsRes, todayOrdersRes] = await Promise.all([
          ordersQuery,
          productsQuery,
          todayOrdersQuery
        ]);

        if (!isMounted) return;

        const orders = ordersRes.data || [];
        const products = productsRes.data || [];
        const todayOrdersCount = todayOrdersRes.data?.length || 0;

        const faturamentoNum = orders
          .filter(o => o.status === 'Pago' || o.status === 'Aprovado')
          .reduce((acc, o) => acc + (Number(o.total) || 0), 0);

        const pendentesNum = orders.filter(o => o.status === 'Pendente' || o.status === 'Aguardando ação').length;
        const ativosNum = products.filter(p => p.is_active).length;

        setMetrics({
          faturamento: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(faturamentoNum),
          pedidos: String(orders.length),
          pedidosSub: `${todayOrdersCount} hoje`,
          produtos: String(products.length),
          produtosSub: `${ativosNum} ativos`,
          pendentes: String(pendentesNum),
          pendentesSub: 'Aguardando ação'
        });

        const groupedSales = new Map<string, number>();
        if (timeRange === 'Hoje') {
          for (let i = 0; i <= now.getHours(); i++) {
            groupedSales.set(i.toString().padStart(2, '0') + ':00', 0);
          }
        } else if (timeRange === '7 dias' || timeRange === '30 dias') {
          const days = timeRange === '7 dias' ? 6 : 29;
          for (let i = days; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            groupedSales.set(`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`, 0);
          }
        } else if (timeRange === '12 meses') {
          for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
            groupedSales.set(monthStr.charAt(0).toUpperCase() + monthStr.slice(1), 0);
          }
        }

        orders.filter(o => o.status === 'Pago' || o.status === 'Aprovado').forEach(o => {
          const d = new Date(o.created_at);
          let key = '';
          if (timeRange === 'Hoje') {
            key = d.getHours().toString().padStart(2, '0') + ':00';
          } else if (timeRange === '7 dias' || timeRange === '30 dias') {
            key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
          } else {
            const monthStr = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
            key = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
          }
          if (groupedSales.has(key)) {
            groupedSales.set(key, groupedSales.get(key)! + (Number(o.total) || 0));
          } else {
            groupedSales.set(key, (Number(o.total) || 0));
          }
        });

        setChartData(Array.from(groupedSales.entries()).map(([date, sales]) => ({ date, sales })));

        const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecentOrders(sortedOrders.slice(0, 5).map(o => ({
          id: o.id,
          name: o.customer_name || 'Desconhecido',
          email: o.customer_email || '-',
          date: new Date(o.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''),
          value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(o.total) || 0),
          status: o.status || 'Pendente'
        })));

        const productSales = new Map<string, { name: string, sales: number, img: string }>();
        let totalItemsSold = 0;

        orders.filter(o => o.status === 'Pago' || o.status === 'Aprovado').forEach(o => {
          if (o.items && Array.isArray(o.items)) {
            o.items.forEach(item => {
              const qty = item.amount || item.quantity || 1;
              totalItemsSold += qty;
              const title = item.title || item.name || 'Produto Desconhecido';
              const img = item.image_url || item.image || 'https://via.placeholder.com/40';
              if (productSales.has(title)) {
                productSales.get(title)!.sales += qty;
              } else {
                productSales.set(title, { name: title, sales: qty, img });
              }
            });
          }
        });

        const sortedBestSellers = Array.from(productSales.values())
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5)
          .map(p => ({
            name: p.name,
            sales: p.sales,
            percentage: totalItemsSold > 0 ? Math.round((p.sales / totalItemsSold) * 100) : 0,
            image: p.img
          }));

        setBestSellers(sortedBestSellers);

      } catch (e) {
        console.error("Error fetching dashboard data", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [timeRange, storeId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-[#5551FF] animate-spin mb-4" />
          <span className="text-sm font-bold text-gray-500 animate-pulse">Carregando métricas reais...</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Dashboard</h1>
          <p className="text-gray-500 font-medium">Bem-vindo de volta 👋</p>
        </div>
        <button
          onClick={() => onNavigate('produtos')}
          className="bg-[#5551FF] text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Novo produto
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={DollarSign}
          label="Faturamento"
          value="R$ 0,00"
          subtext="Pedidos pagos"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={ShoppingCart}
          label="Pedidos"
          value="12"
          subtext="1 hoje"
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          icon={Package}
          label="Produtos"
          value="6"
          subtext="6 ativos"
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

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative z-10">
        {/* Chart Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.05] pointer-events-none">
          <img src="/icon_transparent.png" className="w-full h-full object-contain grayscale brightness-200 blur-[2px]" alt="" />
        </div>

        <div className="flex flex-col sm:items-center sm:flex-row justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Vendas</h2>
            <p className="text-sm text-gray-400">Últimos 7 dias</p>
          </div>
          <div className="flex items-center p-1 bg-gray-50 rounded-xl border border-gray-100">
            {(['Hoje', '7 dias', '30 dias', '12 meses'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-5 py-2 text-xs font-bold rounded-lg transition-all",
                  timeRange === range
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[320px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5551FF" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#5551FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `R$ ${val}`}
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }}
                dx={-20}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '16px',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                itemStyle={{ color: '#111827', fontSize: '13px', fontWeight: '600' }}
                labelStyle={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}
                formatter={(val: any) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val)), 'Faturamento']}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#5551FF"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
                dot={{ r: 4, fill: '#fff', stroke: '#5551FF', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#5551FF', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 mb-6">
        {/* Recent Orders */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pedidos recentes</h2>
              <p className="text-sm text-gray-400">{recentOrders.length} pedido(s) no total</p>
            </div>
            <button
              onClick={() => onNavigate('pedidos')}
              className="px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-white transition-all"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 font-bold">
                    {order.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{order.name}</h4>
                    <p className="text-xs text-gray-400">{order.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 mb-1">{order.total || order.value}</p>
                  <span className={cn(
                    "text-[10px] font-bold px-3 py-1 rounded-full",
                    order.status === 'Cancelado' || order.status === 'Recusado' ? "bg-red-50 text-red-600" :
                      order.status === 'Pago' || order.status === 'Aprovado' ? "bg-emerald-50 text-emerald-600" :
                        "bg-amber-50 text-amber-600"
                  )}>
                    {order.status}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 py-12 text-center italic">Nenhum pedido no período.</p>
            )}
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Mais vendidos</h2>
              <p className="text-sm text-gray-400">Por quantidade</p>
            </div>
            <button className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">Relatório</button>
          </div>
          <div className="space-y-6">
            {bestSellers.length > 0 ? bestSellers.map((product) => (
              <div key={product.name} className="space-y-3 group/prod">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                      <img src={product.image || 'https://via.placeholder.com/60'} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">{product.name}</span>
                      <span className="text-xs text-gray-400 block">{product.sales} und. vendidas</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-gray-900 tabular-nums">{product.value}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${product.percentage || 70}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-[#5551FF] rounded-full"
                  />
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 py-12 text-center italic">Nenhuma venda registrada.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {[
          { title: 'Gerenciar produtos', desc: 'Adicionar, editar ou remover', action: 'produtos', icon: Package, color: 'text-indigo-500' },
          { title: 'Ver pedidos', desc: 'Acompanhar e atualizar status', action: 'pedidos', icon: ShoppingBag, color: 'text-rose-500' },
          { title: 'Editar loja', desc: 'Logo, cores e informações', action: 'minha-loja', icon: Edit3, color: 'text-amber-500' }
        ].map((action) => (
          <button
            key={action.title}
            onClick={() => onNavigate(action.action as View)}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group overflow-hidden relative"
          >
            <div className={cn("w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6 transition-transform group-hover:scale-105", action.color)}>
              <action.icon size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 relative z-10">{action.title}</h3>
            <p className="text-sm text-gray-500 mb-6 relative z-10">{action.desc}</p>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 group-hover:text-indigo-500 transition-colors relative z-10">
              Acessar agora <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

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
            { name: 'Cinematic Premium', desc: 'Layout idêntico à referência (Hero gigante direiro, navegação pura)', tags: ['Clone de Referência', 'Tech', 'Dark'], premium: true },
            { name: 'Futuristic', desc: 'Design Dark Mode UI Moderno, Premium e Focado em Conversão', tags: ['Dark mode', 'Neon', 'Glassmorphism'], premium: true },
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
    footer_note: '',
    origin_cep: ''
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
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                CEP de Origem para Cálculo de Frete
                <span className="text-[9px] font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full normal-case tracking-normal">Melhor Envio</span>
              </label>
              <input
                type="text"
                value={store.origin_cep || ''}
                onChange={e => setStore({ ...store, origin_cep: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                placeholder="Ex: 01310100"
                maxLength={8}
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-mono tracking-widest"
              />
              <p className="text-[10px] text-gray-400">CEP de onde seus produtos serão enviados. Usado para calcular o frete automaticamente no checkout.</p>
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
        <p className="text-gray-500">Métricas consolidadas da plataforma Nexlyra.</p>
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
                <p className="text-[10px] text-gray-400 font-medium truncate">{s.slug}.nexlyra.app</p>
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
      tagline: 'Ideal para começar sem risco',
      cta: 'Perfeito para testar a plataforma',
      features: [
        'Até 10 produtos cadastrados',
        '1 catálogo digital interativo',
        'Link público para divulgação',
        'Integração com WhatsApp'
      ],
      limitation: 'Sem carrinho e checkout (apenas catálogo)',
      accent: '#6b7280',
      kiwifyLink: null,
      maxStores: 0
    },
    {
      name: 'PRO',
      planKey: 'pro',
      priceMonthly: 39.90,
      priceYearly: 399.00,
      tagline: 'Para quem quer vender de forma profissional',
      cta: 'Ideal para quem vende pelo Instagram e WhatsApp',
      features: [
        'Tudo do FREE incluído',
        'Produtos ilimitados',
        'Catálogo 100% personalizado',
        '1 loja online ativa',
        '1 template profissional de vitrine'
      ],
      accent: '#5551FF',
      badge: 'POPULAR',
      kiwifyLink: 'https://pay.kiwify.com.br/5U7m01m',
      maxStores: 1
    },
    {
      name: 'LOJA',
      planKey: 'loja',
      priceMonthly: 99.90,
      priceYearly: 999.00,
      tagline: 'Para transformar seguidores em clientes',
      cta: 'Aqui começa o e-commerce de verdade',
      features: [
        'Tudo do PRO incluído',
        'Loja completa (vitrine + carrinho)',
        'Checkout com PIX e pagamento integrado',
        'Catálogo ilimitado',
        'Relatórios de vendas e visitantes',
        'Domínio próprio (em breve)'
      ],
      accent: '#8b5cf6',
      badge: 'MAIS VENDIDO',
      kiwifyLink: 'https://pay.kiwify.com.br/bKuzC2f',
      maxStores: 1
    },
    {
      name: 'ULTRA',
      planKey: 'ultra',
      priceMonthly: 139.00,
      priceYearly: 1390.00,
      tagline: 'Automação + escala + inteligência',
      cta: 'Para quem quer escalar e ganhar no automático',
      features: [
        'Tudo do LOJA incluído',
        'Até 5 lojas no mesmo painel',
        'Automação de marketing e estoque',
        'Inteligência Artificial (descrições + análise)',
        'Suporte VIP prioritário'
      ],
      accent: '#f59e0b',
      kiwifyLink: '#',
      maxStores: 5
    }
  ];

  if (loading) return <div className="py-12 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-[#5551FF] animate-spin" /></div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Escolha o plano ideal para seu negócio</h1>
        <p className="text-lg text-gray-500 leading-relaxed">Assine e tenha acesso imediato a todas as ferramentas premium da Nexlyra.</p>

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
                  <p className={cn("text-xs mt-1 leading-snug", isUltra ? 'text-gray-400' : 'text-gray-500')}>{plan.tagline}</p>
                  <div className="flex items-baseline gap-1 mt-3">
                    {!isFree && <span className={cn("text-xs font-bold opacity-60", isUltra ? 'text-gray-400' : 'text-gray-500')}>R$</span>}
                    <span className={cn("text-4xl font-black italic tracking-tighter", isUltra ? 'text-white' : 'text-gray-900')}>
                      {isFree ? 'Grátis' : price.toFixed(2).replace('.', ',')}
                    </span>
                    {!isFree && <span className={cn("text-[10px] font-bold opacity-40 uppercase ml-1", isUltra ? 'text-gray-400' : 'text-gray-500')}>/{activeTab === 'monthly' ? 'mês' : 'ano'}</span>}
                  </div>
                  {(plan as any).limitation && (
                    <p className="text-[10px] text-rose-400 mt-2 font-semibold">❌ {(plan as any).limitation}</p>
                  )}
                </div>

                <div className="space-y-2.5 mb-6 flex-1">
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
                {(plan as any).cta && (
                  <p className={cn("text-[10px] font-semibold mb-4 leading-snug italic", isUltra ? 'text-gray-400' : 'text-indigo-500')}>👉 {(plan as any).cta}</p>
                )}

                <button
                  onClick={() => {
                    if (isFree || isActive) return;
                    if (plan.kiwifyLink && plan.kiwifyLink !== '#') {
                      const emailParam = session?.user?.email ? `&email=${encodeURIComponent(session.user.email)}` : '';
                      const userIdParam = session?.user?.id ? `&user_id=${session.user.id}` : '';
                      window.open(`${plan.kiwifyLink}?utm_source=nexlyra${emailParam}${userIdParam}`, '_blank');
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

      {/* Comparison Table */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-6">Comparação rápida</h2>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-black text-gray-500 w-[40%]">Recurso</th>
                  {plans.map(p => (
                    <th key={p.planKey} className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: p.accent }}>{p.name}</span>
                        {p.priceMonthly === 0
                          ? <span className="text-[10px] text-gray-400">Grátis</span>
                          : <span className="text-[10px] text-gray-400">R$ {p.priceMonthly.toFixed(2).replace('.', ',')}/mês</span>
                        }
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { label: 'Produtos', values: ['10', '∞', '∞', '∞'] },
                  { label: 'Catálogo digital', values: [true, true, true, true] },
                  { label: 'Integração WhatsApp', values: [true, true, true, true] },
                  { label: 'Loja online', values: [false, true, true, true] },
                  { label: 'Loja completa + carrinho', values: [false, false, true, true] },
                  { label: 'Checkout integrado (PIX)', values: [false, false, true, true] },
                  { label: 'Relatórios de vendas', values: [false, false, true, true] },
                  { label: 'Múltiplas lojas', values: [false, false, false, true] },
                  { label: 'Automação de marketing', values: [false, false, false, true] },
                  { label: 'Inteligência Artificial', values: [false, false, false, true] },
                  { label: 'Suporte VIP', values: [false, false, false, true] },
                ].map(row => (
                  <tr key={row.label} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-semibold text-gray-700">{row.label}</td>
                    {row.values.map((val, i) => (
                      <td key={i} className="px-4 py-3.5 text-center">
                        {typeof val === 'boolean' ? (
                          val
                            ? <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center mx-auto"><Check size={12} className="text-emerald-500" strokeWidth={3} /></div>
                            : <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center mx-auto"><X size={12} className="text-gray-300" strokeWidth={3} /></div>
                        ) : (
                          <span className="text-sm font-black text-gray-900">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <ShieldCheck size={18} className="text-indigo-400" /> Garantia Nexlyra
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
    if (plan === 'pro') return 1;
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
                  {loading ? 'Criando...' : <><Plus size={16} /> Criar Loja</>}
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

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com Google');
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Por favor, insira seu e-mail para recuperar a senha.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      alert('Se uma conta existir com este e-mail, enviaremos um link de recuperação.');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar e-mail de recuperação');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex items-center gap-4 mb-8 justify-center">
          <img src="/icon_transparent.png" alt="N" className="h-14 w-auto object-contain drop-shadow-md scale-[2.2] ml-4" />
          <span className="text-[28px] font-black tracking-tighter bg-gradient-to-r from-cyan-500 via-blue-600 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-sm leading-none z-10">NEXLYRA</span>
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
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Senha</label>
              {isLogin && (
                <button 
                  type="button" 
                  onClick={handlePasswordReset} 
                  disabled={loading}
                  className="text-[10px] font-bold text-[#5551FF] hover:text-[#4440FF] transition-colors"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>
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
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 font-medium text-gray-400">ou</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-100 text-gray-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Conectar com Google
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
  const [currentView, setCurrentView] = useState<View>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mp_connected') || params.get('mp_error') || params.get('me_success') || params.get('me_error')) {
      return 'pagamentos';
    }
    return 'dashboard';
  });
  const [selectedPlan, setSelecionadoPlan] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });
  const [orderTab, setOrderTab] = useState('Todos');
  const [storeData, setStoreData] = useState<any>(null);
  const [storesList, setStoresList] = useState<any[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(localStorage.getItem('nexlyra_active_store_id'));
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Global pending orders counter
  useEffect(() => {
    if (!activeStoreId) return;

    async function fetchPendingCount() {
      const { data } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('store_id', activeStoreId)
        .eq('status', 'Pendente');
      setPendingOrdersCount(data?.length || 0);
    }
    fetchPendingCount();

    const channel = supabase
      .channel('pending-count')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `store_id=eq.${activeStoreId}`
      }, () => {
        fetchPendingCount();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeStoreId]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Real-time notifications from orders
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; time: string; unread: boolean }>>([]);
  const unreadCount = notifications.filter(n => n.unread).length;

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
        setStoresList([]);
        setStoreData(null);
        setActiveStoreId(null);
        localStorage.removeItem('nexlyra_active_store_id');
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

  // Real-time notifications: subscribe to new orders for active store
  useEffect(() => {
    if (!activeStoreId) return;
    let isMounted = true;

    // Load recent orders as notifications on mount
    supabase
      .from('orders')
      .select('id, customer_name, status, created_at')
      .eq('store_id', activeStoreId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!isMounted || !data) return;
        const now = Date.now();
        setNotifications(data.map(o => {
          const diff = now - new Date(o.created_at).getTime();
          const mins = Math.floor(diff / 60000);
          const hours = Math.floor(diff / 3600000);
          const days = Math.floor(diff / 86400000);
          const timeStr = days > 0 ? `há ${days}d` : hours > 0 ? `há ${hours}h` : mins > 0 ? `há ${mins}min` : 'agora';
          return {
            id: o.id,
            title: `🛒 Pedido de ${o.customer_name || 'Cliente'} — ${o.status || 'Pendente'}`,
            time: timeStr,
            unread: o.status === 'Pendente'
          };
        }));
      });

    const channel = supabase
      .channel(`notifications-${activeStoreId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `store_id=eq.${activeStoreId}`
      }, (payload) => {
        if (!isMounted) return;
        const o = payload.new as any;
        setNotifications(prev => [{
          id: o.id,
          title: `🛒 Novo pedido de ${o.customer_name || 'Cliente'}!`,
          time: 'agora',
          unread: true
        }, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [activeStoreId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
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
        localStorage.setItem('nexlyra_active_store_id', defaultStoreId);
        setStoreData(data[0]);
        if (data[0].custom_domain) setCustomDomain(data[0].custom_domain);
      }
    } else {
      setStoresList([]);
      setStoreData(null);
      setActiveStoreId(null);
      localStorage.removeItem('nexlyra_active_store_id');
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
    return <StorefrontView slug={storeSlug} isCatalog={isCatalog} hasCheckout={getPlanConfig(userProfile?.plan)?.hasCheckout ?? true} />;
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
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">
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
        "fixed inset-y-0 left-0 bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-300 lg:static lg:translate-x-0 w-72",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        <div className="px-6 pt-6 pb-4 flex items-center gap-3 relative z-10">
          <img src="/icon_transparent.png" alt="N" className="h-10 w-auto object-contain drop-shadow-md scale-[2.0] ml-3" />
          <span className="text-[22px] font-black tracking-tighter bg-gradient-to-r from-cyan-500 via-blue-600 to-fuchsia-500 bg-clip-text text-transparent leading-none">NEXLYRA</span>
        </div>

        <div className="px-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3 border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#5551FF] flex items-center justify-center overflow-hidden shadow-md shrink-0">
              {storeData?.logo_url
                ? <img src={storeData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                : <img src="/icon_transparent.png" alt="Nexlyra" className="w-8 h-8 object-contain brightness-0 invert" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-gray-900 truncate">{storeData?.name || 'Minha Loja'}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">LOJA ATIVA</p>
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
                  <SidebarItem
                    icon={ShoppingBag}
                    label="Pedidos"
                    active={currentView === 'pedidos'}
                    badge={pendingOrdersCount}
                    onClick={() => { setCurrentView('pedidos'); setIsSidebarOpen(false); }}
                  />
                  <SidebarItem icon={Wallet} label="Pagamentos" active={currentView === 'pagamentos'} onClick={() => { setCurrentView('pagamentos'); setIsSidebarOpen(false); }} />
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

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all group mb-4"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} />
              <span className="text-sm font-bold">Sair da conta</span>
            </div>
            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100" />
          </button>

          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center p-1.5">
              <img src="/icon_transparent.png" className="w-full h-full object-contain" alt="" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">PLANO ATIVO</p>
              <p className="text-xs font-bold text-gray-900 leading-none">NEXLYRA {(userProfile?.plan || 'FREE').toUpperCase()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#F9FAFB] overflow-hidden min-w-0">
        {/* Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 shrink-0 z-40">
          {/* Mobile menu + Store name */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest truncate hidden sm:block">
              {storeData?.name || session?.user?.email?.split('@')[0] || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Ver loja button */}
            {storeData?.slug && (
              <button
                onClick={() => {
                  if (storeData?.custom_domain) {
                    window.open(`https://${storeData.custom_domain}`, '_blank');
                  } else if (storeData?.slug) {
                    window.open(`/loja/${storeData.slug}`, '_blank');
                  }
                }}
                className="hidden sm:flex px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm font-bold text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 transition-all items-center gap-2"
              >
                <ExternalLink size={15} />
                Ver loja
              </button>
            )}

            {/* Bell / Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications(prev => !prev);
                  setShowProfileMenu(false);
                }}
                className="relative w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-black text-gray-900">Notificações</p>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                          className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700"
                        >
                          Marcar todas como lidas
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <Bell size={24} className="text-gray-200 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">Nenhuma notificação ainda</p>
                        </div>
                      ) : notifications.map(n => (
                        <button
                          key={n.id}
                          onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}
                          className={cn(
                            "w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0",
                            n.unread ? "bg-indigo-50/50" : ""
                          )}
                        >
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-1.5 shrink-0",
                            n.unread ? "bg-indigo-500" : "bg-gray-200"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 leading-snug">{n.title}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Button */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => {
                  setShowProfileMenu(prev => !prev);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 pr-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#5551FF] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {(session?.user?.email?.[0] || 'U').toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-gray-900 leading-none">
                    {session?.user?.email?.split('@')[0] || 'Usuário'}
                  </p>
                  <p className="text-[9px] text-gray-400 leading-none mt-0.5 truncate max-w-[120px]">
                    {session?.user?.email || ''}
                  </p>
                </div>
                <ChevronDown size={12} className="text-gray-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="px-4 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#5551FF] flex items-center justify-center text-white font-bold shadow-sm">
                          {(session?.user?.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-gray-900 truncate">
                            {session?.user?.email?.split('@')[0] || 'Usuário'}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">{session?.user?.email || ''}</p>
                          <span className={cn(
                            "inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                            userProfile?.plan === 'free' ? "bg-gray-100 text-gray-500" :
                              userProfile?.plan === 'pro' ? "bg-indigo-50 text-indigo-600" :
                                "bg-emerald-50 text-emerald-600"
                          )}>
                            {userProfile?.plan?.toUpperCase() || 'FREE'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => { setCurrentView('plano'); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <CreditCard size={14} className="text-gray-400" />
                        Meu Plano
                      </button>
                      <button
                        onClick={() => {
                          supabase.auth.signOut();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} />
                        Sair da conta
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable View */}
        <div className="flex-1 overflow-y-auto bg-[#F9FAFB] relative z-10">
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
                      localStorage.setItem('nexlyra_active_store_id', id);
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
                {currentView === 'pedidos' && <OrdersView session={session} storeId={activeStoreId} onAction={notify} />}
                {currentView === 'pagamentos' && <PaymentSettingsView session={session} storeId={activeStoreId} onAction={notify} />}
                {currentView === 'produtos' && <ProductsView onAction={notify} session={session} storeId={activeStoreId} userProfile={userProfile} />}
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
                            {customDomain || (storeData?.slug ? `${storeData.slug}.nexlyra.app` : 'suaLoja.nexlyra.app')}
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
