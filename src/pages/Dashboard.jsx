import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import {
    TrendingUp,
    Package,
    Truck,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await dashboardService.getSummary();
                setSummary(response.data);
            } catch (err) {
                console.error('Error fetching dashboard summary:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const stats = [
        {
            label: 'Total Products',
            value: summary?.total_products || 0,
            icon: Package,
            color: '#3b82f6',
            trend: '+12%',
            trendUp: true
        },
        {
            label: 'Total Vendors',
            value: summary?.total_vendors || 0,
            icon: Truck,
            color: '#10b981',
            trend: '+4%',
            trendUp: true
        },
        {
            label: 'Total Sales',
            value: `$${summary?.total_sales?.toFixed(2) || '0.00'}`,
            icon: TrendingUp,
            color: '#8b5cf6',
            trend: '+23%',
            trendUp: true
        },
        {
            label: 'Low Stock',
            value: summary?.low_stock_count || 0,
            icon: AlertTriangle,
            color: '#ef4444',
            trend: '-2',
            trendUp: false
        },
    ];

    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="dashboard-page fade-in">
            <div className="dashboard-header">
                <h1>Dashboard Overview</h1>
                <p>Monitor your inventory performance and stock movements</p>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">{stat.label}</p>
                            <h3 className="stat-value">{stat.value}</h3>
                            <div className={`stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
                                {stat.trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                <span>{stat.trend}</span>
                                <span className="trend-text">vs last month</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-main">
                <div className="recent-movements glass">
                    <div className="card-header">
                        <h3>Recent Stock Movements</h3>
                        <button className="view-all">View All</button>
                    </div>
                    <div className="movements-list">
                        {summary?.recent_stock_movement?.length > 0 ? (
                            summary.recent_stock_movement.map((m, i) => (
                                <div key={i} className="movement-item">
                                    <div className={`movement-badge ${m.movement_type}`}>
                                        {m.movement_type.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="movement-details">
                                        <p className="movement-title">
                                            Product #{m.product_id}
                                            <span className={m.quantity_change > 0 ? 'text-success' : 'text-error'}>
                                                {m.quantity_change > 0 ? '+' : ''}{m.quantity_change} Units
                                            </span>
                                        </p>
                                        <p className="movement-meta">
                                            Type: {m.movement_type} | Ref: {m.reference_id}
                                        </p>
                                    </div>
                                    <div className="movement-time">
                                        {new Date(m.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No recent movements found</p>
                        )}
                    </div>
                </div>

                <div className="inventory-summary glass">
                    <div className="card-header">
                        <h3>Inventory Status</h3>
                    </div>
                    <div className="status-chart-placeholder">
                        {/* Simple representation of stock health */}
                        <div className="health-bar">
                            <div className="health-fill" style={{ width: '85%' }}></div>
                        </div>
                        <p className="health-label">85% Stock Optimization</p>
                        <div className="health-details">
                            <div className="health-stat">
                                <span>Healthy</span>
                                <strong>42</strong>
                            </div>
                            <div className="health-stat">
                                <span>Low</span>
                                <strong>{summary?.low_stock_count || 0}</strong>
                            </div>
                            <div className="health-stat">
                                <span>Out</span>
                                <strong>0</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
