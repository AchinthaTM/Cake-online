import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (cake) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === cake.id);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === cake.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...cake, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (cakeId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== cakeId)
    );
  };

  const updateQuantity = (cakeId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cakeId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cakeId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
