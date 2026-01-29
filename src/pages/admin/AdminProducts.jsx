import { useState, useEffect } from 'react';
import { productAPI } from '../../services/api.js';
import '../../css/admin-light.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'cosmetics',
    stock: '',
    image: null
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productAPI.getAll();
      setProducts(response.data?.products || response.data || []);
    } catch (error) {
      alert('Failed to fetch products: ' + error.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Store file for upload
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create FormData for file upload
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('price', formData.price);
      form.append('category', formData.category);
      form.append('stock', formData.stock);
      
      // Append image file if it's a File object
      if (formData.image instanceof File) {
        form.append('image', formData.image);
      }
      
      if (editingId) {
        await productAPI.update(editingId, form);
        alert('Product updated successfully!');
      } else {
        await productAPI.create(form);
        alert('Product created successfully!');
      }
      setShowForm(false);
      setEditingId(null);
      setImagePreview(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'cosmetics',
        stock: '',
        image: null
      });
      fetchProducts();
    } catch (error) {
      alert('Error saving product: ' + error.message);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        // Remove product from state immediately
        setProducts(products.filter(product => product.id !== id));
        alert('Product deleted successfully!');
      } catch (error) {
        alert('Failed to delete product: ' + error.message);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'cosmetics',
      stock: '',
      image: ''
    });
  };

  return (
    <div className="admin-products">
      <div className="products-header">
        <h1>Products Management</h1>
        <button 
          className="btn-add" 
          onClick={() => setShowForm(true)}
        >
          Add New Product
        </button>
      </div>

      {showForm && (
        <div className="product-form-container">
          <form onSubmit={handleSubmit} className="product-form">
            <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            
            <textarea
              name="description"
              placeholder="Product Description"
              value={formData.description}
              onChange={handleInputChange}
              required
            ></textarea>
            
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
            
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="cosmetics">Cosmetics</option>
              <option value="jewelry">Jewelry</option>
              <option value="bags">Bags</option>
              <option value="perfume">Perfume</option>
              <option value="watches">Watches</option>
            </select>
            
            <input
              type="number"
              name="stock"
              placeholder="Stock Quantity"
              value={formData.stock}
              onChange={handleInputChange}
              required
            />
            
            <div className="image-upload-section">
              <label htmlFor="image-input">Product Image</label>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="btn-save">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₹{product.price}</td>
                  <td>{product.stock}</td>
                  <td>{product.description?.substring(0, 30)}...</td>
                  <td className="actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
