const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/database');

async function addChefRole() {
    try {
        console.log('🔧 اضافه کردن نقش chef به جدول users...\n');

        // حذف constraint قدیمی
        await db.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check
    `);
        console.log('✅ Constraint قدیمی حذف شد');

        // اضافه کردن constraint جدید با chef
        await db.query(`
      ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('super_admin', 'admin', 'chef', 'user'))
    `);
        console.log('✅ Constraint جدید با نقش chef اضافه شد');

        console.log('\n✅ عملیات با موفقیت انجام شد!');
        console.log('📋 نقش‌های مجاز: super_admin, admin, chef, user');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ خطا:', error);
        process.exit(1);
    }
}

addChefRole();
