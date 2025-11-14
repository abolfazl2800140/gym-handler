const db = require('../config/database');

async function addAuthToMembers() {
    try {
        console.log('🔧 شروع اضافه کردن فیلدهای احراز هویت به جدول members...');

        // اضافه کردن ستون‌های username و password
        await db.query(`
      ALTER TABLE members 
      ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
      ADD COLUMN IF NOT EXISTS password VARCHAR(255)
    `);
        console.log('✅ ستون‌های username و password اضافه شدند');

        // ایجاد index برای username
        await db.query(`
      CREATE INDEX IF NOT EXISTS idx_members_username ON members(username)
    `);
        console.log('✅ Index برای username ایجاد شد');

        // اضافه کردن username و password برای اعضای موجود
        // رمز عبور: 123456 (هش شده با bcrypt)
        const hashedPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

        const updates = [
            { phone: '09121234568', username: 'sara.mohammadi' },
            { phone: '09121234569', username: 'mohammad.rezaei' },
            { phone: '09121234570', username: 'maryam.karimi' },
            { phone: '09121234571', username: 'hossein.nouri' },
            { phone: '09936630838', username: 'abolfazl.abdi' }
        ];

        for (const update of updates) {
            try {
                await db.query(
                    'UPDATE members SET username = $1, password = $2 WHERE phone = $3',
                    [update.username, hashedPassword, update.phone]
                );
                console.log(`✅ Username و password برای ${update.username} تنظیم شد`);
            } catch (err) {
                console.log(`⚠️  عضو با شماره ${update.phone} یافت نشد یا قبلاً تنظیم شده`);
            }
        }

        console.log('\n✅ عملیات با موفقیت انجام شد!');
        console.log('\n📝 اطلاعات ورود نمونه:');
        console.log('Username: ali.ahmadi');
        console.log('Password: 123456');
        console.log('\nیا');
        console.log('Username: sara.mohammadi');
        console.log('Password: 123456');

        process.exit(0);
    } catch (error) {
        console.error('❌ خطا در اجرای اسکریپت:', error);
        process.exit(1);
    }
}

addAuthToMembers();
