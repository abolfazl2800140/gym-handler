const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'gym_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
});

async function createThreeAdmins() {
    try {
        console.log('🔍 در حال اتصال به دیتابیس...\n');

        // رمز عبور پیش‌فرض: Admin@123
        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        const admins = [
            {
                username: 'superadmin',
                email: 'superadmin@gym.com',
                password: hashedPassword,
                first_name: 'مدیر',
                last_name: 'ارشد',
                role: 'super_admin',
                gender: 'مرد',
                phone: '09121111111'
            },
            {
                username: 'admin1',
                email: 'admin1@gym.com',
                password: hashedPassword,
                first_name: 'علی',
                last_name: 'احمدی',
                role: 'admin',
                gender: 'مرد',
                phone: '09122222222'
            },
            {
                username: 'admin2',
                email: 'admin2@gym.com',
                password: hashedPassword,
                first_name: 'سارا',
                last_name: 'محمدی',
                role: 'admin',
                gender: 'زن',
                phone: '09123333333'
            }
        ];

        console.log('👥 در حال ساخت کاربران...\n');

        for (const admin of admins) {
            try {
                // بررسی اینکه کاربر قبلاً وجود داره یا نه
                const existingUser = await pool.query(
                    'SELECT id, username FROM users WHERE username = $1 OR email = $2',
                    [admin.username, admin.email]
                );

                if (existingUser.rows.length > 0) {
                    console.log(`⚠️  کاربر ${admin.username} قبلاً وجود داره، رد می‌شه...`);
                    continue;
                }

                // ساخت کاربر جدید
                const result = await pool.query(
                    `INSERT INTO users (username, email, password, first_name, last_name, phone, role, gender, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
           RETURNING id, username, email, first_name, last_name, role, gender`,
                    [admin.username, admin.email, admin.password, admin.first_name, admin.last_name, admin.phone, admin.role, admin.gender]
                );

                console.log(`✅ کاربر ${admin.username} با موفقیت ساخته شد`);
                console.log(`   نقش: ${admin.role}`);
                console.log(`   ایمیل: ${admin.email}`);
                console.log(`   رمز عبور: Admin@123\n`);

            } catch (error) {
                console.error(`❌ خطا در ساخت ${admin.username}:`, error.message);
            }
        }

        // نمایش همه کاربران
        console.log('\n📋 لیست کاربران موجود:');
        const allUsers = await pool.query(
            'SELECT id, username, email, first_name, last_name, role, gender, is_active FROM users ORDER BY role DESC, id'
        );
        console.table(allUsers.rows);

        // نمایش آمار
        console.log('\n📊 آمار کاربران:');
        const stats = await pool.query(
            'SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role DESC'
        );
        console.table(stats.rows);

        console.log('\n✅ عملیات با موفقیت انجام شد!');
        console.log('\n🔑 اطلاعات ورود:');
        console.log('   Username: superadmin, admin1, admin2');
        console.log('   Password: Admin@123');

    } catch (error) {
        console.error('❌ خطا:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

// اجرای اسکریپت
createThreeAdmins()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
