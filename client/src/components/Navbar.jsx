import React, { useContext, useState, useEffect } from 'react';
import { ShoppingCart, LogOut, PlusCircle, User, Home, Grid, BellRing, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartCount, toggleCart } = useContext(CartContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = (scrollToTop = true) => {
        setIsMenuOpen(false);
        if (scrollToTop) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-logo" onClick={closeMenu}>
                <ShoppingCart color="var(--accent)" size={32} />
                <span className="gradient-text">College E-shop</span>
            </Link>

            <div className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                <Link to="/" className="nav-item" onClick={() => closeMenu()}>
                    <Home size={20}/> <span>Home</span>
                </Link>
                <Link to="/" className="nav-item" onClick={() => {
                    closeMenu(false);
                    setTimeout(() => {
                        const el = document.getElementById('products');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }}>
                    <Grid size={20}/> <span>Store</span>
                </Link>
                <Link to="/notifications" className="nav-item" onClick={() => closeMenu()}>
                    <BellRing size={20}/> <span>Alerts</span>
                </Link>
                <button onClick={() => { toggleCart(); closeMenu(false); }} className="nav-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', width: 'auto' }}>
                    <ShoppingCart size={20}/> <span>Cart</span>
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '-10px', right: '-15px', background: 'var(--accent)', color: 'white', 
                            fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '50%', fontWeight: '900', boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                        }}>
                            {cartCount}
                        </span>
                    )}
                </button>
                {user ? (
                    <>
                        {user.email === 'admin@eshop.com' && (
                            <Link to="/admin" className="nav-item" onClick={() => closeMenu()} style={{ color: 'var(--accent)', fontWeight: 800 }}>
                                <LayoutDashboard size={20} /> <span>Admin</span>
                            </Link>
                        )}
                        <Link to="/sell" className="nav-item" onClick={() => closeMenu()}>
                            <PlusCircle size={20} /> <span>Sell</span>
                        </Link>
                        <Link to="/dashboard" className="nav-item" onClick={() => closeMenu()}>
                            <User size={20} /> <span>Account</span>
                        </Link>
                        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                            <LogOut size={16} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-item" onClick={() => closeMenu()}>Login</Link>
                        <Link to="/register" className="btn btn-primary" onClick={() => closeMenu()} style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
