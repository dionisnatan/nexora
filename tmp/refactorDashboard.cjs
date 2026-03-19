const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove dashboardData
const dashDataRegex = /\/\/ \-\-\- Mock Data \-\-\-[\s\S]+?(?=\/\/ \-\-\- Components \-\-\-)/;
file = file.replace(dashDataRegex, '\n\n');

// 2. Replace DashboardView component
const dashboardViewRegex = /(const DashboardView = [\s\S]+?)(const AppearanceView = )/;

const newDashboardView = `const DashboardView = ({ onAction, onNavigate, storeId }: { onAction: (msg: string) => void; onNavigate: (view: View) => void; storeId: string | null }) => {
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
        
        let ordersQuery = supabase.from('orders').select('*').gte('created_at', start.toISOString());
        let productsQuery = supabase.from('products').select('*');
        let todayOrdersQuery = supabase.from('orders').select('id, created_at');

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        todayOrdersQuery = todayOrdersQuery.gte('created_at', todayStart.toISOString());
        
        if (storeId) {
          ordersQuery = ordersQuery.eq('store_id', storeId);
          productsQuery = productsQuery.eq('store_id', storeId);
          todayOrdersQuery = todayOrdersQuery.eq('store_id', storeId);
        }
        
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
          pedidosSub: \`\${todayOrdersCount} hoje\`,
          produtos: String(products.length),
          produtosSub: \`\${ativosNum} ativos\`,
          pendentes: String(pendentesNum),
          pendentesSub: 'Aguardando ação'
        });
        
        const groupedSales = new Map<string, number>();
        if (timeRange === 'Hoje') {
          for(let i = 0; i <= now.getHours(); i++) {
            groupedSales.set(i.toString().padStart(2, '0') + ':00', 0);
          }
        } else if (timeRange === '7 dias' || timeRange === '30 dias') {
          const days = timeRange === '7 dias' ? 6 : 29;
          for(let i = days; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            groupedSales.set(\`\${d.getDate().toString().padStart(2,'0')}/\${(d.getMonth()+1).toString().padStart(2,'0')}\`, 0);
          }
        } else if (timeRange === '12 meses') {
           for(let i = 11; i >= 0; i--) {
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
             key = \`\${d.getDate().toString().padStart(2,'0')}/\${(d.getMonth()+1).toString().padStart(2,'0')}\`;
           } else {
             const monthStr = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
             key = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
           }
           if(groupedSales.has(key)) {
             groupedSales.set(key, groupedSales.get(key)! + (Number(o.total) || 0));
           } else {
             groupedSales.set(key, (Number(o.total) || 0));
           }
        });
        
        setChartData(Array.from(groupedSales.entries()).map(([date, sales]) => ({ date, sales })));
        
        const sortedOrders = [...orders].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecentOrders(sortedOrders.slice(0, 5).map(o => ({
           id: o.id,
           name: o.customer_name || 'Desconhecido',
           email: o.customer_email || '-',
           date: new Date(o.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''),
           value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(o.total)||0),
           status: o.status || 'Pendente'
        })));
        
        const productSales = new Map<string, {name: string, sales: number, img: string}>();
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
          .sort((a,b) => b.sales - a.sales)
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
        value={metrics.faturamento}
        subtext={metrics.pedidosSub.includes('hoje') ? 'Pedidos pagos' : 'Pedidos pagos'} 
        color="bg-blue-50 text-blue-600"
      />
      <StatCard
        icon={ShoppingCart}
        label="Pedidos"
        value={metrics.pedidos}
        subtext={metrics.pedidosSub}
        color="bg-indigo-50 text-indigo-600"
      />
      <StatCard
        icon={Box}
        label="Produtos"
        value={metrics.produtos}
        subtext={metrics.produtosSub}
        color="bg-purple-50 text-purple-600"
      />
      <StatCard
        icon={TrendingUp}
        label="Pendentes"
        value={metrics.pendentes}
        subtext={metrics.pendentesSub}
        color="bg-orange-50 text-orange-600"
      />
    </div>

    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Vendas</h2>
          <p className="text-sm text-gray-500">{timeRange === 'Hoje' ? 'Hoje' : \`Últimos \${timeRange}\`}</p>
        </div>
        <div className="flex items-center p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
          {(['Hoje', '7 dias', '30 dias', '12 meses'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                timeRange === range
                  ? "bg-[#5551FF] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {range}
            </button>
          ))}
        </div>
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
              tickFormatter={(val) => 
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)
              }
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              dx={-10}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(val) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val), 'Faturamento']}
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
            <p className="text-sm text-gray-500">{recentOrders.length} pedido(s) no total</p>
          </div>
          <button
            onClick={() => onNavigate('pedidos')}
            className="text-[#5551FF] text-sm font-bold flex items-center gap-1 hover:underline"
          >
            Ver todos <ArrowRight size={14} />
          </button>
        </div>
        <div className="space-y-4">
          {recentOrders.length > 0 ? recentOrders.map((order) => (
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
                  order.status === 'Cancelado' || order.status === 'Recusado' ? "bg-red-50 text-red-500" : 
                  order.status === 'Pago' || order.status === 'Aprovado' ? "bg-emerald-50 text-emerald-500" :
                  "bg-orange-50 text-orange-500"
                )}>
                  {order.status}
                </span>
              </div>
            </div>
          )) : (
            <p className="text-sm text-gray-400 py-4 text-center">Nenhum pedido no período.</p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Mais vendidos</h2>
        <p className="text-sm text-gray-500 mb-6">Por quantidade de pedidos</p>
        <div className="space-y-6">
          {bestSellers.length > 0 ? bestSellers.map((product) => (
            <div key={product.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={product.image || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/40'; }} />
                  <span className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{product.name}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{product.sales} vendas</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: \`\${product.percentage}%\` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#5551FF] rounded-full"
                />
              </div>
            </div>
          )) : (
            <p className="text-sm text-gray-400 py-4 text-center">Nenhuma venda registrada.</p>
          )}
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
};
\nconst AppearanceView = `;

file = file.replace(dashboardViewRegex, newDashboardView);

// 3. Update 'pedidos' view inside App.tsx
// It's defined inline: {currentView === 'pedidos' && (() => {
// We replace the filtering line that used dashboardData

const pedidosViewRegex = /{currentView === 'pedidos' && \(\(\) => {[\s\S]+?const filteredOrders = dashboardData\['30 dias'\].recentOrders.filter\(order => orderTab === 'Todos' \|\| order\.status === orderTab\);/;

const newPedidosView = `{currentView === 'pedidos' && <OrdersView session={session} storeId={storeId} onAction={notify}/>}`;

// Wait, doing this means we need <OrdersView> as a standalone component.
// Instead of replacing the entire inline component, let's just create an inline hook to fetch real orders for that view.
// But we cannot use hooks inside an inline `() => { ... }` block! It throws React Rules of Hooks.
// Instead, I will append an OrdersView component above DashboardView, and replace the inline code with it.

const ordersViewComponent = `
const OrdersView = ({ session, storeId, onAction }: { session: any, storeId: string | null, onAction: (msg: string) => void }) => {
  const [orderTab, setOrderTab] = useState('Todos');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    return () => { isMounted = false; };
  }, [storeId]);

  const filteredOrders = orders.filter(order => orderTab === 'Todos' || order.status === orderTab);

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
            {filteredOrders.map((order) => {
              const customerName = order.customer_name || 'Desconhecido';
              return (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 gap-4 sm:gap-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-[#5551FF] font-bold text-sm shrink-0">
                      {customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{customerName}</h4>
                      <p className="text-xs text-gray-400 truncate">{order.customer_email || '-'} • {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-sm font-bold text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.total)||0)}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                      order.status === 'Cancelado' || order.status === 'Recusado' ? "bg-red-50 text-red-500" : 
                      order.status === 'Pago' || order.status === 'Aprovado' ? "bg-emerald-50 text-emerald-500" :
                      "bg-orange-50 text-orange-500"
                    )}>
                      {order.status || 'Pendente'}
                    </span>
                  </div>
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
`

// Insert OrdersView right above DashboardView in the source
file = file.replace('const DashboardView = ', ordersViewComponent + '\nconst DashboardView = ');

// Now replace the inline pedidos view inside App.tsx rendering
const inlinePedidosRegex = /\{currentView === 'pedidos' && \(\(\) => \{[\s\S]+?\}\)\(\)\}/;
file = file.replace(inlinePedidosRegex, "{currentView === 'pedidos' && <OrdersView session={session} storeId={storeId} onAction={notify}/>}");

fs.writeFileSync('src/App.tsx', file, 'utf-8');
console.log("Refactoring absolute success.");
