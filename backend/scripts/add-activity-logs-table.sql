-- اضافه کردن جدول لاگ فعالیت‌ها
-- این اسکریپت را در pgAdmin اجرا کنید

-- ایجاد جدول activity_logs
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

-- ایجاد ایندکس‌ها برای بهبود عملکرد
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- اضافه کردن چند لاگ نمونه
INSERT INTO activity_logs (username, action, entity_type, entity_id, description, created_at)
VALUES 
    ('سیستم', 'ایجاد', 'عضو', 1, 'عضو جدید ثبت شد: علی احمدی', NOW() - INTERVAL '2 hours'),
    ('سیستم', 'ایجاد', 'تراکنش', 1, 'تراکنش جدید: درآمد - شهریه علی احمدی (2,000,000 تومان)', NOW() - INTERVAL '1 hour'),
    ('سیستم', 'ثبت', 'حضور و غیاب', 1, 'حضور و غیاب ثبت شد برای تاریخ: 2024-11-06', NOW() - INTERVAL '30 minutes'),
    ('مهمان', 'سوال', 'دستیار هوش مصنوعی', NULL, 'سوال از دستیار هوش مصنوعی: چند نفر عضو فعال داریم؟', NOW() - INTERVAL '10 minutes');

SELECT 'جدول activity_logs با موفقیت ایجاد شد!' as message;
