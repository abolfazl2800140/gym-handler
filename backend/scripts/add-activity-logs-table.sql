-- ==========================================
-- اسکریپت اضافه کردن جدول Activity Logs
-- این اسکریپت فقط جدول activity_logs را می‌سازد
-- ==========================================

-- حذف جدول قدیمی (اگر وجود داشته باشد)
DROP TABLE IF EXISTS activity_logs CASCADE;

-- ساخت جدول لاگ فعالیت‌ها
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
);

-- ساخت Indexes برای سرعت بیشتر
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_username ON activity_logs(username);

-- نمایش ساختار جدول
\d activity_logs

-- پیام موفقیت
SELECT 'جدول activity_logs با موفقیت ساخته شد!' as message;
