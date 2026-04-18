import React from 'react';
import { Mail, LayoutGrid, Globe, Link as LinkIcon, Share2 } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ background: 'rgba(15, 23, 42, 0.9)', borderTop: '1px solid var(--glass-border)', padding: '4rem 2rem', marginTop: '4rem', color: 'var(--text-muted)' }}>
            <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'space-between', padding: 0 }}>
                <div style={{ flex: '1 1 250px' }}>
                    <h3 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LayoutGrid size={24} color="var(--accent)" /> Eshop Tech
                    </h3>
                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        The premium destination for extraordinary tech gadgets, gaming gear, and accessories. Experience purely simulated shopping.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color='var(--accent)'} onMouseOut={e => e.target.style.color='var(--text-muted)'}><Globe size={20} /></a>
                        <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color='var(--accent)'} onMouseOut={e => e.target.style.color='var(--text-muted)'}><Share2 size={20} /></a>
                        <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color='var(--accent)'} onMouseOut={e => e.target.style.color='var(--text-muted)'}><LinkIcon size={20} /></a>
                    </div>
                </div>

                <div style={{ flex: '1 1 150px' }}>
                    <h4 style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}>Quick Links</h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <li><a href="/" style={{ color: 'inherit', transition: 'color 0.3s' }}>Home</a></li>
                        <li><a href="/#products" style={{ color: 'inherit', transition: 'color 0.3s' }}>Products</a></li>
                        <li><a href="/login" style={{ color: 'inherit', transition: 'color 0.3s' }}>Login</a></li>
                        <li><a href="/register" style={{ color: 'inherit', transition: 'color 0.3s' }}>Sign Up</a></li>
                    </ul>
                </div>

                <div style={{ flex: '1 1 250px' }}>
                    <h4 style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}>Subscribe to Newsletter</h4>
                    <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Get the latest updates on new products and upcoming sales.</p>
                    <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully in simulated mode!'); }} style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Mail size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem' }} />
                            <input type="email" placeholder="Email Address" required className="form-input" style={{ paddingLeft: '2.5rem' }} />
                        </div>
                        <button type="submit" className="btn btn-primary">Subscribe</button>
                    </form>
                </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} Eshop Tech. All rights reserved. Simulated Frontend.
            </div>
        </footer>
    );
};

export default Footer;
