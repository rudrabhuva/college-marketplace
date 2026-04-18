import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { subscribeOrders, subscribeSales, subscribeSellerProducts, updateOrderStatus, cancelOrder, notify, deleteProduct, updateProduct, subscribeTradeOffers, updateTradeStatus } from '../db';
import { Package, User, Clock, CheckCircle, ShoppingBag, DollarSign, Check, Edit3, Trash2, Tag, Box, X, ArrowLeftRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [sales, setSales] = useState([]);
    const [myProducts, setMyProducts] = useState([]);
    const [trades, setTrades] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [activeTab, setActiveTab] = useState('purchases');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        setLoading(true);
        const unsubscribeOrders = subscribeOrders(user.id, (data) => {
            setOrders(data);
            setLoading(false);
        });

        const unsubscribeSales = subscribeSales(user.id, (data) => {
            setSales(data);
            setLoading(false);
        });

        const unsubscribeProducts = subscribeSellerProducts(user.id, (data) => {
            setMyProducts(data);
            setLoading(false);
        });

        const unsubscribeTrades = subscribeTradeOffers(user.id, (data) => {
            setTrades(data);
            setLoading(false);
        });

        return () => {
            unsubscribeOrders();
            unsubscribeSales();
            unsubscribeProducts();
            unsubscribeTrades();
        };
    }, [user?.id, navigate]);

    const handleCancel = async (order) => {
        try {
            await cancelOrder(order.id, order.product_id, order.quantity);
            toast.success("Order Cancelled. Stock replenished.");
        } catch (err) {
            toast.error("Failed to cancel order.");
        }
    };

    const handleAccept = async (order) => {
        try {
            await updateOrderStatus(order.id, 'Accepted');
            notify(order.buyer_id, `Your order for "${order.title}" has been accepted by the seller!`, 'success');
            toast.success("Order accepted and buyer notified!");
        } catch (err) {
            toast.error("Failed to accept order.");
        }
    };

    const handleAcceptTrade = async (trade) => {
        try {
            await updateTradeStatus(trade.id, 'Accepted', { ...trade, seller_email: user.email });
            toast.success("Trade accepted! Buyer notified.");
        } catch (err) {
            toast.error("Failed to accept trade.");
        }
    };

    const handleDeclineTrade = async (trade) => {
        try {
            await updateTradeStatus(trade.id, 'Declined', trade);
            toast.success("Trade declined.");
        } catch (err) {
            toast.error("Failed to decline trade.");
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Delete this listing? There's no turning back.")) {
            try {
                await deleteProduct(productId);
                toast.success("Listing deleted.");
            } catch (err) {
                toast.error("Failed to delete product.");
            }
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const { id, title, price, stock, description } = editingProduct;
            await updateProduct(id, { 
                title, 
                price: parseFloat(price), 
                stock: parseInt(stock), 
                description 
            });
            setEditingProduct(null);
            toast.success("Product updated successfully!");
        } catch (err) {
            toast.error("Failed to update product.");
        }
    };

    if (!user) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container">
            <header className="dashboard-header">
                <h1 className="gradient-text dashboard-title">Dashboard</h1>
                <div className="tabs-container">
                    <button 
                        onClick={() => setActiveTab('purchases')} 
                        className={`btn tab-btn ${activeTab === 'purchases' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ border: 'none', background: activeTab === 'purchases' ? '' : 'transparent' }}
                    >
                        <ShoppingBag size={18} /> <span>Purchases</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('sales')} 
                        className={`btn tab-btn ${activeTab === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ border: 'none', background: activeTab === 'sales' ? '' : 'transparent' }}
                    >
                        <DollarSign size={18} /> <span>Sales</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('inventory')} 
                        className={`btn tab-btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ border: 'none', background: activeTab === 'inventory' ? '' : 'transparent' }}
                    >
                        <Tag size={18} /> <span>Inventory</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('trades')} 
                        className={`btn tab-btn ${activeTab === 'trades' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ border: 'none', background: activeTab === 'trades' ? '' : 'transparent' }}
                    >
                        <ArrowLeftRight size={18} /> <span>Trades</span>
                    </button>
                </div>
            </header>
            
            <div className="dashboard-grid">
                <section className="glass-panel profile-panel">
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent)' }}>
                        <User size={24} />
                    </div>
                    <h3 style={{ marginBottom: '1.5rem' }}>Profile</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>NAME</label>
                            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.name}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>EMAIL</label>
                            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.email}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>PHONE</label>
                            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.phone || 'N/A'}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>COLLEGE</label>
                            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user.college || 'N/A'}</span>
                        </div>
                        <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{orders.length}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>BOUGHT</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{sales.length}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SOLD</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="glass-panel content-panel">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        {activeTab === 'purchases' ? <Package size={24} color="var(--accent)" /> : (activeTab === 'sales' ? <DollarSign size={24} color="var(--success)" /> : (activeTab === 'trades' ? <ArrowLeftRight size={24} color="#fbbf24" /> : <Tag size={24} color="#a855f7" />))}
                        {activeTab === 'purchases' ? 'Recent Purchases' : (activeTab === 'sales' ? 'Orders for You' : (activeTab === 'trades' ? 'Trade Offers' : 'Listed Inventory'))}
                    </h3>

                    {activeTab === 'inventory' ? (
                        <div className="inventory-grid">
                            {myProducts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 0', gridColumn: '1/-1' }}>
                                    <Tag size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                    <p style={{ color: 'var(--text-muted)' }}>No active listings.</p>
                                    <button onClick={() => navigate('/sell')} className="btn btn-primary" style={{ marginTop: '1rem' }}>List an Item</button>
                                </div>
                            ) : (
                                myProducts.map(p => (
                                    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={p.id} className="inventory-card">
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                                            <img src={p.image} alt={p.title} style={{ width: 70, height: 70, borderRadius: '10px', objectFit: 'cover' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{p.title}</div>
                                                <div style={{ color: 'var(--accent)', fontWeight: 800 }}>₹{p.price?.toFixed(2)}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
                                                    <Box size={14} /> Stock: {p.stock || 0}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <button onClick={() => setEditingProduct(p)} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }}>
                                                <Edit3 size={15} /> Edit
                                            </button>
                                            <button onClick={() => handleDeleteProduct(p.id)} className="btn btn-secondary" style={{ padding: '0.5rem', color: 'var(--danger)' }}>
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    ) : activeTab === 'trades' ? (
                        trades.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                                <ArrowLeftRight size={64} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-muted)' }}>No trade offers received.</p>
                            </div>
                        ) : (
                            <div className="order-list">
                                {trades.map(trade => (
                                    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={trade.id} className="order-card">
                                        <div className="order-header">
                                            <div>
                                                <span style={{ fontWeight: 700, fontSize: '1.1rem', display: 'block' }}>{trade.buyer_name} wants to trade:</span>
                                                <span style={{ color: 'var(--accent)', fontSize: '1.05rem', fontWeight: 600 }}>"{trade.offer_item}"</span>
                                                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>For your: {trade.item_title}</span>
                                            </div>
                                        </div>
                                        <footer className="order-footer">
                                            <span className="status-badge">
                                                {trade.status === 'Accepted' ? <CheckCircle size={14} color="var(--success)" /> : (trade.status === 'Declined' ? <X size={14} color="var(--danger)" /> : <Clock size={14} color="var(--accent)" />)} 
                                                <span style={{ color: trade.status === 'Accepted' ? 'var(--success)' : (trade.status === 'Declined' ? 'var(--danger)' : '#a855f7') }}>{trade.status}</span>
                                            </span>
                                            
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {trade.status === 'Pending' && (
                                                    <>
                                                        <button onClick={() => handleAcceptTrade(trade)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                                            <Check size={16} /> Accept
                                                        </button>
                                                        <button onClick={() => handleDeclineTrade(trade)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--danger)' }}>
                                                            Decline
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </footer>
                                    </motion.div>
                                ))}
                            </div>
                        )
                    ) : (activeTab === 'purchases' ? orders : sales).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                            <Package size={64} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--text-muted)' }}>No activities found.</p>
                        </div>
                    ) : (
                        <div className="order-list">
                            {(activeTab === 'purchases' ? orders : sales).map(order => (
                                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={order.id} className="order-card">
                                    <div className="order-header">
                                        <div>
                                            <span style={{ fontWeight: 700, fontSize: '1.1rem', display: 'block' }}>{order.title}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: #{order.id.toString().slice(-6)}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800, display: 'block' }}>₹{(order.price * (order.quantity || 1)).toFixed(2)}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {order.quantity || 1}</span>
                                        </div>
                                    </div>
                                    
                                    <footer className="order-footer">
                                        <span className="status-badge">
                                            {order.status === 'Delivered' || order.status === 'Accepted' ? <CheckCircle size={14} color="var(--success)" /> : <Clock size={14} color="var(--accent)" />} 
                                            <span style={{ color: order.status === 'Delivered' || order.status === 'Accepted' ? 'var(--success)' : (order.status==='Shipped' ? '#3b82f6' : 'var(--text-main)') }}>{order.status}</span>
                                        </span>
                                        
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {activeTab === 'sales' && order.status === 'Placed' && (
                                                <button onClick={() => handleAccept(order)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                                    <Check size={16} /> Accept
                                                </button>
                                            )}
                                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                <button onClick={() => handleCancel(order)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--danger)' }}>
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </footer>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <AnimatePresence>
                {editingProduct && (
                    <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
                        <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Edit Listing</h3>
                                <button onClick={() => setEditingProduct(null)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleUpdateProduct} style={{ display: 'grid', gap: '1.25rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Product Name</label>
                                    <input type="text" className="form-input" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Price (₹)</label>
                                        <input type="number" step="0.01" className="form-input" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Stock</label>
                                        <input type="number" className="form-input" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Description</label>
                                    <textarea className="form-input" style={{ minHeight: '100px', resize: 'vertical' }} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Update</button>
                                    <button type="button" onClick={() => setEditingProduct(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Dashboard;
