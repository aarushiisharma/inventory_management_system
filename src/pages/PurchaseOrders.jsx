import { useState, useEffect } from 'react';
import { poService, productService, vendorService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, ClipboardList, Truck, DollarSign, X, CheckCircle, Package, Clock, ShieldCheck } from 'lucide-react';
import './Products.css';

const PurchaseOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // New PO state
    const [selectedVendor, setSelectedVendor] = useState('');
    const [items, setItems] = useState([]);
    const [curProduct, setCurProduct] = useState('');
    const [curQty, setCurQty] = useState(1);
    const [curPrice, setCurPrice] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, vendRes, orderRes] = await Promise.all([
                productService.getAll(),
                vendorService.getAll(),
                poService.getAll()
            ]);
            setProducts(prodRes.data);
            setVendors(vendRes.data);
            setOrders(orderRes.data.reverse()); // Show newest first
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        if (!curProduct || curPrice <= 0) return;
        const product = products.find(p => p.id === parseInt(curProduct));
        setItems([...items, {
            product_id: product.id,
            name: product.name,
            quantity: parseInt(curQty),
            unit_price: parseFloat(curPrice)
        }]);
        setCurProduct('');
        setCurQty(1);
        setCurPrice(0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedVendor || items.length === 0) return;
        try {
            await poService.create({
                vendor_id: parseInt(selectedVendor),
                items: items.map(({ product_id, quantity, unit_price }) => ({
                    product_id, quantity, unit_price
                }))
            });
            setShowModal(false);
            setItems([]);
            setSelectedVendor('');
            alert('Purchase Order created successfully!');
            fetchData();
        } catch (err) {
            alert('Error creating PO: ' + (err.response?.data?.detail || 'Try again'));
        }
    };

    const handleApprove = async (id) => {
        try {
            await poService.approve(id);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.detail || 'Approval failed');
        }
    };

    const handleReceive = async (id) => {
        try {
            await poService.receive(id);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.detail || 'Receiving failed');
        }
    };

    return (
        <div className="po-page fade-in">
            <div className="page-header">
                <div>
                    <h1>Purchase Orders</h1>
                    <p>Replenish stock from your vendors</p>
                </div>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    <span>New Order</span>
                </button>
            </div>

            <div className="products-table-container glass">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Vendor</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Created at</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => {
                            const vendor = vendors.find(v => v.id === order.vendor_id);
                            return (
                                <tr key={order.id}>
                                    <td><code className="sku-code">PO-{order.id.toString().padStart(4, '0')}</code></td>
                                    <td>{vendor?.name || `Vendor #${order.vendor_id}`}</td>
                                    <td>${Number(order.total_amount).toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${order.status === 'Completed' ? 'active' :
                                                order.status === 'Approved' ? 'active alert' : 'inactive'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            {order.status === 'Pending' && user?.role === 'admin' && (
                                                <button
                                                    className="action-btn text-success"
                                                    title="Approve Order"
                                                    onClick={() => handleApprove(order.id)}
                                                >
                                                    <ShieldCheck size={18} />
                                                </button>
                                            )}
                                            {order.status === 'Approved' && (user?.role === 'staff' || user?.role === 'admin' || user?.role === 'manager') && (
                                                <button
                                                    className="action-btn text-primary"
                                                    title="Receive Stock"
                                                    onClick={() => handleReceive(order.id)}
                                                >
                                                    <Package size={18} />
                                                </button>
                                            )}
                                            {order.status === 'Completed' && (
                                                <CheckCircle className="text-success" size={18} />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {orders.length === 0 && !loading && (
                    <div className="p-8 text-center text-muted">
                        No purchase orders found.
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass fade-in" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>Create Purchase Order</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="product-form">
                            <div className="form-group">
                                <label>Vendor</label>
                                <select
                                    value={selectedVendor}
                                    onChange={(e) => setSelectedVendor(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">Select Vendor</option>
                                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>

                            <div className="items-builder mt-6 p-4 border rounded bg-slate-50">
                                <h3 className="font-semibold mb-2">Add Items</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <select value={curProduct} onChange={(e) => setCurProduct(e.target.value)} className="p-2 border rounded">
                                        <option value="">Choose Product</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <input type="number" placeholder="Qty" value={curQty} onChange={(e) => setCurQty(e.target.value)} className="p-2 border rounded" min="1" />
                                    <input type="number" step="0.01" placeholder="Unit Price" value={curPrice} onChange={(e) => setCurPrice(e.target.value)} className="p-2 border rounded" min="0" />
                                    <button type="button" onClick={addItem} className="secondary-btn">Add Item</button>
                                </div>
                            </div>

                            <div className="items-list mt-6" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-white">
                                        <tr className="border-b">
                                            <th className="py-2">Product</th>
                                            <th className="py-2">Quantity</th>
                                            <th className="py-2">Price</th>
                                            <th className="py-2">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, i) => (
                                            <tr key={i} className="border-b">
                                                <td className="py-2">{item.name}</td>
                                                <td className="py-2">{item.quantity}</td>
                                                <td className="py-2">${item.unit_price.toFixed(2)}</td>
                                                <td className="py-2">${(item.quantity * item.unit_price).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="modal-footer mt-8">
                                <div className="mr-auto font-bold text-xl">
                                    Total: ${items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}
                                </div>
                                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="primary-btn" disabled={items.length === 0}>Create Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .alert { background: #fef3c7 !important; color: #d97706 !important; }
                .text-success { color: #16a34a; }
                .text-primary { color: #2563eb; }
                .flex { display: flex; }
                .gap-2 { gap: 0.5rem; }
                .font-bold { font-weight: 700; }
                .text-xl { font-size: 1.25rem; }
                .mr-auto { margin-right: auto; }
            `}</style>
        </div>
    );
};

export default PurchaseOrders;
