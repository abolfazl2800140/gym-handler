-- ==========================================
-- ایجاد جداول سیستم بوفه
-- ==========================================

-- 1. اضافه کردن فیلد wallet_balance به جدول members
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS wallet_balance BIGINT DEFAULT 0;

-- 2. ایجاد جدول محصولات بوفه
CREATE TABLE IF NOT EXISTS buffet_products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price BIGINT NOT NULL,
  stock INTEGER DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'عدد',
  image VARCHAR(255),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ایجاد جدول فروش بوفه
CREATE TABLE IF NOT EXISTS buffet_sales (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
  total_amount BIGINT NOT NULL,
  payment_method VARCHAR(20) DEFAULT 'wallet',
  status VARCHAR(20) DEFAULT 'completed',
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ایجاد جدول آیتم‌های فروش
CREATE TABLE IF NOT EXISTS buffet_sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES buffet_sales(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES buffet_products(id) ON DELETE SET NULL,
  product_name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price BIGINT NOT NULL,
  total_price BIGINT NOT NULL
);

-- ایجاد Indexes
CREATE INDEX IF NOT EXISTS idx_buffet_products_category ON buffet_products(category);
CREATE INDEX IF NOT EXISTS idx_buffet_products_available ON buffet_products(is_available);
CREATE INDEX IF NOT EXISTS idx_buffet_sales_member ON buffet_sales(member_id);
CREATE INDEX IF NOT EXISTS idx_buffet_sales_created_by ON buffet_sales(created_by);
CREATE INDEX IF NOT EXISTS idx_buffet_sales_date ON buffet_sales(created_at);
CREATE INDEX IF NOT EXISTS idx_buffet_sale_items_sale ON buffet_sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_buffet_sale_items_product ON buffet_sale_items(product_id);

-- اضافه کردن داده‌های نمونه
INSERT INTO buffet_products (name, category, price, stock, unit) VALUES
  ('ساندویچ مرغ', 'غذا', 50000, 20, 'عدد'),
  ('پیتزا مینی', 'غذا', 80000, 15, 'عدد'),
  ('آب معدنی', 'نوشیدنی', 5000, 100, 'عدد'),
  ('نوشابه', 'نوشیدنی', 10000, 50, 'عدد'),
  ('پروتئین وی', 'مکمل', 150000, 30, 'عدد'),
  ('کراتین', 'مکمل', 200000, 20, 'عدد'),
  ('چیپس', 'اسنک', 15000, 40, 'عدد'),
  ('شکلات', 'اسنک', 20000, 35, 'عدد')
ON CONFLICT DO NOTHING;

-- پایان اسکریپت
SELECT 'جداول بوفه با موفقیت ایجاد شدند!' as message;
