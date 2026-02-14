import { useState, useEffect } from 'react';
import api, { saleService, productService } from '../services/api';
import { Plus, ShoppingCart, Calendar, DollarSign, X, Receipt } from 'lucide-react';
import './Products.css';

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, saleRes] = await Promise.all([
                productService.getAll(),
                api.get('/sales')
            ]);
            setProducts(prodRes.data);
            setSales(saleRes.data.reverse()); // Newest first
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = () => {
        if (!selectedProduct) return;
        const product = products.find(p => p.id === parseInt(selectedProduct));
        if (product.current_stock < quantity) {
            alert('Not enough stock available!');
            return;
        }

        const existing = cart.find(item => item.product_id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.product_id === product.id
                    ? { ...item, quantity: item.quantity + parseInt(quantity) }
                    : item
            ));
        } else {
            setCart([...cart, {
                product_id: product.id,
                name: product.name,
                quantity: parseInt(quantity),
                price: product.price
            }]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        try {
            await saleService.create({ items: cart.map(({ product_id, quantity }) => ({ product_id, quantity })) });
            setShowModal(false);
            setCart([]);
            alert('Sale recorded successfully!');
            fetchData();
        } catch (err) {
            alert('Error recording sale: ' + (err.response?.data?.detail || 'Try again'));
        }
    };

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);

    return (
        <div className="sales-page fade-in">
            <div className="page-header">
                <div>
                    <h1>Sales Transactions</h1>
                    <p>Track your customer orders and revenue</p>
                </div>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    <span>New Sale</span>
                </button>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><DollarSign size={24} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Total Revenue</p>
                        <h3 className="stat-value">${totalRevenue.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><Receipt size={24} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Total Orders</p>
                        <h3 className="stat-value">{sales.length}</h3>
                    </div>
                </div>
            </div>

            <div className="products-table-container glass">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Total Amount</th>
                            <th>Date</th>
                            <th>Items</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(sale => (
                            <tr key={sale.id}>
                                <td><code className="sku-code">INV-{sale.id.toString().padStart(4, '0')}</code></td>
                                <td>${Number(sale.total_amount).toFixed(2)}</td>
                                <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                                <td>{sale.items?.length || 0} Products</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sales.length === 0 && !loading && (
                    <div className="p-8 text-center text-muted">
                        No sales transactions recorded yet.
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass fade-in" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>Create New Sale</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>
                        <div className="sale-form-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div className="product-selection">
                                <div className="form-group">
                                    <label>Select Product</label>
                                    <select
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="">Choose a product...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} (${p.price}) - Stock: {p.current_stock}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <button className="secondary-btn w-full mt-4" onClick={addToCart}>
                                    Add to Cart
                                </button>
                            </div>

                            <div className="cart-summary">
                                <h3 className="font-semibold mb-2">Cart Items</h3>
                                <div className="cart-list mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {cart.map((item, i) => (
                                        <div key={i} className="cart-item py-2 border-b flex justify-between">
                                            <span>{item.name} x {item.quantity}</span>
                                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    {cart.length === 0 && <p className="text-muted italic">Cart is empty</p>}
                                </div>
                                <div className="cart-total mt-4 pt-4 border-t bold flex justify-between font-bold">
                                    <span>Total Amount:</span>
                                    <span>${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                                </div>
                                <button
                                    className="primary-btn w-full mt-6"
                                    onClick={handleSubmit}
                                    disabled={cart.length === 0}
                                >
                                    Complete Sale
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sales;
