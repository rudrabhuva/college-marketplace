import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { registerUser, loginUser } from '../db';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', college: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await registerUser(formData);
            const foundUser = await loginUser(formData.email, formData.password);
            login(foundUser);
            toast.success('Account created! Welcome.');
            navigate('/');
        } catch (err) {
            toast.error(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="auth-container">
            <div className="glass-panel auth-box">
                <div className="auth-header">
                    <h2>Create an Account</h2>
                    <p className="text-muted">Start buying and selling today</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">College Name</label>
                        <input
                            type="text"
                            name="college"
                            className="form-input"
                            value={formData.college}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-input"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
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
                        {loading ? <div className="loader" style={{ width: 16, height: 16, margin: 0 }} /> : <><UserPlus size={18} /> Sign Up</>}
                    </button>
                    <div className="auth-footer">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default Register;
