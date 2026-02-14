import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, User, Mail, Shield, X, Trash2 } from 'lucide-react';
import './Products.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', newUser);
            setShowModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'staff' });
            fetchUsers();
        } catch (err) {
            alert('Error adding user: ' + (err.response?.data?.detail || 'Unauthorized (Admin only)'));
        }
    };

    if (loading) return <div className="p-8">Loading users...</div>;

    return (
        <div className="users-page fade-in">
            <div className="page-header">
                <div>
                    <h1>User Management</h1>
                    <p>Manage system access and permissions</p>
                </div>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    <span>Add User</span>
                </button>
            </div>

            <div className="products-table-container glass">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div className="product-info">
                                        <div className="product-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
                                            <User size={18} />
                                        </div>
                                        <span className="product-name">{u.name}</span>
                                    </div>
                                </td>
                                <td>{u.email}</td>
                                <td>
                                    <span className={`status-badge ${u.role === 'admin' ? 'active' : 'inactive'}`}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button className="action-btn text-error">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass fade-in">
                        <div className="modal-header">
                            <h2>Add New User</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="product-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <div className="input-with-icon">
                                    <User size={18} />
                                    <input
                                        type="text"
                                        placeholder="Enter name"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-with-icon">
                                    <Mail size={18} />
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <div className="input-with-icon">
                                    <Shield size={18} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <div className="input-with-icon">
                                    <Shield size={18} />
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
