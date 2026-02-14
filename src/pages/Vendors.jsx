import { useState, useEffect } from 'react';
import { vendorService } from '../services/api';
import { Plus, Search, Truck, Mail, Phone, MapPin, X } from 'lucide-react';
import './Products.css'; // Reusing some table/form styles

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newVendor, setNewVendor] = useState({
        name: '',
        contact_info: '',
        address: ''
    });

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await vendorService.getAll();
            setVendors(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await vendorService.create(newVendor);
            setShowModal(false);
            setNewVendor({ name: '', contact_info: '', address: '' });
            fetchVendors();
        } catch (err) {
            console.error(err);
            alert('Error adding vendor: ' + (err.response?.data?.detail || 'Check connection'));
        }
    };

    return (
        <div className="vendors-page fade-in">
            <div className="page-header">
                <div>
                    <h1>Vendors</h1>
                    <p>Manage your supplier network</p>
                </div>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    <span>Add Vendor</span>
                </button>
            </div>

            <div className="vendors-grid">
                {vendors.map(vendor => (
                    <div key={vendor.id} className="vendor-card glass">
                        <div className="vendor-header">
                            <div className="vendor-avatar">
                                <Truck size={24} />
                            </div>
                            <h3>{vendor.name}</h3>
                        </div>
                        <div className="vendor-body">
                            <div className="contact-item">
                                <Mail size={16} />
                                <span>{vendor.contact_info}</span>
                            </div>
                            <div className="contact-item">
                                <MapPin size={16} />
                                <span>{vendor.address}</span>
                            </div>
                        </div>
                        <div className="vendor-footer">
                            <button className="secondary-btn">View History</button>
                            <button className="primary-btn">New Order</button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass fade-in">
                        <div className="modal-header">
                            <h2>Add New Vendor</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="product-form">
                            <div className="form-group">
                                <label>Vendor Name</label>
                                <div className="input-with-icon">
                                    <Truck size={18} />
                                    <input
                                        type="text"
                                        placeholder="Vendor Company Name"
                                        value={newVendor.name}
                                        onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Contact Info (Email/Phone)</label>
                                <div className="input-with-icon">
                                    <Mail size={18} />
                                    <input
                                        type="text"
                                        placeholder="email@example.com or phone number"
                                        value={newVendor.contact_info}
                                        onChange={(e) => setNewVendor({ ...newVendor, contact_info: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <div className="input-with-icon">
                                    <MapPin size={18} />
                                    <input
                                        type="text"
                                        placeholder="Full business address"
                                        value={newVendor.address}
                                        onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Register Vendor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .vendors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .vendor-card {
          padding: 1.5rem;
          border-radius: var(--radius);
          background: white;
          box-shadow: var(--shadow);
        }
        .vendor-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .vendor-avatar {
          width: 3rem;
          height: 3rem;
          background: #f1f5f9;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
        }
        .vendor-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .vendor-footer {
          display: flex;
          gap: 1rem;
        }
        .vendor-footer button {
          flex: 1;
          font-size: 0.75rem;
          padding: 0.5rem;
        }
      `}</style>
        </div>
    );
};

export default Vendors;
