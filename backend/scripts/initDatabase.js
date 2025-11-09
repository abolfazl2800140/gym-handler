const { pool } = require('../config/database');
const dotenv = require('dotenv');

dotenv.config();

const createTables = async () => {
  const client = await pool.connect();

  try {
    console.log('🔨 Creating database tables...');

    // Users table (for authentication)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Members table
    await client.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        birth_date DATE,
        member_type VARCHAR(20) NOT NULL,
        membership_level VARCHAR(20) NOT NULL,
        join_date DATE NOT NULL,
        subscription_status VARCHAR(20) DEFAULT 'فعال',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Members table created');

    // Transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        amount BIGINT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        date TIMESTAMP NOT NULL,
        member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Transactions table created');

    // Attendance table
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        date DATE UNIQUE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Attendance table created');

    // Attendance records table (for individual member attendance)
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id SERIAL PRIMARY KEY,
        attendance_id INTEGER REFERENCES attendance(id) ON DELETE CASCADE,
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(attendance_id, member_id)
      );
    `);
    console.log('✅ Attendance records table created');

    // Activity logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        username VARCHAR(50),
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INTEGER,
        description TEXT NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Activity logs table created');

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_member ON transactions(member_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
      CREATE INDEX IF NOT EXISTS idx_attendance_records_member ON attendance_records(member_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
    `);
    console.log('✅ Indexes created');

    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

const insertSampleData = async () => {
  const client = await pool.connect();

  try {
    console.log('📝 Inserting sample data...');

    // Insert sample members
    await client.query(`
      INSERT INTO members (first_name, last_name, phone, birth_date, member_type, membership_level, join_date, subscription_status)
      VALUES 
        ('علی', 'احمدی', '09121234567', '1995-05-15', 'ورزشکار', 'طلایی', '2024-01-10', 'فعال'),
        ('سارا', 'محمدی', '09129876543', '1998-08-20', 'مربی', 'پلاتینیوم', '2023-11-05', 'فعال'),
        ('محمد', 'رضایی', '09135551234', '2000-03-12', 'ورزشکار', 'نقره‌ای', '2024-02-20', 'غیرفعال')
      ON CONFLICT (phone) DO NOTHING;
    `);
    console.log('✅ Sample members inserted');

    // Insert sample transactions
    await client.query(`
      INSERT INTO transactions (type, amount, title, description, category, date, member_id)
      VALUES 
        ('درآمد', 2000000, 'شهریه علی احمدی', 'پرداخت شهریه ماه آذر', 'شهریه', '2024-11-01', 1),
        ('هزینه', 5000000, 'خرید دستگاه پرس سینه', 'تجهیزات جدید سالن', 'تجهیزات', '2024-11-05', NULL),
        ('درآمد', 1500000, 'شهریه سارا محمدی', 'پرداخت شهریه ماه آذر', 'شهریه', '2024-11-10', 2),
        ('هزینه', 3000000, 'حقوق مربی', 'حقوق ماه آذر', 'حقوق', '2024-11-15', NULL);
    `);
    console.log('✅ Sample transactions inserted');

    // Insert sample attendance
    const attendanceResult = await client.query(`
      INSERT INTO attendance (date, notes)
      VALUES 
        ('2024-11-06', 'تمرین سنگین امروز'),
        ('2024-11-05', '')
      ON CONFLICT (date) DO NOTHING
      RETURNING id, date;
    `);

    if (attendanceResult.rows.length > 0) {
      // Insert attendance records
      await client.query(`
        INSERT INTO attendance_records (attendance_id, member_id, status, reason)
        VALUES 
          (${attendanceResult.rows[0].id}, 1, 'حاضر', ''),
          (${attendanceResult.rows[0].id}, 2, 'غایب', 'بیماری'),
          (${attendanceResult.rows[0].id}, 3, 'حاضر', '')
        ON CONFLICT (attendance_id, member_id) DO NOTHING;
      `);
      console.log('✅ Sample attendance records inserted');
    }

    console.log('🎉 Sample data inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
    throw error;
  } finally {
    client.release();
  }
};

const init = async () => {
  try {
    await createTables();
    await insertSampleData();
    console.log('✨ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

init();
