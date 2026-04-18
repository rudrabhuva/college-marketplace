import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Zap, Star, ArrowLeftRight } from 'lucide-react';
import './ProductModal.css';

const ProductModal = ({ isOpen, onClose, product, onBuy, onAddToCart, onTrade }) => {
    const [showTradeInput, setShowTradeInput] = useState(false);
    const [tradeOffer, setTradeOffer] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setShowTradeInput(false);
            setTradeOffer('');
        }
    }, [isOpen]);

    if (!product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="product-modal-backdrop" onClick={onClose}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="product-modal-content glass-panel"
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                        
                        <div className="product-modal-body">
                            <div className="product-modal-image-container">
                                <img 
                                    src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'} 
                                    alt={product.title} 
                                    className="product-modal-image"
                                />
                            </div>
                            
                            <div className="product-modal-details">
                                <div>
                                    {product.stock > 0 ? (
                                        <span className="badge badge-success mb-2">In Stock</span>
                                    ) : (
                                        <span className="badge badge-danger mb-2">Out of Stock</span>
                                    )}
                                    <h2 className="product-modal-title gradient-text">{product.title}</h2>
                                    
                                    <div className="product-modal-rating">
                                        {[1,2,3,4,5].map(star => <Star key={star} size={16} fill={star <= (product.rating || 4.5) ? "var(--accent)" : "none"} color={star <= (product.rating || 4.5) ? "var(--accent)" : "var(--text-muted)"} />)}
                                        <span className="rating-text">({product.rating?.toFixed(1) || 4.8})</span>
                                    </div>
                                    
                                    <p className="product-modal-category">Category: {product.category || 'General'}</p>
                                    <p className="product-modal-description">{product.description}</p>

                                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: 'var(--text-muted)' }}>Seller Details</h4>
                                        <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <span><strong style={{color: 'var(--accent)'}}>Name:</strong> {product.seller_name || 'Anonymous'}</span>
                                            <span><strong style={{color: 'var(--accent)'}}>College:</strong> {product.seller_college || 'N/A'}</span>
                                            <span><strong style={{color: 'var(--accent)'}}>Email:</strong> {product.seller_email || 'N/A'}</span>
                                            <span><strong style={{color: 'var(--accent)'}}>Phone:</strong> {product.seller_phone || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="product-modal-footer">
                                    <div className="product-modal-price">₹{product.price?.toFixed(2)}</div>
                                    {!showTradeInput ? (
                                    <div className="product-modal-actions">
                                        <button 
                                            disabled={product.stock <= 0} 
                                            onClick={() => setShowTradeInput(true)} 
                                            className="btn btn-secondary action-btn"
                                            style={{ opacity: product.stock <= 0 ? 0.5 : 1 }}
                                        >
                                            <ArrowLeftRight size={18} /> Trade
                                        </button>
                                        <button 
                                            disabled={product.stock <= 0} 
                                            onClick={() => onAddToCart(product)} 
                                            className="btn btn-secondary action-btn"
                                            style={{ opacity: product.stock <= 0 ? 0.5 : 1 }}
                                        >
                                            <ShoppingCart size={18} /> Cart
                                        </button>
                                        <button 
                                            disabled={product.stock <= 0} 
                                            onClick={() => onBuy(product)} 
                                            className="btn btn-secure-buy action-btn"
                                            style={{ opacity: product.stock <= 0 ? 0.5 : 1 }}
                                        >
                                            <Zap size={18} style={{ marginRight: '4px' }} fill="currentColor" /> Buy
                                        </button>
                                    </div>
                                    ) : (
                                        <div style={{ width: '100%', marginTop: '0.5rem' }}>
                                            <label style={{display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem'}}>What will you give in return?</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. My old Arduino kit" 
                                                value={tradeOffer} 
                                                onChange={e => setTradeOffer(e.target.value)}
                                                className="form-input"
                                                style={{ marginBottom: '0.5rem' }}
                                            />
                                            <div style={{display:'flex', gap: '8px'}}>
                                                <button onClick={() => {
                                                    if(tradeOffer.trim()){
                                                        onTrade(product, tradeOffer);
                                                        setShowTradeInput(false);
                                                        setTradeOffer('');
                                                    }
                                                }} className="btn btn-primary" style={{flex: 1}}>Send Offer</button>
                                                <button onClick={() => setShowTradeInput(false)} className="btn btn-secondary">Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProductModal;
