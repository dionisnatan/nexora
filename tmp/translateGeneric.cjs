const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/Users/DIONIS/Downloads/nexora-dashboard/src/views/StorefrontView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const translations = [
  [/>Search</g, '>Buscar<'],
  [/>Cart</g, '>Carrinho<'],
  [/>Checkout</g, '>Finalizar Compra<'],
  [/>Loading\.\.\.</g, '>Carregando...<'],
  [/>Home</g, '>Início<'],
  [/>Shop</g, '>Loja<'],
  [/>Products</g, '>Produtos<'],
  [/>Total</g, '>Total<'],
  [/>Price</g, '>Preço<'],
  [/>Quantity</g, '>Quantidade<'],
  [/>Password</g, '>Senha<'],
  [/>Email</g, '>E-mail<'],
  [/>Dashboard</g, '>Painel<'],
  [/>Orders</g, '>Pedidos<'],
  [/>Favorites</g, '>Favoritos<'],
  [/>FAQ</g, '>Perguntas Frequentes<'],
  [/>Categories</g, '>Categorias<'],
  [/>Contact</g, '>Contato<'],
  [/>Shipping</g, '>Frete<'],
  [/>Returns</g, '>Devoluções<'],
  [/>Payment</g, '>Pagamento<'],
  [/>Customer</g, '>Cliente<'],
  [/>Empty</g, '>Vazio<'],
  [/placeholder="Search/g, 'placeholder="Buscar'],
  [/placeholder="Email/g, 'placeholder="E-mail'],
  [/placeholder="Password/g, 'placeholder="Senha'],
  [/title="Search/g, 'title="Buscar'],
  [/title="Cart/g, 'title="Carrinho'],
  [/>Buy</g, '>Comprar<'],
  [/>Sign In</g, '>Entrar<'],
  [/>Sign Up</g, '>Cadastrar<'],
  [/>Menu</g, '>Menu<'],
  [/>Welcome</g, '>Bem-vindo(a)<'],
  [/>Language</g, '>Idioma<'],
  [/>Currency</g, '>Moeda<'],
  [/>Profile</g, '>Perfil<'],
  [/>Logout</g, '>Sair<'],
  [/>Wishlist</g, '>Lista de Desejos<'],
  [/>Support</g, '>Suporte<']
];

let modified = 0;
for (const [regex, pt] of translations) {
  const matches = content.match(regex);
  if (matches) {
    content = content.replace(regex, pt);
    modified += matches.length;
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Translated ${modified} words with regex in StorefrontView.tsx.`);
