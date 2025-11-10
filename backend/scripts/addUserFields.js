require('dotenv').config();
const db = require('../config/database');

/**
 * اسکریپت اضافه کردن فیلدهای جدید به جدول users
 */

const addUserFields = async () => {
  try {
    console.log('🔧 شروع اضافه کردن فیلدهای جدید به جدول users...\n');

    // اضافه کردن فیلدهای جدید
    console.log('📋 اضافه کردن فیلدها...');
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(50),
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(50),
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS avatar_url TEXT
    `);

    // نمایش ساختار جدول
    const result = await db.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('\n✅ فیلدهای جدید با موفقیت اضافه شدند!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ساختار جدول users:\n');
    result.rows.forEach(col => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      console.log(`   - ${col.column_name}: ${col.data_type}${length}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطا:', error.message);
    process.exit(1);
  }
};

// اجرای اسکریپت
addUserFields();
