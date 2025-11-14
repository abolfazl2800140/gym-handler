const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'gym_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
});

async function createMembershipPlansTable() {
    try {
        console.log('🔍 در حال اتصال به دیتابیس...\n');

        // حذف جدول قدیمی
        console.log('🗑️  حذف جدول قدیمی (اگر وجود داشته باشد)...');
        await pool.query('DROP TABLE IF EXISTS membership_plans CASCADE');

        // ساخت جدول جدید
        console.log('📦 ساخت جدول membership_plans...');
        await pool.query(`
      CREATE TABLE membership_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        duration_days INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        color VARCHAR(20) DEFAULT '#3182ce',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // ایجاد ایندکس‌ها
        console.log('📑 ایجاد ایندکس‌ها...');
        await pool.query('CREATE INDEX idx_plans_name ON membership_plans(name)');
        await pool.query('CREATE INDEX idx_plans_active ON membership_plans(is_active)');

        // ایجاد trigger
        console.log('⚡ ایجاد trigger...');
        await pool.query(`
      CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON membership_plans
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

        // درج داده‌های اولیه
        console.log('📝 درج پلن‌های پیش‌فرض...\n');
        const plans = [
            { name: 'برنزی', duration: 30, price: 500000, desc: 'پلن پایه - یک ماهه', color: '#CD7F32' },
            { name: 'نقره‌ای', duration: 60, price: 900000, desc: 'پلن متوسط - دو ماهه', color: '#C0C0C0' },
            { name: 'طلایی', duration: 90, price: 1200000, desc: 'پلن پیشرفته - سه ماهه', color: '#FFD700' },
            { name: 'پلاتینیوم', duration: 180, price: 2000000, desc: 'پلن ویژه - شش ماهه', color: '#E5E4E2' }
        ];

        for (const plan of plans) {
            await pool.query(
                `INSERT INTO membership_plans (name, duration_days, price, description, color, is_active)
         VALUES ($1, $2, $3, $4, $5, true)`,
                [plan.name, plan.duration, plan.price, plan.desc, plan.color]
            );
            console.log(`✅ پلن "${plan.name}" ایجاد شد`);
        }

        // نمایش پلن‌های ایجاد شده
        console.log('\n📋 لیست پلن‌های ایجاد شده:');
        const result = await pool.query(
            'SELECT id, name, duration_days, price, description, color, is_active FROM membership_plans ORDER BY duration_days'
        );
        console.table(result.rows);

        console.log('\n✅ جدول membership_plans با موفقیت ایجاد شد!');

    } catch (error) {
        console.error('❌ خطا:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

// اجرای اسکریپت
createMembershipPlansTable()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
