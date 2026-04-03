import React, { useState, useEffect, cloneElement } from 'react';
import {
  ShoppingCart, Search, MessageCircle, ExternalLink, Package,
  ChevronRight, ChevronLeft, Store, Plus, Mail, Phone, MapPin, Instagram,
  Facebook, Youtube, Send, Lock, ShieldCheck, CreditCard,
  CheckCircle2, Globe, Bookmark, TrendingUp, HelpCircle,
  User, Truck, CreditCard as CardIcon, Twitter, Send as Telegram,
  MessageSquare, Disc, Check, AreaChart, X, ChevronDown, Upload, Trash2, Menu,
  Share2, Heart, Star, ShoppingBag, Minus, Info, LogOut, Zap,
  Eye, EyeOff,
  Smartphone, Laptop, Watch, Headphones, Gamepad2, Camera, Tv, Speaker, Shirt, Baby, Activity, Home, Car, Wrench, Grape, Coffee, Gift
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
  Smartphone, Laptop, Watch, Headphones, Gamepad2, Camera, Tv, Speaker, Shirt, Baby, Activity, Home, Car, Wrench, Heart, Grape, Coffee, Zap, Star, Gift, ShoppingBag, Package
};
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getProductRating } from '../lib/reviews';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const StorefrontView = ({ slug, isCatalog = false, hasCheckout = true }: { slug: string, isCatalog?: boolean, hasCheckout?: boolean }) => {
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [openFooterItem, setOpenFooterItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [activeProductTab, setActiveProductTab] = useState<'todos' | 'mais_vendidos'>('todos');
  const categoriesScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 300;
      categoriesScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showInstallments, setShowInstallments] = useState(false);
  const [selectedInstallments, setSelectedInstallments] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');

  // --- Address + Shipping State ---
  const [checkoutAddress, setCheckoutAddress] = useState({
    fullName: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerSession, setCustomerSession] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showOrders, setShowOrders] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [showDescrição, setShowDescrição] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'shipping' | 'pickup'>('shipping');
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 11, seconds: 45 });
  const [activeDashboardTab, setActiveDashboardTab] = useState<'profile' | 'orders' | 'favorites'>('profile');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showOnlyPromos, setShowOnlyPromos] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isHeroAutoPlaying, setIsHeroAutoPlaying] = useState(true);
  const [showLightbox, setShowLightbox] = useState(false);
  const [zoomState, setZoomState] = useState({ x: 0, y: 0, active: false });
  const [profileState, setProfileState] = useState({
    name: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    city: '',
    state: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [catalogProductDetails, setCatalogProductDetails] = useState<any>(null);
  const [catalogImageIndex, setCatalogImageIndex] = useState(0);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [mpInitialized, setMpInitialized] = useState(false);
  const [mpIntegration, setMpIntegration] = useState<{ public_key?: string } | null>(null);
  const [brickLoading, setBrickLoading] = useState(false);
  const [brickError, setBrickError] = useState(false);
  const [mpInitPoint, setMpInitPoint] = useState<string | null>(null);
  const [brickId] = useState(() => `mp-brick-${Math.random().toString(36).substr(2, 9)}`);
  const [showBrickFallback, setShowBrickFallback] = useState(false);
  // Cart checkout customer info
  const [cartCustomerName, setCartCustomerName] = useState('');
  const [cartCustomerPhone, setCartCustomerPhone] = useState('');
  const [cartDeliveryAddress, setCartDeliveryAddress] = useState('');
  const [cartNeighborhood, setCartNeighborhood] = useState('');
  const [cartShippingZone, setCartShippingZone] = useState<{ label: string; price: number } | null>(null);
  const [cartCheckoutStep, setCartCheckoutStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [cartPaymentMethod, setCartPaymentMethod] = useState<'pix' | 'card' | 'whatsapp'>('pix');
  const [cartOrderId, setCartOrderId] = useState<string>('');
  const [cartBrickId] = useState(() => `cart-mp-brick-${Math.random().toString(36).substr(2, 9)}`);
  const [cartBrickLoading, setCartBrickLoading] = useState(false);
  const [cartCep, setCartCep] = useState('');

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCustomerSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCustomerSession(session);
      
      // Auto-open dashboard after Google OAuth or regular login
      if (event === 'SIGNED_IN' && session) {
        setShowOrders(true);
        setIsAuthModalOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);



  useEffect(() => {
    if (selectedProduct || isCartOpen || isAuthModalOpen || showLightbox) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedProduct, isCartOpen, isAuthModalOpen, showLightbox]);

  // Load Mercado Pago SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => setMpInitialized(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch MP Integration for Public Key
  useEffect(() => {
    if (store?.id) {
      const fetchMPIntegration = async () => {
        const { data } = await supabase
          .from('payment_integrations')
          .select('public_key, mp_user_id')
          .eq('store_id', store.id)
          .eq('provider', 'mercadopago')
          .single();
        if (data) setMpIntegration(data);
      };
      fetchMPIntegration();
    }
  }, [store?.id]);

  // Initialize Wallet Brick
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let fallbackTimer: NodeJS.Timeout;
    let isMounted = true;

    if (mpInitialized && preferenceId && (window as any).MercadoPago) {
      setBrickLoading(true);
      setBrickError(false);

      const publicKey = mpIntegration?.public_key || 'APP_USR-7699b49febcf37bfddfa6e11f77991a8';
      const mp = new (window as any).MercadoPago(publicKey, {
        locale: 'pt-BR'
      });
      const bricksBuilder = mp.bricks();

      // Fallback timer: if brick doesn't load in 6 seconds, show error/fallback
      fallbackTimer = setTimeout(() => {
        if (isMounted && brickLoading) {
          console.log('[MP Brick] Timeout reached, showing fallback');
          setBrickLoading(false);
          setBrickError(true);
        }
      }, 6000);

      const renderWalletBrick = async (bricksBuilder: any) => {
        try {
          console.log('[MP Brick] Initializing with preference:', preferenceId);
          const settings = {
            initialization: {
              preferenceId: preferenceId,
              redirectMode: 'modal'
            },
            customization: {
              texts: {
                valueProp: 'smart_option',
              },
            },
            callbacks: {
              onReady: () => {
                console.log('[MP Brick] Ready');
                if (isMounted) {
                  setBrickLoading(false);
                  clearTimeout(fallbackTimer);
                }
              },
              onError: (error: any) => {
                console.error('[MP Brick] Error:', error);
                if (isMounted) {
                  setBrickLoading(false);
                  setBrickError(true);
                  clearTimeout(fallbackTimer);
                }
              },
            }
          };
          await bricksBuilder.create(
            'wallet',
            brickId,
            settings
          );
          console.log('[MP Brick] Successfully rendered in:', brickId);
        } catch (e) {
          console.error('[MP Brick] Create failed:', e);
          if (isMounted) {
            setBrickLoading(false);
            setBrickError(true);
          }
        }
      };

      const tryRender = () => {
        if (!isMounted) return;
        const container = document.getElementById(brickId);
        if (container) {
          console.log('[MP Brick] Container found:', brickId);
          renderWalletBrick(bricksBuilder);
        } else {
          console.log('[MP Brick] Container NOT found:', brickId, 'retrying...');
          timeoutId = setTimeout(tryRender, 100);
        }
      };

      tryRender();
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [mpInitialized, preferenceId]);

  useEffect(() => {
    if (customerSession?.user) {
      const meta = customerSession.user.user_metadata || {};
      setProfileState({
        name: meta.full_name || meta.name || '',
        phone: meta.phone || '',
        cep: meta.cep || '',
        address: meta.address || '',
        number: meta.number || '',
        city: meta.city || '',
        state: meta.state || ''
      });
      if (meta.favorites) {
        setFavorites(meta.favorites);
      }
    }
  }, [customerSession]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 1, minutes: 11, seconds: 45 }; // Reset timer
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isHeroAutoPlaying || !store || products.length === 0) return;

    const featuredId = store.featured_product_id;
    const prod = featuredId ? products.find(p => p.id === featuredId) : products[0];
    if (!prod?.image_url) return;

    const images = prod.image_url.split(',');
    if (images.length <= 1) {
      setIsHeroAutoPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      setHeroImageIndex(prev => {
        if (prev >= images.length - 1) {
          setIsHeroAutoPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isHeroAutoPlaying, store, products]);

  useEffect(() => {
    if (!isHeroAutoPlaying || store?.template !== 'Futuristic' || products.length === 0) return;
    
    const interval = setInterval(() => {
      const heroItems = bestSellers.length > 0 ? bestSellers.slice(0, 5) : products.slice(0, 5);
      if (heroItems.length > 1) {
        setCurrentHeroIndex(prev => (prev + 1) % heroItems.length);
        setHeroImageIndex(0);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isHeroAutoPlaying, store?.template, products.length, bestSellers.length]);

  useEffect(() => {
    if (customerSession?.user?.id && store?.id) {
      fetchCustomerOrders();
    }
  }, [customerSession, store?.id]);

  const fetchCustomerOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerSession.user.id)
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching customer orders:', error);
        return;
      }
      if (data) setCustomerOrders(data);
    } catch (err) {
      console.error('Unexpected error fetching customer orders:', err);
    }
  };

  const [expandedTrackingOrderId, setExpandedTrackingOrderId] = useState<string | null>(null);
  const [orderTrackingLogs, setOrderTrackingLogs] = useState<Record<string, any[]>>({});

  const fetchOrderTracking = async (orderId: string) => {
    const { data } = await supabase
      .from('order_tracking')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (data) setOrderTrackingLogs(prev => ({ ...prev, [orderId]: data }));
  };

  const handleExpandTracking = (orderId: string) => {
    if (expandedTrackingOrderId === orderId) {
      setExpandedTrackingOrderId(null);
    } else {
      setExpandedTrackingOrderId(orderId);
      fetchOrderTracking(orderId);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) throw error;
        showNotification('Confirme seu e-mail para ativar sua conta.', 'info');
        setAuthMode('login');
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao entrar com Google');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!authEmail) {
      setAuthError('Informe seu e-mail para recuperar a senha.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      showNotification('Link de recuperação enviado!', 'info');
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao enviar link de recuperação');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        showNotification('CEP não encontrado', 'error');
        return;
      }

      setProfileState(prev => ({
        ...prev,
        cep: cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2'),
        address: data.logradouro || prev.address,
        city: data.localidade || prev.city,
        state: data.uf || prev.state
      }));
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
    }
  };

  const handleCheckoutCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setCheckoutAddress(prev => ({ ...prev, cep }));
    if (cleanCep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setCheckoutAddress(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
          cep: cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2')
        }));
        // Calculate shipping options after CEP is found
        calculateShipping(cleanCep);
      } else {
        showNotification('CEP não encontrado', 'error');
      }
    } catch (e) {
      console.error('Erro ao buscar CEP:', e);
    } finally {
      setCepLoading(false);
    }
  };

  const handleCartCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setCartCep(cep);
    if (cleanCep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setCartDeliveryAddress(data.logradouro || '');
        setCartNeighborhood(data.bairro || '');
        setCartCep(cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2'));
        // Calculate shipping options after CEP is found
        calculateShipping(cleanCep);
      } else {
        showNotification('CEP não encontrado', 'error');
      }
    } catch (e) {
      console.error('Erro ao buscar CEP:', e);
    } finally {
      setCepLoading(false);
    }
  };

  const calculateShipping = async (cep: string) => {
    setShippingLoading(true);
    setShippingOptions([]);
    setSelectedShipping(null);
    try {
      const productsPayload = cart.length > 0 ? cart : (selectedProduct ? [selectedProduct] : []);
      const { data, error } = await supabase.functions.invoke('calculate-shipping', {
        body: { cep_destino: cep, products: productsPayload, from_cep: store?.origin_cep || undefined, store_id: store?.id }
      });

      if (error) throw error;

      const options = data?.options || [];
      const formattedOptions = options.map((opt: any) => ({
        id: opt.id,
        name: opt.name,
        price: opt.price,
        days: `${opt.days} dias úteis`,
        icon: opt.company?.toLowerCase().includes('correios') ? '📦' : '🚚'
      }));

      // Sort by price (cheapest first)
      formattedOptions.sort((a: any, b: any) => a.price - b.price);

      setShippingOptions(formattedOptions);
      if (formattedOptions.length > 0) {
        setSelectedShipping(formattedOptions[0]); // auto-select cheapest
      }
    } catch (err: any) {
      console.error("Erro ao calcular frete:", err);
      showNotification('Não foi possível calcular o frete para este CEP. O serviço pode estar indisponível.', 'error');
    } finally {
      setShippingLoading(false);
    }
  };

  const updateProfile = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileState.name,
          phone: profileState.phone,
          cep: profileState.cep,
          address: profileState.address,
          number: profileState.number,
          city: profileState.city,
          state: profileState.state
        }
      });
      if (error) throw error;
      setIsEditingProfile(false);
      showNotification('Perfil atualizado com sucesso!', 'success');
    } catch (err: any) {
      showNotification('Erro ao atualizar perfil: ' + err.message, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const addToCart = (product: any, variation: any) => {
    if (!hasCheckout) {
      // If plan doesn't have checkout, redirect to WhatsApp
      const phone = store?.phone || '';
      let msg = `Olá! Tenho interesse no produto: *${product.name}*`;
      if (variation) msg += ` (${variation.name}: ${variation.value})`;
      msg += `\nPreço: R$ ${(variation?.price || product.price).toFixed(2).replace('.', ',')}`;
      msg += `\n\nLink: ${window.location.origin}/loja/${slug}`;
      const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
      window.open(whatsappUrl, '_blank');
      return;
    }

    const cartItemId = variation ? `${product.id}-${variation.id}` : product.id;
    const existingItem = cart.find(item => item.cartItemId === cartItemId);

    if (existingItem) {
      setCart(cart.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        ...product,
        selectedVariation: variation,
        cartItemId,
        quantity: 1,
        price: variation?.price || product.price,
        compare_at_price: variation?.compare_at_price || product.compare_at_price
      }]);
    }
    setIsCartOpen(true);
  };

  const handleShareProduct = async (product: any) => {
    // Correct URL for sharing - using the storefront URL structure
    const url = `${window.location.origin}/loja/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      showNotification('Link da loja copiado!', 'success');
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const toggleFavorite = (product: any) => {
    if (!customerSession) {
      setIsAuthModalOpen(true);
      return;
    }

    setFavorites(prev => {
      const isFav = prev.find(p => p.id === product.id);
      const newFavorites = isFav
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product];

      // Persist to Supabase
      supabase.auth.updateUser({
        data: { favorites: newFavorites }
      });

      return newFavorites;
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const cartPixTotal = cart.reduce((acc, item) => {
    const discount = Number(item.pix_discount_percent || 0) / 100;
    return acc + (Number(item.price) * item.quantity * (1 - discount));
  }, 0);

  const footerContent: Record<string, string> = {
    "Sobre Nós": `Bem-vindo à ${store?.name || 'nossa loja'}. Somos especialistas em oferecer os melhores produtos com qualidade garantida e atendimento humanizado. Nossa missão é facilitar sua jornada de compra com segurança e agilidade.`,
    "Segurança": "Sua segurança é nossa prioridade. Utilizamos criptografia SSL de ponta a ponta e parceiros de pagamento certificados para garantir que seus dados nunca sejam compartilhados ou acessados por terceiros.",
    "Termos de Uso": "Ao utilizar nossa loja, você concorda com nossas diretrizes de navegação, prezando pela ética e bom uso das ferramentas. Reservamo-nos o direito de atualizar preços e estoques conforme a disponibilidade.",
    "Privacidade": "Respeitamos sua privacidade. Seus dados cadastrais são utilizados exclusivamente para o processamento de pedidos e melhoria da sua experiência de compra, seguindo rigorosamente a LGPD.",
    "Como Comprar": "Para comprar, basta escolher seus produtos, adicionar ao carrinho e clicar em 'Finalizar'. Você será direcionado para o checkout onde poderá escolher a melhor forma de pagamento e entrega.",
    "Prazos e Entregas": "Nossos prazos variam de acordo com sua região. Após a confirmação do pagamento, seu pedido é processado em até 24h úteis e o código de rastreamento enviado via e-mail.",
    "Formas de Pagamento": "Aceitamos PIX com aprovação imediata e Cartões de Crédito (Visa, Master, Elo, etc.) com parcelamento em até 12x, processados com segurança.",
    "Perguntas Frequentes": "Dúvidas sobre rastreio? Acesse 'Meus Pedidos'. Problemas com o pagamento? Fale conosco via WhatsApp. Trocas? Consulte nossa política de devolução.",
    "Minha Conta": "Na sua conta você pode gerenciar seus endereços, verificar o status dos seus pedidos e baixar notas fiscais. Acesse com seu e-mail de cadastro.",
    "Meus Pedidos": "Acompanhe cada etapa do seu pedido em tempo real. Desde a separação no estoque até a entrega na sua porta. O código de rastreio fica disponível logo após o envio.",
    "Central de Atendimento": "Nosso time está pronto para ajudar. Atendimento via WhatsApp, E-mail ou formulário de contato de segunda a sexta, das 08h30 às 18h00.",
    "Fale Conosco": "Precisa de algo urgente? O botão de WhatsApp no canto inferior direito é o caminho mais rápido. Se preferir, use o formulário de contato acima."
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let storeData;
        if (isCatalog) {
          const { data, error } = await supabase
            .from('catalogs')
            .select('*')
            .eq('slug', slug)
            .single();

          if (error || !data) throw new Error('Catálogo não encontrado');

          storeData = { ...data, name: data.title };

          const { data: prods } = await supabase
            .from('catalog_products')
            .select('id, catalog_id, name, description, price, compare_at_price, image_url, is_active, created_at, updated_at, estoque')
            .eq('catalog_id', data.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          setProducts(prods || []);
          setCategorias([]);
        } else {
          const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('slug', slug)
            .single();

          if (error || !data) throw new Error('Loja não encontrada');

          storeData = data;

          const { data: cats } = await supabase.from('categories').select('*').eq('store_id', storeData.id).order('name');
          setCategorias(cats || []);

          const { data: prods } = await supabase
            .from('products')
            .select(`
              id, store_id, name, description, price, compare_at_price, estoque, image_url, is_active, created_at, updated_at, sku, category_id, extra_info, warranty, pix_discount_percent, weight, width, height, length, has_shipping_data,
              categories (name),
              product_variations (id, name, value, price, estoque, sku, image_url, created_at)
            `)
            .eq('store_id', storeData.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          setProducts(prods || []);
        }
        setStore(storeData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomState({ x, y, active: true });
  };

  const renderLightbox = () => {
    if (!showLightbox || !selectedProduct) return null;
    const images = selectedProduct.image_url?.split(',') || [];
    const currentImage = images[activeImageIndex];

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLightbox(false)}
            className="absolute inset-0 bg-black/95 backdrop-blur-sm shadow-2xl"
          />

          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-6 right-6 p-4 text-white/50 hover:text-white transition-all hover:rotate-90 z-[210] cursor-pointer"
          >
            <X size={32} />
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-50 max-w-5xl w-full h-full flex flex-col items-center justify-center p-8"
          >

            <div className="w-full h-full flex items-center justify-center overflow-hidden touch-none select-none relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={currentImage}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={(_e, { offset, velocity }) => {
                    const swipe = offset.x;
                    const threshold = 70;
                    if (swipe < -threshold || (swipe < -20 && velocity.x < -100)) {
                      setActiveImageIndex((activeImageIndex + 1) % images.length);
                    } else if (swipe > threshold || (swipe > 20 && velocity.x > 100)) {
                      setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length);
                    }
                  }}
                  className="max-w-full max-h-full object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] cursor-grab active:cursor-grabbing relative z-10"
                  alt={selectedProduct.name}
                  draggable={false}
                />
              </AnimatePresence>

              {/* Navigation arrows for desktop hints */}
              {images.length > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/50">
                    <ChevronLeft size={24} />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/50">
                    <ChevronRight size={24} />
                  </div>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-12 flex gap-2">
                {images.map((_url: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      i === activeImageIndex ? "bg-white w-6" : "bg-white/30 hover:bg-white/50"
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  // Fetch best sellers based on order_items counts
  useEffect(() => {
    if (!store?.id || products.length === 0) return;
    const fetchBestSellers = async () => {
      try {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .in('product_id', products.map((p: any) => p.id));

        if (!orderItems || orderItems.length === 0) {
          // Fallback: use first 8 products sorted by created_at
          setBestSellers(products.slice(0, 8));
          return;
        }

        // Aggregate quantities per product
        const counts: Record<string, number> = {};
        orderItems.forEach((item: any) => {
          counts[item.product_id] = (counts[item.product_id] || 0) + (item.quantity || 1);
        });

        // Sort products by sales count descending
        const sorted = [...products].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
        setBestSellers(sorted.slice(0, 8));
      } catch (err) {
        setBestSellers(products.slice(0, 8));
      }
    };
    fetchBestSellers();
  }, [store?.id, products]);


  const appearance = store?.appearance_settings || {};
  const themeColor = store?.theme_color || '#5551FF';
  const secondaryColor = appearance.secondaryColor || '#4f46e5';
  const fontFamily = appearance.fontFamily || 'Inter';
  const buttonStyle = appearance.buttonStyle || 'rounded';
  const backgroundType = appearance.backgroundType || 'solid';
  const template = store?.template || 'Modern Shop';
  const isMegaStore = template.includes('Mega Store');
  const megaVariant = template.split('Mega Store ')[1] || 'Blue';
  const checkoutStyle = appearance.checkoutStyle || 'default';

  // --- Styling Helpers ---
  const getButtonStyle = (customClass?: string) => {
    const base = "transition-all duration-300 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs";
    const styles: Record<string, string> = {
      rounded: "rounded-xl",
      squared: "rounded-none",
      pill: "rounded-full",
      glass: "rounded-xl backdrop-blur-md bg-white/10 border border-white/20"
    };
    return cn(base, styles[buttonStyle] || styles.rounded, customClass);
  };

  const getBackgroundStyles = () => {
    if (template === 'Luxury Dark') return "bg-[#050505] text-white";
    if (template === 'Tech Glow' || template === 'Cyberpunk Neon' || template === 'Futuristic') return "bg-[#020617] text-white";
    if (template === 'Eco Soft' || template === 'Zen Space') return "bg-[#fdfbf7] text-gray-900";
    if (template === 'Vintage Retro') return "bg-[#F3E5AB] text-[#3e2723]";

    const backgrounds: Record<string, string> = {
      solid: "bg-white",
      gradient: `bg-gradient-to-br from-white via-indigo-50/30 to-white`,
      mesh: "bg-white relative overflow-hidden",
      glass: "bg-gray-50/50 backdrop-blur-sm"
    };
    return backgrounds[backgroundType] || backgrounds.solid;
  };

  const getFontFamily = () => {
    const fonts: Record<string, string> = {
      'Inter': "'Inter', sans-serif",
      'Montserrat': "'Montserrat', sans-serif",
      'Playfair Display': "'Playfair Display', serif",
      'Roboto': "'Roboto', sans-serif",
      'Outfit': "'Outfit', sans-serif"
    };
    return fonts[fontFamily] || fonts.Inter;
  };

  const handleNavClick = (section: string) => {
    if (section === 'Início' || section === 'Loja') {
      setSearchQuery('');
      setActiveCategory(null);
      setShowOnlyPromos(false);
      setActiveProductTab('todos');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'Categorias' || section === 'NAVEGAR CATEGORIAS') {
      setShowOnlyPromos(!showOnlyPromos);
      if (!showOnlyPromos) {
        document.getElementById('mega-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (section === 'Produtos') {
      setSearchQuery('');
      setActiveCategory(null);
      setShowOnlyPromos(false);
      document.getElementById('mega-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (section === 'Contato') {
      document.getElementById('mega-footer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  const renderMegaHeader = () => {
    const isBlue = megaVariant === 'Blue';
    const topBarBg = isBlue ? 'bg-[#1868D5]' : 'bg-[var(--theme-primary)]';
    const headerBg = 'bg-white';
    const bottomNavBg = 'bg-white';

    return (
      <header className="w-full font-sans shadow-sm z-50 relative">
        {/* Top Bar */}
        <div className={cn("py-2 text-[11px] text-white flex justify-between items-center", topBarBg)}>
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center w-full">
            <div className="opacity-90"></div>
            <div className="flex items-center gap-6 opacity-90 hidden md:flex">
              <span 
                className="cursor-pointer hover:opacity-100"
                onClick={() => {
                  if (customerSession) {
                    setActiveDashboardTab('orders');
                    setShowOrders(true);
                  } else {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }
                }}
              >
                Rastrear Pedido
              </span>
              <a
                href={store.whatsapp ? `https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=Olá! Preciso de ajuda.` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer hover:opacity-100 flex items-center gap-1"
              >
                Central de Ajuda
              </a>
              
              <div className="flex items-center gap-1 cursor-pointer hover:opacity-100">
                <img src="https://flagcdn.com/w20/br.png" className="w-4 h-3 object-cover rounded-sm" />
                <span>Português</span>
                <ChevronDown size={12} />
              </div>

              <div className="flex items-center gap-1 cursor-pointer hover:opacity-100">
                <span>R$ BRL</span>
                <ChevronDown size={12} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className={cn("py-3 md:py-6 border-b border-gray-100", headerBg)}>
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 md:gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => { setActiveCategory(null); setSearchQuery(''); }}>
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-8 md:h-10 object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className={cn("h-7 w-7 md:h-8 md:w-8 rounded bg-[var(--theme-primary)] flex items-center justify-center text-white font-black text-lg md:text-xl shadow-md", isBlue && "bg-[#1868D5]")}>
                    <Package size={20} />
                  </div>
                  <span className="text-xl md:text-2xl font-black tracking-tight text-[#1a1a1a]">{store.name}</span>
                </div>
              )}
            </div>

            {/* Middle Search Bar */}
            <div className="w-full md:flex-1 order-last md:order-none max-w-3xl flex relative items-center border-2 border-slate-200 rounded-lg overflow-hidden h-[40px] md:h-[46px] group hover:border-[var(--theme-primary)] focus-within:border-[var(--theme-primary)] transition-colors" style={!isBlue ? { '--tw-ring-color': themeColor } as any : {}}>
              <div className="relative h-full flex items-center bg-gray-50 border-r border-gray-200 min-w-[150px] group-hover:bg-gray-100 transition-colors">
                <select
                  value={activeCategory || ''}
                  onChange={(e) => setActiveCategory(e.target.value || null)}
                  className="w-full h-full appearance-none bg-transparent pl-4 pr-10 text-xs font-bold text-gray-700 outline-none cursor-pointer"
                >
                  <option value="">Todas as Categorias</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 text-gray-400 pointer-events-none" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produto aqui..."
                className="flex-1 h-full px-4 outline-none text-sm text-gray-700 placeholder:text-gray-400"
              />
              <button className={cn("h-full px-6 flex items-center justify-center transition-colors text-white", isBlue ? "bg-[#1868D5] hover:bg-blue-700" : "bg-[var(--theme-primary)] hover:brightness-90")}>
                <Search size={18} />
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-8 shrink-0">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {
                if (customerSession) {
                  setActiveDashboardTab('profile');
                  setShowOrders(true);
                } else {
                  setIsAuthModalOpen(true);
                }
              }}>
                <User size={26} className="text-gray-700 group-hover:text-[var(--theme-primary)] transition-colors" />
                <div className="hidden lg:flex flex-col leading-tight">
                  <span className="text-gray-500 text-[10px] font-bold">Minha Conta</span>
                  <span className="text-gray-900 text-xs font-black">{customerSession ? 'Meu Perfil' : 'Entrar'}</span>
                </div>
              </div>

              <div
                className="relative cursor-pointer group hover:text-[var(--theme-primary)] transition-colors hidden md:block"
                onClick={() => { setActiveDashboardTab('favorites'); setShowOrders(true); }}
              >
                <Heart size={26} className={favorites.length > 0 ? "text-[var(--theme-primary)] fill-current" : "text-gray-700"} />
                {favorites.length > 0 && (
                  <span className={cn("absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center", isBlue ? "bg-[#1868D5]" : "bg-[var(--theme-primary)]")}>
                    {favorites.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsCartOpen(true)}>
                <div className="relative">
                  <ShoppingCart size={26} className="text-gray-700 group-hover:text-[var(--theme-primary)] transition-colors" />
                  <span className={cn("absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center", isBlue ? "bg-[#1868D5]" : "bg-[var(--theme-primary)]")}>
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                </div>
                <div className="hidden lg:flex flex-col leading-tight">
                  <span className="text-gray-500 text-[10px] font-bold">Meu Carrinho</span>
                  <span className="text-gray-900 text-xs font-black">{(cartTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Nav Bar */}
        <div className={cn("border-b border-gray-100 hidden md:block", bottomNavBg)}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-[52px]">
            <div className="flex items-center gap-8 h-full">
              {/* Categorias Menu Button */}
              <button onClick={() => handleNavClick("Categorias")} className="flex items-center gap-2 font-bold text-sm text-gray-800 hover:text-[var(--theme-primary)] transition-colors h-full border-b-[3px] border-[var(--theme-primary)]">
                <Menu size={18} />
                NAVEGAR CATEGORIAS
              </button>

              {/* Nav Links */}
              <nav className="flex items-center gap-6 h-full">
                {['Início', 'Loja', 'Categorias', 'Produtos', 'Contato'].map((item, i) => (
                  <button key={item} onClick={() => handleNavClick(item)} className={cn("text-sm font-bold text-gray-700 hover:text-[var(--theme-primary)] transition-colors flex items-center gap-1", (item === 'Categorias' && showOnlyPromos) && "text-[var(--theme-primary)]")}>
                    {item}
                    {i !== 0 && <ChevronDown size={14} className="text-gray-400" />}
                    {(i === 2 || i === 3) && (
                      <span className={cn("ml-1 px-1.5 py-0.5 text-[8px] text-white rounded font-black uppercase", i === 2 ? "bg-emerald-500" : "bg-red-500")}>
                        {i === 2 ? "PROMO" : "NOVO"}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2 font-bold text-sm text-[var(--theme-primary)] hover:opacity-80 transition-opacity cursor-pointer">
              <Zap size={16} />
              Oferta do Dia
            </div>
          </div>
        </div>
      </header>
    );
  };

  const renderMegaHero = () => {
    const isBlue = megaVariant === 'Blue';
    const btnColor = isBlue ? 'bg-[#1868D5]' : 'bg-[var(--theme-primary)]';

    // Use Featured Product if available, fallback to top product if no banner available
    const fallbackProduct = store.featured_product_id
      ? (products.find(p => p.id === store.featured_product_id) || products[0] || {})
      : (products[0] || {});

    return (
      <div 
        className="pt-8 pb-12 relative overflow-hidden"
        style={megaVariant !== 'Blue' 
          ? { background: `linear-gradient(to bottom, ${themeColor} 0%, ${themeColor} 15%, #f8fafc 100%)` } as any 
          : { background: `linear-gradient(to bottom, #1868D5 0%, #1868D5 15%, #f8fafc 100%)` }
        }
      >
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-50/50 to-transparent -skew-x-12 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
          <div className="flex-1 w-full order-2 md:order-1 flex justify-center mt-8 md:mt-0 relative group">
            <AnimatePresence mode="wait">
              <motion.img
                key={heroImageIndex}
                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                transition={{ duration: 0.4, type: 'spring', damping: 20 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_e, info) => {
                  const threshold = 50;
                  const images = fallbackProduct.image_url?.split(',') || [];
                  if (info.offset.x < -threshold) {
                    setHeroImageIndex(prev => (prev + 1) % images.length);
                    setIsHeroAutoPlaying(false);
                  } else if (info.offset.x > threshold) {
                    setHeroImageIndex(prev => (prev - 1 + images.length) % images.length);
                    setIsHeroAutoPlaying(false);
                  }
                }}
                src={fallbackProduct.image_url?.split(',')[heroImageIndex]}
                className="max-w-[280px] md:max-w-sm lg:max-w-md object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] h-[220px] md:h-[350px] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-500"
                style={{ mixBlendMode: 'multiply' }}
              />
            </AnimatePresence>
            
            {/* Floating Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-4 -right-4 md:right-0 bg-white p-4 rounded-2xl shadow-2xl border border-gray-50 flex items-center gap-3 z-20 animate-bounce-slow"
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <ShieldCheck size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1 tracking-widest">Garantia</div>
                <div className="text-xs font-black text-gray-900 uppercase italic">100% Original</div>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 space-y-4 max-w-xl order-1 md:order-2 text-center md:text-left">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Oferta Exclusiva
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }} 
              className="text-4xl md:text-6xl lg:text-7xl font-black text-[#0f172a] leading-[0.9] tracking-tighter uppercase italic"
            >
              {store.name} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Mega</span> <br />
              Oferta
            </motion.h2>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-4 justify-center md:justify-start py-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">A partir de</span>
                <span className="text-2xl md:text-3xl text-gray-900 font-black tracking-tighter italic">
                  {(Number(fallbackProduct.price || 149.99)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="h-12 w-px bg-gray-100 hidden md:block" />
              <div className="hidden md:flex flex-col">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none mb-1">Pix Discount</span>
                <span className="text-xl font-black text-emerald-600">10% OFF</span>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 0.3 }}
              onClick={() => fallbackProduct.id && setSelectedProduct(fallbackProduct)}
              className={getButtonStyle(cn("w-full md:w-auto text-white font-black uppercase text-xs tracking-[0.2em] px-10 py-3.5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] transition-all", btnColor))}
            >
              COMPRAR AGORA
            </motion.button>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {fallbackProduct.image_url?.split(',').map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => {
                setHeroImageIndex(i);
                setIsHeroAutoPlaying(false); // Stop auto-play on manual click
              }}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                heroImageIndex === i
                  ? (isBlue ? "bg-[#1868D5] w-6" : "bg-[var(--theme-primary)] w-6")
                  : "bg-gray-300 hover:bg-gray-400"
              )}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderMegaCategorias = () => {
    return (
      <section id="mega-categories" className="py-10 bg-white border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-xl font-black text-gray-900 border-b-2 border-gray-100 pb-2 mb-8 inline-block pr-6 relative after:absolute after:bottom-[-2px] after:left-0 after:w-16 after:h-0.5 after:bg-[#1868D5]" style={megaVariant !== 'Blue' ? { '--tw-after-bg': themeColor } as any : {}}>
            Comprar por Categoria
          </h3>
          <div className="relative group">
            <button onClick={() => scrollCategories('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.1)] rounded-full flex items-center justify-center text-gray-600 hover:text-[#1868D5] hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:outline-none border border-gray-100" style={megaVariant !== 'Blue' ? { color: themeColor } as any : {}}>
              <ChevronDown size={24} className="rotate-90" />
            </button>
            <div ref={categoriesScrollRef} className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-6 items-start justify-start scroll-smooth w-full px-2">
              {categories.map((cat, i) => {
                const isActive = activeCategory === cat.id;
                const isHovered = hoveredCategory === cat.id;
                const isBlueTheme = megaVariant === 'Blue';
                const highlight = isActive || isHovered;
                return (
                  <div
                    key={cat.id || i}
                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                    onMouseEnter={() => setHoveredCategory(cat.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className="flex flex-col items-center gap-4 cursor-pointer group/cat shrink-0"
                  >
                    <div
                      className={cn(
                        "w-14 h-14 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center relative overflow-hidden transition-all duration-500",
                        highlight ? (isBlueTheme ? "bg-[#1868D5] text-white shadow-[0_20px_40px_-10px_rgba(24,104,213,0.4)] scale-110" : "bg-[var(--theme-primary)] text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] scale-110") : "bg-gray-50 text-gray-400 hover:bg-white hover:shadow-xl hover:scale-105 border border-transparent hover:border-gray-100"
                      )}
                      style={megaVariant !== 'Blue' && highlight ? { backgroundColor: themeColor } as any : {}}
                    >
                      {highlight && (
                        <motion.div layoutId="mega-cat-active" className="absolute inset-0 bg-white/10" />
                      )}
                      
                      <div className={cn("relative z-10 w-full h-full flex items-center justify-center p-4 transition-transform duration-500", highlight ? "scale-110 rotate-3" : "group-hover/cat:scale-110")}>
                        {cat.image_url ? (
                          <img src={cat.image_url} className="w-full h-full object-cover rounded-2xl" alt={cat.name} />
                        ) : (
                          React.createElement(CATEGORY_ICONS[cat.icon] || Package, {
                            size: 24,
                            className: "transition-colors duration-200"
                          })
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-[9px] md:text-xs font-black text-center uppercase tracking-widest transition-all duration-300",
                        highlight ? "text-gray-900" : "text-gray-400 group-hover/cat:text-gray-600"
                      )}
                    >
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => scrollCategories('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] rounded-full flex items-center justify-center text-gray-600 hover:text-[#1868D5] hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:outline-none" style={megaVariant !== 'Blue' ? { color: themeColor } as any : {}}>
              <ChevronDown size={20} className="-rotate-90" />
            </button>
          </div>
        </div>
      </section>
    );
  };

  const renderMegaPromoBanners = () => {
    const isBlue = megaVariant === 'Blue';
    const promos = [
      { prod: products[1] || products[0], bg: 'bg-[#ffebee]', linkColor: 'text-blue-600' },
      { prod: products[2] || products[0], bg: 'bg-[#e3f2fd]', linkColor: 'text-blue-600' },
      { prod: products[3] || products[0], bg: 'bg-[#ffebee]', linkColor: 'text-blue-600' }
    ];

    if (!promos[0]?.prod) return null;

    return (
      <section id="mega-promos" className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-xl font-black text-[#1a1a1a] border-b-2 border-gray-100 pb-2 mb-8 inline-block pr-6 relative after:absolute after:bottom-[-2px] after:left-0 after:w-16 after:h-0.5 after:bg-[#1868D5]" style={megaVariant !== 'Blue' ? { '--tw-after-bg': themeColor } as any : {}}>
            Produtos em Alta
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promos.map((p, i) => (
              <div key={i} className={cn("rounded-sm flex items-center p-6 cursor-pointer group relative overflow-hidden transition-shadow hover:shadow-lg", p.bg)} onClick={() => p.prod && setSelectedProduct(p.prod)}>
                <div className="flex-1 space-y-2 relative z-10 pr-4">
                  <h4 className="text-base font-black text-gray-900 leading-tight">{p.prod?.name || 'Oferta Especial'}</h4>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-gray-500 font-bold">A partir de</span>
                    <span className="text-red-500 font-black">{(Number(p.prod?.price || 59.99)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <button className={getButtonStyle(cn("flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-wider group-hover:underline", isBlue ? "text-[#1868D5] bg-transparent" : "text-[var(--theme-primary)] bg-transparent", "p-0! justify-start! shadow-none!"))} style={{ padding: 0, justifyContent: 'flex-start', boxShadow: 'none' }}>
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-white", isBlue ? "bg-[#1868D5]" : "bg-[var(--theme-primary)]")}>
                      <ChevronRight size={12} strokeWidth={3} />
                    </div>
                    Comprar Agora
                  </button>
                </div>
                {p.prod?.image_url && (
                  <div className="w-28 h-28 shrink-0 relative z-10 group-hover:scale-105 transition-transform">
                    <img src={p.prod.image_url?.split(',')[0]} className="w-full h-full object-contain mix-blend-multiply drop-shadow-md" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderMegaProductCard = (product: any) => {
    const finalPrice = product.price;
    const compareAt = product.compare_at_price;
    const hasDiscount = compareAt && compareAt > finalPrice;
    const discountPercent = hasDiscount ? Math.round((1 - finalPrice / compareAt) * 100) : 0;

    // Single Badge Logic: Priority - Esgotado > Últimas unidades > Desconto
    const renderSingleBadge = () => {
      if (product.estoque === 0) {
        return (
          <div className="bg-gray-900 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg w-fit backdrop-blur-md bg-opacity-90">
            Esgotado
          </div>
        );
      }
      if (product.estoque <= 5) {
        return (
          <div className="bg-orange-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg shadow-orange-200 w-fit animate-pulse">
            Últimas unidades
          </div>
        );
      }
      if (hasDiscount) {
        return (
          <div className="bg-red-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg shadow-red-200 w-fit">
            -{discountPercent}% OFF
          </div>
        );
      }
      return null;
    };

    return (
      <div key={product.id} className="bg-white border border-gray-100 rounded-2xl hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] transition-all duration-500 flex flex-col p-3 relative group cursor-pointer overflow-hidden" onClick={() => setSelectedProduct(product)}>
        {/* Badge Top Left */}
        <div className="absolute top-4 left-4 z-20">
          {renderSingleBadge()}
        </div>

        {/* Hover Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-20">
          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }} className="w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 transition-all">
            <Heart size={15} className={favorites.some(f => f.id === product.id) ? 'fill-current text-red-500' : ''} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); addToCart(product, null); }} className="w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-400 hover:text-[var(--theme-primary)] hover:scale-110 transition-all">
            <ShoppingCart size={15} />
          </button>
        </div>

        {/* Image - Forced 1:1 Aspect Ratio */}
        <div className="w-full aspect-square mb-3 relative rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
          <img 
            src={product.image_url?.split(',')[0]} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            alt={product.name} 
          />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 px-1">
          <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">
            {categories.find(c => c.id === product.category_id)?.name || 'Coleção'}
          </p>
          <h4 className="text-[13px] font-black text-gray-900 line-clamp-2 leading-tight min-h-[32px] mb-2">
            {product.name}
          </h4>

          <div className="flex items-center gap-1 mb-3">
            {(() => {
              const { rating, count } = getProductRating(product.id);
              return (
                <>
                  <div className="flex text-[#FFB300] gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={8} fill={i <= Math.round(rating) ? "currentColor" : "none"} />)}
                  </div>
                  <span className="text-[8px] font-bold text-gray-300">({count})</span>
                </>
              );
            })()}
          </div>

          <div className="mt-auto">
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black text-gray-900 tracking-tighter">
                {(Number(finalPrice)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-gray-400 line-through mt-1 opacity-60 font-bold">
                  {(Number(compareAt)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMegaTrustSection = () => {
    return (
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border border-gray-100 rounded-sm grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100 p-6 md:p-8">
            {[
              { icon: Truck, title: "Frete Grátis", subtitle: "Para todos os pedidos acima de R$ 100" },
              { icon: ShieldCheck, title: "Devolução em 30 Dias", subtitle: "Para trocas de produtos" },
              { icon: CreditCard, title: "Pagamento Seguro", subtitle: "Cartões de pagamento aceitos" },
              { icon: Package, title: "Brindes Especiais", subtitle: "Presentes perfeitos, sempre" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-2 md:px-6 py-4 md:py-0 text-[#1a1a1a]">
                <item.icon size={32} strokeWidth={1.5} className="text-gray-400" />
                <div className="flex flex-col">
                  <h5 className="text-[11px] md:text-xs font-black uppercase mb-0.5">{item.title}</h5>
                  <p className="text-[9px] md:text-[10px] text-gray-500 font-medium">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderMegaFooter = () => {
    // Generate WhatsApp link
    const whatsappLink = store.whatsapp ? `https://wa.me/${store.whatsapp.replace(/\D/g, '')}` : '#';

    return (
      <footer id="mega-footer" className="bg-[#f8f9fa] pt-20 pb-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-8 md:h-12 object-contain" />
              ) : (
                <span className="text-2xl font-black text-[#1a1a1a]">{store.name}</span>
              )}
              <p className="text-xs text-gray-500 leading-relaxed">{store.description || "Sua melhor escolha com entrega rápida e garantia total. Produtos que facilitam o seu dia a dia."}</p>
              <div className="flex items-center gap-2">
                {store.facebook_url && (
                  <a href={store.facebook_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#1877F2] hover:border-[#1877F2] transition-all cursor-pointer">
                    <Facebook size={14} />
                  </a>
                )}
                {store.instagram_url && (
                  <a href={store.instagram_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#E4405F] hover:border-[#E4405F] transition-all cursor-pointer">
                    <Instagram size={14} />
                  </a>
                )}
                {store.youtube_url && (
                  <a href={store.youtube_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#FF0000] hover:border-[#FF0000] transition-all cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd"></path></svg>
                  </a>
                )}
                {store.telegram_url && (
                  <a href={store.telegram_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#0088cc] hover:border-[#0088cc] transition-all cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                  </a>
                )}
                {store.x_url && (
                  <a href={store.x_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-all cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-black text-[#1a1a1a]">Atendimento</h5>
              <ul className="space-y-2 text-xs text-gray-500 font-medium">
                <li><a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--theme-primary)] flex items-center gap-1"><MessageCircle size={14} /> Fale Conosco</a></li>
                <li className="hover:text-[var(--theme-primary)] cursor-pointer">Trocas e Devoluções</li>
                <li className="hover:text-[var(--theme-primary)] cursor-pointer">Informações de Envio</li>
                <li className="hover:text-[var(--theme-primary)] cursor-pointer">Rastreie seu Pedido</li>
                <li className="hover:text-[var(--theme-primary)] cursor-pointer">Políticas de Privacidade</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-black text-[#1a1a1a]">Categorias</h5>
              <ul className="space-y-2 text-xs text-gray-500 font-medium">
                {categories.slice(0, 5).map(c => (
                  <li key={c.id} className="hover:text-[var(--theme-primary)] cursor-pointer" onClick={() => { setActiveCategory(c.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{c.name}</li>
                ))}
                <li className="hover:text-[var(--theme-primary)] cursor-pointer text-[var(--theme-primary)] font-bold" onClick={() => { setActiveCategory(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Ver todas...</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-black text-[#1a1a1a]">Suporte</h5>
              <p className="text-xs text-gray-500 leading-relaxed">Precisa de ajuda? Entre em contato diretamente com a nossa equipe.</p>
              <div className="flex flex-col gap-3">
                {store.whatsapp && (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all font-bold shadow-sm group">
                    <MessageCircle size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs">WhatsApp</span>
                  </a>
                )}
                {store.email && (
                  <a href={`mailto:${store.email}`} className="bg-white border text-gray-700 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all font-bold shadow-sm group">
                    <Mail size={16} className="group-hover:scale-110 transition-transform text-gray-400" />
                    <span className="text-xs">E-mail</span>
                  </a>
                )}
                {store.address && (
                  <div className="flex items-start gap-2 text-gray-500 mt-2">
                    <MapPin size={14} className="mt-0.5 shrink-0" />
                    <span className="text-xs leading-tight">{store.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-xs text-gray-500 font-medium">© {new Date().getFullYear()} {store.name} - Todos os direitos reservados.</p>
              {store.cnpj && <p className="text-[10px] text-gray-400 mt-1">CNPJ: {store.cnpj}</p>}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 grayscale opacity-60">
                <img src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/visa.svg" className="h-3.5" alt="Visa" />
                <img src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/mastercard.svg" className="h-5" alt="Mastercard" />
                <img src="https://logodownload.org/wp-content/uploads/2020/02/pix-logo-1.png" className="h-3.5" alt="Pix" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  };


  // --- Filtering Logic ---
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || prod.category_id === activeCategory;
    const matchesPromo = !showOnlyPromos || (prod.compare_at_price && Number(prod.compare_at_price) > Number(prod.price));
    return matchesSearch && matchesCategory && matchesPromo;
  });

  const renderProductCard = (prod: any, idx: number) => {
    // Template specific card styles
    const cardStyles = {
      'Luxury Dark': "bg-[#111] border-white/5 hover:border-[var(--theme-primary)]/50 shadow-2xl group",
      'Tech Glow': "bg-[#0f172a]/50 backdrop-blur-md border-blue-500/10 hover:border-blue-400 shadow-[0_0_30px_rgba(56,189,248,0.05)]",
      'Cyberpunk Neon': "bg-[#09090b] border-fuchsia-500/30 hover:border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.2)] group",
      'Pure Minimal': "bg-white border-transparent hover:bg-gray-50/50 transition-all duration-700",
      'Corporate Pro': "bg-white border-gray-200 hover:shadow-md hover:border-blue-500",
      'Zen Space': "bg-[#faf9f6] border-[#e6e2d3] hover:shadow-lg transition-transform hover:-translate-y-1",
      'Bold Fashion': "bg-white border-black/5 hover:shadow-[20px_20px_0_0_var(--theme-primary)]",
      'Playful Pop': "bg-white border-4 border-black rounded-3xl hover:-translate-y-2 hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all",
      'Vintage Retro': "bg-[#ffecd2] border-2 border-[#5d4037] hover:bg-[#ffe0b2] shadow-[4px_4px_0_0_#5d4037]",
      'Rustic Charm': "bg-[#fff8f0] border-[#d7ccc8] hover:border-[#8d6e63] shadow-md",
      'Eco Soft': "bg-white border-emerald-100 rounded-[2.5rem] hover:shadow-xl hover:-translate-y-2",
      'Modern Shop': "bg-white border-gray-100 rounded-xl hover:shadow-2xl hover:-translate-y-1.5 hover:border-[var(--theme-primary)]/20 transition-all duration-300"
    }[template as string] || "bg-white border-gray-100 rounded-xl hover:shadow-2xl transition-all";

    const imageStyles = {
      'Eco Soft': "rounded-[2rem] m-2",
      'Playful Pop': "rounded-2xl m-2 border-2 border-black",
      'Zen Space': "rounded-xl m-2 shadow-inner",
      'Vintage Retro': "border-b-2 border-[#5d4037]",
      'Pure Minimal': "aspect-square object-cover"
    }[template as string] || "aspect-square";

    const renderSingleBadge = () => {
      if (prod.estoque === 0) {
        return (
          <div className="px-2 py-0.5 bg-gray-900 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm">
            Esgotado
          </div>
        );
      }
      if (prod.estoque <= 5) {
        return (
          <div className="px-2 py-0.5 bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm animate-pulse">
            Últimas unidades
          </div>
        );
      }
      if (prod.compare_at_price && prod.compare_at_price > prod.price) {
        return (
          <div className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm">
            -{Math.round((1 - prod.price / prod.compare_at_price) * 100)}%
          </div>
        );
      }
      return null;
    };

    return (
      <motion.div
        key={prod.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        onClick={() => setSelectedProduct(prod)}
        className={cn(
          "relative border overflow-hidden transition-all cursor-pointer flex flex-col",
          cardStyles,
          buttonStyle === 'pill' && template !== 'Eco Soft' ? "rounded-3xl" :
            buttonStyle === 'squared' ? "rounded-none" : "rounded-xl"
        )}
      >
        {/* Badge Top Left */}
        <div className="absolute top-3 left-3 z-10">
          {renderSingleBadge()}
        </div>

        {/* Product Image - Standardized to Aspect Square */}
        <div className={cn("relative overflow-hidden group aspect-square flex items-center justify-center bg-gray-50", imageStyles)}>
          <img
            src={prod.image_url?.split(',')[0]}
            alt={prod.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {/* Quick Add Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button className={getButtonStyle("bg-white text-black px-4 py-2 text-[9px] hover:scale-105")}>Ver Detalhes</button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 md:p-4 space-y-1 flex flex-col flex-1">
          <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-0.5">
            {categories.find(c => c.id === prod.category_id)?.name || 'Coleção'}
          </p>
          <h3 className={cn(
            "text-[12px] md:text-[14px] font-black tracking-tight line-clamp-2 leading-tight uppercase mb-1",
            template === 'Luxury Dark' ? "text-gray-200" : "text-gray-900"
          )}>
            {prod.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {(() => {
              const { rating, count } = getProductRating(prod.id);
              return (
                <>
                  <div className="flex text-[#FFB300] gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={8} fill={i <= Math.round(rating) ? "currentColor" : "none"} />)}
                  </div>
                  <span className="text-[8px] font-bold text-gray-300">({count})</span>
                </>
              );
            })()}
          </div>

          <div className="flex flex-col mt-auto">
              <span className={cn(
                "text-xl md:text-2xl font-black tracking-tighter italic leading-none",
                template === 'Luxury Dark' ? "text-[var(--theme-primary)]" : "text-emerald-600"
              )}>
                {(prod.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <div className="flex items-center gap-2 mt-1">
                {prod.compare_at_price && prod.compare_at_price > prod.price && (
                  <span className="text-[10px] text-gray-400 line-through opacity-70 font-bold">
                    {(prod.compare_at_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                )}
                {Number(prod.pix_discount_percent || 0) > 0 && (
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">ou Pix {Number(prod.pix_discount_percent || 0)}% OFF</span>
                )}
              </div>
            </div>
          </div>
      </motion.div>
    );
  };

  const renderHero = () => {
    if (template === 'Futuristic') return (
      <>
        {renderFuturisticHero()}
        {renderFuturisticDestaques()}
      </>
    );
    if (isMegaStore) return renderMegaHero();

    if (!store?.banner_url && template !== 'Pure Minimal') return null;

    if (template === 'Luxury Dark') {
      return (
        <div className="bg-[#050505] py-24 md:py-32 relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter mb-8 brightness-110 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Exclusividade <span className="text-[var(--theme-primary)]">&</span> Luxo
            </motion.h2>
            <div className="w-full max-w-5xl aspect-[21/9] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={store.banner_url} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      );
    }

    if (template === 'Tech Glow') {
      return (
        <div className="bg-[#020617] py-20 relative overflow-hidden border-b border-blue-500/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]" />
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                <Disc className="animate-spin-slow" size={14} /> Sistema Ativo
              </div>
              <h2 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter leading-none uppercase">
                Novas <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Chegadas</span>
              </h2>
              <button className={getButtonStyle("px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white")}>
                Explorar Agora
              </button>
            </div>
            <div className="flex-1 w-full aspect-square md:aspect-video rounded-3xl overflow-hidden border border-white/5 relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10" />
              <img src={store.banner_url} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      );
    }

    if (template === 'Pure Minimal') {
      return (
        <div className="py-24 md:py-40 bg-white">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center space-y-8">
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400"
            >
              Qualidade em Primeiro Lugar
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-light text-gray-900 tracking-tight max-w-3xl"
            >
              Colecoes essenciais para o seu <span className="font-serif italic text-[var(--theme-primary)]">dia a dia</span>.
            </motion.h2>
            <div className="w-px h-20 bg-gray-100" />
          </div>
        </div>
      );
    }

    if (template === 'Bold Fashion') {
      return (
        <div className="relative h-[80vh] bg-black overflow-hidden">
          <img src={store.banner_url} className="absolute inset-0 w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 flex flex-col justify-center px-4 md:px-20">
            <motion.h2
              initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="text-7xl md:text-[12rem] font-black text-white uppercase italic leading-[0.8] tracking-items-tighter"
            >
              {store.name}<br />
              <span className="text-[var(--theme-primary)]">Style</span>
            </motion.h2>
          </div>
          <div className="absolute bottom-12 right-12">
            <button className={getButtonStyle("px-12 py-6 bg-white text-black text-lg")}>Ver Colecao</button>
          </div>
        </div>
      );
    }

    if (template === 'Eco Soft') {
      return (
        <div className="bg-[#f0f4ef] py-20 rounded-b-[4rem] mx-4 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-10 grid md:grid-cols-2 items-center gap-12">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold text-gray-800 tracking-tight">Viva o <span className="text-emerald-600">Equilibrio</span></h2>
              <p className="text-gray-500 font-medium">Produtos sustentáveis e naturais para seu bem estar.</p>
              <button className={getButtonStyle("bg-emerald-600 text-white rounded-full px-8")}>Ver Agora</button>
            </div>
            <div className="rounded-[3rem] overflow-hidden rotate-2 shadow-2xl">
              <img src={store.banner_url} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      );
    }

    if (template === 'Cyberpunk Neon') {
      return (
        <div className="bg-[#09090b] py-20 relative overflow-hidden border-b border-fuchsia-500/30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,70,239,0.15),transparent_70%)]" />
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center relative z-10">
            <motion.h2
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-fuchsia-500 uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(217,70,239,0.5)] mb-6"
            >
              System Override
            </motion.h2>
            <div className="w-full max-w-4xl aspect-video rounded-xl border border-fuchsia-500/50 shadow-[0_0_40px_rgba(217,70,239,0.3)] overflow-hidden">
              <img src={store.banner_url} className="w-full h-full object-cover mix-blend-screen" />
            </div>
          </div>
        </div>
      );
    }

    if (template === 'Rustic Charm') {
      return (
        <div className="bg-[#f5ebe0] py-24 border-b border-[#e3d5ca]">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-6xl font-serif text-[#5e503f] tracking-tight">Feito com <br /><span className="italic">Alma & Arte</span></h2>
              <div className="w-16 h-1 bg-[#d6ccc2]" />
              <p className="text-[#7f6a5b] font-medium text-lg">Descubra nossa coleção única de produtos selecionados.</p>
            </div>
            <div className="flex-1 w-full aspect-square rounded-full overflow-hidden border-8 border-white shadow-xl">
              <img src={store.banner_url} className="w-full h-full object-cover sepia-[0.3]" />
            </div>
          </div>
        </div>
      );
    }

    if (template === 'Corporate Pro') {
      return (
        <div className="bg-white py-20 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 items-center gap-12">
            <div className="w-full aspect-[4/3] rounded bg-gray-100 overflow-hidden shadow-md">
              <img src={store.banner_url} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-6">
              <span className="text-sm font-bold text-blue-600 tracking-wider uppercase">Soluções que entregam</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">Excelência e<br />Confiabilidade.</h2>
              <p className="text-gray-600 text-lg">Catálogo premium pensado para resultados práticos e duradouros.</p>
              <button className={getButtonStyle("bg-blue-600 text-white px-8 py-3 rounded text-sm hover:bg-blue-700")}>Ver Catálogo</button>
            </div>
          </div>
        </div>
      );
    }

    if (template === 'Playful Pop') {
      return (
        <div className="bg-[#ffd166] py-24 border-b-8 border-black overflow-hidden relative">
          <div className="absolute top-10 right-10 w-32 h-32 bg-[#ef476f] rounded-full border-4 border-black" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#118ab2] rounded-full border-4 border-black" />
          <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-8">
            <h2 className="text-6xl md:text-8xl font-black text-white px-4 py-2 bg-black inline-block -rotate-2 border-4 border-white shadow-[8px_8px_0_0_#ef476f]">
              SUPER
            </h2>
            <br />
            <h2 className="text-5xl md:text-7xl font-black text-black px-4 py-2 bg-white inline-block rotate-2 border-4 border-black shadow-[8px_8px_0_0_#118ab2] mt-4">
              NOVIDADES!
            </h2>
            <div className="mt-12 max-w-3xl mx-auto aspect-video border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0_0_rgba(0,0,0,0.2)]">
              <img src={store.banner_url} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      );
    }

    if (template === 'Zen Space') {
      return (
        <div className="bg-[#faf9f6] py-32 border-b border-[#e6e2d3]">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-10">
            <h2 className="text-3xl md:text-5xl font-light text-[#8b8577] tracking-widest leading-relaxed">
              Equilíbrio em cada <br /><span className="font-medium text-[#6b655b]">detalhe</span>.
            </h2>
            <div className="w-full max-w-2xl mx-auto aspect-[3/2] rounded-[3rem] overflow-hidden opacity-90 hover:opacity-100 transition-opacity duration-1000 shadow-2xl">
              <img src={store.banner_url} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      );
    }

    if (template === 'Vintage Retro') {
      return (
        <div className="bg-[#F3E5AB] py-20 border-b-4 border-[#3e2723] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
            <div className="border-4 border-[#3e2723] p-2 bg-[#ffc107] shadow-[8px_8px_0_0_#3e2723] mb-12 -rotate-1">
              <h2 className="text-4xl md:text-6xl font-black text-[#3e2723] uppercase tracking-tighter px-4 py-2 bg-[#F3E5AB] border-2 border-[#3e2723]">
                Estilo <span className="text-[#d84315]">Retrô</span>
              </h2>
            </div>
            <div className="w-full max-w-4xl aspect-[21/9] border-4 border-[#3e2723] shadow-[12px_12px_0_0_#3e2723] bg-white p-2">
              <div className="border border-[#3e2723] w-full h-full overflow-hidden opacity-90 sepia-[0.5]">
                <img src={store.banner_url} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default Template Hero
    return (
      <div className="bg-[#0b0b0b] py-12 md:py-20 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--theme-primary)] rounded-full blur-[160px] opacity-10" />
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full aspect-[21/9] md:aspect-[3/1] rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] border-8 border-white/5 group relative"
          >
            <img src={store.banner_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 md:p-16">
              <h2 className="text-3xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none mb-4">
                Grandes Ofertas<br />
                <span className="text-[var(--theme-primary)]">Pronta Entrega</span>
              </h2>
              <button
                onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
                className={getButtonStyle("self-start px-8 py-3 bg-white text-black hover:bg-[var(--theme-primary)] hover:text-white")}
              >
                Explorar Agora
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderProducts = () => {
    if (template === 'Futuristic') return renderFuturisticProducts();
    if (filteredProducts.length === 0) {
      return (
        <div className="py-20 md:py-40 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200 mb-8 border border-gray-100 shadow-inner">
            <Package size={48} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2 italic">Nenhum produto encontrado</h3>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Tente outro termo ou limpe os filtros</p>
          <button onClick={() => { setSearchQuery(''); setActiveCategory(null); }} className={getButtonStyle("mt-8 px-8 py-3 bg-[#0b0b0b] text-white hover:bg-[var(--theme-primary)]")}>Limpar Busca</button>
        </div>
      );
    }

    if (isMegaStore) {
      const isBlue = megaVariant === 'Blue';
      const primaryColor = isBlue ? '#1868D5' : themeColor;
      const displayedProducts = activeProductTab === 'mais_vendidos' ? bestSellers : filteredProducts;
      return (
        <section id="mega-products" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            {/* Tab bar for Mais Vendidos / Todos */}
            <div className="flex items-end gap-6 border-b-2 border-gray-100 pb-0 mb-8 relative">
              <button
                onClick={() => setActiveProductTab('mais_vendidos')}
                className="pb-3 text-sm font-black uppercase tracking-wide border-b-2 transition-all duration-200"
                style={{
                  color: activeProductTab === 'mais_vendidos' ? primaryColor : '#9ca3af',
                  borderColor: activeProductTab === 'mais_vendidos' ? primaryColor : 'transparent',
                  marginBottom: '-2px',
                }}
              >
                ⭐ Mais Vendidos
              </button>
              <button
                onClick={() => setActiveProductTab('todos')}
                className="pb-3 text-sm font-black uppercase tracking-wide border-b-2 transition-all duration-200"
                style={{
                  color: activeProductTab === 'todos' ? primaryColor : '#9ca3af',
                  borderColor: activeProductTab === 'todos' ? primaryColor : 'transparent',
                  marginBottom: '-2px',
                }}
              >
                Produtos
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">
              {displayedProducts.map(prod => renderMegaProductCard(prod))}
            </div>
          </div>
        </section>
      );
    }

    if (template === 'Luxury Dark') {
      return (
        <div className="space-y-16">
          <div className="flex flex-col items-center text-center space-y-4">
            <span className="text-[10px] font-black tracking-[0.6em] uppercase text-[var(--theme-primary)]">Exclusividade</span>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>Itens Exclusivos</h2>
            <div className="w-20 h-px bg-[var(--theme-primary)]/20" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((prod, idx) => renderProductCard(prod, idx))}
          </div>
        </div>
      );
    }

    if (template === 'Tech Glow' || template === 'Bold Fashion' || template === 'Cyberpunk Neon' || template === 'Playful Pop') {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((prod, idx) => renderProductCard(prod, idx))}
        </div>
      );
    }

    if (template === 'Eco Soft' || template === 'Zen Space' || template === 'Rustic Charm') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProducts.map((prod, idx) => renderProductCard(prod, idx))}
        </div>
      );
    }

    if (template === 'Pure Minimal' || template === 'Corporate Pro') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100 border-y border-gray-100">
          {filteredProducts.map((prod, idx) => renderProductCard(prod, idx))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
        {filteredProducts.map((prod, idx) => renderProductCard(prod, idx))}
      </div>
    );
  };

  const renderTrustSection = () => {
    if (template === 'Futuristic') return null; // Built into destaques already
    return (
      <div className="bg-gray-50/50 py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: <ShieldCheck className="text-emerald-500" />, title: "Compra Segura", desc: "Sua privacidade protegida" },
            { icon: <Truck className="text-indigo-500" />, title: "Entrega Rápida", desc: "Para todo o Brasil" },
            { icon: <CreditCard className="text-orange-500" />, title: "Parcelamento", desc: "Em até 12x sem juros" },
            { icon: <Star className="text-yellow-500" />, title: "Qualidade Premium", desc: "Produtos selecionados" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-2">
                {cloneElement(item.icon as React.ReactElement, { size: 24 })}
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">{item.title}</h4>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFuturisticHeader = () => {
    return (
      <header className="sticky top-0 z-50 w-full bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group shrink-0" onClick={() => { setActiveCategory(null); setSearchQuery(''); }}>
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-8 md:h-10 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.5)] transition-all group-hover:drop-shadow-[0_0_25px_rgba(56,189,248,0.8)]" />
            ) : (
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
                {store.name}
              </h1>
            )}
          </div>
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <input
              type="text"
              placeholder="Buscar no sistema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 h-11 pl-5 pr-12 rounded-full text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all relative z-10"
            />
            <button className="absolute right-1 top-1 h-9 w-10 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-colors z-20 bg-white/5 rounded-full">
              <Search size={16} />
            </button>
          </div>
          <div className="flex items-center gap-4 text-white shrink-0">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { if (customerSession) { setActiveDashboardTab('profile'); setShowOrders(true); } else { setIsAuthModalOpen(true); } }}>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/50 group-hover:text-blue-400 transition-all group-hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <User size={18} />
              </div>
            </div>
            <button onClick={() => { setActiveDashboardTab('favorites'); setShowOrders(true); }} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hidden md:flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-purple-400 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] relative">
              <Heart size={18} className={favorites.length > 0 ? "fill-current text-purple-400" : ""} />
              {favorites.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.8)]">{favorites.length}</span>}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-3 bg-white/5 border border-white/10 pr-4 pl-1 py-1 rounded-full hover:bg-white/10 transition-all group hover:border-blue-500/30">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.5)] group-hover:scale-105 transition-transform relative">
                <ShoppingCart size={14} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-blue-600 text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">{cart.reduce((a, i) => a + i.quantity, 0)}</span>
              </div>
              <div className="hidden lg:flex flex-col items-start leading-none justify-center">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Carrinho</span>
                <span className="text-xs font-black text-white">{(cartTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </button>
          </div>
        </div>
      </header>
    );
  };

  const renderFuturisticHero = () => {
    const featuredProduct = store?.featured_product_id ? (products.find(p => p.id === store.featured_product_id)) : null;
    const heroItems = featuredProduct ? [featuredProduct] : (bestSellers.length > 0 ? bestSellers.slice(0, 5) : products.slice(0, 5));
    const currentHeroProduct = heroItems[currentHeroIndex % heroItems.length];
    
    // Auto-advance product index if needed (reusing the same auto-play logic if desired)
    // For now we'll focus on the manual navigation requested.

    const nextHero = () => {
      if (heroItems.length === 1) {
        const images = currentHeroProduct?.image_url?.split(',') || [];
        if (images.length > 1) {
          setHeroImageIndex((prev) => (prev + 1) % images.length);
          return;
        }
      }
      setCurrentHeroIndex((prev) => (prev + 1) % heroItems.length);
      setHeroImageIndex(0); // Reset image index when product changes
    };

    const prevHero = () => {
      if (heroItems.length === 1) {
        const images = currentHeroProduct?.image_url?.split(',') || [];
        if (images.length > 1) {
          setHeroImageIndex((prev) => (prev - 1 + images.length) % images.length);
          return;
        }
      }
      setCurrentHeroIndex((prev) => (prev - 1 + heroItems.length) % heroItems.length);
      setHeroImageIndex(0); // Reset image index when product changes
    };
    return (
      <div className="relative pt-16 pb-24 overflow-hidden bg-[#020617] md:min-h-[70vh] flex items-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />
        <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />
        
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12 relative z-10 w-full">
          <div className="flex-1 space-y-8 text-center md:text-left z-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Oferta Especial
            </motion.div>
            <motion.h2 
              key={`title-${currentHeroIndex}`}
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }} 
              className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase italic"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                {currentHeroProduct?.name?.split(' ')[0]}
              </span> {currentHeroProduct?.name?.split(' ').slice(1).join(' ')}
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-gray-400 font-medium max-w-lg">
              {currentHeroProduct?.description?.slice(0, 100) || "Frete rápido + garantia de 7 dias. Adquira o que há de mais avançado."}...
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
              <button onClick={() => currentHeroProduct?.id && setSelectedProduct(currentHeroProduct)} className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(79,70,229,0.6)] border border-white/10 group flex items-center justify-center gap-2">
                Comprar Agora
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-10 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[11px] tracking-[0.2em] border border-white/10 transition-all hover:border-white/20 flex items-center justify-center gap-2">
                <ShieldCheck size={14} className="text-blue-400" />
                Garantia de 7 dias
              </button>
            </motion.div>
          </div>
          <div className="flex-1 w-full flex justify-center mt-6 md:mt-0 relative group">
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full group-hover:bg-blue-400/30 transition-colors duration-1000" />
            <AnimatePresence mode="wait">
              <motion.img
                key={`product-${currentHeroIndex}-${heroImageIndex}`}
                initial={{ opacity: 0, scale: 0.9, filter: 'brightness(0.5) contrast(1.2)' }}
                animate={{ opacity: 1, scale: 1, filter: 'brightness(1) contrast(1.2)' }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                src={currentHeroProduct?.image_url?.split(',')[heroImageIndex]}
                className="max-w-[280px] md:max-w-md lg:max-w-lg object-contain relative z-10 drop-shadow-[0_0_50px_rgba(56,189,248,0.3)] h-[280px] md:h-[450px]"
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            {heroItems.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prevHero(); }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextHero(); }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute -right-2 md:-right-4 top-1/4 bg-white/5 backdrop-blur-md border border-white/10 p-3 md:p-4 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20 flex flex-col items-center">
              <span className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-amber-500 mb-1">4.9/5</span>
              <div className="flex text-yellow-500 gap-0.5"><Star size={10} className="fill-current"/><Star size={10} className="fill-current"/><Star size={10} className="fill-current"/><Star size={10} className="fill-current"/><Star size={10} className="fill-current"/></div>
              <span className="text-[8px] text-gray-400 uppercase tracking-widest mt-2">{store.name} Certified</span>
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  const renderFuturisticDestaques = () => {
    if (bestSellers.length === 0) return null;
    return (
      <section className="py-12 bg-[#020617] border-t border-white/5 relative z-10 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar flex gap-4 md:gap-6 pb-4">
          <div className="shrink-0 flex items-center justify-center p-6 bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/10 rounded-3xl min-w-[260px] text-center">
             <div>
               <h3 className="text-lg font-black text-white italic tracking-tight uppercase mb-2">Fast <br/><span className="text-blue-400">Delivery</span></h3>
               <p className="text-[9px] text-gray-400 uppercase tracking-widest">Garantia Nacional</p>
             </div>
          </div>
          <div className="shrink-0 flex items-center justify-center p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-white/10 rounded-3xl min-w-[260px] text-center">
             <div>
               <h3 className="text-lg font-black text-white italic tracking-tight uppercase mb-2">+ 5.000 <br/><span className="text-purple-400">Clientes Ativos</span></h3>
               <p className="text-[9px] text-gray-400 uppercase tracking-widest">Suporte WhatsApp</p>
             </div>
          </div>
          {bestSellers.slice(0, 3).map((prod, i) => (
            <div key={i} onClick={() => setSelectedProduct(prod)} className="shrink-0 flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-3xl min-w-[280px] cursor-pointer hover:bg-white/10 transition-all hover:border-blue-500/30 group">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-black/50 overflow-hidden shrink-0 border border-white/5 group-hover:border-blue-500/50 transition-colors p-2 flex items-center justify-center">
                <img src={prod.image_url?.split(',')[0]} className="w-full h-full object-contain mix-blend-screen group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Top Seller</span>
                <h4 className="text-xs font-bold text-white leading-tight line-clamp-1 mb-1">{prod.name}</h4>
                <div className="flex items-center gap-1.5 mt-auto">
                    <span className="text-sm md:text-base font-black text-white">{(Number(prod.price)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderFuturisticProducts = () => {
    return (
      <div className="flex flex-col space-y-12 pb-16">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "px-4 md:px-5 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border",
              !activeCategory ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
            )}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 md:px-5 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border",
                activeCategory === cat.id ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((prod, idx) => {
            const finalPrice = prod.price;
            const compareAt = prod.compare_at_price;
            const hasDiscount = compareAt && compareAt > finalPrice;
            const discountPercent = hasDiscount ? Math.round((1 - finalPrice / compareAt) * 100) : 0;
            return (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={prod.id} className="bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] hover:border-blue-500/30 hover:bg-white/10 transition-all duration-500 flex flex-col p-3 md:p-4 relative group cursor-pointer" onClick={() => setSelectedProduct(prod)}>
                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(prod); }} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-pink-500 transition-colors border border-white/10 hover:border-pink-500/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                    <Heart size={14} className={favorites.some(f => f.id === prod.id) ? 'fill-current text-pink-500' : ''} />
                  </button>
                </div>
                {hasDiscount && (
                  <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
                    <div className="bg-red-500/80 backdrop-blur-md border border-red-500 text-white text-[8px] md:text-[9px] font-black uppercase px-2 py-1 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                      -{discountPercent}%
                    </div>
                  </div>
                )}
                <div className="w-full aspect-[4/3] md:aspect-square mb-3 md:mb-4 relative rounded-xl md:rounded-2xl overflow-hidden bg-black/30 flex items-center justify-center p-3 md:p-4 border border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  <img src={prod.image_url?.split(',')[0]} className="w-full h-full object-contain mix-blend-screen transition-transform duration-700 group-hover:scale-110 relative z-0" alt={prod.name} />
                </div>
                <div className="flex flex-col flex-1">
                  <p className="text-[8px] md:text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">{categories.find(c => c.id === prod.category_id)?.name || 'Categoria'}</p>
                  <h4 className="text-xs md:text-sm font-bold text-white line-clamp-2 leading-tight min-h-[36px] md:min-h-[40px] mb-2 md:mb-3 group-hover:text-blue-300 transition-colors">{prod.name}</h4>
                  <div className="flex flex-col mt-auto gap-0.5">
                    {hasDiscount && <span className="text-[9px] md:text-[10px] text-gray-500 line-through">{(Number(compareAt)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>}
                    <div className="flex items-end justify-between">
                      <span className="text-base md:text-xl font-black text-white tracking-tight">{(Number(finalPrice)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      <div className="flex items-center text-[9px] md:text-[10px] font-bold text-yellow-500 gap-0.5"><Star size={10} className="fill-current"/> {getProductRating(prod.id).rating}</div>
                    </div>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); addToCart(prod, null); }} className="absolute bottom-3 right-3 md:bottom-4 md:right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all z-20 hover:bg-blue-500 hover:scale-110">
                  <ShoppingCart size={14} className="md:w-4 md:h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    if (template === 'Futuristic') return renderFuturisticHeader();
    if (isMegaStore) return renderMegaHeader();

    return (
      <div className="w-full">
        {/* Top Bar */}
        <div className="bg-[#1a1a1a] text-[10px] text-gray-400 py-1.5 border-b border-white/5 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center font-bold uppercase tracking-widest">
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><ShieldCheck size={10} className="text-emerald-500" /> Compra Segura</span>
              <span className="flex items-center gap-1"><Truck size={10} className="text-indigo-500" /> Entrega em todo o Brasil</span>
            </div>
          </div>
        </div>

        {/* Sticky Wrapper for Header + Categories */}
        <div className="sticky top-0 z-50 flex flex-col w-full shadow-md">
          {/* Main Bar */}
          <div className="bg-[#0b0b0b] py-3 md:py-4 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap md:flex-nowrap items-center justify-between md:gap-8 gap-y-3">
            <div className="flex items-center gap-2 md:gap-3 shrink-0 cursor-pointer" onClick={() => { setActiveCategory(null); setSearchQuery(''); }}>
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-8 w-8 md:h-12 md:w-12 object-contain rounded-md md:rounded-lg shadow-2xl" />
              ) : (
                <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg flex items-center justify-center bg-white text-black font-black text-lg md:text-xl shadow-2xl">
                  {store.name?.charAt(0)}
                </div>
              )}
              <div className="hidden sm:flex flex-col">
                <span className="text-xl md:text-2xl font-black tracking-tighter text-white italic leading-none">{store.name}</span>
                <span className="text-[8px] font-black text-[#f70] tracking-[0.3em] uppercase opacity-80">Marketplace Premium</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full md:flex-1 order-last md:order-none relative group max-w-2xl">
              <input
                type="text"
                placeholder="O que você está procurando?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white h-10 md:h-12 pl-4 md:pl-6 pr-12 rounded-md text-sm font-bold text-black focus:ring-4 focus:ring-[var(--theme-primary)]/20 transition-all outline-none"
              />
              <button className="absolute right-0 top-0 h-10 md:h-12 w-14 flex items-center justify-center text-gray-400 hover:text-[var(--theme-primary)] transition-colors">
                <Search size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 md:gap-8 text-white shrink-0">
              <div
                onClick={() => {
                  if (customerSession) {
                    setActiveDashboardTab('orders');
                    setShowOrders(true);
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="flex items-center gap-3 group cursor-pointer hidden md:flex"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <User size={20} className="text-gray-400 group-hover:text-white" />
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                    {customerSession ? 'Olá, Cliente' : 'Minha Conta'}
                  </span>
                  <span className="text-xs font-black uppercase">
                    {customerSession ? 'Meus Pedidos' : 'Entrar'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => { setActiveDashboardTab('favorites'); setShowOrders(true); }}
                className="p-2 text-gray-400 hover:text-[var(--theme-primary)] transition-colors relative"
              >
                <Heart size={20} className={favorites.length > 0 ? "fill-current text-[var(--theme-primary)]" : ""} />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f70] text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-sm">
                    {favorites.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-900 transition-colors relative"
              >
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f70] text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-sm">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Categorias Bar */}
        <div className="bg-[#111] py-2 md:py-3 border-b border-white/5 w-full">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 md:gap-8">
            <div className="relative group/dept shrink-0">
              <button className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-1.5 md:py-2 bg-[#1a1a1a] rounded-full md:rounded text-[10px] md:text-[11px] font-black text-white hover:bg-[#222] transition-colors group border border-white/10">
                <div className="space-y-1 w-3 md:w-4">
                  <div className="h-0.5 w-full bg-[var(--theme-primary)] group-hover:bg-white transition-colors" />
                  <div className="h-0.5 w-full bg-[var(--theme-primary)] group-hover:bg-white transition-colors" />
                  <div className="h-0.5 w-2/3 bg-[var(--theme-primary)] group-hover:bg-white transition-colors" />
                </div>
                <span className="hidden sm:inline uppercase">DEPARTAMENTOS</span>
                <span className="sm:hidden">MENU</span>
              </button>
              <div className="absolute top-full left-0 w-64 bg-white shadow-2xl rounded-b-xl opacity-0 translate-y-2 pointer-events-none group-hover/dept:opacity-100 group-hover/dept:translate-y-0 group-hover/dept:pointer-events-auto transition-all z-[100] border border-gray-100 py-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(activeCategory === cat.id ? null : cat.id); setSearchQuery(''); }}
                    className={`w-full text-left px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 flex items-center justify-between group/item ${activeCategory === cat.id ? 'text-[var(--theme-primary)]' : 'text-gray-600'}`}
                  >
                    {cat.name}
                    <ChevronRight size={14} className="text-gray-300 group-hover/item:text-[var(--theme-primary)]" />
                  </button>
                ))}
                {categories.length === 0 && (
                  <p className="px-6 py-4 text-[10px] text-gray-400 font-bold uppercase italic">Sem categorias</p>
                )}
              </div>
            </div>

            <nav className="flex items-center gap-3 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth w-full pr-4 pb-1 md:pb-0">
              <button
                onClick={() => { setActiveCategory(null); setSearchQuery(''); }}
                className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${!activeCategory && !searchQuery ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white hover:bg-white/10'}`}
              >
                Início
              </button>
              {categories.slice(0, 8).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(activeCategory === cat.id ? null : cat.id); setSearchQuery(''); }}
                  className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${activeCategory === cat.id ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white hover:bg-white/10'}`}
                >
                  {cat.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
        </div> {/* End Sticky Wrapper */}
      </div>
    );
  };


  const handleWhatsAppAlert = (product: any) => {
    const phone = store.whatsapp?.replace(/\D/g, '');
    if (!phone) {
      showNotification('WhatsApp da loja não configurado.', 'error');
      return;
    }
    const skuInfo = product.sku ? ` (SKU: ${product.sku})` : '';
    const message = `Olá, tenho interesse no produto: ${product.name}${skuInfo}, mas vi que está indisponível no momento. Poderia me avisar quando voltar ao estoque?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDirectPurchase = async (price: number, method: 'pix' | 'card') => {
    const productsPayload = cart.length > 0 ? cart : (selectedProduct ? [selectedProduct] : []);
    const canShipPurchase = productsPayload.every(p => p.has_shipping_data !== false);
    const isPickup = !canShipPurchase ? true : (deliveryMode === 'pickup');

    // Validate shipping and address only for shipping mode
    if (!isPickup) {
      if (!checkoutAddress.fullName || !checkoutAddress.cep || !checkoutAddress.number) {
        showNotification('Preencha os campos obrigatórios de endereço (Nome, CEP, Número).', 'error');
        return;
      }
      if (shippingOptions.length > 0 && !selectedShipping) {
        showNotification('Por favor, selecione uma opção de frete para continuar.', 'error');
        return;
      }
    }

    const pixDiscount = Number(selectedProduct.pix_discount_percent || 0) / 100;
    const priceToUse = method === 'pix' ? price * (1 - pixDiscount) : price;
    const shippingCost = isPickup ? 0 : (selectedShipping?.price || 0);
    const finalPriceWithShipping = priceToUse + shippingCost;
    const shippingMethodToSave = isPickup ? { id: 'pickup', name: 'Retirar em Mãos', price: 0 } : selectedShipping;

    if (!customerSession?.user) {
      showNotification('Você precisa estar logado para comprar.', 'info');
      setIsAuthModalOpen(true);
      return;
    }

    const addressParts = [
      checkoutAddress.street ? `End: ${checkoutAddress.street}` : '',
      checkoutAddress.number ? `Nº: ${checkoutAddress.number}` : '',
      checkoutAddress.complement ? `Comp: ${checkoutAddress.complement}` : '',
      checkoutAddress.neighborhood ? `Bairro: ${checkoutAddress.neighborhood}` : '',
      checkoutAddress.city && checkoutAddress.state ? `${checkoutAddress.city}-${checkoutAddress.state}` : '',
      checkoutAddress.cep ? `CEP: ${checkoutAddress.cep}` : '',
      selectedShipping && !isPickup ? `Frete: ${selectedShipping.name}` : ''
    ].filter(Boolean).join(' | ');

    let orderId = '';
    try {
      const { data, error } = await supabase.from('orders').insert([{
        customer_id: customerSession.user.id,
        store_id: store.id,
        total: finalPriceWithShipping,
        pix_total: finalPriceWithShipping,
        items: [{
          ...selectedProduct,
          selectedVariation,
          quantity: 1,
          price: price
        }],
        customer_email: customerSession.user.email,
        customer_name: checkoutAddress.fullName || customerSession.user.email.split('@')[0],
        customer_whatsapp: checkoutAddress.phone,
        address: isPickup ? 'Retirar em Mãos' : addressParts,
        shipping: shippingMethodToSave || null,
        status: 'Pendente'
      }]).select('id').single();
      if (error) throw error;
      if (data) Object.assign({ orderId: data.id }, { orderId: data.id });
      orderId = data?.id || '';
      fetchCustomerOrders();
    } catch (err: any) {
      console.error('Error saving direct order:', err);
      showNotification(`Erro ao criar pedido: ${err.message || 'Verifique sua conexão.'}`, 'error');
      return; 
    }

    if (isPickup) {
      // Pickup goes directly to WhatsApp
      const phone = store.whatsapp?.replace(/\D/g, '');
      if (!phone) {
        showNotification('WhatsApp da loja não configurado.', 'error');
        return;
      }

      const varInfo = selectedVariation ? ` (${selectedVariation.name}: ${selectedVariation.value})` : '';
      const skuInfo = selectedProduct.sku ? ` (SKU: ${selectedProduct.sku})` : '';
      const methodStr = method === 'pix' ? 'no PIX' : 'no Cartão';
      const message = `Olá! Quero comprar o produto: ${selectedProduct.name}${skuInfo}${varInfo} por ${(finalPriceWithShipping).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ${methodStr}.\n\nModalidade: ✋ RETIRAR EM MÃOS`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      return;
    }

    // Shipping goes exclusively to Mercado Pago
    try {
      const { data, error } = await supabase.functions.invoke('mp-create-payment', {
        body: {
          store_id: store.id,
          amount: finalPriceWithShipping,
          title: `${selectedProduct.name} ${selectedVariation ? `(${selectedVariation.value})` : ''}`,
          payer_email: customerSession?.user?.email,
          order_id: orderId
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.preference_id) {
        setPreferenceId(data.preference_id);
        setMpInitPoint(data.init_point || null);
      } else if (data?.init_point) {
        // Fallback to redirect if preference_id not available (though it should be)
        window.location.href = data.init_point;
      } else {
        throw new Error('Link de pagamento não retornado');
      }
    } catch (mpError: any) {
      console.log('Mercado Pago connect error or not configured:', mpError);
      showNotification('Pagamento online indisponível. A loja precisa configurar o Mercado Pago.', 'error');
    }
  };

  const renderDefaultCheckoutModal = () => {
    if (!selectedProduct) return null;
    const finalPrice = Number(selectedVariation?.price || selectedProduct.price);
    const pixDiscount = Number(selectedProduct.pix_discount_percent || 0) / 100;
    const pixPrice = finalPrice * (1 - pixDiscount);
    const installmentPrice = finalPrice / 12;

    // Check all products that are part of this transaction
    const productsPayload = cart.length > 0 ? cart : [selectedProduct];
    const canShip = productsPayload.every(p => p.has_shipping_data !== false);
    const currentDeliveryMode = canShip ? deliveryMode : 'pickup';

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
            className="absolute inset-0 bg-[#0b0b0b]/90 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="bg-white w-full max-w-5xl h-[95vh] md:h-[90vh] rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] flex flex-col md:flex-row relative z-50 overflow-y-auto overscroll-contain md:overflow-hidden"
          >
            {/* Top Toolbar */}
            <div className="absolute top-3 right-6 z-[60] flex items-center gap-3">
              <button
                onClick={() => handleShareProduct(selectedProduct)}
                className="p-3 bg-white/80 hover:bg-white rounded-2xl transition-all text-gray-500 hover:text-gray-900 shadow-sm backdrop-blur-sm group"
              >
                <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
              </button>
              <button
                onClick={() => toggleFavorite(selectedProduct)}
                className={cn(
                  "p-3 rounded-2xl transition-all shadow-sm backdrop-blur-sm group",
                  favorites.some(f => f.id === selectedProduct.id)
                    ? "bg-red-50/80 text-red-500 hover:bg-red-100"
                    : "bg-white/80 text-gray-500 hover:bg-white hover:text-red-500"
                )}
              >
                <Heart
                  size={20}
                  className={cn(
                    "group-hover:scale-110 transition-transform",
                    favorites.some(f => f.id === selectedProduct.id) && "fill-current"
                  )}
                />
              </button>
              <button
                onClick={() => { setSelectedProduct(null); setPreferenceId(null); }}
                className="p-3 bg-[#0b0b0b] hover:bg-[#f70] rounded-2xl transition-all text-white shadow-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Left: Visuals Section */}
            <div className="w-full md:w-[45%] bg-gray-50 p-6 pt-20 md:p-10 md:pt-10 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-gray-100 shrink-0 md:overflow-y-auto custom-scrollbar">
              {/* Categorias Breadcrumb */}
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#f70]">
                <span>Início</span>
                <ChevronRight size={10} />
                <span>{selectedProduct.categories?.name || 'Geral'}</span>
                <ChevronRight size={10} />
                <span className="text-gray-400">{selectedProduct.name}</span>
              </div>

              {/* Main Image View */}
              <div
                className="aspect-[4/3] w-full rounded-[2rem] bg-white shadow-inner flex items-center justify-center p-8 group relative overflow-hidden cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setZoomState({ ...zoomState, active: false })}
                onClick={() => setShowLightbox(true)}
              >
                {selectedProduct.image_url && (
                  <motion.img
                    key={activeImageIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: zoomState.active ? 1.5 : 1,
                      transformOrigin: `${zoomState.x}% ${zoomState.y}%`
                    }}
                    transition={{
                      opacity: { duration: 0.3 },
                      scale: { duration: 0.2 },
                      transformOrigin: { duration: 0 }
                    }}
                    src={selectedProduct.image_url.split(',')[activeImageIndex]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                )}
                <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none">
                  <span className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-lg shadow-emerald-200 uppercase tracking-widest animate-pulse">Pronta Entrega</span>
                  <span className="px-4 py-2 bg-[#0b0b0b] text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-widest">Novo</span>
                </div>
              </div>

              {/* Thumbnails Gallery */}
              <div className="grid grid-cols-5 gap-3">
                {selectedProduct.image_url?.split(',').map((url: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`aspect-square rounded-2xl border-2 transition-all hover:border-[#f70] overflow-hidden bg-white p-2 ${i === activeImageIndex ? 'border-[#f70] ring-4 ring-orange-50' : 'border-gray-100'}`}
                  >
                    <img src={url} className="w-full h-full object-contain" alt={`Thumbnail ${i + 1}`} />
                  </button>
                ))}
                {/* Fill empty slots for layout consistency if fewer than 5 images */}
                {selectedProduct.image_url?.split(',').length < 5 && Array.from({ length: 5 - selectedProduct.image_url.split(',').length }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-gray-100/50 border-2 border-dashed border-gray-100" />
                ))}
              </div>

              {/* Trust Cards Grid */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f70] flex items-center justify-center"><ShieldCheck size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-900 leading-none">{selectedProduct.warranty || '12 Meses'}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Garantia total</p>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Truck size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-900 leading-none">Envio Imediato</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Todo Brasil</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[55%] flex flex-col md:h-full relative overflow-visible md:overflow-hidden">
              {/* Scrollable Content Area */}
              <div className="w-full md:flex-1 md:overflow-y-auto p-4 md:p-6 custom-scrollbar relative">
                {/* Limited Offer Banner */}
                <div className="mb-4 p-2 text-[10px] bg-[#0b0b0b] rounded-xl flex items-center justify-between text-white relative overflow-hidden group shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-transparent" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1">Oferta Especial</p>
                  </div>
                  <div className="relative z-10 flex flex-col items-end">
                    <p className="text-[9px] font-black uppercase opacity-60 mb-1">Acaba em:</p>
                    <div className="flex gap-1 font-mono text-sm font-black">
                      <span className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                        {timeLeft.hours.toString().padStart(2, '0')}
                      </span>
                      <span>:</span>
                      <span className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                        {timeLeft.minutes.toString().padStart(2, '0')}
                      </span>
                      <span>:</span>
                      <span className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                        {timeLeft.seconds.toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pb-4">
                  {/* High-End Price Box - Non-sticky on mobile to avoid overlaps */}
                  <div className="z-10 -mx-1 px-1 py-2 bg-white md:bg-white/80 md:backdrop-blur-md rounded-2xl shadow-sm md:shadow-md border border-gray-100 mb-4 p-4 rounded-[1.5rem] space-y-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <CreditCard size={100} />
                    </div>

                    <div className="space-y-1">
                      {(selectedProduct.compare_at_price || selectedVariation?.compare_at_price) && (
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest line-through">
                          De: {(Number(selectedVariation?.compare_at_price || selectedProduct.compare_at_price)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      )}
                      <p className="text-3xl font-black text-gray-900 tracking-tighter italic leading-none">{(finalPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>

                    <div className="h-px bg-gray-200/50" />

                    <div className="space-y-4">
                      {paymentMethod === 'pix' ? (
                        <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs italic shrink-0 shadow-sm shadow-emerald-200/50">PIX</div>
                          <div>
                            <p className="text-2xl font-black text-emerald-600 tracking-tight">{(pixPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            {Number(selectedProduct.pix_discount_percent || 0) > 0 && (
                              <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">À vista com {Number(selectedProduct.pix_discount_percent || 0)}% de desconto adicional</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                          <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#f70] flex items-center justify-center shrink-0 shadow-sm shadow-orange-200/50"><CreditCard size={20} /></div>
                          <div>
                            <p className="text-2xl font-black text-gray-900 tracking-tight italic">12x de {((finalPrice / 12)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Parcelamento sem juros no cartão</p>
                          </div>
                        </div>
                      )}

                      {/* Stock Warning */}
                      {(selectedVariation?.estoque ?? selectedProduct.estoque) > 0 && (selectedVariation?.estoque ?? selectedProduct.estoque) <= 5 && (
                        <div className="mt-2 p-2 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                          Últimas {(selectedVariation?.estoque ?? selectedProduct.estoque)} unidades disponíveis!
                        </div>
                      )}
                      {(selectedVariation?.estoque ?? selectedProduct.estoque) === 0 && (
                        <div className="mt-2 p-3 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-200 text-center">
                          Produto indisponível no momento
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Stats */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight italic">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-4">
                      {(() => {
                        const { rating, count } = getProductRating(selectedProduct.id);
                        return (
                          <>
                            <div className="flex text-orange-400">
                              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill={i <= Math.round(rating) ? "currentColor" : "none"} />)}
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest underline decoration-[#f70]/30 underline-offset-4">{count} avaliações</span>
                          </>
                        );
                      })()}
                      <div className="w-1 h-1 bg-gray-200 rounded-full" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cód: {selectedVariation?.sku || selectedProduct.sku || '---'}</span>
                    </div>
                  </div>


                  {/* Variation Selector (If any) */}
                  {selectedProduct.product_variations?.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Selecione a Variação</p>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedProduct.product_variations.map((v: any) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariation(v)}
                            className={cn(
                              "p-4 rounded-2xl border-2 text-left transition-all duration-300 relative group overflow-hidden",
                              selectedVariation?.id === v.id
                                ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/5 ring-4 ring-[var(--theme-primary)]/5'
                                : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                            )}
                          >
                            <span className={cn(
                              "block text-[10px] font-black uppercase tracking-widest mb-1",
                              selectedVariation?.id === v.id ? 'text-[var(--theme-primary)]' : 'text-gray-400'
                            )}>{v.name}</span>
                            <span className="block text-sm font-black text-gray-900">{v.value}</span>
                            {selectedVariation?.id === v.id && (
                              <div className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-[var(--theme-primary)] text-white">
                                <Check size={10} strokeWidth={4} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extra Info (New) */}
                  {selectedProduct.extra_info && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedProduct.extra_info.technical && (
                        <div className="space-y-1 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Especificações</p>
                          <p className="text-[11px] font-bold text-gray-600 leading-tight whitespace-pre-line">{selectedProduct.extra_info.technical}</p>
                        </div>
                      )}

                      {selectedProduct.extra_info.informative && (
                        <div className="space-y-1 p-3 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Informações</p>
                          <p className="text-[11px] font-bold text-gray-600 leading-tight whitespace-pre-line">{selectedProduct.extra_info.informative}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Collapsible Descrição */}
                  {selectedProduct.description && (
                    <div className="border border-gray-100 rounded-3xl p-1 overflow-hidden bg-white/50">
                      <button
                        onClick={() => setShowDescrição(!showDescrição)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-2xl transition-all group/desc"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover/desc:bg-[#f70]/10 group-hover/desc:text-[#f70] transition-colors">
                            <Info size={16} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900">Descrição do Produto</span>
                        </div>
                        <ChevronDown
                          size={18}
                          className={cn(
                            "text-gray-400 transition-transform duration-500",
                            showDescrição ? "rotate-180 text-[#f70]" : ""
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {showDescrição && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 border-t border-gray-50 mt-1">
                              <p className="text-xs text-gray-600 leading-relaxed font-medium whitespace-pre-wrap italic">
                                {selectedProduct.description}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  <div className="space-y-2 p-4 bg-orange-50/50 rounded-3xl border border-orange-100">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-orange-600 flex items-center gap-2 italic">
                        {Number(selectedVariation?.estoque || selectedProduct.estoque) <= 10 ? (
                          Number(selectedVariation?.estoque || selectedProduct.estoque) === 0 
                            ? "Esgotado!" 
                            : `Apenas ${selectedVariation?.estoque || selectedProduct.estoque} unidades restantes!`
                        ) : (
                          "Produto em estoque"
                        )}
                      </span>
                      <span className="text-gray-400">Oferta Limitada</span>
                    </div>
                    <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-orange-100 shadow-inner p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (Number(selectedVariation?.estoque || selectedProduct.estoque) / 50) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-lg"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setShowInstallments(!showInstallments)}
                      className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#f70] transition-colors flex items-center justify-center gap-2 group/parc py-3 rounded-xl hover:bg-orange-50/50"
                    >
                      {showInstallments ? '- Ocultar Detalhes das Parcelas' : '+ Ver Detalhes do Parcelamento'}
                      <ChevronDown size={14} className={`transition-transform duration-300 ${showInstallments ? 'rotate-180 text-[#f70]' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showInstallments && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-2 pt-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setSelectedInstallments(num)}
                                className={cn(
                                  "p-3 rounded-xl flex justify-between items-center transition-all",
                                  selectedInstallments === num
                                    ? 'bg-orange-50 border-2 border-[#f70] shadow-md ring-2 ring-orange-100'
                                    : 'bg-white border border-gray-100 shadow-sm hover:border-[#f70] hover:shadow-md'
                                )}
                              >
                                <span className={cn("text-[10px] font-bold", selectedInstallments === num ? 'text-[#f70]' : 'text-gray-400')}>{num}x</span>
                                <span className="text-[11px] font-black text-gray-900">{((finalPrice / num)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                {selectedInstallments === num && <Check size={10} className="text-[#f70] shrink-0" strokeWidth={4} />}
                              </button>
                            ))}
                          </div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center mt-4 flex items-center justify-center gap-2">
                            <ShieldCheck size={10} className="text-emerald-500" />
                            Pagamento Seguro
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Escolha como pagar Section */}
                  <div className="p-3 rounded-[1.5rem] bg-gray-50/50 border-2 border-dashed border-gray-200/60">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2 font-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f70] animate-pulse" />
                      Escolha como pagar
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setPaymentMethod('card');
                          setShowInstallments(true);
                        }}
                        className={cn(
                          "p-4 rounded-2xl text-center space-y-2 transition-all duration-300 relative overflow-hidden group",
                          paymentMethod === 'card'
                            ? 'bg-white border-2 border-[var(--theme-primary)] shadow-xl shadow-[var(--theme-primary)]/10 scale-[1.02] z-10'
                            : 'bg-white border text-gray-400 border-gray-100 hover:border-gray-300 opacity-60 z-0'
                        )}
                      >
                        <CreditCard size={20} className={cn("mx-auto transition-transform group-hover:scale-110", paymentMethod === 'card' ? 'text-[var(--theme-primary)]' : 'text-gray-400')} />
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", paymentMethod === 'card' ? 'text-gray-900' : 'text-gray-400')}>Cartão</p>
                        {paymentMethod === 'card' && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--theme-primary)] text-white flex items-center justify-center">
                            <Check size={10} strokeWidth={4} />
                          </div>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setPaymentMethod('pix');
                          setShowInstallments(false);
                        }}
                        className={`p-4 rounded-2xl text-center space-y-2 transition-all duration-300 relative overflow-hidden group ${paymentMethod === 'pix'
                          ? 'bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-200/20 scale-[1.02] z-10'
                          : 'bg-white border-1 border-gray-100 hover:border-gray-300 opacity-60 z-0'
                          }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 font-black text-[10px] transition-all group-hover:scale-110 ${paymentMethod === 'pix' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {paymentMethod === 'pix' ? <Check size={14} strokeWidth={4} /> : 'P'}
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'pix' ? 'text-gray-900' : 'text-gray-400'}`}>PIX {Number(selectedProduct.pix_discount_percent || 0) > 0 ? `-${Number(selectedProduct.pix_discount_percent || 0)}%` : ''}</p>
                        {paymentMethod === 'pix' && (
                          <div className="absolute -bottom-1 -right-1 px-2 py-1 bg-emerald-500 text-white text-[8px] font-black rounded-tl-xl uppercase tracking-tighter">Melhor Opção</div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Address + Shipping Section */}
                  <div className="mt-4 border-t border-dashed border-gray-100 pt-3 space-y-3">
                    {/* Delivery Mode Toggle */}
                    {canShip ? (
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f70] animate-pulse" />
                          Modalidade de Entrega
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setDeliveryMode('shipping');
                              setSelectedShipping(null);
                              setShippingOptions([]);
                            }}
                            className={cn(
                              "p-3 rounded-2xl border-2 text-left transition-all duration-200 relative overflow-hidden",
                              deliveryMode === 'shipping'
                                ? 'border-[#f70] bg-orange-50 ring-2 ring-orange-100'
                                : 'border-gray-100 bg-white hover:border-gray-200'
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Truck size={14} className={deliveryMode === 'shipping' ? 'text-[#f70]' : 'text-gray-400'} />
                              <span className={cn("text-[9px] font-black uppercase tracking-widest", deliveryMode === 'shipping' ? 'text-[#f70]' : 'text-gray-400')}>Enviar</span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-500">Receber em casa</p>
                            {deliveryMode === 'shipping' && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#f70] text-white flex items-center justify-center"><Check size={9} strokeWidth={4} /></div>}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeliveryMode('pickup');
                              setSelectedShipping({ id: 'pickup', name: 'Retirar em Mãos', price: 0 });
                              setShippingOptions([]);
                            }}
                            className={cn(
                              "p-3 rounded-2xl border-2 text-left transition-all duration-200 relative overflow-hidden",
                              deliveryMode === 'pickup'
                                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100'
                                : 'border-gray-100 bg-white hover:border-gray-200'
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">✋</span>
                              <span className={cn("text-[9px] font-black uppercase tracking-widest", deliveryMode === 'pickup' ? 'text-emerald-600' : 'text-gray-400')}>Retirar</span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-500">Retirar em mãos</p>
                            {deliveryMode === 'pickup' && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Check size={9} strokeWidth={4} /></div>}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-start gap-3">
                        <span className="text-xl shrink-0">⚠️</span>
                        <div>
                          <p className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">Produto indisponível para envio</p>
                          <p className="text-[10px] font-bold text-yellow-600 mt-0.5">Apenas retirada em mãos disponível.</p>
                        </div>
                      </div>
                    )}

                    {/* Pickup info banner */}
                    {currentDeliveryMode === 'pickup' && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                        <span className="text-xl shrink-0">✋</span>
                        <div>
                          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Retirada grátis!</p>
                          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Combine com o vendedor o local e horário de retirada via WhatsApp.</p>
                          {store?.address && <p className="text-[10px] font-bold text-emerald-600 mt-1">📍 {store.address}</p>}
                        </div>
                      </div>
                    )}

                    {/* Shipping Address fields (only show for shipping mode) */}
                    {currentDeliveryMode === 'shipping' && (
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f70] animate-pulse" />
                        Endereço de Entrega
                      </p>
                    )}

                    {currentDeliveryMode === 'shipping' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nome completo *</label>
                          <input
                            type="text"
                            required
                            value={checkoutAddress.fullName}
                            onChange={e => setCheckoutAddress(prev => ({ ...prev, fullName: e.target.value }))}
                            placeholder="Ex: João Silva"
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f70]/20 transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Telefone</label>
                          <input
                            type="text"
                            value={checkoutAddress.phone}
                            onChange={e => setCheckoutAddress(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="(11) 99999-9999"
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f70]/20 transition-all"
                          />
                        </div>
                        <div className="space-y-1 relative">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">CEP *</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              maxLength={9}
                              value={checkoutAddress.cep}
                              onChange={e => handleCheckoutCepLookup(e.target.value)}
                              placeholder="00000-000"
                              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f70]/20 transition-all pr-8"
                            />
                            {cepLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#f70]/30 border-t-[#f70] rounded-full animate-spin" />}
                          </div>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Rua</label>
                          <input
                            type="text"
                            value={checkoutAddress.street}
                            onChange={e => setCheckoutAddress(prev => ({ ...prev, street: e.target.value }))}
                            placeholder="Preenchido automaticamente"
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f70]/20 transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Número *</label>
                          <input
                            type="text"
                            required
                            value={checkoutAddress.number}
                            onChange={e => setCheckoutAddress(prev => ({ ...prev, number: e.target.value }))}
                            placeholder="Ex: 123"
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f70]/20 transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Complemento</label>
                          <input
                            type="text"
                            value={checkoutAddress.complement}
                            onChange={e => setCheckoutAddress(prev => ({ ...prev, complement: e.target.value }))}
                            placeholder="Apto, Bloco..."
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f70]/20 transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Bairro</label>
                          <input
                            type="text"
                            value={checkoutAddress.neighborhood}
                            onChange={e => setCheckoutAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                            placeholder="Bairro"
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f70]/20 transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cidade</label>
                          <input
                            type="text"
                            value={checkoutAddress.city}
                            readOnly
                            placeholder="Preenchido pelo CEP"
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold opacity-70"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Estado</label>
                          <input
                            type="text"
                            value={checkoutAddress.state}
                            readOnly
                            placeholder="UF"
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold opacity-70"
                          />
                        </div>
                      </div>
                    )}

                    {/* Shipping Options (only for shipping mode) */}
                    {currentDeliveryMode === 'shipping' && shippingLoading && (
                      <div className="flex items-center gap-3 py-4 justify-center">
                        <div className="w-4 h-4 border-2 border-[#f70]/30 border-t-[#f70] rounded-full animate-spin" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Calculando frete...</span>
                      </div>
                    )}

                    {currentDeliveryMode === 'shipping' && !shippingLoading && shippingOptions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Opção de Frete</p>
                        {shippingOptions.map(option => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedShipping(option)}
                            className={cn(
                              "w-full p-3 rounded-xl flex items-center justify-between text-left transition-all",
                              selectedShipping?.id === option.id
                                ? 'bg-orange-50 border-2 border-[#f70] ring-2 ring-orange-100'
                                : 'bg-white border border-gray-100 hover:border-[#f70]/50'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-base">{option.icon}</span>
                              <div>
                                <p className={cn("text-[10px] font-black uppercase tracking-wide", selectedShipping?.id === option.id ? 'text-[#f70]' : 'text-gray-900')}>{option.name}</p>
                                <p className="text-[9px] font-bold text-gray-400">{option.days}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-gray-900">
                                {option.price === 0 ? 'Grátis' : `${(option.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                              </p>
                              {selectedShipping?.id === option.id && <Check size={10} className="text-[#f70] ml-auto" strokeWidth={4} />}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Total summary */}
                    {(selectedShipping || currentDeliveryMode === 'pickup') && (
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-gray-500">
                          <span>Produto</span>
                          <span>{(finalPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-500">
                          <span>{currentDeliveryMode === 'pickup' ? '✋ Retirada em Mãos' : `Frete (${selectedShipping?.name})`}</span>
                          <span className={currentDeliveryMode === 'pickup' ? 'text-emerald-600 font-black' : ''}>
                            {currentDeliveryMode === 'pickup' ? 'Grátis' : (selectedShipping?.price === 0 ? 'Grátis' : `${(selectedShipping?.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`)}
                          </span>
                        </div>
                        <div className="h-px bg-gray-200" />
                        <div className="flex justify-between text-[11px] font-black text-gray-900">
                          <span>Total</span>
                          <span>{((finalPrice + (currentDeliveryMode === 'pickup' ? 0 : (selectedShipping?.price || 0)))).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fixed Footer with Purchase CTA */}
              <div className="p-3 md:p-4 bg-white border-t border-gray-100 shrink-0 relative z-40 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => (selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? addToCart(selectedProduct, selectedVariation) : handleWhatsAppAlert(selectedProduct)}
                    className={getButtonStyle(`flex-1 h-12 bg-white border-2 border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/5`)}
                  >
                    {(selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? (
                      <>
                        <ShoppingBag size={18} />
                        Adicionar
                      </>
                    ) : (
                      <>
                        <MessageCircle size={18} />
                        Avisar no WhatsApp
                      </>
                    )}
                  </button>
                  {preferenceId ? (
                    <div className="h-24 w-full flex flex-col items-center justify-center gap-2">
                      <div id={brickId} className={cn("w-full transition-all", (brickLoading || brickError) ? 'h-0 opacity-0 overflow-hidden' : 'min-h-[64px] opacity-100')} />
                      {brickLoading && (
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex items-center gap-2 text-gray-500 animate-pulse">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Preparando Checkout...</span>
                          </div>
                          {preferenceId && (
                            <button
                              onClick={() => mpInitPoint && (window.location.href = mpInitPoint)}
                              className="text-[9px] font-black text-blue-500 uppercase tracking-tighter hover:underline"
                            >
                              Não carregou? Clique aqui para pagar
                            </button>
                          )}
                        </div>
                      )}
                      {brickError && (
                        <button
                          onClick={() => mpInitPoint && (window.location.href = mpInitPoint)}
                          className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={16} /> Pagar Agora (Link Seguro)
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => (selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? handleDirectPurchase(finalPrice, paymentMethod) : handleWhatsAppAlert(selectedProduct)}
                      className={cn(
                        "h-14 text-white rounded-[1.25rem] font-black uppercase tracking-[0.15em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 group italic",
                        (selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? "bg-[#25D366] shadow-[#25D366]/20" : "bg-[#0b0b0b] shadow-black/20"
                      )}
                    >
                      {(selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? (
                        <>
                          <ShoppingCart size={18} />
                          Comprar Agora
                        </>
                      ) : (
                        <>
                          <MessageCircle size={18} />
                          Avisar no WhatsApp
                        </>
                      )}
                    </button>
                  )}
                </div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] text-center opacity-50">Atendimento 100% Humano via WhatsApp</p>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  const renderMinimalCheckoutModal = () => {
    if (!selectedProduct) return null;
    const finalPrice = Number(selectedVariation?.price || selectedProduct.price);
    const pixDiscount = Number(selectedProduct.pix_discount_percent || 0) / 100;
    const pixPrice = finalPrice * (1 - pixDiscount);

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
            className="absolute inset-0 bg-white/95 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="bg-white w-full max-w-4xl h-[95vh] md:h-[90vh] rounded-[2rem] border border-gray-100 shadow-[0_30px_60px_rgba(0,0,0,0.05)] flex flex-col md:flex-row relative z-50 overflow-y-auto overscroll-contain md:overflow-hidden"
          >
            <button onClick={() => { setSelectedProduct(null); setPreferenceId(null); }} className="absolute top-6 right-6 z-20 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full transition-colors">
              <X size={20} />
            </button>
            <div
              className="w-full md:w-1/2 p-6 pt-20 md:p-10 bg-gray-50 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-gray-100 overflow-hidden group cursor-zoom-in shrink-0"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setZoomState({ ...zoomState, active: false })}
              onClick={() => setShowLightbox(true)}
            >
              <motion.img
                animate={{
                  scale: zoomState.active ? 1.5 : 1,
                  transformOrigin: `${zoomState.x}% ${zoomState.y}%`
                }}
                transition={{
                  scale: { duration: 0.2 },
                  transformOrigin: { duration: 0 }
                }}
                src={selectedProduct.image_url.split(',')[0]}
                className="w-full mix-blend-multiply drop-shadow-xl"
              />
            </div>
            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center space-y-6 md:space-y-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#f70]">{categories.find((c: any) => c.id === selectedProduct.category_id)?.name || 'Produto'}</span>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight mt-2">{selectedProduct.name}</h2>
                <p className="text-gray-500 text-sm mt-3 line-clamp-3 leading-relaxed">{selectedProduct.description}</p>
              </div>

              {selectedProduct.product_variations?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Opções</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.product_variations.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariation(v)}
                        className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                          selectedVariation?.id === v.id ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                        )}
                      >
                        {v.value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-5 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor Final</p>
                  <p className="text-3xl font-black text-gray-900">{(finalPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  <p className="text-[10px] font-black text-emerald-600 mt-1 uppercase tracking-widest">ou {(pixPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} no PIX</p>
                  {(selectedVariation?.estoque ?? selectedProduct.estoque) <= 5 && (selectedVariation?.estoque ?? selectedProduct.estoque) > 0 && (
                    <p className="text-[9px] font-black text-orange-500 uppercase mt-2 animate-pulse">Últimas {(selectedVariation?.estoque ?? selectedProduct.estoque)} unidades!</p>
                  )}
                  {(selectedVariation?.estoque ?? selectedProduct.estoque) === 0 && (
                    <p className="text-[9px] font-black text-red-500 uppercase mt-2">Produto indisponível</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setPaymentMethod('pix')} className={cn("px-4 py-2 text-[10px] font-black uppercase rounded-lg border", paymentMethod === 'pix' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-200 text-gray-400 hover:border-gray-300')}>Pix</button>
                  <button onClick={() => setPaymentMethod('card')} className={cn("px-4 py-2 text-[10px] font-black uppercase rounded-lg border", paymentMethod === 'card' ? 'border-[#f70] bg-orange-50 text-[#f70]' : 'border-gray-200 text-gray-400 hover:border-gray-300')}>Cartão</button>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => (selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? addToCart(selectedProduct, selectedVariation) : handleWhatsAppAlert(selectedProduct)} className="h-14 w-14 shrink-0 bg-white border-2 border-gray-100 hover:border-[#f70] hover:text-[#f70] rounded-2xl flex items-center justify-center text-gray-400 transition-colors shadow-sm">
                  {(selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? <ShoppingBag size={20} /> : <MessageCircle size={20} />}
                </button>
                {preferenceId ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <div id={brickId} className={cn("w-full transition-all", (brickLoading || brickError) ? 'h-0 opacity-0 overflow-hidden' : 'min-h-[56px] opacity-100')} />
                    {brickLoading && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-3 h-3 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Processando...</span>
                        <button
                          onClick={() => mpInitPoint && (window.location.href = mpInitPoint)}
                          className="text-[8px] font-bold text-gray-400 uppercase hover:underline"
                        >
                          Problemas ao carregar? Clique aqui
                        </button>
                      </div>
                    )}
                    {brickError && (
                      <button
                        onClick={() => mpInitPoint && (window.location.href = mpInitPoint)}
                        className="flex-1 h-14 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={16} /> Link de Pagamento
                      </button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => (selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? handleDirectPurchase(finalPrice, paymentMethod) : handleWhatsAppAlert(selectedProduct)} className={cn("flex-1 h-14 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-colors shadow-lg", (selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? "bg-[#25D366] shadow-[#25D366]/20" : "bg-gray-900 shadow-gray-200/20")}>
                    {(selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? (
                      <>
                        <ShoppingCart size={18} /> Comprar Agora
                      </>
                    ) : (
                      <>
                         <MessageCircle size={18} /> Avisar no WhatsApp
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };


  const renderPremiumCheckoutModal = () => {
    if (!selectedProduct) return null;
    const finalPrice = Number(selectedVariation?.price || selectedProduct.price);
    const pixDiscount = Number(selectedProduct.pix_discount_percent || 0) / 100;
    const pixPrice = finalPrice * (1 - pixDiscount);

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
            className="absolute inset-0 bg-[#050505]/95 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-[#0b0b0b] w-full max-w-5xl h-[95vh] md:h-[90vh] rounded-[2rem] border border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.05)] flex flex-col md:flex-row relative z-50 overflow-y-auto overscroll-contain md:overflow-hidden"
          >
            <button onClick={() => { setSelectedProduct(null); setPreferenceId(null); }} className="absolute top-3 right-6 z-20 p-3 text-gray-400 hover:text-white bg-white/5 rounded-full backdrop-blur-md transition-colors border border-white/10">
              <X size={20} />
            </button>
            <div
              className="w-full md:w-1/2 p-6 pt-20 md:p-12 bg-gradient-to-br from-[#111] to-[#050505] flex items-center justify-center relative border-b md:border-b-0 md:border-r border-white/5 overflow-hidden group cursor-zoom-in shrink-0"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setZoomState({ ...zoomState, active: false })}
              onClick={() => setShowLightbox(true)}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)] pointer-events-none" />
              <motion.img
                animate={{
                  scale: zoomState.active ? 1.5 : 1,
                  transformOrigin: `${zoomState.x}% ${zoomState.y}%`
                }}
                transition={{
                  scale: { duration: 0.2 },
                  transformOrigin: { duration: 0 }
                }}
                src={selectedProduct.image_url.split(',')[0]}
                className="w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] scale-105 relative z-10"
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col bg-[#0b0b0b] md:h-full relative overflow-visible md:overflow-hidden">
              <div className="w-full md:flex-1 md:overflow-y-auto p-6 md:p-8 custom-scrollbar relative space-y-6">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500 line-through decoration-white/20">SELECAO PREMIUM</span>
                <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{selectedProduct.name}</h2>
                <div className="w-12 h-px bg-[var(--theme-primary)]" />

                {selectedProduct.product_variations?.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Edition</p>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProduct.product_variations.map((v: any) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariation(v)}
                          className={cn("px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            selectedVariation?.id === v.id ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"
                          )}
                        >
                          {v.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="md:sticky md:top-0 z-30 -mx-1 px-1 py-4 bg-[#0b0b0b] md:bg-[#0b0b0b]/90 md:backdrop-blur-md border-b border-white/5 mb-4">
                  <p className="text-gray-500 uppercase tracking-widest text-[9px] font-bold mb-1">Valor Total</p>
                  <p className="text-4xl font-light text-white tracking-tighter leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>{(finalPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  {(selectedVariation?.estoque ?? selectedProduct.estoque) === 0 && (
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-2">Indisponível</p>
                  )}
                  {(selectedVariation?.estoque ?? selectedProduct.estoque) > 0 && (selectedVariation?.estoque ?? selectedProduct.estoque) <= 5 && (
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-2 animate-pulse">Últimas {(selectedVariation?.estoque ?? selectedProduct.estoque)} unidades</p>
                  )}
                </div>
              </div>

              <div className="p-6 bg-black border-t border-white/5 shrink-0 relative z-40 space-y-4">
                <div className="flex gap-2">
                  <button onClick={() => setPaymentMethod('pix')} className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded border transition-all", paymentMethod === 'pix' ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] bg-[var(--theme-primary)]/10' : 'border-white/10 text-gray-500 hover:border-white/30')}>Pix {Number(selectedProduct.pix_discount_percent || 0) > 0 ? `-${Number(selectedProduct.pix_discount_percent || 0)}%` : ''}</button>
                  <button onClick={() => setPaymentMethod('card')} className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded border transition-all", paymentMethod === 'card' ? 'border-white text-white bg-white/10' : 'border-white/10 text-gray-500 hover:border-white/30')}>Cartao</button>
                </div>
                {preferenceId ? (
                  <div className="w-full flex flex-col items-center justify-center gap-2">
                    <div id={brickId} className={cn("w-full transition-all", (brickLoading || brickError) ? 'h-0 opacity-0 overflow-hidden' : 'min-h-[64px] opacity-100')} />
                    {brickLoading && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2 text-gray-500 animate-pulse">
                          <div className="w-4 h-4 border-2 border-gray-100 border-t-white rounded-full animate-spin" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Finalizando...</span>
                        </div>
                        <button
                          onClick={() => mpInitPoint && (window.location.href = mpInitPoint)}
                          className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] hover:text-white transition-colors"
                        >
                          Manual Link [Safe Mode]
                        </button>
                      </div>
                    )}
                    {brickError && (
                      <button
                        onClick={() => mpInitPoint && (window.location.href = mpInitPoint)}
                        className="w-full h-16 bg-white text-black rounded font-black uppercase tracking-[0.3em] text-[10px] hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={16} /> Pagar Agora (Link Seguro)
                      </button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => (selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? handleDirectPurchase(finalPrice, paymentMethod) : handleWhatsAppAlert(selectedProduct)} className={cn("w-full h-16 rounded font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]", (selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? "bg-white hover:bg-gray-200 text-black" : "bg-white/5 text-white/50 border border-white/10")}>
                    {(selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? (
                      <>
                        Confirmar Agora <ChevronRight size={14} />
                      </>
                    ) : (
                      <>
                         <MessageCircle size={14} /> Avisar no WhatsApp
                      </>
                    )}
                  </button>
                )}
                <button 
                  onClick={() => (selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? addToCart(selectedProduct, selectedVariation) : handleWhatsAppAlert(selectedProduct)} 
                  className="w-full text-center text-[8px] font-black tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  {(selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? (
                    <>
                      <ShoppingBag size={12} /> Adicionar ao Carrinho
                    </>
                  ) : (
                    <>
                      <MessageCircle size={12} /> Avisar Disponibilidade
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  const renderGamerCheckoutModal = () => {
    if (!selectedProduct) return null;
    const finalPrice = Number(selectedVariation?.price || selectedProduct.price);
    const pixDiscount = Number(selectedProduct.pix_discount_percent || 0) / 100;
    const pixPrice = finalPrice * (1 - pixDiscount);

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
            className="absolute inset-0 bg-[#020617]/95 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="bg-[#0f1115] w-full max-w-5xl h-[95vh] md:h-[90vh] rounded-3xl border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.2)] flex flex-col md:flex-row relative z-50 overflow-y-auto overscroll-contain md:overflow-hidden"
          >
            <button onClick={() => { setSelectedProduct(null); setPreferenceId(null); }} className="absolute top-3 right-6 z-20 p-2 text-blue-400 hover:text-white bg-blue-500/10 rounded-xl transition-all border border-blue-500/20">
              <X size={20} />
            </button>
            <div
              className="w-full md:w-1/2 p-8 pt-20 bg-[#020617] flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-blue-500/10 overflow-hidden group cursor-zoom-in shrink-0"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setZoomState({ ...zoomState, active: false })}
              onClick={() => setShowLightbox(true)}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />
              <motion.img
                animate={{
                  scale: zoomState.active ? 1.5 : 1,
                  transformOrigin: `${zoomState.x}% ${zoomState.y}%`
                }}
                transition={{
                  scale: { duration: 0.2 },
                  transformOrigin: { duration: 0 }
                }}
                src={selectedProduct.image_url.split(',')[0]}
                className="w-full drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] relative z-10"
              />
              <div className="mt-8 flex gap-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/30 rounded-lg">Alto Desempenho</span>
                <span className="px-3 py-1 bg-fuchsia-500/20 text-fuchsia-400 text-[10px] font-black uppercase tracking-widest border border-fuchsia-500/30 rounded-lg">Qualidade Premium</span>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col bg-slate-900/50 backdrop-blur-sm md:h-full relative overflow-visible md:overflow-hidden">
              <div className="w-full md:flex-1 md:overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sistema Integrado</span>
                    </div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedProduct.name}</h2>
                    {selectedProduct.description && (
                      <p className="text-slate-400 text-xs mt-4 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                        {selectedProduct.description}
                      </p>
                    )}
                  </div>

                  {selectedProduct.product_variations?.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selecione Config.</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.product_variations.map((v: any) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariation(v)}
                            className={cn("p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                              selectedVariation?.id === v.id ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                            )}
                          >
                            {v.value}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="md:sticky md:top-0 z-30 -mx-1 px-1 py-4 bg-[#020617] md:bg-[#020617]/90 md:backdrop-blur-md rounded-2xl border border-blue-500/20 mb-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Valor Final</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white tracking-tighter">{(finalPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      <span className="text-blue-400 text-xs font-black uppercase leading-none">Subir Nível</span>
                    </div>
                    {(selectedVariation?.estoque ?? selectedProduct.estoque) === 0 && (
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-2">Inventory Empty</p>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-400 uppercase">Desconto Pix</span>
                      <span className="text-lg font-black text-emerald-500">{(pixPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Installments</span>
                      <span className="text-[10px] font-black text-white">12x {((finalPrice / 12)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2"
                    >
                      {[1, 2, 3, 4, 6, 12].map(num => (
                        <div key={num} className="p-2 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center">
                          <span className="text-[8px] font-black text-slate-500 uppercase">{num}x</span>
                          <span className="text-[10px] font-black text-white">{((finalPrice / num)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="mt-8 space-y-3 px-6 md:px-8 pb-8">
                <div className="flex gap-2">
                  <button onClick={() => setPaymentMethod('pix')} className={cn("flex-1 py-3 text-[10px] font-black uppercase rounded-lg border transition-all", paymentMethod === 'pix' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600')}>Pix</button>
                  <button onClick={() => setPaymentMethod('card')} className={cn("flex-1 py-3 text-[10px] font-black uppercase rounded-lg border transition-all", paymentMethod === 'card' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600')}>Card</button>
                </div>
                {preferenceId ? (
                  <div className="w-full flex flex-col items-center justify-center gap-2">
                    <div id={brickId} className={cn("w-full transition-all", (brickLoading || brickError) ? 'h-0 opacity-0 overflow-hidden' : 'min-h-[56px] opacity-100')} />
                    {brickLoading && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-fuchsia-500 rounded-full animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Initiating System...</span>
                        </div>
                        <button
                          onClick={() => mpInitPoint && (window.location.href = mpInitPoint)}
                          className="text-[9px] font-black text-blue-400/50 uppercase tracking-[0.2em] hover:text-blue-400 transition-colors"
                        >
                          Manual Bypass [Click Here]
                        </button>
                      </div>
                    )}
                    {brickError && (
                      <button
                        onClick={() => mpInitPoint && (window.location.href = mpInitPoint)}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white font-black uppercase tracking-widest text-[10px] hover:from-blue-500 hover:to-fuchsia-500 transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={16} /> Checkout Link (Secure)
                      </button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => (selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? handleDirectPurchase(finalPrice, paymentMethod) : handleWhatsAppAlert(selectedProduct)} className={getButtonStyle(cn("w-full h-14 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]", (selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? "bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:from-blue-500 hover:to-fuchsia-500 text-white shadow-[0_10px_30px_rgba(59,130,246,0.3)]" : "bg-slate-800 text-slate-400 border border-slate-700"))}>
                    {(selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? (
                      <>
                        <Zap size={18} fill="currentColor" /> Initiate Purchase
                      </>
                    ) : (
                      <>
                         <MessageCircle size={18} /> Avisar no WhatsApp
                      </>
                    )}
                  </button>
                )}
                <div className="flex items-center justify-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] pt-2">
                  <span className="flex items-center gap-1"><ShieldCheck size={12} /> Secure</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full" />
                  <span className="flex items-center gap-1"><Truck size={12} /> Entrega Rápida</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  const renderOfferCheckoutModal = () => {
    if (!selectedProduct) return null;
    const finalPrice = Number(selectedVariation?.price || selectedProduct.price);
    const pixDiscount = Number(selectedProduct.pix_discount_percent || 0) / 100;
    const pixPrice = finalPrice * (1 - pixDiscount);

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="bg-white w-full max-w-4xl h-[95vh] md:h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col relative z-50 overflow-y-auto overscroll-contain md:overflow-hidden"
          >
            {/* Urgency Header */}
            <div className="bg-red-600 text-white py-3 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest">Oferta por tempo limitado!</span>
              </div>
              <div className="flex gap-2 font-mono text-xs font-black">
                <span>{timeLeft.hours.toString().padStart(2, '0')}h</span>
                <span>{timeLeft.minutes.toString().padStart(2, '0')}m</span>
                <span>{timeLeft.seconds.toString().padStart(2, '0')}s</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:overflow-y-auto md:max-h-[85vh] custom-scrollbar">
              <div
                className="w-full md:w-1/2 p-8 pt-16 bg-gray-50 flex items-center justify-center overflow-hidden group cursor-zoom-in relative shrink-0"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setZoomState({ ...zoomState, active: false })}
                onClick={() => setShowLightbox(true)}
              >
                <motion.img
                  animate={{
                    scale: zoomState.active ? 1.5 : 1,
                    transformOrigin: `${zoomState.x}% ${zoomState.y}%`
                  }}
                  transition={{
                    scale: { duration: 0.2 },
                    transformOrigin: { duration: 0 }
                  }}
                  src={selectedProduct.image_url.split(',')[0]}
                  className="w-full drop-shadow-2xl"
                />
              </div>
              <div className="w-full md:w-1/2 p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic">{selectedProduct.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    {(() => {
                      const { rating, count, salesCount } = getProductRating(selectedProduct.id);
                      return (
                        <>
                          <div className="flex text-yellow-500">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill={i <= Math.round(rating) ? "currentColor" : "none"} />)}
                          </div>
                          <span className="text-[10px] font-bold text-gray-400">{rating} ({salesCount} vendas este mês)</span>
                        </>
                      );
                    })()}
                  </div>
                  {selectedProduct.description && (
                    <p className="text-gray-500 text-xs mt-4 leading-relaxed line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                      {selectedProduct.description}
                    </p>
                  )}
                </div>

                {selectedProduct.product_variations?.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escolha uma opção</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.product_variations.map((v: any) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariation(v)}
                          className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                            selectedVariation?.id === v.id ? "bg-red-600 border-red-600 text-white" : "bg-white border-gray-200 text-gray-400 hover:border-red-200"
                          )}
                        >
                          {v.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-red-600 uppercase mb-1">Preço Promocional</p>
                    <p className="text-3xl font-black text-gray-900">{(finalPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p className="text-[10px] font-bold text-gray-400 line-through">De {((finalPrice * 1.5)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                  <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">33% OFF</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    {(selectedVariation?.estoque ?? selectedProduct.estoque) === 0 ? (
                      <span className="text-red-600 animate-pulse">Produto indisponível!</span>
                    ) : (
                      <span className="text-red-600">Restam apenas {selectedVariation?.estoque ?? selectedProduct.estoque} unidades!</span>
                    )}
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: (selectedVariation?.estoque ?? selectedProduct.estoque) === 0 ? '0%' : '85%' }}
                      className="h-full bg-red-600"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setPaymentMethod('pix')} className={cn("flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all text-center", paymentMethod === 'pix' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200')}>
                    <span className="text-[10px] font-black uppercase tracking-widest">Pix</span>
                    <span className="text-[10px] font-black text-emerald-600">{(pixPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </button>
                  <button onClick={() => setPaymentMethod('card')} className={cn("flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all text-center", paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200')}>
                    <span className="text-[10px] font-black uppercase tracking-widest">Cartão</span>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">12x S/ Juros</span>
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {[1, 2, 3, 4, 6, 12].map(num => (
                      <div key={num} className="p-2 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                        <span className="text-[8px] font-black text-gray-400 uppercase">{num}x</span>
                        <span className="text-[10px] font-black text-gray-900">{((finalPrice / num)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {preferenceId ? (
                  <div className="w-full flex flex-col items-center justify-center gap-2">
                    <div id={brickId} className={cn("w-full transition-all", (brickLoading || brickError) ? 'h-0 opacity-0 overflow-hidden' : 'min-h-[64px] opacity-100')} />
                    {brickLoading && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2 text-red-600 animate-pulse">
                          <div className="w-4 h-4 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Carregando Oferta...</span>
                        </div>
                        <button
                          onClick={() => mpInitPoint && (window.location.href = mpInitPoint)}
                          className="text-[9px] font-black text-red-600/60 uppercase tracking-widest hover:text-red-600 transition-colors"
                        >
                          Não quer esperar? Clique aqui
                        </button>
                      </div>
                    )}
                    {brickError && (
                      <button
                        onClick={() => mpInitPoint && (window.location.href = mpInitPoint)}
                        className="w-full h-16 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={16} /> Pagar Agora (Link Seguro)
                      </button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => (selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? handleDirectPurchase(finalPrice, paymentMethod) : handleWhatsAppAlert(selectedProduct)} className={cn("w-full h-16 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-colors shadow-lg", (selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? "bg-[#25D366] hover:bg-[#1da851] shadow-[#25D366]/20" : "bg-gray-900 shadow-gray-200/20")}>
                    {(selectedVariation?.estoque ?? selectedProduct.estoque) > 0 ? (
                      <>
                        <ShoppingCart size={20} /> Garantir Minha Oferta
                      </>
                    ) : (
                      <>
                        <MessageCircle size={20} /> Avisar no WhatsApp
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <button onClick={() => { setSelectedProduct(null); setPreferenceId(null); }} className="absolute top-12 right-6 p-2 text-white hover:text-gray-200">
              <X size={20} />
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  const renderCheckoutModal = () => {
    if (!selectedProduct) return null;
    if (checkoutStyle === 'premium') return renderPremiumCheckoutModal();
    if (checkoutStyle === 'minimal') return renderMinimalCheckoutModal();
    if (checkoutStyle === 'gamer') return renderGamerCheckoutModal();
    if (checkoutStyle === 'offer') return renderOfferCheckoutModal();
    return renderDefaultCheckoutModal();
  };

  const renderNotification = () => (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] min-w-[300px]"
        >
          <div className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
              notification.type === 'success' ? "bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20" :
                notification.type === 'error' ? "bg-red-500/20 text-red-400 shadow-red-500/20" :
                  "bg-blue-500/20 text-blue-400 shadow-blue-500/20"
            )}>
              {notification.type === 'success' ? <CheckCircle2 size={20} /> :
                notification.type === 'error' ? <X size={20} /> :
                  <Info size={20} />}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Notificação</p>
              <p className="text-xs font-bold text-white leading-tight">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-white/5 rounded-lg text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-[#f70] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white font-black uppercase tracking-widest text-[10px] animate-pulse">Carregando Nexlyra...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 bg-white/5 p-12 rounded-[3rem] border border-white/10 backdrop-blur-sm">
          <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <X className="text-red-500" size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Ops! Algo deu errado.</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
              {error || "A loja que você procura não existe ou foi desativada no momento."}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-[#f70] hover:text-white transition-all shadow-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (isCatalog) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative">
          <div className="p-8 text-center" style={{ backgroundColor: (store.theme_color || '#5551FF') + '15' }}>
            {store.logo_url ? (
              <img src={store.logo_url} alt="Logo" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: store.theme_color || '#5551FF' }}>
                <Store size={32} />
              </div>
            )}
            <h1 className="text-2xl font-black text-gray-900">{store.name || 'Meu Catálogo'}</h1>
            {store.description && <p className="text-sm text-gray-500 mt-2">{store.description}</p>}
            <div className="flex items-center justify-center gap-3 mt-4">
              {store.whatsapp && (
                <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors">
                  <MessageCircle size={14} /> WhatsApp
                </a>
              )}
              {store.instagram_url && (
                <a href={store.instagram_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-full hover:bg-pink-100 transition-colors">
                  <Instagram size={14} /> Instagram
                </a>
              )}
            </div>
          </div>
          <div className="p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Produtos</p>
            {products.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Store size={32} className="mx-auto mb-3 opacity-50" />
                <p className="font-bold text-xs uppercase tracking-widest">Nenhum produto disponível</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p.id} onClick={() => { setCatalogProductDetails(p); setCatalogImageIndex(0); }} className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm flex flex-col group hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-square bg-gray-50 overflow-hidden relative">
                      {p.image_url ? (
                        <img src={p.image_url.split(',')[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200"><Store size={24} /></div>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <p className="text-[11px] font-bold text-gray-900 line-clamp-2 leading-tight flex-1">{p.name}</p>
                      <div className="mt-2 text-left">
                        {(p.compare_at_price) && (
                          <p className="text-[9px] font-bold text-gray-400 line-through mb-0.5">{(Number(p.compare_at_price)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        )}
                        <p className="text-xs font-black" style={{ color: store.theme_color || '#5551FF' }}>
                          {(Number(p.price)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>
                    <div
                      className="w-full py-3 text-[9px] font-black uppercase tracking-widest text-white text-center hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: store.theme_color || '#5551FF' }}
                    >
                      Ver Detalhes
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-6 text-center text-[9px] font-bold text-gray-300 uppercase tracking-widest pb-12">
            Powered by Nexlyra
          </div>
        </div>

        {/* Modal de Produto do Catálogo */}
        <AnimatePresence>
          {catalogProductDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCatalogProductDetails(null)}
              className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4"
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                onClick={e => e.stopPropagation()}
                className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="relative aspect-square bg-gray-100 shrink-0">
                  <button onClick={() => setCatalogProductDetails(null)} className="absolute top-4 right-4 z-10 p-2 bg-white/50 backdrop-blur-md rounded-full text-gray-900 hover:bg-white transition-colors">
                    <X size={20} />
                  </button>

                  {catalogProductDetails.image_url ? (
                    <>
                      <div className="w-full h-full flex items-center justify-center overflow-hidden touch-none select-none relative">
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={catalogImageIndex}
                            src={catalogProductDetails.image_url.split(',')[catalogImageIndex]}
                            alt={catalogProductDetails.name}
                            className="w-full h-full object-cover absolute inset-0"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.2 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.6}
                            onDragEnd={(_e, { offset, velocity }) => {
                              const images = catalogProductDetails.image_url.split(',');
                              const swipe = offset.x;
                              const threshold = 70;
                              if (swipe < -threshold || (swipe < -20 && velocity.x < -100)) {
                                setCatalogImageIndex((catalogImageIndex + 1) % images.length);
                              } else if (swipe > threshold || (swipe > 20 && velocity.x > 100)) {
                                setCatalogImageIndex((catalogImageIndex - 1 + images.length) % images.length);
                              }
                            }}
                          />
                        </AnimatePresence>
                        {catalogProductDetails.image_url.split(',').length > 1 && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); setCatalogImageIndex((catalogImageIndex - 1 + catalogProductDetails.image_url.split(',').length) % catalogProductDetails.image_url.split(',').length); }}
                              className="absolute left-2 z-20 p-2 bg-black/20 hover:bg-black/60 backdrop-blur-sm rounded-full text-white transition-colors"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setCatalogImageIndex((catalogImageIndex + 1) % catalogProductDetails.image_url.split(',').length); }}
                              className="absolute right-2 z-20 p-2 bg-black/20 hover:bg-black/60 backdrop-blur-sm rounded-full text-white transition-colors"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </>
                        )}
                      </div>
                      {catalogProductDetails.image_url.split(',').length > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                          {catalogProductDetails.image_url.split(',').map((_: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setCatalogImageIndex(idx)}
                              className={cn(
                                "h-1.5 rounded-full transition-all",
                                catalogImageIndex === idx ? "w-6" : "w-1.5 opacity-50 text-white"
                              )}
                              style={{ backgroundColor: catalogImageIndex === idx ? (store.theme_color || '#5551FF') : 'white' }}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Store size={48} />
                    </div>
                  )}
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-white">
                  <h2 className="text-xl font-black text-gray-900 leading-tight mb-2">{catalogProductDetails.name}</h2>
                  <div className="flex items-end gap-2 mb-6">
                    <p className="text-2xl font-black" style={{ color: store.theme_color || '#5551FF' }}>
                      {(Number(catalogProductDetails.price)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    {catalogProductDetails.compare_at_price && (
                      <p className="text-sm font-bold text-gray-400 line-through mb-1">
                        {(Number(catalogProductDetails.compare_at_price)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    )}
                  </div>

                  {catalogProductDetails.description && (
                    <div className="mb-6">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descrição</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{catalogProductDetails.description}</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                  <a
                    href={`https://wa.me/${store.whatsapp?.replace(/\D/g, '') || ''}?text=Olá,%20gostaria%20de%20comprar%20o%20produto:%20${encodeURIComponent(catalogProductDetails.name)}%20(SKU:%20${encodeURIComponent(catalogProductDetails.sku || '')})`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: store.theme_color || '#5551FF' }}
                  >
                    <MessageCircle size={18} /> Comprar Agora
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const renderCinematicTemplate = () => {
    // Pegar produtos reais
    const heroProduct = products[0];
    const sideProduct1 = products[1];
    const sideProduct2 = products[2];
    const bestSellers = products.slice(0, 8);
    const dailyOffers = products.slice(0, 3);

    return (
      <div className="relative min-h-screen w-full bg-[#0a0f16] text-white overflow-hidden selection:bg-indigo-500/30 font-sans pb-32">
        {/* Fundo dinâmico com glows idêntico à imagem */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
          {/* Ondas sutis baseadas no fundo */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_20%,transparent_100%)] opacity-20" />
        </div>

        {/* HEADER GLASS */}
        <header className="relative z-50 flex items-center justify-between px-8 py-6 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tighter hidden md:block">{store.name}</h1>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            {store.logo_url ? (
               <img src={store.logo_url} alt="Logo" className="h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
            ) : (
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tighter md:hidden">
                {store.name}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-6 text-gray-300">
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              <User size={18} />
              <span className="text-xs font-medium hidden lg:block">Minha Conta</span>
            </button>
            <button className="hover:text-white transition-colors"><Heart size={18} /></button>
            <button onClick={() => setIsCartOpen(true)} className="hover:text-white transition-colors relative">
               <ShoppingBag size={18} />
               {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-500 text-black text-[9px] font-black rounded-full flex items-center justify-center">{cart.length}</span>}
            </button>
          </div>
        </header>

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8">
          {/* HERO SECTION */}
          <section className="flex flex-col lg:flex-row items-center pt-10 pb-20 justify-between min-h-[70vh]">
            {/* HERO LEFT - TEXTOS */}
            <div className="w-full lg:w-[45%] space-y-5 relative z-20 mt-10 lg:mt-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-bold text-gray-300 tracking-wider uppercase opacity-70">Oferta Especial</span>
              </div>
              <h2 className="text-2xl lg:text-4xl font-bold text-white leading-tight tracking-tight max-w-[85%]">
                {heroProduct?.name || 'Inovação e Performance'}
              </h2>
              <p className="text-base text-gray-400 font-medium opacity-60">
                Frete rápido + garantia de 7 dias
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button 
                  onClick={() => {
                    if (heroProduct) {
                      setSelectedProduct(heroProduct);
                      setIsCartOpen(true);
                      addToCart(heroProduct, null);
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black text-[12px] font-black rounded-full shadow-[0_0_20px_rgba(202,138,4,0.2)] transition-all hover:scale-105 uppercase tracking-wider"
                >
                  Comprar agora
                </button>
                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-white text-[12px] font-bold rounded-full transition-all flex items-center gap-2">
                  <ShieldCheck size={16} className="text-gray-400" /> Garantia
                </button>
              </div>
            </div>

            {/* HERO RIGHT - IMAGEM GIGANTE + CARDS LATERAIS */}
            <div className="w-full lg:w-[55%] relative h-[500px] lg:h-[700px] mt-12 lg:mt-0">
               {/* Produto Primário */}
               <div className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-32 animate-in slide-in-from-right-12 duration-1000">
                 {heroProduct && heroProduct.image_url ? (
                   <img 
                     src={heroProduct.image_url.split(',')[0]} 
                     alt={heroProduct.name} 
                     className="max-h-full max-w-[120%] object-contain drop-shadow-[0_0_80px_rgba(59,130,246,0.3)] hover:drop-shadow-[0_0_120px_rgba(59,130,246,0.5)] transition-all duration-700 hover:scale-105 cursor-pointer z-10"
                     onClick={() => setSelectedProduct(heroProduct)}
                   />
                 ) : (
                   <div className="w-96 h-96 bg-white/5 rounded-full blur-2xl flex items-center justify-center" />
                 )}
               </div>

               {/* Cartões Laterais Flutuantes (Direita) */}
               <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col gap-4 z-20">
                 {/* Card 1 */}
                 {sideProduct1 && (
                   <div 
                     onClick={() => setSelectedProduct(sideProduct1)}
                     className="w-48 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-3 flex flex-col gap-3 hover:bg-white/10 transition-colors cursor-pointer group"
                   >
                     <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/50">
                       <span className="absolute top-2 left-2 z-10 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                         🔥 TOP
                       </span>
                       <img src={sideProduct1.image_url?.split(',')[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                     </div>
                     <div className="px-1 pb-1">
                       <p className="text-xs font-bold text-white line-clamp-1">{sideProduct1.name}</p>
                       <p className="text-[10px] text-gray-400">{(Number(sideProduct1.price)).toLocaleString('pt-BR', {style: 'currency', currency:'BRL'})}</p>
                     </div>
                   </div>
                 )}
                 {/* Card 2 */}
                 {sideProduct2 && (
                   <div 
                     onClick={() => setSelectedProduct(sideProduct2)}
                     className="w-48 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-3 flex flex-col gap-3 hover:bg-white/10 transition-colors cursor-pointer group"
                   >
                     <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/50">
                       <img src={sideProduct2.image_url?.split(',')[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                     </div>
                     <div className="px-1 pb-1 flex justify-between items-center">
                       <div>
                         <p className="text-xs font-bold text-white line-clamp-1">{sideProduct2.name}</p>
                         <p className="text-[10px] text-yellow-500 flex items-center gap-1"><Star size={10} fill="currentColor"/> 4.9</p>
                       </div>
                       <button className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white text-gray-400 transition-colors">
                         <ChevronRight size={12} />
                       </button>
                     </div>
                   </div>
                 )}
               </div>
            </div>
          </section>

          {/* BENEFÍCIOS - 4 CARDS HORIZONTAIS */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-20 relative z-20">
            {[
              { icon: Truck, title: "Entrega Expressa", desc: "Para todo Brasil", glow: "text-blue-400" },
              { icon: ShieldCheck, title: "Compra Garantida", desc: "Devolução grátis", glow: "text-purple-400" },
              { icon: User, title: "+5.000 clientes", desc: "Satisfeitos", glow: "text-emerald-400" },
              { icon: Headphones, title: "Suporte 24/7", desc: "Especializado", glow: "text-gray-300" }
            ].map((ben, i) => (
              <div key={i} className="bg-white/5 hover:bg-white/[0.07] backdrop-blur-md rounded-2xl border border-white/5 p-4 flex items-center gap-4 transition-colors">
                <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10", ben.glow)}>
                  <ben.icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{ben.title}</h4>
                  <p className="text-[10px] text-gray-400">{ben.desc}</p>
                </div>
              </div>
            ))}
          </section>

          {/* TÍTULOS CATEGORIAS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-20">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar hide-scrollbar">
              {['Todos', ...categories.slice(0,4)].map((cat, i) => (
                <button 
                  key={i} 
                  onClick={() => i === 0 ? setActiveCategory('') : setActiveCategory(cat.name)}
                  className={cn(
                    "px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                    (i === 0 && !activeCategory) || activeCategory === cat.name
                      ? "bg-white text-black border-white" 
                      : "bg-transparent text-gray-400 border-white/20 hover:border-white/40 hover:text-white"
                  )}
                >
                  {i === 0 ? 'Dortco' : cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* PRODUTOS CARROSSEL (Mais vendidas) */}
          <section className="flex gap-4 overflow-x-auto pb-12 snap-x hide-scrollbar relative z-20">
            {bestSellers.map((p, i) => (
              <div 
                key={p.id} 
                className="min-w-[160px] md:min-w-[190px] snap-start flex flex-col gap-2 cursor-pointer group"
                onClick={() => setSelectedProduct(p)}
              >
                <div className="w-full aspect-square rounded-[1.25rem] bg-white/5 border border-white/5 flex items-center justify-center relative overflow-hidden group-hover:border-white/20 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-full h-full p-6 flex items-center justify-center">
                    <img 
                      src={p.image_url?.split(',')[0]} 
                      alt={p.name} 
                      className="max-w-full max-h-full object-contain filter drop-shadow-xl group-hover:scale-110 transition-transform duration-500 z-0" 
                    />
                  </div>
                  <div className="absolute bottom-4 left-0 w-full flex justify-center z-20 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 px-4">
                    <button className="w-full bg-white text-black text-[8px] font-black py-2 rounded-full flex items-center justify-center gap-1 uppercase tracking-widest shadow-xl">
                      Ver detalhes
                    </button>
                  </div>
                </div>
                <div className="px-1 space-y-1">
                  <h4 className="text-[10px] font-bold text-gray-400 line-clamp-1 h-4">{p.name}</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-white">
                      {(Number(p.price)).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}
                    </p>
                    <span className="text-yellow-500 text-[9px] flex items-center gap-0.5 font-bold">
                      <Star size={9} fill="currentColor"/> 4.9
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* OFERTAS DO DIA */}
          <div className="relative z-20 pb-20">
             <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {products.slice(0, 4).map((p, i) => (
                  <div key={p.id} className="relative bg-white/5 backdrop-blur-md rounded-[1.25rem] border border-white/5 overflow-hidden flex flex-col aspect-square group cursor-pointer shadow-2xl" onClick={() => setSelectedProduct(p)}>
                    <div className="absolute top-0 right-0 p-2 z-20">
                      <button className="w-6 h-6 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center backdrop-blur-md transition-colors shadow-lg">
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="w-full h-full p-8 md:p-10 flex items-center justify-center relative z-10">
                      <img 
                        src={p.image_url?.split(',')[0]} 
                        className="max-w-full max-h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-all duration-500" 
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity z-20" />
                    <div className="absolute bottom-0 left-0 w-full p-4 z-30">
                      <h4 className="text-[10px] font-bold text-gray-200 line-clamp-1 mb-0.5">{p.name}</h4>
                      <p className="text-indigo-400 font-black text-[11px]">{(Number(p.price)).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn("min-h-screen selection:bg-indigo-500/20 selection:text-indigo-500", getBackgroundStyles())}
      style={{
        fontFamily: getFontFamily(),
        ['--theme-color' as any]: themeColor,
        ['--secondary-color' as any]: secondaryColor
      }}
    >
      <style>{`
        :root {
          --theme-primary: ${themeColor};
          --theme-secondary: ${secondaryColor};
          --theme-font: ${getFontFamily()};
        }
        
        * {
          font-family: var(--theme-font) !important;
        }

        .text-theme { color: ${themeColor}; }
        .bg-theme { background-color: ${themeColor}; }
        .border-theme { border-color: ${themeColor}; }
        .hover-bg-theme:hover { background-color: ${themeColor}; }
        .hover-text-theme:hover { color: ${themeColor}; }
        
        .text-secondary { color: ${secondaryColor}; }
        .bg-secondary { background-color: ${secondaryColor}; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${themeColor}22; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${themeColor}44; }
      `}</style>
      
      {template === 'Cinematic Premium' ? (
        renderCinematicTemplate()
      ) : (
        <>
          {renderHeader()}
          <main className="min-h-[80vh]">
            {renderHero()}
            {isMegaStore && renderMegaCategorias()}

            {/* Content Section */}
            <section id="catalogo" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
              {renderProducts()}
            </section>

            {renderTrustSection()}
          </main>
        </>
      )}

      {/* Cart Drawer — Multi-Step Checkout */}
      <AnimatePresence>
        {isCartOpen && (() => {
          const shippingZones: { label: string; price: number }[] = store.shipping_zones?.length > 0
            ? store.shipping_zones
            : [
                { label: 'Cidade Baixa', price: 5 },
                { label: 'Cidade Alta', price: 10 },
                { label: 'Zona Sul', price: 12 },
                { label: 'Zona Norte', price: 15 },
                { label: 'Outro / Consultar', price: 0 },
              ];
          const shippingCost = selectedShipping ? selectedShipping.price : (cartShippingZone?.price ?? 0);
          const cartFinalTotal = cartTotal + shippingCost;
          const cartFinalPixTotal = cartPixTotal + shippingCost;
          const totalItemsQty = cart.reduce((a: number, i: any) => a + i.quantity, 0);

          // Build WhatsApp message string (reused across steps)
          const buildWhatsAppMessage = () => {
            const itemsList = cart.map((item: any) => {
              const variation = item.selectedVariation ? ` [${item.selectedVariation.name}: ${item.selectedVariation.value}]` : '';
              const skuStr = item.sku ? ` (SKU: ${item.sku})` : '';
              return `• ${item.quantity}x ${item.name}${skuStr}${variation} — ${(Number(item.price) * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
            }).join('\n');
            const shippingLabel = selectedShipping ? `📦 *Frete (${selectedShipping.name}):*` : `🚚 *Frete (${cartShippingZone?.label || 'A organizar'}):*`;
            const shippingLine = (selectedShipping || cartShippingZone)
              ? `${shippingLabel} ${shippingCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
              : '🚚 *Frete:* A consultar';
            const addressLine = cartDeliveryAddress.trim()
              ? `📍 *Endereço:* ${cartDeliveryAddress.trim()}${cartNeighborhood.trim() ? ` — ${cartNeighborhood.trim()}` : ''}`
              : cartNeighborhood.trim() ? `📍 *Bairro:* ${cartNeighborhood.trim()}` : '';
            return [
              `🛒 *Novo Pedido — ${store.name}*`,
              '',
              '*Produtos:*',
              itemsList,
              '',
              `💰 *Subtotal:* ${cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
              shippingLine,
              `✅ *Total:* ${cartFinalTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
              `💚 *Total no Pix:* ${cartFinalPixTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
              '',
              `👤 *Cliente:* ${cartCustomerName.trim()}`,
              cartCustomerPhone.trim() ? `📱 *Telefone:* ${cartCustomerPhone.trim()}` : '',
              cartCep.trim() ? `📮 *CEP:* ${cartCep.trim()}` : '',
              addressLine,
            ].filter(Boolean).join('\n');
          };

          const saveOrderAndGetId = async (method: string): Promise<string> => {
            try {
              const total = method === 'pix' ? cartFinalPixTotal : cartFinalTotal;
              
              // Consolidate address info
              const addressParts = [
                cartDeliveryAddress ? `End: ${cartDeliveryAddress}` : '',
                cartNeighborhood ? `Bairro: ${cartNeighborhood}` : '',
                cartCep ? `CEP: ${cartCep}` : '',
                selectedShipping ? `Frete: ${selectedShipping.name}` : cartShippingZone ? `Zona: ${cartShippingZone.label}` : ''
              ].filter(Boolean).join(' | ');

              const payload = {
                customer_id: customerSession?.user?.id,
                store_id: store.id,
                total,
                pix_total: cartFinalPixTotal,
                items: cart,
                customer_name: cartCustomerName,
                customer_email: customerSession?.user?.email,
                customer_whatsapp: cartCustomerPhone,
                address: addressParts,
                shipping: selectedShipping || (cartShippingZone ? { name: cartShippingZone.label, price: cartShippingZone.price } : null),
                status: 'Pendente'
              };

              if (cartOrderId) {
                const { error: updateError } = await supabase.from('orders').update(payload).eq('id', cartOrderId);
                if (updateError) throw updateError;
                if (customerSession?.user) fetchCustomerOrders();
                return cartOrderId;
              }

              const { data, error } = await supabase.from('orders').insert([payload]).select('id').single();
              
              if (error) throw error;
              if (data?.id) {
                setCartOrderId(data.id);
                if (customerSession?.user) fetchCustomerOrders();
                return data.id;
              }
            } catch (err: any) { 
              console.error('Error saving order:', err);
              showNotification(`Erro ao salvar pedido: ${err.message || 'Verifique sua conexão e tente novamente.'}`, 'error');
            }
            return '';
          };

          const handleGoToCheckout = () => {
            if (!customerSession) {
              showNotification('Você precisa estar logado para continuar com a compra.', 'info');
              setIsAuthModalOpen(true);
              return;
            }
            if (!cartCustomerName.trim()) {
              showNotification('Preencha seu nome antes de continuar.', 'error');
              return;
            }
            // Create order automatically when entering payment step
            saveOrderAndGetId('whatsapp'); // Use 'whatsapp' as initial/placeholder method
            setCartCheckoutStep('payment');
          };

          const handleCartWhatsApp = async () => {
            if (!cartCustomerName.trim()) {
              showNotification('Por favor, informe seu nome para continuar.', 'error');
              return;
            }
            const phone = store.whatsapp?.replace(/\D/g, '');
            if (!phone) { showNotification('WhatsApp da loja não configurado.', 'error'); return; }
            await saveOrderAndGetId('whatsapp');
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage())}`, '_blank');
            setCartCheckoutStep('success');
          };

          const handleCartPaymentConfirm = async () => {
            if (!cartCustomerName.trim()) {
              showNotification('Preencha seu nome antes de continuar.', 'error');
              return;
            }
            const phone = store.whatsapp?.replace(/\D/g, '');

            if (cartPaymentMethod === 'whatsapp') {
              if (!phone) { showNotification('WhatsApp da loja não configurado.', 'error'); return; }
              await saveOrderAndGetId('whatsapp');
              window.open(`https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage())}`, '_blank');
              setCartCheckoutStep('success');
              return;
            }

            // Pix or Card via Mercado Pago
            try {
              const method = cartPaymentMethod;
              const ordId = await saveOrderAndGetId(method);
              const amount = method === 'pix' ? cartFinalPixTotal : cartFinalTotal;
              const title = cart.map((i: any) => i.name).join(', ').substring(0, 80);

              const { data, error } = await supabase.functions.invoke('mp-create-payment', {
                body: {
                  store_id: store.id,
                  amount,
                  title,
                  payer_email: customerSession?.user?.email,
                  order_id: ordId
                }
              });

              if (error) throw error;
              if (data?.init_point) {
                window.open(data.init_point, '_blank');
                setCartCheckoutStep('success');
              } else if (data?.preference_id) {
                // Show MP Brick if possible
                setPreferenceId(data.preference_id);
                setMpInitPoint(data.init_point || null);
                setCartCheckoutStep('success');
              } else {
                throw new Error('Link de pagamento não retornado');
              }
            } catch (mpErr: any) {
              console.error('MP error:', mpErr);
              // Fallback: send WhatsApp
              showNotification('Pagamento online indisponível. Usando WhatsApp como alternativa.', 'info');
              if (phone) {
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage())}`, '_blank');
              }
              setCartCheckoutStep('success');
            }
          };

          const closeCart = () => {
            setIsCartOpen(false);
            setCartCheckoutStep('cart');
            setCartOrderId('');
            setShippingOptions([]);
            setSelectedShipping(null);
          };

          // --- Step indicator label ---
          const stepLabels: Record<string, string> = {
            cart: 'Carrinho',
            payment: 'Pagamento',
            success: 'Confirmação'
          };

          return (
            <div className="fixed inset-0 z-[150] flex justify-end">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={closeCart}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={cn("relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden", template === 'Futuristic' ? "!bg-[#020617] !text-white border-l border-white/10 *:!text-white" : "")}
              >
                {/* === HEADER === */}
                <div className={cn("px-6 py-4 border-b border-gray-100 bg-white shrink-0", template === 'Futuristic' ? "!bg-[#020617] !border-white/10" : "")}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {cartCheckoutStep !== 'cart' && cartCheckoutStep !== 'success' && (
                        <button
                          onClick={() => setCartCheckoutStep('cart')}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                        >
                          <ChevronLeft size={18} />
                        </button>
                      )}
                      <div>
                        <h3 className={cn("text-base font-black text-gray-900", template === 'Futuristic' ? "!text-white" : "")}>{stepLabels[cartCheckoutStep]}</h3>
                        {cartCheckoutStep === 'cart' && (
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{totalItemsQty} {totalItemsQty === 1 ? 'item' : 'itens'}</p>
                        )}
                      </div>
                    </div>
                    <button onClick={closeCart} className={cn("p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400", template === 'Futuristic' ? "hover:!bg-white/10" : "")}>
                      <X size={20} />
                    </button>
                  </div>
                  {/* Step progress bar */}
                  <div className="flex gap-1.5">
                    {(['cart', 'payment', 'success'] as const).map((s, i) => (
                      <div key={s} className={cn(
                        "h-1 rounded-full flex-1 transition-all duration-500",
                        cartCheckoutStep === 'success' ? "bg-emerald-500" :
                        i <= ['cart', 'payment', 'success'].indexOf(cartCheckoutStep) ? "bg-[var(--theme-primary)]" : "bg-gray-100"
                      )} />
                    ))}
                  </div>
                </div>

                {/* === STEP 1: CART === */}
                {cartCheckoutStep === 'cart' && (
                  <>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-8 opacity-30">
                          <ShoppingBag size={56} strokeWidth={1} />
                          <p className="font-black uppercase tracking-widest text-xs">Carrinho Vazio</p>
                        </div>
                      ) : (
                        <div className="p-5 space-y-5">
                          {/* Products */}
                          <div className="space-y-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Produtos</p>
                            {cart.map((item: any) => (
                              <div key={item.cartItemId} className={cn("flex gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100", template === 'Futuristic' ? "!bg-white/5 !border-white/10" : "")}>
                                <div className={cn("w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-gray-100", template === 'Futuristic' ? "!bg-black/50 !border-white/5" : "")}>
                                  <img src={item.image_url?.split(',')[0]} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <h4 className="font-black text-[11px] leading-tight line-clamp-1 text-gray-900">{item.name}</h4>
                                  {item.sku && <p className="text-[9px] text-gray-400 font-bold">SKU: {item.sku}</p>}
                                  {item.selectedVariation && <p className="text-[9px] font-bold text-gray-400">{item.selectedVariation.name}: {item.selectedVariation.value}</p>}
                                  <div className="flex items-center justify-between pt-1">
                                    <div className={cn("flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-100 shadow-sm", template === 'Futuristic' ? "!bg-white/10 !border-white/20 !shadow-none" : "")}>
                                      <button onClick={() => updateCartQuantity(item.cartItemId, -1)} className="w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 transition-colors"><Minus size={10} /></button>
                                      <span className="text-[11px] font-black w-4 text-center">{item.quantity}</span>
                                      <button onClick={() => updateCartQuantity(item.cartItemId, 1)} className="w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 transition-colors"><Plus size={10} /></button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[13px] font-black text-gray-900">{((Number(item.price) * item.quantity)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                      <button onClick={() => removeFromCart(item.cartItemId)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Shipping zones */}
                          <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5"><Truck size={11} /> Região de Entrega</p>
                            <div className="grid grid-cols-2 gap-2">
                              {shippingZones.map((zone: any) => (
                                <button
                                  key={zone.label}
                                  onClick={() => setCartShippingZone(cartShippingZone?.label === zone.label ? null : zone)}
                                  className={cn('p-3 rounded-xl text-left border-2 transition-all', cartShippingZone?.label === zone.label ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/5' : 'border-gray-100 bg-gray-50 hover:border-gray-200', template === 'Futuristic' ? (cartShippingZone?.label === zone.label ? "!border-blue-500 !bg-blue-500/10" : "!border-white/10 !bg-white/5") : "")}
                                >
                                  <p className={cn("text-[10px] font-black leading-tight", cartShippingZone?.label === zone.label ? "text-[var(--theme-primary)]" : "text-gray-700")}>{zone.label}</p>
                                  <p className={cn("text-[11px] font-black mt-0.5", zone.price === 0 ? "text-gray-400" : "text-emerald-600")}>{zone.price === 0 ? 'A combinar' : `${(zone.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Customer data */}
                          <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5"><User size={11} /> Seus Dados</p>
                            <div className="space-y-2">
                              <input type="text" placeholder="Seu nome *" value={cartCustomerName} onChange={e => setCartCustomerName(e.target.value)}
                                className={cn("w-full px-4 py-3 rounded-xl border-2 text-xs font-bold text-gray-900 placeholder:text-gray-300 outline-none transition-colors bg-white", cartCustomerName.trim() ? "border-emerald-300 focus:border-emerald-500" : "border-gray-100 focus:border-[var(--theme-primary)]", template === 'Futuristic' ? "!bg-white/5 !border-white/10 !text-white focus:!border-blue-500" : "")} />
                              <input type="tel" placeholder="Telefone (opcional)" value={cartCustomerPhone} onChange={e => setCartCustomerPhone(e.target.value)}
                                className={cn("w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-xs font-bold text-gray-900 placeholder:text-gray-300 focus:border-[var(--theme-primary)] outline-none transition-colors bg-white", template === 'Futuristic' ? "!bg-white/5 !border-white/10 !text-white focus:!border-blue-500" : "")} />
                              <div className="grid grid-cols-3 gap-2">
                                <div className="relative col-span-1">
                                  <input type="text" placeholder="CEP" value={cartCep} onChange={e => handleCartCepLookup(e.target.value)}
                                    className={cn("w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-xs font-bold text-gray-900 placeholder:text-gray-300 focus:border-[var(--theme-primary)] outline-none transition-colors bg-white", (cepLoading || shippingLoading) && "pr-10", template === 'Futuristic' ? "!bg-white/5 !border-white/10 !text-white focus:!border-blue-500" : "")} />
                                  {(cepLoading || shippingLoading) && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                      <div className="w-4 h-4 border-2 border-[var(--theme-primary)]/20 border-t-[var(--theme-primary)] rounded-full animate-spin" />
                                    </div>
                                  )}
                                </div>
                                <input type="text" placeholder="Bairro (opcional)" value={cartNeighborhood} onChange={e => setCartNeighborhood(e.target.value)}
                                  className="col-span-2 px-4 py-3 rounded-xl border-2 border-gray-100 text-xs font-bold text-gray-900 placeholder:text-gray-300 focus:border-[var(--theme-primary)] outline-none transition-colors bg-white" />
                              </div>

                              {/* Dynamic Shipping Options */}
                              {shippingOptions.length > 0 && (
                                <div className="space-y-2 py-1">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Opções de Frete</p>
                                  <div className="grid grid-cols-1 gap-2">
                                    {shippingOptions.map((opt: any) => (
                                      <button
                                        key={opt.id}
                                        onClick={() => {
                                          setSelectedShipping(opt);
                                          setCartShippingZone(null); // Clear manual zone if dynamic is picked
                                        }}
                                        className={cn(
                                          'p-3 rounded-xl text-left border-2 transition-all flex items-center justify-between',
                                          selectedShipping?.id === opt.id ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/5' : 'border-gray-100 bg-white hover:border-gray-200'
                                        )}
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className="text-lg">{opt.icon}</span>
                                          <div>
                                            <p className={cn("text-[10px] font-black", selectedShipping?.id === opt.id ? "text-[var(--theme-primary)]" : "text-gray-700")}>{opt.name}</p>
                                            <p className="text-[9px] text-gray-400 font-bold">{opt.days}</p>
                                          </div>
                                        </div>
                                        <p className="text-[11px] font-black text-gray-900">{(opt.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <input type="text" placeholder="Rua e número (opcional)" value={cartDeliveryAddress} onChange={e => setCartDeliveryAddress(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-xs font-bold text-gray-900 placeholder:text-gray-300 focus:border-[var(--theme-primary)] outline-none transition-colors bg-white" />
                            </div>
                          </div>

                          {/* Order summary mini */}
                          <div className={cn("rounded-2xl border border-gray-100 overflow-hidden", template === 'Futuristic' ? "!border-white/10" : "")}>
                            <div className={cn("bg-gray-50 px-4 py-2.5 border-b border-gray-100", template === 'Futuristic' ? "!bg-white/5 !border-white/10" : "")}>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Resumo</p>
                            </div>
                            <div className="p-4 space-y-2">
                              <div className="flex justify-between"><span className="text-[11px] font-bold text-gray-500">Subtotal ({totalItemsQty} itens)</span><span className="text-[12px] font-black">{(cartTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                              <div className="flex justify-between"><span className="text-[11px] font-bold text-gray-500">Frete</span><span className={cn("text-[12px] font-black", cartShippingZone ? "text-gray-900" : "text-gray-400")}>{cartShippingZone ? (cartShippingZone.price === 0 ? 'A combinar' : `${(cartShippingZone.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`) : '—'}</span></div>
                              <div className="h-px bg-gray-100" />
                              <div className="flex justify-between"><span className="text-[13px] font-black">Total</span><span className="text-[17px] font-black">{(cartFinalTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                              <div className="flex justify-between"><span className="text-[10px] font-black text-emerald-600">Total no Pix</span><span className="text-[15px] font-black text-emerald-600">{(cartFinalPixTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cart footer */}
                    {cart.length > 0 && (
                      <div className={cn("p-5 border-t border-gray-100 bg-white shrink-0 space-y-2", template === 'Futuristic' ? "!bg-[#020617] !border-white/10" : "")}>
                        {!cartCustomerName.trim() && (
                          <p className="text-[10px] text-amber-600 font-bold text-center flex items-center justify-center gap-1">
                            <Info size={12} /> Informe seu nome para continuar
                          </p>
                        )}
                        <button
                          onClick={handleGoToCheckout}
                          className={cn(getButtonStyle("w-full h-14 text-white shadow-lg gap-3"), "bg-[var(--theme-primary)] hover:brightness-110")}
                        >
                          Continuar para Checkout
                          <ChevronRight size={18} />
                        </button>
                        <button
                          onClick={handleCartWhatsApp}
                          className="w-full h-11 rounded-xl border-2 border-[#25D366] text-[#25D366] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#25D366] hover:text-white transition-all"
                        >
                          <MessageCircle size={16} /> Finalizar via WhatsApp
                        </button>
                        <button onClick={closeCart} className="w-full text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-gray-500 transition-colors py-1">
                          ← Continuar Comprando
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* === STEP 2: PAYMENT === */}
                {cartCheckoutStep === 'payment' && (
                  <>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
                      {/* Mini order summary */}
                      <div className={cn("rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2", template === 'Futuristic' ? "!bg-white/5 !border-white/10" : "")}>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Resumo do Pedido</p>
                        {cart.map((item: any) => (
                          <div key={item.cartItemId} className="flex items-center gap-2 text-xs">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                              <img src={item.image_url?.split(',')[0]} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="flex-1 font-bold text-gray-700 line-clamp-1">{item.quantity}x {item.name}</span>
                            <span className="font-black text-gray-900">{((Number(item.price) * item.quantity)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          </div>
                        ))}
                        <div className="h-px bg-gray-200 mt-2 mb-1" />
                        {cartShippingZone && cartShippingZone.price > 0 && (
                          <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-gray-500">Frete ({cartShippingZone.label})</span>
                            <span className="font-black">{(cartShippingZone.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[12px] font-black text-gray-900">Total</span>
                          <span className="text-[18px] font-black text-gray-900">{(cartFinalTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        <div className="text-right text-[10px] font-black text-emerald-600">ou {(cartFinalPixTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} no Pix</div>
                      </div>

                      {/* Payment methods */}
                      <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Forma de Pagamento</p>

                        {/* PIX */}
                        <button
                          onClick={() => setCartPaymentMethod('pix')}
                          className={cn("w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all", cartPaymentMethod === 'pix' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white hover:border-gray-200', template === 'Futuristic' ? (cartPaymentMethod === 'pix' ? "!bg-emerald-500/10" : "!bg-white/5 !border-white/10") : "")}
                        >
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0", cartPaymentMethod === 'pix' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500', template === 'Futuristic' && cartPaymentMethod !== 'pix' ? "!bg-white/10 !text-white" : "")}>PIX</div>
                          <div className="flex-1">
                            <p className={cn("text-[12px] font-black", cartPaymentMethod === 'pix' ? 'text-emerald-700' : 'text-gray-900')}>Pagar com Pix</p>
                            <p className={cn("text-[10px] font-bold", cartPaymentMethod === 'pix' ? 'text-emerald-600' : 'text-gray-400')}>{(cartFinalPixTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} — aprovação imediata</p>
                          </div>
                          {cartPaymentMethod === 'pix' && <Check size={18} className="text-emerald-500 shrink-0" strokeWidth={3} />}
                        </button>

                        {/* CARD */}
                        <button
                          onClick={() => setCartPaymentMethod('card')}
                          className={cn("w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all", cartPaymentMethod === 'card' ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/5' : 'border-gray-100 bg-white hover:border-gray-200', template === 'Futuristic' ? (cartPaymentMethod === 'card' ? "!border-blue-500 !bg-blue-500/10" : "!bg-white/5 !border-white/10") : "")}
                        >
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", cartPaymentMethod === 'card' ? 'bg-[var(--theme-primary)] text-white' : 'bg-gray-100 text-gray-500', template === 'Futuristic' && cartPaymentMethod !== 'card' ? "!bg-white/10 !text-white" : "", template === 'Futuristic' && cartPaymentMethod === 'card' ? "!bg-blue-600" : "")}>
                            <CreditCard size={22} />
                          </div>
                          <div className="flex-1">
                            <p className={cn("text-[12px] font-black", cartPaymentMethod === 'card' ? 'text-[var(--theme-primary)]' : 'text-gray-900')}>Cartão de Crédito</p>
                            <p className={cn("text-[10px] font-bold", cartPaymentMethod === 'card' ? 'text-[var(--theme-primary)]/70' : 'text-gray-400')}>12x de {((cartFinalTotal / 12)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem juros</p>
                          </div>
                          {cartPaymentMethod === 'card' && <Check size={18} className="text-[var(--theme-primary)] shrink-0" strokeWidth={3} />}
                        </button>

                        {/* WHATSAPP */}
                        <button
                          onClick={() => setCartPaymentMethod('whatsapp')}
                          className={cn("w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all", cartPaymentMethod === 'whatsapp' ? 'border-[#25D366] bg-[#25D366]/5' : 'border-gray-100 bg-white hover:border-gray-200', template === 'Futuristic' ? (cartPaymentMethod === 'whatsapp' ? "!bg-[#25D366]/10" : "!bg-white/5 !border-white/10") : "")}
                        >
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", cartPaymentMethod === 'whatsapp' ? 'bg-[#25D366] text-white' : 'bg-gray-100 text-gray-500', template === 'Futuristic' && cartPaymentMethod !== 'whatsapp' ? "!bg-white/10 !text-white" : "")}>
                            <MessageCircle size={22} />
                          </div>
                          <div className="flex-1">
                            <p className={cn("text-[12px] font-black", cartPaymentMethod === 'whatsapp' ? 'text-[#25D366]' : 'text-gray-900')}>Combinar via WhatsApp</p>
                            <p className={cn("text-[10px] font-bold", cartPaymentMethod === 'whatsapp' ? 'text-[#25D366]/70' : 'text-gray-400')}>Fale diretamente com a loja</p>
                          </div>
                          {cartPaymentMethod === 'whatsapp' && <Check size={18} className="text-[#25D366] shrink-0" strokeWidth={3} />}
                        </button>
                      </div>

                      {/* Customer info preview */}
                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-2">Dados do Cliente</p>
                        <p className="text-[11px] font-bold text-gray-700">👤 {cartCustomerName}</p>
                        {cartCustomerPhone && <p className="text-[11px] font-bold text-gray-500">📱 {cartCustomerPhone}</p>}
                        {(cartDeliveryAddress || cartNeighborhood || cartCep) && (
                          <div className="pt-1">
                            <p className="text-[11px] font-bold text-gray-500 flex items-start gap-1">
                              <span className="shrink-0 mt-0.5">📍</span>
                              <span>{[cartDeliveryAddress, cartNeighborhood, cartCep].filter(Boolean).join(' — ')}</span>
                            </p>
                            {selectedShipping && (
                              <p className="text-[11px] font-black text-[var(--theme-primary)] flex items-center gap-1 mt-1">
                                <Truck size={12} /> {selectedShipping.name} — {(selectedShipping.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </p>
                            )}
                          </div>
                        )}
                        {cartShippingZone && <p className="text-[11px] font-bold text-gray-500">🚚 {cartShippingZone.label}</p>}
                        <button onClick={() => setCartCheckoutStep('cart')} className="text-[9px] font-black text-blue-400 hover:text-blue-600 uppercase tracking-widest mt-1 block">Editar dados ↗</button>
                      </div>
                    </div>

                    {/* Payment footer */}
                    <div className={cn("p-5 border-t border-gray-100 bg-white shrink-0 space-y-2", template === 'Futuristic' ? "!bg-[#020617] !border-white/10" : "")}>
                      <button
                        onClick={handleCartPaymentConfirm}
                        disabled={cartBrickLoading}
                        className={cn(
                          getButtonStyle("w-full h-14 text-white shadow-lg gap-3"),
                          cartPaymentMethod === 'whatsapp' ? "bg-[#25D366] hover:brightness-110 shadow-[#25D366]/20" :
                          cartPaymentMethod === 'card' ? "bg-[var(--theme-primary)] hover:brightness-110" :
                          "bg-emerald-500 hover:bg-emerald-600",
                          cartBrickLoading && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        {cartBrickLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processando...
                          </>
                        ) : cartPaymentMethod === 'whatsapp' ? (
                          <><MessageCircle size={18} /> Enviar Pedido no WhatsApp</>
                        ) : cartPaymentMethod === 'card' ? (
                          <><CreditCard size={18} /> Pagar com Cartão</>
                        ) : (
                          <><span className="font-black text-sm">PIX</span> Pagar com Pix</>
                        )}
                      </button>
                      <p className="text-[9px] text-gray-400 font-bold text-center flex items-center justify-center gap-1">
                        <ShieldCheck size={11} className="text-emerald-500" /> Compra 100% segura e protegida
                      </p>
                    </div>
                  </>
                )}

                {/* === STEP 3: SUCCESS === */}
                {cartCheckoutStep === 'success' && (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center"
                    >
                      <CheckCircle2 size={50} className="text-emerald-500" />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
                      <h3 className="text-2xl font-black text-gray-900">Pedido Realizado!</h3>
                      <p className="text-sm text-gray-500 font-bold leading-relaxed">
                        {cartPaymentMethod === 'whatsapp'
                          ? 'Sua mensagem foi enviada. Aguarde o contato da loja para confirmar seu pedido.'
                          : 'Seu pedido foi registrado. Complete o pagamento na janela que foi aberta.'}
                      </p>
                    </motion.div>

                    {/* Mini order recap */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full rounded-2xl border border-gray-100 p-4 text-left space-y-2 bg-gray-50">
                      <div className="flex justify-between text-[11px]"><span className="font-bold text-gray-500">Total pago</span><span className="font-black text-gray-900">{((cartPaymentMethod === 'pix' ? cartFinalPixTotal : cartFinalTotal)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                      <div className="flex justify-between text-[11px]"><span className="font-bold text-gray-500">Forma de pagamento</span><span className="font-black text-gray-900 capitalize">{cartPaymentMethod === 'pix' ? 'Pix' : cartPaymentMethod === 'card' ? 'Cartão' : 'WhatsApp'}</span></div>
                      <div className="flex justify-between text-[11px]"><span className="font-bold text-gray-500">Status</span><span className="font-black text-amber-600">Pendente</span></div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="w-full space-y-3">
                      {customerSession?.user && (
                        <button
                          onClick={closeCart}
                          className={cn(getButtonStyle("w-full h-12 text-white shadow-lg gap-2"), "bg-[var(--theme-primary)]")}
                        >
                          <Package size={16} /> Pedido Salvo — Fechar
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setCart([]);
                          setCartCustomerName('');
                          setCartCustomerPhone('');
                          setCartDeliveryAddress('');
                          setCartNeighborhood('');
                          setCartCep('');
                          setCartShippingZone(null);
                          setShippingOptions([]);
                          setSelectedShipping(null);
                          setCartOrderId('');
                          closeCart();
                        }}
                        className="w-full h-11 rounded-xl border-2 border-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest hover:border-gray-300 hover:text-gray-700 transition-all"
                      >
                        Continuar Comprando
                      </button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {renderCheckoutModal()}

      {/* Professional Footer */}
      {isMegaStore ? renderMegaFooter() : (
        <footer className="bg-[#0b0b0b] text-white">
          {renderTrustSection()}

          <div className="max-w-7xl mx-auto px-4 py-20 border-t border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
              <div className="space-y-6 md:col-span-1">
                <div className="flex items-center gap-3">
                  {store.logo_url ? <img src={store.logo_url} className="h-10 filter brightness-0 invert" alt={store.name} /> : <div className="h-10 w-10 bg-white text-black font-black flex items-center justify-center rounded-xl">N</div>}
                  <span className="text-2xl font-black tracking-tighter italic uppercase">{store.name}</span>
                </div>
                <p className="text-gray-500 text-xs font-bold leading-relaxed pr-4">
                  {store.description || "Simplificando sua vida com produtos inovadores e atendimento excepcional."}
                </p>
                <div className="flex gap-4">
                  {store.instagram_url && (
                    <a href={store.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#E4405F] hover:text-white text-gray-400 transition-all cursor-pointer"><Instagram size={18} /></a>
                  )}
                  {store.facebook_url && (
                    <a href={store.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1877F2] hover:text-white text-gray-400 transition-all cursor-pointer"><Facebook size={18} /></a>
                  )}
                  {store.youtube_url && (
                    <a href={store.youtube_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#FF0000] hover:text-white text-gray-400 transition-all cursor-pointer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd"></path></svg>
                    </a>
                  )}
                  {store.telegram_url && (
                    <a href={store.telegram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#0088cc] hover:text-white text-gray-400 transition-all cursor-pointer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                    </a>
                  )}
                  {store.x_url && (
                    <a href={store.x_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black text-gray-400 transition-all cursor-pointer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f70]">Departamentos</h5>
                  <ul className="space-y-4">
                    {categories.slice(0, 4).map(c => (
                      <li key={c.id} className="flex flex-col">
                        <button onClick={() => { setActiveCategory(c.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-[11px] text-gray-500 hover:text-white transition-all font-black uppercase tracking-widest flex items-center gap-2 group w-full text-left py-1">
                          <ChevronRight size={12} className="text-[#f70] transition-transform duration-300 group-hover:translate-x-1" />
                          {c.name}
                        </button>
                      </li>
                    ))}
                    <li className="flex flex-col">
                      <button onClick={() => { setActiveCategory(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-[11px] text-gray-500 hover:text-[#f70] transition-all font-black uppercase tracking-widest flex items-center gap-2 group w-full text-left py-1">
                        <ChevronRight size={12} className="text-[#f70] transition-transform duration-300 group-hover:translate-x-1" />
                        Todos os Produtos
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f70]">Institucional</h5>
                  <ul className="space-y-4">
                    <li className="flex flex-col">
                      <button className="text-[11px] text-gray-500 hover:text-white transition-all font-black uppercase tracking-widest flex items-center gap-2 group w-full text-left py-1">
                        <ChevronRight size={12} className="text-[#f70] transition-transform duration-300 group-hover:translate-x-1" />
                        Sobre Nós
                      </button>
                    </li>
                    <li className="flex flex-col">
                      <button className="text-[11px] text-gray-500 hover:text-white transition-all font-black uppercase tracking-widest flex items-center gap-2 group w-full text-left py-1">
                        <ChevronRight size={12} className="text-[#f70] transition-transform duration-300 group-hover:translate-x-1" />
                        Políticas de Troca
                      </button>
                    </li>
                    <li className="flex flex-col">
                      <button className="text-[11px] text-gray-500 hover:text-white transition-all font-black uppercase tracking-widest flex items-center gap-2 group w-full text-left py-1">
                        <ChevronRight size={12} className="text-[#f70] transition-transform duration-300 group-hover:translate-x-1" />
                        Prazos de Entrega
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f70]">Suporte</h5>
                  <ul className="space-y-4">
                    {store.whatsapp && (
                      <li className="flex flex-col">
                        <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-gray-500 hover:text-[#25D366] transition-all font-black uppercase tracking-widest flex items-center gap-2 group w-full text-left py-1">
                          <MessageCircle size={14} className="text-[#25D366] transition-transform duration-300 group-hover:translate-x-1" />
                          Fale Conosco
                        </a>
                      </li>
                    )}
                    {store.email && (
                      <li className="flex flex-col">
                        <a href={`mailto:${store.email}`} className="text-[11px] text-gray-500 hover:text-white transition-all font-black uppercase tracking-widest flex items-center gap-2 group w-full text-left py-1">
                          <Mail size={14} className="text-[#f70] transition-transform duration-300 group-hover:translate-x-1" />
                          E-mail
                        </a>
                      </li>
                    )}
                    {store.address && (
                      <li className="flex flex-col">
                        <div className="text-[11px] text-gray-500 hover:text-white transition-all font-black uppercase tracking-widest flex items-start gap-2 group w-full text-left py-1 leading-relaxed">
                          <MapPin size={14} className="text-[#f70] shrink-0 mt-0.5" />
                          <span className="normal-case tracking-normal">{store.address}</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>

              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16">
              {/* Payment Methods */}
              <div className="space-y-8">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f70]">Formas de Pagamento</h5>
                <div className="flex flex-wrap gap-6 items-center">
                  {/* White Card Pill */}
                  <div className="bg-white px-4 py-2 rounded-full flex items-center gap-3 shadow-lg">
                    <img
                      src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/visa.svg"
                      className="h-4 object-contain"
                      alt="Visa"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <img
                      src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/mastercard.svg"
                      className="h-6 object-contain"
                      alt="Mastercard"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <img
                      src="https://raw.githubusercontent.com/adrianosena/logos-pagamentos-brasil/master/hipercard.svg"
                      className="h-5 object-contain"
                      alt="Hipercard"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <img
                      src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/amex.svg"
                      className="h-5 object-contain"
                      alt="Amex"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <img
                      src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/elo.svg"
                      className="h-5 object-contain"
                      alt="Elo"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/nubank.svg"
                      className="h-5 object-contain"
                      alt="Nubank"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <img
                      src="https://www.lojasbecker.com.br/arquivos/logo-pix-branco-poweredby.png?v=637512347230000000"
                      className="h-7 object-contain ml-3"
                      alt="Pix powered by Banco Central"
                      onError={(e) => {
                        e.currentTarget.src = "https://logodownload.org/wp-content/uploads/2020/02/pix-logo-1.png";
                        e.currentTarget.className = "h-4 object-contain ml-3 brightness-0 invert opacity-80";
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Security Certificates */}
              <div className="space-y-8 md:text-right">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f70]">Segurança</h5>
                <div className="flex flex-wrap gap-4 md:justify-end items-center">
                  {/* Google Safe Browsing */}
                  <div className="bg-white/5 border border-white/10 p-2 rounded-xl flex items-center gap-2">
                    <img
                      src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/google-icon.svg"
                      className="h-4 grayscale invert brightness-200"
                      alt="Google"
                      onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')}
                    />
                    <span className="text-[8px] font-black uppercase text-emerald-500">Site Seguro</span>
                  </div>

                  {/* Cloudflare */}
                  <div className="bg-white/5 border border-white/10 p-2 rounded-xl">
                    <img
                      src="https://raw.githubusercontent.com/gilbarbara/logos/master/logos/cloudflare.svg"
                      className="h-5 grayscale invert brightness-200"
                      alt="Cloudflare"
                      onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')}
                    />
                  </div>

                  {/* Site Blindado */}
                  <div className="bg-white/5 border border-emerald-500/30 px-3 py-2 rounded-xl flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[9px] font-black text-emerald-500 uppercase">Site Blindado</span>
                      <span className="text-[6px] text-emerald-500/50 uppercase font-bold">Auditado em {new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Reclame Aqui Selection */}
                  <div className="bg-[#1a1a1a] border border-gray-800 p-2 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-[#00ff00] italic">Reclame AQUI</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3 border-t border-white/5 pt-12 pb-6">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{store.razao_social || store.name.toUpperCase()} | CNPJ: {store.cnpj || '00.000.000/0001-00'}</p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest text-center">© {new Date().getFullYear()} Todos os direitos reservados</p>
                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-800" />
                <p className="text-[9px] font-black text-emerald-500/50 uppercase tracking-[0.3em] italic">Nexlyra.Commerce Platform</p>
              </div>
            </div>
          </div>
        </footer>
      )}
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] group">
        <a
          href={`https://wa.me/${store.whatsapp?.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-16 h-16 md:w-20 md:h-20 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(37,211,102,0.4)] hover:shadow-[0_25px_60px_rgba(37,211,102,0.5)] hover:-translate-y-2 hover:scale-110 transition-all duration-500 relative group active:scale-95 border border-white/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping-slow opacity-20 group-hover:opacity-40" />
          <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10 text-white fill-current fill-white drop-shadow-md">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="absolute right-full mr-8 bg-white/90 backdrop-blur-md text-[#25D366] px-6 py-3 rounded-2xl text-[10px] font-black shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-10 group-hover:translate-x-0 pointer-events-none whitespace-nowrap uppercase tracking-[0.3em] border border-emerald-50/50">
            Fale Conosco
            <div className="absolute -bottom-1.5 right-10 w-3 h-3 bg-white/90 rotate-45 border-r border-b border-emerald-50/50" />
          </span>
        </a>
      </div>


      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full z-10">
                <X size={20} />
              </button>
              <div className="p-10">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[var(--theme-primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User size={32} className="text-[var(--theme-primary)]" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">
                    {authMode === 'login' ? 'Entrar na conta' : 'Criar conta'}
                  </h2>
                  <p className="text-gray-400 text-xs mt-2 font-medium">
                    {authMode === 'login' ? 'Acesse sua conta para ver seus pedidos' : 'Junte-se e acompanhe seus pedidos'}
                  </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">E-mail</label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)]"
                      required
                    />
                  </div>
                   <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Senha</label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-[10px] font-black text-[var(--theme-primary)] hover:underline uppercase tracking-widest"
                        >
                          Esqueceu a senha?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showAuthPassword ? "text" : "password"}
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] bg-gray-50 focus:bg-white transition-all pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAuthPassword(!showAuthPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showAuthPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-3 rounded-xl">
                      {authError}
                    </div>
                  )}

                   <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-14 bg-[var(--theme-primary)] text-white font-black uppercase tracking-widest text-xs rounded-xl hover:brightness-90 transition-all shadow-lg shadow-[var(--theme-primary)]/10 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {authLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                    {authMode === 'login' ? 'Entrar' : 'Criar conta'}
                  </button>
                </form>

                {authMode === 'login' && (
                  <>
                    <div className="my-6 flex items-center gap-4">
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">OU</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <button
                      onClick={handleGoogleAuth}
                      disabled={authLoading}
                      className="w-full bg-white border border-gray-100 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-70"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span className="text-xs font-black uppercase tracking-widest">Entrar com Google</span>
                    </button>
                  </>
                )}

                <p className="text-center text-xs text-gray-400 mt-6 font-medium">
                  {authMode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
                  <button
                    onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(null); }}
                    className="text-[var(--theme-primary)] font-black hover:underline"
                  >
                    {authMode === 'login' ? 'Cadastre-se' : 'Entrar'}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Dashboard Overlay */}
      <AnimatePresence>
        {showOrders && (
          <div className="fixed inset-0 z-[200] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowOrders(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-6 pb-4">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight italic leading-tight">Central do Cliente</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Sua conta, seus pedidos e favoritos</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => { await supabase.auth.signOut(); setShowOrders(false); showNotification('Sessão encerrada', 'info'); }}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-50 text-orange-400 hover:bg-orange-100 transition-colors"
                    title="Sair"
                  >
                    <LogOut size={18} />
                  </button>
                  <button onClick={() => setShowOrders(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex mx-6 mb-4 bg-gray-100 rounded-2xl p-1 gap-1">
                {(['profile', 'orders', 'favorites'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveDashboardTab(tab)}
                    className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeDashboardTab === tab
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {tab === 'profile' ? 'Dados' : tab === 'orders' ? 'Pedidos' : 'Favoritos'}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar space-y-4">

                {/* DADOS Tab */}
                {activeDashboardTab === 'profile' && (
                  <div className="space-y-4">
                    {/* Welcome Card */}
                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                        <User size={28} className="text-[var(--theme-primary)]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bem-vindo(a),</p>
                        <p className="text-lg font-black uppercase tracking-tight text-gray-900 leading-tight">
                          {profileState.name || customerSession?.user?.user_metadata?.full_name || customerSession?.user?.email?.split('@')[0] || 'Cliente'}
                        </p>
                      </div>
                    </div>

                    {/* E-mail */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">E-mail de Acesso</p>
                      <div className="border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
                        <p className="text-sm font-medium text-gray-700">{customerSession?.user?.email}</p>
                      </div>
                    </div>

                    {/* Tipo de Cliente */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tipo de Cliente</p>
                      <div className="border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        <p className="text-sm font-black text-emerald-600">Verificado Nexlyra</p>
                      </div>
                    </div>

                    {/* Dados Básicos */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Nome Completo</p>
                        <input
                          type="text"
                          value={profileState.name}
                          onChange={(e) => setProfileState(p => ({ ...p, name: e.target.value }))}
                          placeholder="Seu nome completo"
                          className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] focus:bg-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Telefone</p>
                        <input
                          type="text"
                          value={profileState.phone}
                          onChange={(e) => setProfileState(p => ({ ...p, phone: e.target.value }))}
                          placeholder="(00) 00000-0000"
                          className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 sm:col-span-5 space-y-1.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">CEP</p>
                        <input
                          type="text"
                          value={profileState.cep}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                            setProfileState(p => ({ ...p, cep: val }));
                            if (val.length === 8) handleCepLookup(val);
                          }}
                          onBlur={() => handleCepLookup(profileState.cep)}
                          placeholder="00000-000"
                          className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] focus:bg-white transition-all"
                        />
                      </div>
                      <div className="col-span-8 space-y-1.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Endereço (Rua)</p>
                        <input
                          type="text"
                          value={profileState.address}
                          onChange={(e) => setProfileState(p => ({ ...p, address: e.target.value }))}
                          placeholder="Nome da rua/avenida"
                          className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] focus:bg-white transition-all"
                        />
                      </div>
                      <div className="col-span-4 space-y-1.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Número</p>
                        <input
                          type="text"
                          value={profileState.number}
                          onChange={(e) => setProfileState(p => ({ ...p, number: e.target.value }))}
                          placeholder="123"
                          className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] focus:bg-white transition-all"
                        />
                      </div>
                      <div className="col-span-8 space-y-1.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Cidade</p>
                        <input
                          type="text"
                          value={profileState.city}
                          onChange={(e) => setProfileState(p => ({ ...p, city: e.target.value }))}
                          placeholder="Cidade"
                          className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] focus:bg-white transition-all"
                        />
                      </div>
                      <div className="col-span-4 space-y-1.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Estado</p>
                        <input
                          type="text"
                          value={profileState.state}
                          onChange={(e) => setProfileState(p => ({ ...p, state: e.target.value }))}
                          placeholder="UF"
                          maxLength={2}
                          className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] focus:bg-white transition-all uppercase"
                        />
                      </div>
                    </div>

                    {/* Settings Card */}
                    <div className="bg-orange-50 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-[var(--theme-primary)]" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-primary)]">Configurações</p>
                      </div>
                      <p className="text-[10px] font-bold text-orange-600/80 uppercase tracking-wide leading-relaxed">
                        As preferências de e-mail e notificações estão ativadas para sua conta.
                      </p>
                      <button
                        onClick={updateProfile}
                        disabled={authLoading}
                        className="w-full h-10 border border-orange-200 bg-white text-[var(--theme-primary)] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-50 transition-all disabled:opacity-60"
                      >
                        {authLoading ? 'Salvando...' : 'Alterar Preferências'}
                      </button>
                    </div>
                  </div>
                )}

                {/* PEDIDOS Tab */}
                {activeDashboardTab === 'orders' && (
                  <div className="space-y-4">
                    {customerOrders.length === 0 ? (
                      <div className="text-center py-16 text-gray-300 space-y-4">
                        <Package size={48} strokeWidth={1} className="mx-auto" />
                        <p className="font-black uppercase text-xs tracking-widest text-gray-400">Nenhum pedido ainda</p>
                        <p className="text-xs text-gray-300">Seus pedidos aparecerão aqui após a confirmação</p>
                      </div>
                    ) : (
                      customerOrders.map((order: any) => {
                        const isExpanded = expandedTrackingOrderId === order.id;
                        const logs = orderTrackingLogs[order.id] || [];
                        const ALL_STEPS = ['Pendente', 'Pago', 'Preparando', 'Enviado', 'Entregue'];
                        const stepIdx = ALL_STEPS.indexOf(order.status);
                        const statusColor = (
                          order.status === 'Cancelado' ? 'bg-red-50 text-red-600 border-red-100' :
                          order.status === 'Pago' || order.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          order.status === 'Entregue' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          order.status === 'Enviado' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                          order.status === 'Preparando' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          'bg-orange-50 text-orange-600 border-orange-100'
                        );
                        return (
                          <div key={order.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 transition-colors">
                            {/* Order Summary Row */}
                            <div
                              className="p-4 space-y-3 cursor-pointer"
                              onClick={() => handleExpandTracking(order.id)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                  Pedido #{order.id?.slice(0, 8)}
                                </span>
                                <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border ${statusColor}`}>
                                  {order.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-xl font-black">{(Number(order.total)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                <p className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                              </div>

                              {/* Tracking Code and Link */}
                              {order.tracking_code && (
                                <div className="bg-blue-50/50 rounded-xl p-3 flex items-center justify-between border border-blue-100/50">
                                  <div className="flex items-center gap-2">
                                    <Truck size={14} className="text-blue-600" />
                                    <div>
                                      <p className="text-[8px] font-black uppercase tracking-widest text-blue-400">Código de Rastreio</p>
                                      <p className="text-xs font-black text-blue-700 font-mono tracking-wider">{order.tracking_code}</p>
                                    </div>
                                  </div>
                                  <a 
                                    href={`https://www.melhorenvio.com.br/rastreio/${order.tracking_code}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                                  >
                                    Rastrear <ExternalLink size={10} />
                                  </a>
                                </div>
                              )}

                              {/* Progress bar for non-cancelled orders */}
                              {order.status !== 'Cancelado' && stepIdx >= 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                  {ALL_STEPS.map((step, i) => (
                                    <div key={step} className="flex-1 flex flex-col items-center gap-1">
                                      <div className={`w-full h-1.5 rounded-full transition-colors ${
                                        i <= stepIdx ? 'bg-[var(--theme-primary)]' : 'bg-gray-100'
                                      }`} />
                                      <span className={`text-[8px] font-bold truncate w-full text-center ${
                                        i === stepIdx ? 'text-[var(--theme-primary)]' : i < stepIdx ? 'text-gray-400' : 'text-gray-200'
                                      }`}>{step}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <p className="text-[10px] text-[var(--theme-primary)] font-black text-right">
                                {isExpanded ? '▲ Ocultar histórico' : '▼ Ver histórico completo'}
                              </p>
                            </div>

                            {/* Tracking Timeline */}
                            {isExpanded && (
                              <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">📍 Rastreio do Pedido</p>
                                {logs.length === 0 ? (
                                  <p className="text-xs text-gray-400 italic">Nenhuma atualização disponível ainda.</p>
                                ) : (
                                  <div className="relative pl-6">
                                    <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />
                                    {logs.map((log: any, idx: number) => (
                                      <div key={log.id} className="relative mb-4 last:mb-0">
                                        <div className={`absolute -left-[23px] w-4 h-4 rounded-full border-2 border-white shadow ${
                                          idx === logs.length - 1 ? 'bg-[var(--theme-primary)]' : 'bg-emerald-400'
                                        }`} />
                                        <p className="text-[11px] font-black text-gray-800">{log.description || log.status}</p>
                                        <p className="text-[9px] text-gray-400 mt-0.5">
                                          {new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* FAVORITOS Tab */}
                {activeDashboardTab === 'favorites' && (
                  <div className="space-y-4">
                    {favorites.length === 0 ? (
                      <div className="text-center py-16 text-gray-300 space-y-4">
                        <Heart size={48} strokeWidth={1} className="mx-auto" />
                        <p className="font-black uppercase text-xs tracking-widest text-gray-400">Nenhum favorito salvo</p>
                        <p className="text-xs text-gray-300">Clique no coração nos produtos para salvar aqui</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {favorites.map((product: any) => (
                          <div key={product.id} className="border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-gray-50 overflow-hidden relative">
                              <img src={product.image_url?.split(',')[0]} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                              <button
                                onClick={() => toggleFavorite(product)}
                                className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                              >
                                <Heart size={14} className="text-red-500 fill-current" />
                              </button>
                            </div>
                            <div className="p-3">
                              <p className="text-[10px] font-black text-gray-800 line-clamp-2 uppercase leading-tight">{product.name}</p>
                              <p className="text-sm font-black text-[var(--theme-primary)] mt-1">{(Number(product.price)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                              <button
                                onClick={() => { setSelectedProduct(product); setShowOrders(false); }}
                                className="mt-2 w-full h-8 bg-[var(--theme-primary)] text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:brightness-90 transition-all"
                              >
                                Ver produto
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {renderNotification()}
      {renderLightbox()}
    </div>
  );
};

// Main StorefrontView Component Export
export default StorefrontView;
