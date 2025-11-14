const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function createAdmins() {
    try {
        console.log('👥 ایجاد سوپرادمین و ادمین...\n');

        // هش کردن رمز عبور
        const password = '123456';
        const hashedPassword = await bcrypt.hash(password, 10);

        // ایجاد سوپرادمین
        console.log('🔑 ایجاد سوپرادمین...');
        const superAdminResult = await db.query(
            `INSERT INTO users (username, email, password, role, gender)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING
       RETURNING id, username, role`,
            ['superadmin', 'superadmin@gym.com', hashedPassword, 'super_admin', 'مرد']
        );

        if (superAdminResult.rows.length > 0) {
            console.log(`✅ سوپرادمین ایجاد شد - ID: ${superAdminResult.rows[0].id}`);
        } else {
            console.log('⚠️  سوپرادمین قبلاً وجود دارد');
        }

        // ایجاد ادمین
        console.log('👤 ایجاد ادمین...');
        const adminResult = await db.query(
            `INSERT INTO users (username, email, password, role, gender)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING
       RETURNING id, username, role`,
            ['admin', 'admin@gym.com', hashedPassword, 'admin', 'مرد']
        );

        if (adminResult.rows.length > 0) {
            console.log(`✅ ادمین ایجاد شد - ID: ${adminResult.rows[0].id}`);
        } else {
            console.log('⚠️  ادمین قبلاً وجود دارد');
        }

        console.log('\n✅ عملیات با موفقیت انجام شد!');
        console.log('\n📝 اطلاعات ورود:');
        console.log('\n🔑 سوپرادمین:');
        console.log('   Username: superadmin');
        console.log('   Password: 123456');
        console.log('\n👤 ادمین:');
        console.log('   Username: admin');
        console.log('   Password: 123456');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ خطا در ایجاد ادمین‌ها:', error);
        process.exit(1);
    }
}

createAdmins();
