const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/DIONIS/Downloads/nexora-dashboard/src/views/StorefrontView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const translations = [
  ["Tell a friends about", "Indique para amigos"],
  ["& get 30% off your next order.", "e ganhe descontos no próximo pedido."],
  ["Track Order", "Rastrear Pedido"],
  ["Help Center", "Central de Ajuda"],
  ["All Categories", "Todas as Categorias"],
  ["Search product here...", "Buscar produto aqui..."],
  ["Account", "Minha Conta"],
  ["Log In", "Entrar"],
  ["My Cart", "Meu Carrinho"],
  ["BROWSE ALL CATEGORY", "NAVEGAR CATEGORIAS"],
  ["['Home', 'Shop', 'Categories', 'Products', 'Top Deals', 'Elements']", "['Início', 'Loja', 'Categorias', 'Produtos', 'Ofertas', 'Contato']"],
  ["Today's Deal", "Oferta do Dia"],
  ["Flat 20% Discount", "Até 20% de Desconto"],
  ["Mega Oferta", "Mega Oferta"],
  [">From<", ">A partir de<"],
  ['<span className="text-gray-500 font-bold">From</span>', '<span className="text-gray-500 font-bold">De</span>'],
  ["SHOP NOW", "COMPRAR AGORA"],
  ["Shop Now", "Comprar Agora"],
  ["Shop By Category", "Comprar por Categoria"],
  ["Special Offer", "Oferta Especial"],
  ["Free Shipping", "Frete Grátis"],
  ["For all Orders Over $100", "Para todos os pedidos acima de R$ 100"],
  ["30 Days Returns", "Devolução em 30 Dias"],
  ["For an Exchange Product", "Para trocas de produtos"],
  ["Secured Payment", "Pagamento Seguro"],
  ["Payment Cards Accepted", "Cartões de pagamento aceitos"],
  ["Special Gifts", "Brindes Especiais"],
  ["Perfect Gifts, Every Time", "Presentes perfeitos, sempre"],
  ["Customer Care", "Atendimento"],
  ["['Contact Us', 'Returns & Exchanges', 'Shipping Information', 'Track Your Order', 'Store Locator']", "['Fale Conosco', 'Trocas e Devoluções', 'Informações de Envio', 'Rastreie seu Pedido', 'Nossas Lojas']"],
  ["Categories", "Categorias"],
  ["Our App", "Nosso App"],
  ["Download our app to get 10% discount on your first order. Available on App Store and Google Play.", "Baixe nosso aplicativo para receber novidades."],
  ["All Rights Reserved.", "Todos os direitos reservados."],
  ["Trending Products", "Produtos em Alta"],
  ["Electronics</span", "Eletrônicos</span"],
  ["Gadgets</span", "Acessórios</span"],
  ["Smart Devices</span", "Smartphones</span"],
  ["New Products", "Novos Produtos"],
  ["Explore More", "Explorar Mais"]
];

let modified = 0;
for (const [en, pt] of translations) {
  if (content.includes(en)) {
    // using split join for global replace
    content = content.split(en).join(pt);
    modified++;
  }
}

// Extra translations for other Store themes (if any still remain in standard sections like Hero)
const extraTranslations = [
  ["Shop the Collection", "Ver Coleção"],
  ["View Collection", "Ver Coleção"],
  ["Discover Now", "Descobrir Agora"],
  ["Learn More", "Saiba Mais"],
  ["Add to Cart", "Adicionar ao Carrinho"],
  ["View Details", "Ver Detalhes"],
  ["Product Not Found", "Produto não encontrado"],
  ["No products found matching your criteria.", "Nenhum produto encontrado com esses critérios."],
  ["Try adjusting your filters.", "Tente ajustar os filtros."],
  ["Reviews", "Avaliações"],
  ["Description", "Descrição"],
  ["Related Products", "Produtos Relacionados"],
  ["Secure Checkout", "Pagamento Seguro"],
  ["Fast Delivery", "Entrega Rápida"],
  ["24/7 Support", "Suporte 24/7"],
];

for (const [en, pt] of extraTranslations) {
  if (content.includes(en)) {
    content = content.split(en).join(pt);
    modified++;
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Translated ${modified} phrases successfully in StorefrontView.tsx.`);
