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

async function clearDataExceptUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  شروع پاک کردن داده‌ها...\n');
    
    // نمایش تعداد رکوردها قبل از حذف
    console.log('📊 قبل از حذف:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const beforeCounts = await client.query(`
      SELECT 'Users' as table_name, COUNT(*) as count FROM users
      UNION ALL
      SELECT 'Members', COUNT(*) FROM members
      UNION ALL
      SELECT 'Transactions', COUNT(*) FROM transactions
      UNION ALL
      SELECT 'Attendance', COUNT(*) FROM attendance
      UNION ALL
      SELECT 'Attendance Records', COUNT(*) FROM attendance_records
      UNION ALL
      SELECT 'Activity Logs', COUNT(*) FROM activity_logs
    `);
    
    beforeCounts.rows.forEach(row => {
      console.log(`${row.table_name}: ${row.count}`);
    });
    
    console.log('\n🔄 در حال حذف رکوردها...\n');
    
    // حذف رکوردها به ترتیب وابستگی
    await client.query('DELETE FROM activity_logs');
    console.log('✅ Activity Logs پاک شد');
    
    await client.query('DELETE FROM attendance_records');
    console.log('✅ Attendance Records پاک شد');
    
    await client.query('DELETE FROM attendance');
    console.log('✅ Attendance پاک شد');
    
    await client.query('DELETE FROM transactions');
    console.log('✅ Transactions پاک شد');
    
    await client.query('DELETE FROM members');
    console.log('✅ Members پاک شد');
    
    console.log('\n🔄 در حال ریست کردن Sequences...\n');
    
    // ریست کردن Sequences
    await client.query('ALTER SEQUENCE members_id_seq RESTART WITH 1000');
    console.log('✅ Members sequence ریست شد (شروع از 1000)');
    
    await client.query('ALTER SEQUENCE transactions_id_seq RESTART WITH 1');
    console.log('✅ Transactions sequence ریست شد');
    
    await client.query('ALTER SEQUENCE attendance_id_seq RESTART WITH 1');
    console.log('✅ Attendance sequence ریست شد');
    
    await client.query('ALTER SEQUENCE attendance_records_id_seq RESTART WITH 1');
    console.log('✅ Attendance Records sequence ریست شد');
    
    await client.query('ALTER SEQUENCE activity_logs_id_seq RESTART WITH 1');
    console.log('✅ Activity Logs sequence ریست شد');
    
    // نمایش تعداد رکوردها بعد از حذف
    console.log('\n📊 بعد از حذف:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const afterCounts = await client.query(`
      SELECT 'Users' as table_name, COUNT(*) as count FROM users
      UNION ALL
      SELECT 'Members', COUNT(*) FROM members
      UNION ALL
      SELECT 'Transactions', COUNT(*) FROM transactions
      UNION ALL
      SELECT 'Attendance', COUNT(*) FROM attendance
      UNION ALL
      SELECT 'Attendance Records', COUNT(*) FROM attendance_records
      UNION ALL
      SELECT 'Activity Logs', COUNT(*) FROM activity_logs
    `);
    
    afterCounts.rows.forEach(row => {
      console.log(`${row.table_name}: ${row.count}`);
    });
    
    // نمایش کاربران باقیمانده
    console.log('\n👥 کاربران باقیمانده:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const users = await client.query(`
      SELECT id, username, email, role, gender, is_active
      FROM users
      ORDER BY id
    `);
    
    users.rows.forEach(user => {
      console.log(`ID: ${user.id} | ${user.username} (${user.email}) | ${user.role} | ${user.gender} | ${user.is_active ? 'فعال' : 'غیرفعال'}`);
    });
    
    console.log('\n✅ تمام داده‌ها به جز کاربران پاک شدند!');
    console.log(`📊 تعداد کاربران باقیمانده: ${users.rows.length}\n`);
    
  } catch (error) {
    console.error('❌ خطا در پاک کردن داده‌ها:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// اجرای اسکریپت
clearDataExceptUsers()
  .then(() => {
    console.log('🎉 عملیات با موفقیت انجام شد!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 خطا:', error);
    process.exit(1);
  });
