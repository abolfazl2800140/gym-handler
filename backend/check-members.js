const db = require('./config/database');

async function checkMembers() {
    try {
        const result = await db.query(
            'SELECT id, first_name, last_name, phone, member_type, username, password FROM members LIMIT 10'
        );

        console.log('📋 اعضای موجود:');
        console.table(result.rows.map(row => ({
            id: row.id,
            نام: `${row.first_name} ${row.last_name}`,
            تلفن: row.phone,
            نوع: row.member_type,
            username: row.username,
            hasPassword: row.password ? 'بله' : 'خیر'
        })));

        process.exit(0);
    } catch (error) {
        console.error('❌ خطا:', error);
        process.exit(1);
    }
}

checkMembers();
