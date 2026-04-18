import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CheckoutModal = ({ isOpen, onClose, onConfirm, itemTitle }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        college: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.email || !formData.college) {
            toast.error("Please fill all required fields");
            return;
        }
        onConfirm(formData);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', 
                            backdropFilter: 'blur(5px)', zIndex: 10000
                        }}
                        onClick={onClose}
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: "-40%", x: "-50%" }}
                        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                        exit={{ opacity: 0, scale: 0.9, y: "-40%", x: "-50%" }}
                        style={{
                            position: 'fixed', top: '50%', left: '50%',
                            width: '90%', maxWidth: '400px', zIndex: 10001,
                            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--border-radius)', padding: '2rem',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', color: 'var(--text-muted)' }}>
                            <X size={20} />
                        </button>
                        
                        <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={24} color="var(--accent)" /> Checkout details
                        </h3>
                        {itemTitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Buying: {itemTitle}</p>}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Full Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                    placeholder="John Doe"
                                    required 
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Email Address</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                    placeholder="john@college.edu"
                                    required 
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">College Name</label>
                                <input 
                                    type="text" 
                                    name="college" 
                                    value={formData.college} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                    placeholder="Your University / College"
                                    required 
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Phone Number</label>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                    placeholder="+1 234 567 890"
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                Confirm Purchase
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CheckoutModal;
