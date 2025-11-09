const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Testing Backend Configuration...\n');

// Test 1: Environment Variables
console.log('1️⃣ Environment Variables:');
console.log('   PORT:', process.env.PORT || '5000 (default)');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('   DB_HOST:', process.env.DB_HOST || 'not set');
console.log('   DB_NAME:', process.env.DB_NAME || 'not set');
console.log('   DB_USER:', process.env.DB_USER || 'not set');
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'not set');
console.log('');

// Test 2: Database Connection
console.log('2️⃣ Testing Database Connection...');
const { pool } = require('./config/database');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('   ❌ Database connection failed!');
    console.error('   Error:', err.message);
    console.log('\n📝 Possible solutions:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check database credentials in .env file');
    console.log('   3. Create database: CREATE DATABASE gym_management;');
    console.log('   4. Run: npm run init-db');
    process.exit(1);
  } else {
    console.log('   ✅ Database connected successfully!');
    console.log('   Current time from DB:', res.rows[0].now);

    // Test 3: Check if tables exist
    console.log('\n3️⃣ Checking Database Tables...');
    pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `, (err, res) => {
      if (err) {
        console.error('   ❌ Error checking tables:', err.message);
      } else {
        if (res.rows.length === 0) {
          console.log('   ⚠️  No tables found!');
          console.log('   Run: npm run init-db');
        } else {
          console.log('   ✅ Tables found:');
          res.rows.forEach(row => {
            console.log('      -', row.table_name);
          });
        }
      }

      console.log('\n✨ Configuration test complete!');
      process.exit(0);
    });
  }
});
