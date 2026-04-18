import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, Trash2, X, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../db';
import toast from 'react-hot-toast';
import CheckoutModal from './CheckoutModal';

const CartDrawer = () => {
    const { isCartOpen, toggleCart, cartItems, removeFromCart, incrementQuantity, decrementQuantity, clearCart, cartTotal } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [checkingOut, setCheckingOut] = useState(false);

    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    const handleCheckoutClick = () => {
        if (!user) {
            toggleCart();
            navigate('/login');
            return;
        }
        setIsCheckoutModalOpen(true);
    };

    const confirmPurchase = (buyerInfo) => {
        setCheckingOut(true);
        setTimeout(() => {
            cartItems.forEach(item => {
                createOrder({ 
                    product_id: item.id, 
                    title: item.title, 
                    price: item.price, 
                    buyer_id: user.id,
                    buyer_name: buyerInfo.name,
                    buyer_phone: buyerInfo.phone,
                    buyer_email: buyerInfo.email
                });
            });
            clearCart();
            toast.success('Order Placed Successfully! 🎉');
            setCheckingOut(false);
            setIsCheckoutModalOpen(false);
            toggleCart();
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 0.5 }} 
                        exit={{ opacity: 0 }} 
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'black', zIndex: 999 }} 
                        onClick={toggleCart} 
                    />
                    <motion.div 
                        initial={{ x: '100%' }} 
                        animate={{ x: 0 }} 
                        exit={{ x: '100%' }} 
                        transition={{ type: 'tween', stiffness: 300, damping: 30 }}
                        style={{ 
                            position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(400px, 100%)', 
                            background: 'var(--bg-color)', zIndex: 1000, display: 'flex', flexDirection: 'column',
                            boxShadow: '-4px 0 24px rgba(0,0,0,0.5)', borderLeft: '1px solid var(--glass-border)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><ShoppingCart size={24} color="var(--accent)" /> Your Cart</h2>
                            <button onClick={toggleCart} style={{ background: 'transparent', color: 'var(--text-main)', padding: '0.4rem', borderRadius: '50%' }}><X size={20} /></button>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                            {cartItems.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
                                    <ShoppingCart size={64} style={{ opacity: 0.2, marginBottom: '1rem', margin: '0 auto' }} />
                                    <p>Your cart is empty.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {cartItems.map(item => (
                                        <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                            <img src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'} alt={item.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>{item.title}</h4>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.2rem', borderRadius: '6px' }}>
                                                        <button onClick={() => decrementQuantity(item.id)} style={{ background: 'transparent', color: 'var(--text-main)', padding: '0.2rem' }}><Minus size={14}/></button>
                                                        <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                                        <button onClick={() => incrementQuantity(item.id)} style={{ background: 'transparent', color: 'var(--text-main)', padding: '0.2rem' }}><Plus size={14}/></button>
                                                    </div>
                                                    <span style={{ fontWeight: 'bold' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} style={{ alignSelf: 'flex-start', background: 'transparent', color: 'var(--danger)', padding: '0.2rem' }}><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--accent)' }}>₹{cartTotal.toFixed(2)}</span>
                                </div>
                                <button onClick={handleCheckoutClick} disabled={checkingOut} className="btn btn-primary" style={{ width: '100%' }}>
                                    {checkingOut ? <span className="loader" style={{ width: 16, height: 16, margin: 0, borderTopColor: 'white' }}></span> : 'Place Order securely'}
                                </button>
                                <button onClick={clearCart} className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }}>Clear Cart</button>
                            </div>
                        )}
                        <CheckoutModal 
                            isOpen={isCheckoutModalOpen} 
                            onClose={() => setIsCheckoutModalOpen(false)} 
                            onConfirm={confirmPurchase} 
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
