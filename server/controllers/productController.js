import { productDB, supabase, storageDB } from '../utils/supabaseDB.js';

export const getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20, minPrice, maxPrice, sort } = req.query;

    let query = supabase.from('products').select('*');

    if (category) query = query.eq('category', category);
    if (minPrice) query = query.gte('price', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice));

    // Handle search with ilike (case-insensitive like)
    if (search) query = query.ilike('name', `%${search}%`);

    // Add ordering
    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    }

    // Get total count
    const { data: products, error } = await query;
    if (error) throw error;

    const total = products ? products.length : 0;
    const skipAmount = (page - 1) * limit;
    const paginatedProducts = products ? products.slice(skipAmount, skipAmount + parseInt(limit)) : [];

    res.json({
      products: paginatedProducts,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await productDB.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, category, price, description, stock } = req.body;

    // Validate required fields
    if (!name || !category || price === undefined || price === null || price === '') {
      return res.status(400).json({ message: 'Name, category, and price are required' });
    }

    // Handle image - store in Supabase Storage
    let image = null;
    if (req.file) {
      const fs = await import('fs');
      const filepath = req.file.path;

      try {
        const fileBuffer = fs.readFileSync(filepath);
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const mimeType = req.file.mimetype || 'image/jpeg';

        // Upload to Supabase Storage
        image = await storageDB.uploadProductImage(fileBuffer, fileName, mimeType);

        // Delete the uploaded file from local server
        fs.unlinkSync(filepath);
      } catch (fileError) {
        console.error('File upload error:', fileError);
        // Fallback to local path if storage fails (though we prefer storage)
        image = `/uploads/${req.file.filename}`;
      }
    } else if (req.body.image) {
      image = req.body.image;
    }

    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Build product data
    const productData = {
      name: String(name).trim(),
      category: String(category).trim(),
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      image: image
    };

    if (description && description.trim()) {
      productData.description = description.trim();
    }

    const product = await productDB.create(productData);

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    const errorMessage = error.message || 'Unknown error';
    res.status(500).json({
      message: 'Error creating product',
      error: errorMessage,
      details: error.details || null
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // If new file uploaded, upload to storage and update image path
    if (req.file) {
      const fs = await import('fs');
      const filepath = req.file.path;

      try {
        const fileBuffer = fs.readFileSync(filepath);
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const mimeType = req.file.mimetype || 'image/jpeg';

        const imageUrl = await storageDB.uploadProductImage(fileBuffer, fileName, mimeType);
        updateData.image = imageUrl;

        fs.unlinkSync(filepath);
      } catch (error) {
        console.error('File upload error:', error);
        // Fallback
        updateData.image = `/uploads/${req.file.filename}`;
      }
    }

    // Convert numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);

    const product = await productDB.update(req.params.id, updateData);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await productDB.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete related order items first
    try {
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('product_id', req.params.id);
    } catch (err) {
      // Silently handle deletion errors
    }

    // Delete related cart items (from 'cart' table)
    try {
      const { error: cartError } = await supabase
        .from('cart')
        .delete()
        .eq('product_id', req.params.id);
    } catch (err) {
      // Silently handle deletion errors
    }

    // Delete image from storage bucket if it exists
    if (product.image) {
      try {
        await storageDB.deleteProductImage(product.image);
      } catch (err) {
        console.error('Error deleting image from storage:', err);
      }
    }

    // Now delete the product
    await productDB.delete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { query, category } = req.query;

    let searchQuery = supabase
      .from('products')
      .select('*')
      .ilike('name', `%${query}%`);

    if (category) searchQuery = searchQuery.eq('category', category);

    const { data: products, error } = await searchQuery;

    if (error) throw error;
    res.json(products || []);
  } catch (error) {
    res.status(500).json({ message: 'Error searching products', error: error.message });
  }
};
