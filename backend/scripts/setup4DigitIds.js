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

async function setup4DigitIds() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 تنظیم شناسه‌های 4 رقمی...\n');
    
    // تنظیم sequence برای Users
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1000');
    await client.query('ALTER SEQUENCE users_id_seq MAXVALUE 9999');
    await client.query('ALTER SEQUENCE users_id_seq NO CYCLE');
    console.log('✅ Users sequence تنظیم شد (1000-9999)');
    
    // تنظیم sequence برای Members
    await client.query('ALTER SEQUENCE members_id_seq RESTART WITH 1000');
    await client.query('ALTER SEQUENCE members_id_seq MAXVALUE 9999');
    await client.query('ALTER SEQUENCE members_id_seq NO CYCLE');
    console.log('✅ Members sequence تنظیم شد (1000-9999)');
    
    // نمایش تنظیمات
    console.log('\n📊 تنظیمات Sequences:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const sequences = await client.query(`
      SELECT 
        sequencename as sequence_name,
        last_value,
        max_value
      FROM pg_sequences
      WHERE sequencename IN ('users_id_seq', 'members_id_seq')
    `);
    
    sequences.rows.forEach(seq => {
      console.log(`${seq.sequence_name}:`);
      console.log(`  Last Value: ${seq.last_value}`);
      console.log(`  Max Value: ${seq.max_value}`);
      console.log('');
    });
    
    console.log('✅ شناسه‌های 4 رقمی با موفقیت تنظیم شدند!');
    console.log('📊 محدوده: 1000 تا 9999');
    console.log('💾 ظرفیت: 9000 رکورد برای هر جدول\n');
    
  } catch (error) {
    console.error('❌ خطا در تنظیم sequences:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// اجرای اسکریپت
setup4DigitIds()
  .then(() => {
    console.log('🎉 عملیات با موفقیت انجام شد!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 خطا:', error);
    process.exit(1);
  });
