-- BEAUTY POINT FULL DATABASE INITIALIZATION & DATA RESTORATION
-- 📦 Project: nnyccxmetdftbogltokf

-- 1. CLEANUP (Optional - only if you want to start fresh)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admin;

-- 2. CREATE TABLES

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  original_price NUMERIC,
  discount_percentage NUMERIC
);

-- Users (Sync table for Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Admin (Separate admin table)
CREATE TABLE admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Coupons
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
  discount_value NUMERIC NOT NULL,
  min_purchase NUMERIC DEFAULT 0,
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address TEXT,
  contact_phone TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  selected_color TEXT
);

-- Cart
CREATE TABLE cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  selected_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ENABLE SECURITY (RLS) & POLICIES
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read" ON products FOR SELECT USING (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Users" ON users FOR SELECT USING (true);
CREATE POLICY "User Update Self" ON users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User Read Own Orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public Create Orders" ON orders FOR INSERT WITH CHECK (true);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Create Items" ON order_items FOR INSERT WITH CHECK (true);

ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User Manage Own Cart" ON cart FOR ALL USING (auth.uid() = user_id);

ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin Select" ON admin FOR SELECT USING (true);
CREATE POLICY "Admin Insert" ON admin FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Update" ON admin FOR UPDATE USING (true);
CREATE POLICY "Admin Delete" ON admin FOR DELETE USING (true);

-- Grant access to the 'products' table
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO service_role;

-- Grant access to the 'users' table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO service_role;

-- Grant access to the 'admin' table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin TO service_role;

-- Grant access to the 'coupons' table
GRANT SELECT ON public.coupons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO service_role;

-- Grant access to the 'orders' table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO service_role;

-- Grant access to the 'order_items' table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO service_role;

-- Grant access to the 'cart' table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart TO service_role;

-- 5. RESTORE PRODUCTS (40 Rescue Items)
-- Note: I will provide the INSERT statement separately in the chat to avoid making this file too long.
