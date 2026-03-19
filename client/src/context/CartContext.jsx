import { createContext, useContext, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    const exist = cartItems.find((item) => item._id === product._id || item.id === product.id);

    if (exist) {
      setCartItems(
        cartItems.map((item) =>
          (item._id === product._id || item.id === product.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }

    // 🔥 TOAST MESSAGE
    toast.success(`${product.name} added to cart 🛒`);
  };

  const removeFromCart = (id) => {
    const removedItem = cartItems.find((item) => item._id === id || item.id === id);
    setCartItems(cartItems.filter((item) => item._id !== id && item.id !== id));
    if (removedItem) {
      toast.error(`${removedItem.name} is removed`);
    } else {
      toast.error("Item removed");
    }
  };

  const increaseQty = (id) => {
    setCartItems(
      cartItems.map((item) =>
        (item._id === id || item.id === id)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCartItems(
      cartItems
        .map((item) =>
          (item._id === id || item.id === id)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
