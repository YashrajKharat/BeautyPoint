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
    image: null,
    images: []
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
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (files.length > 6) {
        alert('You can only upload up to 6 images');
        return;
      }

      // Store files for upload
      setFormData(prev => ({
        ...prev,
        images: files
      }));

      // Generate previews
      const newPreviews = [];
      let loadedCount = 0;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          loadedCount++;
          if (loadedCount === files.length) {
            setImagePreview(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      });
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
      if (formData.colors) {
        form.append('colors', formData.colors);
      }

      // Append image files
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach(file => {
          if (file instanceof File) {
            form.append('images', file);
          }
        });
      } else if (formData.image instanceof File) {
        // Fallback for single image if state wasn't cleared
        form.append('images', formData.image);
      }

      // If we are editing and have existing images but no new files, we generally don't send 'images'
      // The backend should preserve existing if 'images' is missing?
      // Or we need to handle "existing images" preservation?
      // The current backend Update logic appends new images.

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
        image: null,
        images: []
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
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
      image: product.image,
      images: [],
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : (product.colors || '')
    });
    setEditingId(product.id);
    if (product.images && product.images.length > 0) {
      setImagePreview(product.images);
    } else if (product.image) {
      setImagePreview(product.image); // Single string
    } else {
      setImagePreview(null);
    }
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

            <div className="form-group-colors">
              <label htmlFor="colors-input">Available Colors (comma separated)</label>
              <textarea
                id="colors-input"
                name="colors"
                placeholder="Red, Blue, Green, #FF0000"
                value={formData.colors || ''}
                onChange={handleInputChange}
                rows="2"
              />
            </div>

            <div className="image-upload-section">
              <label htmlFor="image-input">Product Images (Max 6)</label>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
              <div className="image-previews-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                {imagePreview && !Array.isArray(imagePreview) && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                  </div>
                )}
                {Array.isArray(imagePreview) && imagePreview.map((src, idx) => (
                  <div key={idx} className="image-preview">
                    <img src={src} alt={`Preview ${idx}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
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
