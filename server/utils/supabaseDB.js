import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is missing in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// User operations
export const userDB = {
  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },

  async findByPhone(phone) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },

  async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, userData) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;
    return data;
  }
};

// Product operations
export const productDB = {
  async create(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;
    return data;
  },

  async update(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Cart operations
export const cartDB = {
  async addItem(userId, productId, quantity, selectedColor = null) {
    const { data, error } = await supabase
      .from('cart')
      .insert([{ user_id: userId, product_id: productId, quantity, selected_color: selectedColor }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getByUser(userId) {
    const { data, error } = await supabase
      .from('cart')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async updateQuantity(cartId, quantity) {
    const { data, error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('id', cartId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeItem(cartId) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartId);

    if (error) throw error;
    return true;
  },

  async clearCart(userId) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
};

// Order operations
export const orderDB = {
  async create(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addOrderItem(orderItemData) {
    const { data, error } = await supabase
      .from('order_items')
      .insert([orderItemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getByUser(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), users(email, phone, name)');

    if (error) throw error;
    return data;
  },

  async update(id, orderData) {
    const { data, error } = await supabase
      .from('orders')
      .update(orderData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    // Manually delete order items first to avoid Foreign Key constraint errors
    // (In case Cascade Delete is not enabled on the DB)
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id);

    if (itemsError) throw itemsError;

    // Now delete the order
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Coupon operations
export const couponDB = {
  async create(couponData) {
    const { data, error } = await supabase
      .from('coupons')
      .insert([couponData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async findByCode(code) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('coupons')
      .select('*');

    if (error) throw error;
    return data;
  },

  async update(id, couponData) {
    const { data, error } = await supabase
      .from('coupons')
      .update(couponData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Newsletter operations


// Storage operations
export const storageDB = {
  async uploadProductImage(fileBuffer, fileName, contentType) {
    const { data, error } = await supabase
      .storage
      .from('products')
      .upload(fileName, fileBuffer, {
        contentType: contentType,
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase
      .storage
      .from('products')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async deleteProductImage(url) {
    if (!url || !url.includes('/storage/v1/object/public/products/')) return;

    // Extract filename from URL
    const fileName = url.split('/products/').pop();

    const { error } = await supabase
      .storage
      .from('products')
      .remove([fileName]);

    if (error) throw error;
    return true;
  }
};
