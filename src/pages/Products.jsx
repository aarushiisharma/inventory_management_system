import { useState, useEffect } from 'react';
import { productService, categoryService } from '../services/api';
import { Plus, Search, Filter, MoreVertical, Package, Tag, DollarSign, Layers, AlertTriangle } from 'lucide-react';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        sku: '',
        category_id: '',
        price: '',
        cost_price: '',
        reorder_level: 5,
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                productService.getAll(),
                categoryService.getAll()
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newProduct,
                category_id: parseInt(newProduct.category_id),
                price: parseFloat(newProduct.price),
                cost_price: parseFloat(newProduct.cost_price),
                reorder_level: parseInt(newProduct.reorder_level)
            };
            // Note: 'description' is not in the backend schema ProductCreate, 
            // so we omit it from the payload.
            delete payload.description;

            await productService.create(payload);
            setShowModal(false);
            fetchData();
            setNewProduct({
                name: '',
                sku: '',
                category_id: '',
                price: '',
                cost_price: '',
                reorder_level: 5,
                description: ''
            });
        } catch (err) {
            console.error(err);
            alert('Error creating product: ' + (err.response?.data?.detail || 'Check if category exists'));
        }
    };

    return (
        <div className="products-page fade-in">
            <div className="page-header">
                <div>
                    <h1>Products</h1>
                    <p>Manage your inventory catalog</p>
                </div>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="filters-bar glass">
                <div className="search-input">
                    <Search size={18} />
                    <input type="text" placeholder="Search products..." />
                </div>
                <div className="filter-actions">
                    <button className="filter-btn">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                    <button className="filter-btn">
                        <Layers size={18} />
                        <span>Categories</span>
                    </button>
                </div>
            </div>

            <div className="products-table-container glass">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            const category = categories.find(c => c.id === product.category_id);
                            return (
                                <tr key={product.id}>
                                    <td>
                                        <div className="product-info">
                                            <div className="product-icon">
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <p className="product-name">{product.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td><code className="sku-code">{product.sku}</code></td>
                                    <td>{category?.name || 'N/A'}</td>
                                    <td>${Number(product.price).toFixed(2)}</td>
                                    <td>
                                        <span className={`stock-count ${product.current_stock <= product.reorder_level ? 'low' : ''}`}>
                                            {product.current_stock}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${product.current_stock > 0 ? 'active' : 'inactive'}`}>
                                            {product.current_stock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass fade-in">
                        <div className="modal-header">
                            <h2>Add New Product</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="product-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <div className="input-with-icon">
                                        <Package size={18} />
                                        <input
                                            type="text"
                                            placeholder="Enter product name"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>SKU (Unique ID)</label>
                                    <div className="input-with-icon">
                                        <Tag size={18} />
                                        <input
                                            type="text"
                                            placeholder="e.g. LAP-001"
                                            value={newProduct.sku}
                                            onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <div className="input-with-icon">
                                        <Layers size={18} />
                                        <select
                                            value={newProduct.category_id}
                                            onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Selling Price ($)</label>
                                    <div className="input-with-icon">
                                        <DollarSign size={18} />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Cost Price ($)</label>
                                    <div className="input-with-icon">
                                        <DollarSign size={18} />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={newProduct.cost_price}
                                            onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Reorder Level</label>
                                    <div className="input-with-icon">
                                        <AlertTriangle size={18} />
                                        <input
                                            type="number"
                                            value={newProduct.reorder_level}
                                            onChange={(e) => setNewProduct({ ...newProduct, reorder_level: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    rows="2"
                                    placeholder="Optional description"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Create Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
