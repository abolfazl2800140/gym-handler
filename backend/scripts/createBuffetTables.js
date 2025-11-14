const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/database');

async function createBuffetTables() {
    try {
        console.log('🔧 شروع ایجاد جداول بوفه...\n');

        // 1. اضافه کردن wallet_balance به members
        console.log('💰 اضافه کردن فیلد wallet_balance به جدول members...');
        await db.query(`
      ALTER TABLE members 
      ADD COLUMN IF NOT EXISTS wallet_balance BIGINT DEFAULT 0
    `);
        console.log('✅ فیلد wallet_balance اضافه شد');

        // 2. ایجاد جدول محصولات
        console.log('\n📦 ایجاد جدول buffet_products...');
        await db.query(`
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
      )
    `);
        console.log('✅ جدول buffet_products ایجاد شد');

        // 3. ایجاد جدول فروش
        console.log('\n🛒 ایجاد جدول buffet_sales...');
        await db.query(`
      CREATE TABLE IF NOT EXISTS buffet_sales (
        id SERIAL PRIMARY KEY,
        member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
        total_amount BIGINT NOT NULL,
        payment_method VARCHAR(20) DEFAULT 'wallet',
        status VARCHAR(20) DEFAULT 'completed',
        notes TEXT,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ جدول buffet_sales ایجاد شد');

        // 4. ایجاد جدول آیتم‌های فروش
        console.log('\n📋 ایجاد جدول buffet_sale_items...');
        await db.query(`
      CREATE TABLE IF NOT EXISTS buffet_sale_items (
        id SERIAL PRIMARY KEY,
        sale_id INTEGER REFERENCES buffet_sales(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES buffet_products(id) ON DELETE SET NULL,
        product_name VARCHAR(100) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price BIGINT NOT NULL,
        total_price BIGINT NOT NULL
      )
    `);
        console.log('✅ جدول buffet_sale_items ایجاد شد');

        // 5. ایجاد Indexes
        console.log('\n🔍 ایجاد Indexes...');
        await db.query(`
      CREATE INDEX IF NOT EXISTS idx_buffet_products_category ON buffet_products(category);
      CREATE INDEX IF NOT EXISTS idx_buffet_products_available ON buffet_products(is_available);
      CREATE INDEX IF NOT EXISTS idx_buffet_sales_member ON buffet_sales(member_id);
      CREATE INDEX IF NOT EXISTS idx_buffet_sales_created_by ON buffet_sales(created_by);
      CREATE INDEX IF NOT EXISTS idx_buffet_sales_date ON buffet_sales(created_at);
      CREATE INDEX IF NOT EXISTS idx_buffet_sale_items_sale ON buffet_sale_items(sale_id);
      CREATE INDEX IF NOT EXISTS idx_buffet_sale_items_product ON buffet_sale_items(product_id);
    `);
        console.log('✅ Indexes ایجاد شدند');

        // 6. اضافه کردن داده‌های نمونه
        console.log('\n🍔 اضافه کردن محصولات نمونه...');
        const products = [
            { name: 'ساندویچ مرغ', category: 'غذا', price: 50000, stock: 20, unit: 'عدد' },
            { name: 'پیتزا مینی', category: 'غذا', price: 80000, stock: 15, unit: 'عدد' },
            { name: 'آب معدنی', category: 'نوشیدنی', price: 5000, stock: 100, unit: 'عدد' },
            { name: 'نوشابه', category: 'نوشیدنی', price: 10000, stock: 50, unit: 'عدد' },
            { name: 'پروتئین وی', category: 'مکمل', price: 150000, stock: 30, unit: 'عدد' },
            { name: 'کراتین', category: 'مکمل', price: 200000, stock: 20, unit: 'عدد' },
            { name: 'چیپس', category: 'اسنک', price: 15000, stock: 40, unit: 'عدد' },
            { name: 'شکلات', category: 'اسنک', price: 20000, stock: 35, unit: 'عدد' }
        ];

        for (const product of products) {
            try {
                await db.query(
                    `INSERT INTO buffet_products (name, category, price, stock, unit)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
                    [product.name, product.category, product.price, product.stock, product.unit]
                );
                console.log(`  ✅ ${product.name}`);
            } catch (err) {
                console.log(`  ⚠️  ${product.name} قبلاً وجود دارد`);
            }
        }

        console.log('\n✅ تمام جداول و داده‌های بوفه با موفقیت ایجاد شدند!');
        console.log('\n📊 خلاصه:');
        console.log('  - جدول buffet_products ✅');
        console.log('  - جدول buffet_sales ✅');
        console.log('  - جدول buffet_sale_items ✅');
        console.log('  - فیلد wallet_balance در members ✅');
        console.log('  - 8 محصول نمونه ✅');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ خطا در ایجاد جداول:', error);
        process.exit(1);
    }
}

createBuffetTables();
