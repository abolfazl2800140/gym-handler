const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/database');

const sampleProducts = [
    { name: 'ساندویچ مرغ', category: 'ساندویچ', price: 45000, stock: 20, unit: 'عدد', is_available: true },
    { name: 'ساندویچ کالباس', category: 'ساندویچ', price: 35000, stock: 15, unit: 'عدد', is_available: true },
    { name: 'پیتزا مخصوص', category: 'پیتزا', price: 120000, stock: 10, unit: 'عدد', is_available: true },
    { name: 'پیتزا پپرونی', category: 'پیتزا', price: 100000, stock: 12, unit: 'عدد', is_available: true },
    { name: 'نوشابه', category: 'نوشیدنی', price: 15000, stock: 50, unit: 'عدد', is_available: true },
    { name: 'آب معدنی', category: 'نوشیدنی', price: 8000, stock: 60, unit: 'عدد', is_available: true },
    { name: 'دلستر', category: 'نوشیدنی', price: 12000, stock: 40, unit: 'عدد', is_available: true },
    { name: 'چیپس', category: 'تنقلات', price: 18000, stock: 30, unit: 'بسته', is_available: true },
    { name: 'شکلات', category: 'تنقلات', price: 25000, stock: 25, unit: 'عدد', is_available: true },
    { name: 'پروتئین شیک', category: 'مکمل', price: 55000, stock: 15, unit: 'عدد', is_available: true },
    { name: 'انرژی بار', category: 'مکمل', price: 30000, stock: 20, unit: 'عدد', is_available: true },
    { name: 'سالاد سزار', category: 'سالاد', price: 65000, stock: 8, unit: 'عدد', is_available: true },
];

async function addSampleProducts() {
    try {
        console.log('شروع افزودن محصولات نمونه...');

        for (const product of sampleProducts) {
            try {
                const result = await db.query(
                    `INSERT INTO buffet_products (name, category, price, stock, unit, is_available)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     RETURNING *`,
                    [product.name, product.category, product.price, product.stock, product.unit, product.is_available]
                );
                console.log(`✓ ${product.name} اضافه شد`);
            } catch (err) {
                if (err.code === '23505') {
                    console.log(`⚠ ${product.name} قبلاً وجود دارد`);
                } else {
                    throw err;
                }
            }
        }

        console.log('\n✅ همه محصولات با موفقیت اضافه شدند!');
        console.log(`تعداد کل: ${sampleProducts.length} محصول`);

        process.exit(0);
    } catch (error) {
        console.error('❌ خطا در افزودن محصولات:', error);
        process.exit(1);
    }
}

addSampleProducts();
