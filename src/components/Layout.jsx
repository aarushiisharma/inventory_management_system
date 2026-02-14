import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    Users as UsersIcon,
    ShoppingCart,
    Truck,
    LogOut,
    Menu,
    X,
    Plus
} from 'lucide-react';
import { useState } from 'react';
import './Layout.css';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'staff'] },
        { name: 'Products', path: '/products', icon: Package, roles: ['admin', 'manager', 'staff'] },
        { name: 'Vendors', path: '/vendors', icon: Truck, roles: ['admin', 'manager', 'staff'] },
        { name: 'Sales', path: '/sales', icon: ShoppingCart, roles: ['admin', 'manager', 'staff'] },
        { name: 'Purchase Orders', path: '/purchase-orders', icon: Plus, roles: ['admin', 'manager', 'staff'] },
        { name: 'Users', path: '/users', icon: UsersIcon, roles: ['admin'] },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="layout-container">
            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <div className="logo-icon">S</div>
                        <span className="logo-text">Inventory</span>
                    </div>
                    <button className="mobile-toggle" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span className="nav-text">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <p className="user-name">{user?.name}</p>
                            <p className="user-role">{user?.role}</p>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span className="nav-text">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="main-header glass">
                    <button className="desktop-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                        <Menu size={24} />
                    </button>
                    <div className="header-actions">
                        <div className="search-bar">
                            <input type="text" placeholder="Search..." />
                        </div>
                    </div>
                </header>
                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
