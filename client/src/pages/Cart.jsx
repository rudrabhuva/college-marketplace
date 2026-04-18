import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '../db';
import toast from 'react-hot-toast';
import API_URL from '../api';
import CheckoutModal from '../components/CheckoutModal';
import { useState } from 'react';

const Cart = () => {
    const { cartItems, removeFromCart, clearCart, cartTotal } = useContext(CartContext);
    const navigate = useNavigate();

    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    const handleCheckoutClick = () => {
        if (cartItems.length === 0) return;
        
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            toast.error('Please login to checkout');
            navigate('/login');
            return;
        }
        setIsCheckoutModalOpen(true);
    }

    const confirmPurchase = async (buyerInfo) => {
        const user = JSON.parse(localStorage.getItem('user'));
        // --- MODIFIED: Create shared Firestore orders ---
        try {
            await Promise.all(cartItems.map(item => 
                createOrder({ 
                    product_id: item.id, 
                    title: item.title, 
                    price: item.price, 
                    buyer_id: user.id,
                    seller_id: item.seller_id,
                    quantity: item.quantity,
                    buyer_name: buyerInfo.name,
                    buyer_phone: buyerInfo.phone,
                    buyer_email: buyerInfo.email,
                    buyer_college: buyerInfo.college
                })
            ));
            
            clearCart();
            toast.success('Orders placed successfully!');
            setIsCheckoutModalOpen(false);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            toast.error("Failed to place order.");
        }
    };

    return (
        <div className="container" style={{ maxWidth: 800 }}>
            <div className="glass-panel" style={{ marginTop: '3rem' }}>
                <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingCart size={24} color="var(--accent)" /> Your Cart
                </h2>

                {cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                        <ShoppingCart size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>Your cart is empty. Let's find some amazing items!</p>
                        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Browse Shop</Link>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {cartItems.map(item => (
                                <div key={item.id} style={{
                                    padding: '1.5rem',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <img 
                                            src={item.image ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`) : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'} 
                                            alt={item.title} 
                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                        <div>
                                            <h4 style={{ color: 'var(--text-main)', margin: '0 0 0.2rem 0' }}>{item.title}</h4>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Quantity: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                        <button onClick={() => removeFromCart(item.id)} className="btn btn-secondary" style={{ padding: '0.4rem' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>Total: <span style={{ color: 'var(--accent)' }}>₹{cartTotal.toFixed(2)}</span></h3>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={clearCart} className="btn btn-secondary">Clear Cart</button>
                                <button onClick={handleCheckoutClick} className="btn btn-primary">Proceed to Checkout</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <CheckoutModal 
                isOpen={isCheckoutModalOpen} 
                onClose={() => setIsCheckoutModalOpen(false)} 
                onConfirm={confirmPurchase} 
            />
        </div>
    );
};

export default Cart; 
