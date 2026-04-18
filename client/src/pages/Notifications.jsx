import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BellRing, PackageCheck, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { subscribeNotifications } from '../db';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user) return;
        
        setLoading(true);
        const unsubscribe = subscribeNotifications(user.id, (data) => {
            setNotifications(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const getIcon = (type) => {
        switch(type) {
            case 'success': return <CheckCircle size={20} color="var(--success)" />;
            case 'error': return <AlertCircle size={20} color="var(--danger)" />;
            default: return <Info size={20} color="var(--accent)" />;
        }
    };

    return (
        <div className="container" style={{ maxWidth: 800 }}>
            <div className="glass-panel" style={{ marginTop: '3rem' }}>
                <h2 style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BellRing size={28} color="var(--accent)" /> System Notifications
                </h2>

                {loading ? (
                    <div className="loader" />
                ) : notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                        <PackageCheck size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                        <p style={{ fontSize: '1.1rem' }}>Your inbox is currently clear.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {notifications.map(notif => (
                            <div key={notif.id} style={{
                                padding: '1.5rem',
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '16px',
                                border: '1px solid var(--glass-border)',
                                display: 'flex',
                                gap: '1.25rem',
                                alignItems: 'center'
                            }}>
                                <div style={{ 
                                    background: 'rgba(255,255,255,0.05)', 
                                    padding: '0.75rem', 
                                    borderRadius: '12px' 
                                }}>
                                    {getIcon(notif.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ color: 'var(--text-main)', margin: '0 0 0.5rem 0', fontSize: '1.05rem', lineHeight: 1.5 }}>
                                        {notif.message}
                                    </p>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                                        {new Date(notif.date).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
