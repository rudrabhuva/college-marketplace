import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SellItem from './pages/SellItem';
import Notifications from './pages/Notifications';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import SiteBackground from './components/SiteBackground';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const { token } = React.useContext(AuthContext);
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const ScrollToTop = () => {
    const { pathname } = useLocation();

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

const AppContent = () => {
    return (
        <Router>
            <ScrollToTop />
            <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--glass-bg)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' } }} />
            <SiteBackground />
            <Navbar />
            <CartDrawer />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/sell" element={
                    <ProtectedRoute>
                        <SellItem />
                    </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                    <ProtectedRoute>
                        <Notifications />
                    </ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <ProtectedRoute>
                        <AdminPanel />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
            </Routes>
            <Footer />
        </Router>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <CartProvider>
                <AppContent />
            </CartProvider>
        </AuthProvider>
    );
};

export default App;
