export const PRODUCTS = [
  { id: "cup", name: "Ceramic cup", price: 4500 },
  { id: "bag", name: "Linen bag", price: 8000 },
  { id: "poster", name: "Printed poster", price: 3000 },
  { id: "notebook", name: "Plain notebook", price: 2500 },
];

export function addToCart(cart, productId) {
  const product = PRODUCTS.find((item) => item.id === productId);
  if (!product) return cart;
  const existing = cart.find((item) => item.id === productId);
  if (!existing) return [...cart, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
  return cart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item));
}

export function changeQuantity(cart, productId, quantity) {
  const next = Number(quantity);
  if (!Number.isFinite(next) || next <= 0) return cart.filter((item) => item.id !== productId);
  return cart.map((item) => (item.id === productId ? { ...item, quantity: next } : item));
}

export function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
