const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/database');

async function setupIdRanges() {
    try {
        console.log('🔧 تنظیم محدوده ID برای جداول...\n');

        // تنظیم sequence برای users (عوامل باشگاه)
        console.log('👥 تنظیم ID برای عوامل باشگاه (users): 1000-1999');
        await db.query('ALTER SEQUENCE users_id_seq RESTART WITH 1000');

        // تنظیم sequence برای members (ورزشکاران)
        console.log('🏃 تنظیم ID برای ورزشکاران (members): 2000-9999');
        await db.query('ALTER SEQUENCE members_id_seq RESTART WITH 2000');

        // اضافه کردن constraint برای users
        console.log('\n🔒 اضافه کردن محدودیت‌های ID...');
        await db.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_range_check');
        await db.query(`
      ALTER TABLE users ADD CONSTRAINT users_id_range_check 
      CHECK (id >= 1000 AND id <= 1999)
    `);
        console.log('✅ محدودیت برای users اضافه شد');

        // اضافه کردن constraint برای members
        await db.query('ALTER TABLE members DROP CONSTRAINT IF EXISTS members_id_range_check');
        await db.query(`
      ALTER TABLE members ADD CONSTRAINT members_id_range_check 
      CHECK (id >= 2000 AND id <= 9999)
    `);
        console.log('✅ محدودیت برای members اضافه شد');

        console.log('\n✅ تنظیمات با موفقیت انجام شد!');
        console.log('\n📊 محدوده ID ها:');
        console.log('  👥 عوامل باشگاه (users): 1000-1999 (حداکثر 1000 نفر)');
        console.log('  🏃 ورزشکاران (members): 2000-9999 (حداکثر 8000 نفر)');
        console.log('\n💡 نکته: اگر به تعداد بیشتری نیاز داشتید، محدوده‌ها را تغییر دهید.');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ خطا در تنظیم محدوده ID ها:', error);
        process.exit(1);
    }
}

setupIdRanges();
