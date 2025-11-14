const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'gym_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function deleteAdminsExceptSuperAdmin() {
    try {
        console.log('🔍 در حال اتصال به دیتابیس...');

        // نمایش کاربران قبل از حذف
        console.log('\n📋 کاربران قبل از حذف:');
        const beforeResult = await pool.query(
            'SELECT id, username, email, first_name, last_name, role, is_active FROM users ORDER BY role, id'
        );
        console.table(beforeResult.rows);

        // حذف ادمین‌ها (به جز سوپرادمین)
        console.log('\n🗑️  در حال حذف ادمین‌ها...');
        const deleteResult = await pool.query(
            "DELETE FROM users WHERE role = 'admin' RETURNING id, username, role"
        );

        if (deleteResult.rowCount > 0) {
            console.log(`\n✅ ${deleteResult.rowCount} ادمین حذف شد:`);
            console.table(deleteResult.rows);
        } else {
            console.log('\n⚠️  هیچ ادمینی برای حذف پیدا نشد!');
        }

        // نمایش کاربران بعد از حذف
        console.log('\n📋 کاربران بعد از حذف:');
        const afterResult = await pool.query(
            'SELECT id, username, email, first_name, last_name, role, is_active FROM users ORDER BY role, id'
        );
        console.table(afterResult.rows);

        // نمایش آمار
        console.log('\n📊 آمار کاربران:');
        const statsResult = await pool.query(
            'SELECT role, COUNT(*) as count FROM users GROUP BY role'
        );
        console.table(statsResult.rows);

        console.log('\n✅ عملیات با موفقیت انجام شد!');

    } catch (error) {
        console.error('❌ خطا در حذف ادمین‌ها:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

// اجرای اسکریپت
deleteAdminsExceptSuperAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
