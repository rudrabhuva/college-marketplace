import React, { useState, useEffect, useContext, useRef } from 'react';
import { ShoppingBag, Star, ShoppingCart, Search, ArrowRight, Watch, Smartphone, Headphones, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { subscribeProducts, createOrder, createTradeOffer } from '../db';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutModal from '../components/CheckoutModal';
import ProductModal from '../components/ProductModal';
import './Home.css';

const useTypingEffect = (words, typingSpeed = 100, deletingSpeed = 50, pauseTime = 2000) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [text, setText] = useState('');

    useEffect(() => {
        if (subIndex === words[index].length + 1 && !isDeleting) {
            setTimeout(() => setIsDeleting(true), pauseTime);
            return;
        }

        if (subIndex === 0 && isDeleting) {
            setIsDeleting(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
        }, isDeleting ? deletingSpeed : typingSpeed);

        return () => clearTimeout(timeout);
    }, [subIndex, index, isDeleting, words, typingSpeed, deletingSpeed, pauseTime]);

    useEffect(() => {
        setText(words[index].substring(0, subIndex));
    }, [subIndex, index, words]);

    return text;
};

const Home = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [selectedBuyProduct, setSelectedBuyProduct] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedViewProduct, setSelectedViewProduct] = useState(null);
    const heroRef = useRef(null);

    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    const animatedText = useTypingEffect(['Gadgets', 'Shopping', 'Gaming', 'Tech'], 120, 60, 2500);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeProducts((prods) => {
            setProducts(prods);
            setFilteredProducts(prods);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let results = products;
        if (searchTerm) {
            results = results.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (category !== 'All') {
            results = results.filter(p => p.category === category || (p.description && p.description.includes(category)));
        }
        setFilteredProducts(results);
    }, [searchTerm, category, products]);

    const handleMouseMove = (e) => {
        if (!heroRef.current) return;
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        heroRef.current.style.setProperty('--mouse-x', `${x}%`);
        heroRef.current.style.setProperty('--mouse-y', `${y}%`);
        heroRef.current.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(59, 130, 246, 0.25) 0%, transparent 40%)`;
    };

    const handleMouseLeave = () => {
        if (!heroRef.current) return;
        heroRef.current.style.background = 'transparent';
    };

    const handleBuyClick = (product) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setSelectedBuyProduct(product);
        setIsCheckoutModalOpen(true);
    };

    const confirmPurchase = async (buyerInfo) => {
        if (!selectedBuyProduct) return;
        try {
            await createOrder({ 
                product_id: selectedBuyProduct.id, 
                title: selectedBuyProduct.title, 
                price: selectedBuyProduct.price, 
                buyer_id: user.id,
                seller_id: selectedBuyProduct.seller_id,
                buyer_name: buyerInfo.name,
                buyer_phone: buyerInfo.phone,
                buyer_email: buyerInfo.email,
                buyer_college: buyerInfo.college
            });
            toast.success('Order placed successfully!');
            setIsCheckoutModalOpen(false);
            setSelectedBuyProduct(null);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            toast.error("Order failed.");
        }
    };

    const handleTradeClick = async (product, offerText) => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await createTradeOffer({
                product_id: product.id,
                item_title: product.title,
                seller_id: product.seller_id,
                buyer_id: user.id,
                buyer_name: user.name,
                buyer_email: user.email,
                buyer_phone: user.phone || 'N/A',
                offer_item: offerText
            });
            setIsProductModalOpen(false);
            toast.success('Trade offer sent!');
        } catch (err) {
            toast.error('Failed to send trade offer');
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.8 }}
            className="container"
        >
            <section 
                className="hero glass-panel" 
                ref={heroRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className="blob-container">
                    <div className="blob blob-purple"></div>
                    <div className="blob blob-blue"></div>
                </div>

                <motion.div className="floating-icon icon-1" animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }}><Watch size={48}/></motion.div>
                <motion.div className="floating-icon icon-2" animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }}><Headphones size={54}/></motion.div>
                <motion.div className="floating-icon icon-3" animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}><Smartphone size={40}/></motion.div>

                <motion.div 
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="hero-content"
                >
                    <h1 className="hero-title gradient-text">
                        College E-shop
                    </h1>
                    <p className="hero-subtitle">
                        Experience the future of <span className="gradient-text" style={{fontWeight: 800}}>{animatedText}</span><span className="typing-cursor"></span>
                    </p>
                    <div className="hero-actions">
                        <a href="#products" className="btn btn-primary">
                            Explore Store <ArrowRight size={20} />
                        </a>
                        <button onClick={() => navigate('/sell')} className="btn btn-secondary">
                            Start Selling
                        </button>
                    </div>
                </motion.div>
            </section>

            <div id="products" className="filters-bar">
                <h2 className="filters-title">Featured Products</h2>
                <div className="filters-controls">
                    <div className="search-wrapper">
                        <Search size={20} className="search-icon" />
                        <input 
                            type="text" 
                            className="form-input search-input" 
                            placeholder="Search premium items..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className="form-input category-select" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="All">All Categories</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Accessories">Accessories</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loader" />
            ) : (
                <AnimatePresence mode='popLayout'>
                    <motion.div 
                        layout
                        className="products-grid"
                    >
                        {filteredProducts.map((product, index) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="product-card" 
                                key={product.id}
                                onClick={() => { setSelectedViewProduct(product); setIsProductModalOpen(true); }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div style={{ overflow: 'hidden' }}>
                                    <img 
                                        src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'} 
                                        alt={product.title} 
                                        className="product-image" 
                                    />
                                </div>
                                <div className="product-info">
                                    {product.stock > 0 ? (
                                        <span className="badge badge-success" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>In Stock</span>
                                    ) : (
                                        <span className="badge" style={{ alignSelf: 'flex-start', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Out of Stock</span>
                                    )}
                                    <h3 className="product-title">{product.title}</h3>
                                    <div style={{ display: 'flex', gap: '3px', marginBottom: '1rem' }}>
                                        {[1,2,3,4,5].map(star => <Star key={star} size={14} fill={star <= (product.rating || 4.5) ? "var(--accent)" : "none"} color={star <= (product.rating || 4.5) ? "var(--accent)" : "var(--text-muted)"} />)}
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({product.rating?.toFixed(1) || 4.8})</span>
                                    </div>
                                    <p className="product-description">
                                        {product.description}
                                    </p>
                                    <div style={{ marginTop: 'auto' }}>
                                        <div className="product-price">₹{product.price?.toFixed(2)}</div>
                                        <div className="product-meta">
                                            <button disabled={product.stock <= 0} onClick={(e) => { e.stopPropagation(); addToCart(product); toast.success('Added to Cart');}} className="btn btn-secondary" style={{ padding: '0.75rem', flex: 1, opacity: product.stock <= 0 ? 0.5 : 1 }}>
                                                <ShoppingCart size={18} />
                                            </button>
                                            <button disabled={product.stock <= 0} onClick={(e) => { e.stopPropagation(); handleBuyClick(product);}} className="btn btn-secure-buy" style={{ padding: '0.75rem 1rem', flex: 2, opacity: product.stock <= 0 ? 0.5 : 1 }}>
                                                <Zap size={16} style={{ marginRight: '4px' }} fill="currentColor" /> Buy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}

            {filteredProducts.length === 0 && !loading && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', marginTop: '6rem', color: 'var(--text-muted)' }}
                >
                    <ShoppingBag size={84} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                    <h3>No gadgets found.</h3>
                    <p>Try searching for something else or browse all categories.</p>
                </motion.div>
            )}
            

        <CheckoutModal 
            isOpen={isCheckoutModalOpen} 
            onClose={() => setIsCheckoutModalOpen(false)} 
            onConfirm={confirmPurchase} 
            itemTitle={selectedBuyProduct?.title} 
        />
        <ProductModal
            isOpen={isProductModalOpen}
            onClose={() => { setIsProductModalOpen(false); setSelectedViewProduct(null); }}
            product={selectedViewProduct}
            onBuy={(prod) => {
                setIsProductModalOpen(false);
                handleBuyClick(prod);
            }}
            onAddToCart={(prod) => {
                addToCart(prod);
                toast.success('Added to Cart');
            }}
            onTrade={handleTradeClick}
        />
        </motion.div>
    );
};

export default Home;
