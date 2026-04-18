import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const incrementQuantity = (id) => {
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
    };

    const decrementQuantity = (id) => {
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item));
    };

    const clearCart = () => setCartItems([]);

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, isCartOpen, toggleCart, addToCart, removeFromCart, clearCart, incrementQuantity, decrementQuantity, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};
