const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function createChef() {
    try {
        console.log('👨‍🍳 ایجاد آشپز...\n');

        const password = '123456';
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            `INSERT INTO users (username, email, password, role, gender)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING
       RETURNING id, username, role`,
            ['chef', 'chef@gym.com', hashedPassword, 'chef', 'مرد']
        );

        if (result.rows.length > 0) {
            console.log(`✅ آشپز ایجاد شد - ID: ${result.rows[0].id}`);
        } else {
            console.log('⚠️  آشپز قبلاً وجود دارد');
        }

        console.log('\n📝 اطلاعات ورود آشپز:');
        console.log('   Username: chef');
        console.log('   Password: 123456');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ خطا در ایجاد آشپز:', error);
        process.exit(1);
    }
}

createChef();
