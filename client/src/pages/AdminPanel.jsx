import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAllOrders, getProducts, updateOrderStatus, updateProductStock, getUsers, notify, subscribeProducts, subscribeAllOrders, deleteProduct } from '../db';
import { 
    LayoutDashboard, Package, ShoppingCart, Users, Check, X, 
    Trash2, AlertCircle, TrendingUp, Box, ArrowRight, Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('orders');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.email !== 'admin@eshop.com') {
            toast.error('Unauthorized access');
            navigate('/');
            return;
        }

        // Subscriptions
        const unsubscribeProducts = subscribeProducts(setProducts);
        const unsubscribeOrders = subscribeAllOrders(setOrders);
        
        // Manual fetch for users (async)
        const fetchUsers = async () => {
            const allUsers = await getUsers();
            setUsers(allUsers);
        };
        fetchUsers();

        return () => {
            unsubscribeProducts();
            unsubscribeOrders();
        };
    }, [user, navigate]);

    // --- MODIFIED: Async stock update ---
    const handleAction = async (order, status) => {
        updateOrderStatus(order.id, status);
        if (status === 'Accepted') {
            const product = products.find(p => p.id === order.product_id);
            if (product) {
                await updateProductStock(product.id, Math.max(0, (product.stock || 0) - (order.quantity || 1)));
            }
        }
        const verb = status === 'Accepted' ? 'accepted' : 'rejected';
        notify(order.buyer_id, `Administrative Update: Your order for "${order.title}" has been ${verb}.`, status === 'Accepted' ? 'success' : 'error');
        toast.success(`Order ${status}`);
        
        // Refresh orders manually since no subscription yet
        const allOrders = await getAllOrders();
        setOrders(allOrders);
    };

    // --- MODIFIED: Async stock update ---
    const handleStockUpdate = async (productId, delta) => {
        const product = products.find(p => p.id === productId);
        const newStock = Math.max(0, (product.stock || 0) + delta);
        await updateProductStock(productId, newStock);
        toast.success('Inventory updated');
        // No need to call loadData() because of product subscription
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Are you sure you want to remove this product permanently?")) {
            await deleteProduct(productId);
        }
    };

    const stats = {
        revenue: orders.reduce((sum, o) => o.status === 'Accepted' ? sum + (o.price * o.quantity) : sum, 0),
        pending: orders.filter(o => o.status === 'Placed').length,
        items: products.length,
        activeUsers: users.length
    };

    if (user?.email !== 'admin@eshop.com') return null;

    return (
        <div className="container" style={{ maxWidth: 1200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>E-Shop Control</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Global administrative overwatch and system management</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    {['orders', 'inventory', 'users'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`btn ${activeTab === tab ? 'btn-primary' : ''}`}
                            style={{ 
                                background: activeTab === tab ? '' : 'transparent',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: <TrendingUp />, color: 'var(--success)' },
                    { label: 'Pending Orders', value: stats.pending, icon: <Clock />, color: '#f59e0b' },
                    { label: 'Total Stock', value: stats.items, icon: <Box />, color: 'var(--accent)' },
                    { label: 'Registered Users', value: stats.activeUsers, icon: <Users />, color: '#8b5cf6' }
                ].map((s, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${s.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.05em' }}>{s.label.toUpperCase()}</span>
                            <div style={{ color: s.color }}>{s.icon}</div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'orders' && (
                    <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="glass-panel">
                            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <ShoppingCart size={24} color="var(--accent)" /> System Workflow
                            </h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                                            <th style={{ padding: '1rem' }}>Order Info</th>
                                            <th style={{ padding: '1rem' }}>Customer</th>
                                            <th style={{ padding: '1rem' }}>Amount</th>
                                            <th style={{ padding: '1rem' }}>Status</th>
                                            <th style={{ padding: '1rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <div style={{ fontWeight: 700 }}>{order.title}</div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>#{order.id.toString().slice(-6)}</div>
                                                </td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                                                            {order.buyer_id.toString().slice(0,1)}
                                                        </div>
                                                        <span style={{ fontSize: '0.9rem' }}>User ID: {order.buyer_id}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem', fontWeight: 800 }}>
                                                    ${(order.price * order.quantity).toFixed(2)}
                                                </td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <span style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, background: 'rgba(255,255,255,0.05)', color: order.status === 'Accepted' ? 'var(--success)' : (order.status === 'Rejected' ? 'var(--danger)' : 'var(--text-main)') }}>
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    {order.status === 'Placed' && (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={() => handleAction(order, 'Accepted')} className="btn btn-primary" style={{ padding: '0.5rem', borderRadius: '6px' }} title="Accept">
                                                                <Check size={16} />
                                                            </button>
                                                            <button onClick={() => handleAction(order, 'Rejected')} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '6px', color: 'var(--danger)' }} title="Reject">
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'inventory' && (
                    <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {products.map(p => (
                                <div key={p.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <img src={p.image} alt={p.title} style={{ width: 60, height: 60, borderRadius: '8px', objectFit: 'cover' }} />
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{p.title}</div>
                                            <div style={{ color: 'var(--accent)', fontWeight: 800 }}>${p.price.toFixed(2)}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stock</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <button onClick={() => handleStockUpdate(p.id, -1)} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', minWidth: '30px' }}>-</button>
                                                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: p.stock < 5 ? 'var(--danger)' : 'var(--text-main)' }}>{p.stock || 0}</span>
                                                <button onClick={() => handleStockUpdate(p.id, 1)} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', minWidth: '30px' }}>+</button>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteProduct(p.id)} 
                                            className="btn btn-secondary" 
                                            style={{ color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px' }}
                                            title="Delete Product"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'users' && (
                    <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="glass-panel">
                            <h3 style={{ marginBottom: '2rem' }}>Registered Platform Members</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {users.map(u => (
                                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: 45, height: 45, borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                                                {u.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{u.name || 'Anonymous'}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                                            <div>ID REF</div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>#{u.id.toString().slice(-6)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPanel;
