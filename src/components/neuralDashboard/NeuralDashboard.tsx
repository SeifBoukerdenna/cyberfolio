import { useState, useEffect } from 'react';

const NeuralDashboard = () => {
    // State to track network metrics
    const [metrics, setMetrics] = useState({
        activity: 11,
        neurons: '2/6',
        pulses: 0,
        health: 93,
        state: 'STABLE'
    });

    // Simulate changing metrics periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                activity: Math.max(5, Math.min(95, prev.activity + (Math.random() - 0.5) * 5)),
                pulses: Math.max(0, prev.pulses + Math.floor((Math.random() - 0.5) * 2)),
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="neural-dashboard" style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(10, 10, 18, 0.85)',
            borderTop: '1px solid #3b4a6b',
            borderLeft: '1px solid #3b4a6b',
            borderRight: '1px solid #3b4a6b',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            padding: '10px 15px 8px',
            display: 'flex',
            gap: '20px',
            zIndex: 100,
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.5), 0 0 5px rgba(0, 255, 170, 0.2)',
            backdropFilter: 'blur(3px)',
        }}>
            <div className="metric-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="metric-label" style={{ fontSize: '0.75rem', color: '#908878' }}>ACTIVITY</span>
                <span className="metric-value" style={{ fontSize: '0.85rem', color: '#d0c8c0', fontWeight: 'bold', fontFamily: 'Courier New, monospace' }}>
                    {Math.round(metrics.activity)}%
                </span>
            </div>

            <div className="metric-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="metric-label" style={{ fontSize: '0.75rem', color: '#908878' }}>NEURONS</span>
                <span className="metric-value" style={{ fontSize: '0.85rem', color: '#d0c8c0', fontWeight: 'bold', fontFamily: 'Courier New, monospace' }}>
                    {metrics.neurons}
                </span>
            </div>

            <div className="metric-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="metric-label" style={{ fontSize: '0.75rem', color: '#908878' }}>PULSES</span>
                <span className="metric-value" style={{ fontSize: '0.85rem', color: '#d0c8c0', fontWeight: 'bold', fontFamily: 'Courier New, monospace' }}>
                    {metrics.pulses}
                </span>
            </div>

            <div className="metric-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="metric-label" style={{ fontSize: '0.75rem', color: '#908878' }}>HEALTH</span>
                <span className="metric-value" style={{ fontSize: '0.85rem', color: '#d0c8c0', fontWeight: 'bold', fontFamily: 'Courier New, monospace' }}>
                    {metrics.health}%
                </span>
            </div>

            <div className="metric-item" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="metric-label" style={{ fontSize: '0.75rem', color: '#908878' }}>STATE</span>
                <span className="metric-value" style={{
                    fontSize: '0.85rem',
                    color: '#00ffaa',
                    fontWeight: 'bold',
                    fontFamily: 'Courier New, monospace'
                }}>
                    {metrics.state}
                </span>
            </div>
        </div>
    );
};

export default NeuralDashboard;