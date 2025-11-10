require('dotenv').config();
const db = require('./config/database');

async function checkUsersTable() {
  try {
    // بررسی ساختار جدول users
    const tableInfo = await db.query(`
      SELECT column_name, data_type, character_maximum_length, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('📋 ساختار جدول users:\n');
    tableInfo.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
    });

    // بررسی کاربران موجود
    const users = await db.query('SELECT id, username, email, role, created_at FROM users');
    
    console.log('\n👥 کاربران موجود:\n');
    if (users.rows.length === 0) {
      console.log('   هیچ کاربری وجود ندارد!');
    } else {
      users.rows.forEach(user => {
        console.log(`   - ${user.username} (${user.role}) - ${user.email}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ خطا:', error.message);
    process.exit(1);
  }
}

checkUsersTable();
