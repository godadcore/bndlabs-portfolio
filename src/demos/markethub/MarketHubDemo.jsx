import { useState } from "react";
import DemoShell from "../DemoShell";
import { PRODUCTS, addToCart, cartTotal, changeQuantity } from "./cart.js";

export default function MarketHubDemo() {
  const [cart, setCart] = useState([]);

  return (
    <DemoShell title="MarketHub">
      <section className="demoPanel">
        <ul className="demoList">
          {PRODUCTS.map((product) => (
            <li className="demoItem" key={product.id}>
              <span>{product.name}</span>
              <span>{product.price.toLocaleString()}</span>
              <button className="liquid is-solid" type="button" onClick={() => setCart(addToCart(cart, product.id))}>Add to cart</button>
            </li>
          ))}
        </ul>
      </section>
      <section className="demoPanel">
        <p>Cart total {cartTotal(cart).toLocaleString()}</p>
        <ul className="demoList">
          {cart.map((item) => (
            <li className="demoItem" key={item.id}>
              <span>{item.name}</span>
              <label>
                Quantity
                <input
                  inputMode="numeric"
                  value={item.quantity}
                  onChange={(event) => setCart(changeQuantity(cart, item.id, event.target.value))}
                />
              </label>
              <span>{(item.price * item.quantity).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </DemoShell>
  );
}
