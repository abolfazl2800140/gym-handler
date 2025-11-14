const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/database');

async function clearAllRecords() {
    try {
        console.log('🗑️  شروع پاک کردن تمام رکوردها...\n');

        // غیرفعال کردن foreign key checks موقتاً
        await db.query("SET session_replication_role = 'replica'");

        // پاک کردن رکوردها
        console.log('📋 پاک کردن activity_logs...');
        await db.query('TRUNCATE TABLE activity_logs CASCADE');

        console.log('📋 پاک کردن attendance_records...');
        await db.query('TRUNCATE TABLE attendance_records CASCADE');

        console.log('📋 پاک کردن attendance...');
        await db.query('TRUNCATE TABLE attendance CASCADE');

        console.log('📋 پاک کردن transactions...');
        await db.query('TRUNCATE TABLE transactions CASCADE');

        console.log('📋 پاک کردن members...');
        await db.query('TRUNCATE TABLE members CASCADE');

        console.log('📋 پاک کردن users...');
        await db.query('TRUNCATE TABLE users CASCADE');

        // فعال کردن دوباره foreign key checks
        await db.query("SET session_replication_role = 'origin'");

        // ریست کردن sequence ها
        console.log('\n🔄 ریست کردن sequence ها...');
        await db.query('ALTER SEQUENCE activity_logs_id_seq RESTART WITH 1');
        await db.query('ALTER SEQUENCE attendance_records_id_seq RESTART WITH 1');
        await db.query('ALTER SEQUENCE attendance_id_seq RESTART WITH 1');
        await db.query('ALTER SEQUENCE transactions_id_seq RESTART WITH 1');
        await db.query('ALTER SEQUENCE members_id_seq RESTART WITH 1');
        await db.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');

        console.log('\n✅ تمام رکوردها با موفقیت پاک شدند!');
        console.log('📊 ساختار جداول دست نخورده باقی ماند.');
        console.log('🔢 ID ها از 1 شروع می‌شوند.');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ خطا در پاک کردن رکوردها:', error);
        process.exit(1);
    }
}

// تایید از کاربر
console.log('⚠️  هشدار: این عملیات تمام رکوردهای دیتابیس را پاک می‌کند!');
console.log('⚠️  ساختار جداول دست نخورده باقی می‌ماند.\n');

clearAllRecords();
