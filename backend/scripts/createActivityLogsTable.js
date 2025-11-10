require('dotenv').config();
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * اسکریپت ساخت جدول Activity Logs
 */

const createActivityLogsTable = async () => {
  try {
    console.log('🔧 شروع ساخت جدول Activity Logs...\n');

    // حذف جدول قدیمی (اگر وجود دارد)
    console.log('🗑️  حذف جدول قدیمی (اگر وجود دارد)...');
    await db.query('DROP TABLE IF EXISTS activity_logs CASCADE');

    // ساخت جدول جدید
    console.log('📋 ساخت جدول activity_logs...');
    await db.query(`
      CREATE TABLE activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        username VARCHAR(50),
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        description TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ساخت Indexes
    console.log('🔍 ساخت Indexes...');
    await db.query('CREATE INDEX idx_activity_logs_user ON activity_logs(user_id)');
    await db.query('CREATE INDEX idx_activity_logs_action ON activity_logs(action)');
    await db.query('CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id)');
    await db.query('CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at)');
    await db.query('CREATE INDEX idx_activity_logs_username ON activity_logs(username)');

    console.log('\n✅ جدول activity_logs با موفقیت ساخته شد!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ساختار جدول:');
    console.log('   - id: شناسه یکتا');
    console.log('   - user_id: شناسه کاربر');
    console.log('   - username: نام کاربری');
    console.log('   - action: نوع عملیات (CREATE, UPDATE, DELETE, etc.)');
    console.log('   - entity_type: نوع موجودیت (members, transactions, etc.)');
    console.log('   - entity_id: شناسه موجودیت');
    console.log('   - description: توضیحات');
    console.log('   - ip_address: آدرس IP');
    console.log('   - created_at: زمان ثبت');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطا در ساخت جدول:', error.message);
    process.exit(1);
  }
};

// اجرای اسکریپت
createActivityLogsTable();
