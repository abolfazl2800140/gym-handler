require('dotenv').config();
const db = require('../config/database');

/**
 * اسکریپت اضافه کردن فیلد is_active به جدول users
 */

const addIsActiveField = async () => {
  try {
    console.log('🔧 شروع اضافه کردن فیلد is_active...\n');

    // اضافه کردن فیلد is_active
    console.log('📋 اضافه کردن فیلد...');
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true
    `);

    // به‌روزرسانی کاربران موجود
    console.log('🔄 به‌روزرسانی کاربران موجود...');
    await db.query(`
      UPDATE users 
      SET is_active = true 
      WHERE is_active IS NULL
    `);

    console.log('\n✅ فیلد is_active با موفقیت اضافه شد!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 همه کاربران به صورت پیش‌فرض فعال هستند\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطا:', error.message);
    process.exit(1);
  }
};

// اجرای اسکریپت
addIsActiveField();
