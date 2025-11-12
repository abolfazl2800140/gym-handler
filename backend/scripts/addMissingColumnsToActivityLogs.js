const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function addMissingColumns() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 اضافه کردن ستون‌های گمشده به activity_logs...\n');
    
    // اضافه کردن user_id
    await client.query('ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS user_id INTEGER');
    console.log('✅ ستون user_id اضافه شد');
    
    // اضافه کردن user_agent
    await client.query('ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS user_agent TEXT');
    console.log('✅ ستون user_agent اضافه شد');
    
    // نمایش ساختار جدول
    console.log('\n📊 ساختار جدول activity_logs:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const columns = await client.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'activity_logs'
      ORDER BY ordinal_position
    `);
    
    columns.rows.forEach(col => {
      const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  ${col.column_name}: ${col.data_type}${maxLength} ${nullable}`);
    });
    
    console.log('\n✅ عملیات با موفقیت انجام شد!');
    
  } catch (error) {
    console.error('❌ خطا:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// اجرای اسکریپت
addMissingColumns()
  .then(() => {
    console.log('\n🎉 تمام!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 خطا:', error);
    process.exit(1);
  });
