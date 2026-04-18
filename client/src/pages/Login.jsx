import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { loginUser } from '../db';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const foundUser = await loginUser(formData.email, formData.password);
            login(foundUser);
            toast.success('Successfully logged in!');
            navigate('/');
        } catch (err) {
            toast.error(err.message || 'Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="auth-container">
            <div className="glass-panel auth-box">
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p className="text-muted">Sign in to buy and sell premium items</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? <div className="loader" style={{ width: 16, height: 16, margin: 0 }} /> : <><LogIn size={18} /> Sign In</>}
                    </button>
                    <div className="auth-footer">
                        Don't have an account? <Link to="/register">Create one</Link>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default Login;
