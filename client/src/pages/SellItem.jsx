import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PackageOpen, ArrowLeft, UploadCloud } from 'lucide-react';
import { addProduct } from '../db';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import './SellItem.css';

const SellItem = () => {
    const [formData, setFormData] = useState({ title: '', description: '', price: '', image: '', stock: '10' });
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setImageFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.image && !imageFile) {
                setError('Please provide an image URL or upload a file.');
                setLoading(false);
                return;
            }

            await addProduct({
                title: formData.title,
                description: formData.description,
                price: Math.round(parseFloat(formData.price) * 100) / 100 || 0,
                image: formData.image,
                seller_id: user?.id || 1,
                seller_name: user?.name || 'Anonymous',
                seller_email: user?.email || 'N/A',
                seller_phone: user?.phone || 'N/A',
                seller_college: user?.college || 'N/A',
                rating: 5.0,
                stock: parseInt(formData.stock) || 10
            }, imageFile);
            
            toast.success('Item listed successfully!');
            navigate('/');
        } catch (err) {
            console.error("Upload Error:", err);
            setError(err.message || 'Failed to add item. Please check your connection.');
            toast.error('Failed to list item.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container sell-container">
            <button onClick={() => navigate(-1)} className="btn back-btn" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                <ArrowLeft size={18} /> <span>Back to store</span>
            </button>
            <div className="glass-panel">
                <header className="sell-header">
                    <div className="sell-icon-wrapper">
                        <PackageOpen size={30} />
                    </div>
                    <h1 className="sell-title gradient-text">Sell Your Gear</h1>
                    <p style={{ color: 'var(--text-muted)' }}>List your premium items for the elite community</p>
                </header>

                {error && <div className="alert">{error}</div>}
                
                <form onSubmit={handleSubmit} className="sell-form">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Product Name</label>
                        <input
                            type="text"
                            name="title"
                            className="form-input"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Ultra Horizon VR Headset"
                            required
                        />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            step="0.01"
                            className="form-input"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Stock Quantity</label>
                        <input
                            type="number"
                            name="stock"
                            className="form-input"
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="10"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Detailed Description</label>
                        <textarea
                            name="description"
                            className="form-input"
                            style={{ resize: 'vertical', minHeight: '120px' }}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe features and specs..."
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Product Representation</label>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <input
                                type="text"
                                name="image"
                                className="form-input"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="Paste image URL..."
                            />
                            <div className="image-upload-zone">
                                <UploadCloud size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" style={{ cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, display: 'block' }}>
                                    {imageFile ? imageFile.name : 'Or upload local image'}
                                </label>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }} disabled={loading}>
                        {loading ? <div className="loader" style={{ width: 20, height: 20, margin: 0 }} /> : 'List Product Now'}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default SellItem;
