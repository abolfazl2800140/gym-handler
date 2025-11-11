const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const members = [
  { first_name: 'علی', last_name: 'احمدی', phone: '09121234567', birth_date: '1370-05-15', member_type: 'ورزشکار', membership_level: 'طلایی', subscription_status: 'فعال', join_date: '2024-01-15' },
  { first_name: 'محمد', last_name: 'رضایی', phone: '09122345678', birth_date: '1375-08-20', member_type: 'ورزشکار', membership_level: 'نقره‌ای', subscription_status: 'فعال', join_date: '2024-01-20' },
  { first_name: 'حسین', last_name: 'محمدی', phone: '09123456789', birth_date: '1368-03-10', member_type: 'مربی', membership_level: 'پلاتینیوم', subscription_status: 'فعال', join_date: '2024-01-10' },
  { first_name: 'رضا', last_name: 'کریمی', phone: '09124567890', birth_date: '1380-11-25', member_type: 'ورزشکار', membership_level: 'برنزی', subscription_status: 'فعال', join_date: '2024-02-01' },
  { first_name: 'مهدی', last_name: 'نوری', phone: '09125678901', birth_date: '1372-07-18', member_type: 'ورزشکار', membership_level: 'طلایی', subscription_status: 'فعال', join_date: '2024-02-05' },
  { first_name: 'امیر', last_name: 'حسینی', phone: '09126789012', birth_date: '1378-02-12', member_type: 'ورزشکار', membership_level: 'نقره‌ای', subscription_status: 'غیرفعال', join_date: '2024-02-10' },
  { first_name: 'سعید', last_name: 'جعفری', phone: '09127890123', birth_date: '1365-09-30', member_type: 'مربی', membership_level: 'پلاتینیوم', subscription_status: 'فعال', join_date: '2024-02-15' },
  { first_name: 'مصطفی', last_name: 'صادقی', phone: '09128901234', birth_date: '1382-04-22', member_type: 'ورزشکار', membership_level: 'برنزی', subscription_status: 'فعال', join_date: '2024-02-20' },
  { first_name: 'حمید', last_name: 'موسوی', phone: '09129012345', birth_date: '1371-12-05', member_type: 'ورزشکار', membership_level: 'طلایی', subscription_status: 'فعال', join_date: '2024-02-25' },
  { first_name: 'داود', last_name: 'اکبری', phone: '09121112222', birth_date: '1376-06-14', member_type: 'پرسنل', membership_level: 'نقره‌ای', subscription_status: 'فعال', join_date: '2024-03-01' },
  { first_name: 'فرهاد', last_name: 'زارعی', phone: '09122223333', birth_date: '1369-01-08', member_type: 'ورزشکار', membership_level: 'پلاتینیوم', subscription_status: 'فعال', join_date: '2024-03-05' },
  { first_name: 'بهرام', last_name: 'رحیمی', phone: '09123334444', birth_date: '1383-10-19', member_type: 'ورزشکار', membership_level: 'برنزی', subscription_status: 'غیرفعال', join_date: '2024-03-10' },
  { first_name: 'کامران', last_name: 'عباسی', phone: '09124445555', birth_date: '1374-05-27', member_type: 'ورزشکار', membership_level: 'طلایی', subscription_status: 'فعال', join_date: '2024-03-15' },
  { first_name: 'پیمان', last_name: 'حیدری', phone: '09125556666', birth_date: '1367-08-16', member_type: 'مربی', membership_level: 'پلاتینیوم', subscription_status: 'فعال', join_date: '2024-03-20' },
  { first_name: 'سهراب', last_name: 'فتحی', phone: '09126667777', birth_date: '1381-03-11', member_type: 'ورزشکار', membership_level: 'نقره‌ای', subscription_status: 'فعال', join_date: '2024-03-25' },
  { first_name: 'آرش', last_name: 'قاسمی', phone: '09127778888', birth_date: '1373-11-23', member_type: 'ورزشکار', membership_level: 'برنزی', subscription_status: 'فعال', join_date: '2024-04-01' },
  { first_name: 'سامان', last_name: 'باقری', phone: '09128889999', birth_date: '1379-07-09', member_type: 'ورزشکار', membership_level: 'طلایی', subscription_status: 'فعال', join_date: '2024-04-05' },
  { first_name: 'شهرام', last_name: 'نجفی', phone: '09129990000', birth_date: '1366-02-17', member_type: 'پرسنل', membership_level: 'نقره‌ای', subscription_status: 'فعال', join_date: '2024-04-10' },
  { first_name: 'مسعود', last_name: 'طاهری', phone: '09121231234', birth_date: '1384-09-28', member_type: 'ورزشکار', membership_level: 'برنزی', subscription_status: 'غیرفعال', join_date: '2024-04-15' },
  { first_name: 'جواد', last_name: 'سلیمانی', phone: '09122342345', birth_date: '1370-04-13', member_type: 'ورزشکار', membership_level: 'پلاتینیوم', subscription_status: 'فعال', join_date: '2024-04-20' },
  { first_name: 'ایمان', last_name: 'خانی', phone: '09123453456', birth_date: '1377-12-06', member_type: 'ورزشکار', membership_level: 'طلایی', subscription_status: 'فعال', join_date: '2024-04-25' },
  { first_name: 'نیما', last_name: 'شریفی', phone: '09124564567', birth_date: '1368-06-21', member_type: 'مربی', membership_level: 'پلاتینیوم', subscription_status: 'فعال', join_date: '2024-05-01' },
  { first_name: 'بابک', last_name: 'امینی', phone: '09125675678', birth_date: '1385-01-15', member_type: 'ورزشکار', membership_level: 'برنزی', subscription_status: 'فعال', join_date: '2024-05-05' },
  { first_name: 'سیاوش', last_name: 'مرادی', phone: '09126786789', birth_date: '1372-10-29', member_type: 'ورزشکار', membership_level: 'نقره‌ای', subscription_status: 'فعال', join_date: '2024-05-10' },
  { first_name: 'فرزاد', last_name: 'یوسفی', phone: '09127897890', birth_date: '1380-05-18', member_type: 'ورزشکار', membership_level: 'طلایی', subscription_status: 'فعال', join_date: '2024-05-15' },
  { first_name: 'مجید', last_name: 'ملکی', phone: '09128908901', birth_date: '1364-08-07', member_type: 'پرسنل', membership_level: 'پلاتینیوم', subscription_status: 'فعال', join_date: '2024-05-20' },
  { first_name: 'وحید', last_name: 'صفری', phone: '09129019012', birth_date: '1386-03-24', member_type: 'ورزشکار', membership_level: 'برنزی', subscription_status: 'غیرفعال', join_date: '2024-05-25' },
  { first_name: 'هادی', last_name: 'اسدی', phone: '09121120123', birth_date: '1371-11-12', member_type: 'ورزشکار', membership_level: 'نقره‌ای', subscription_status: 'فعال', join_date: '2024-06-01' },
  { first_name: 'میلاد', last_name: 'پورمحمد', phone: '09122231234', birth_date: '1378-07-03', member_type: 'ورزشکار', membership_level: 'طلایی', subscription_status: 'فعال', join_date: '2024-06-05' },
  { first_name: 'سروش', last_name: 'کاظمی', phone: '09123342345', birth_date: '1369-02-26', member_type: 'مربی', membership_level: 'پلاتینیوم', subscription_status: 'فعال', join_date: '2024-06-10' }
];

async function addMembers() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 شروع اضافه کردن اعضا...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const member of members) {
      try {
        await client.query(
          `INSERT INTO members (first_name, last_name, phone, birth_date, member_type, membership_level, subscription_status, join_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            member.first_name,
            member.last_name,
            member.phone,
            member.birth_date,
            member.member_type,
            member.membership_level,
            member.subscription_status,
            member.join_date
          ]
        );
        successCount++;
        console.log(`✅ ${member.first_name} ${member.last_name} اضافه شد`);
      } catch (err) {
        errorCount++;
        console.log(`❌ خطا در اضافه کردن ${member.first_name} ${member.last_name}: ${err.message}`);
      }
    }
    
    // نمایش تعداد کل اعضا
    const result = await client.query('SELECT COUNT(*) as total FROM members');
    console.log(`\n📊 تعداد کل اعضا: ${result.rows[0].total}`);
    console.log(`✅ موفق: ${successCount}`);
    console.log(`❌ خطا: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ خطا:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addMembers();
