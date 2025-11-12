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

async function setupSeparateIdRanges() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 تنظیم محدوده‌های جداگانه برای Users و Members...\n');
    
    // تنظیم sequence برای Users (1000-1999)
    // حذف و ساخت مجدد sequence
    await client.query('DROP SEQUENCE IF EXISTS users_id_seq CASCADE');
    await client.query(`
      CREATE SEQUENCE users_id_seq
      START WITH 1000
      MINVALUE 1000
      MAXVALUE 1999
      NO CYCLE
      OWNED BY users.id
    `);
    await client.query('ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval(\'users_id_seq\')');
    console.log('✅ Users sequence تنظیم شد');
    console.log('   محدوده: 1000-1999');
    console.log('   ظرفیت: 1000 کاربر\n');
    
    // تنظیم sequence برای Members (2000-9999)
    // حذف و ساخت مجدد sequence
    await client.query('DROP SEQUENCE IF EXISTS members_id_seq CASCADE');
    await client.query(`
      CREATE SEQUENCE members_id_seq
      START WITH 2000
      MINVALUE 2000
      MAXVALUE 9999
      NO CYCLE
      OWNED BY members.id
    `);
    await client.query('ALTER TABLE members ALTER COLUMN id SET DEFAULT nextval(\'members_id_seq\')');
    console.log('✅ Members sequence تنظیم شد');
    console.log('   محدوده: 2000-9999');
    console.log('   ظرفیت: 8000 عضو\n');
    
    // نمایش تنظیمات
    console.log('📊 تنظیمات نهایی Sequences:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const sequences = await client.query(`
      SELECT 
        sequencename,
        min_value,
        max_value,
        last_value
      FROM pg_sequences
      WHERE sequencename IN ('users_id_seq', 'members_id_seq')
      ORDER BY sequencename
    `);
    
    sequences.rows.forEach(seq => {
      const capacity = seq.max_value - seq.min_value + 1;
      console.log(`\n${seq.sequencename}:`);
      console.log(`  Min Value: ${seq.min_value}`);
      console.log(`  Max Value: ${seq.max_value}`);
      console.log(`  Last Value: ${seq.last_value || 'Not used yet'}`);
      console.log(`  Capacity: ${capacity.toLocaleString('fa-IR')}`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ محدوده‌های جداگانه با موفقیت تنظیم شدند!');
    console.log('👥 Users (کاربران): 1000-1999 (1000 نفر)');
    console.log('👤 Members (اعضا): 2000-9999 (8000 نفر)\n');
    
  } catch (error) {
    console.error('❌ خطا در تنظیم sequences:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// اجرای اسکریپت
setupSeparateIdRanges()
  .then(() => {
    console.log('🎉 عملیات با موفقیت انجام شد!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 خطا:', error);
    process.exit(1);
  });
