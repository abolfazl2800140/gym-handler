# راهنمای تنظیم شناسه‌های 4 رقمی

## مشکل
به صورت پیش‌فرض، PostgreSQL از SERIAL استفاده می‌کنه که از 1 شروع میشه. ما می‌خوایم ID های 4 رقمی بین 1000 تا 9999 داشته باشیم.

## راه‌حل

### برای دیتابیس جدید (بدون داده)

اگر هنوز هیچ کاربر یا عضوی اضافه نکردید:

```sql
-- اجرای این اسکریپت:
\i backend/scripts/setup-4digit-ids-fresh.sql
```

یا مستقیماً:

```sql
ALTER SEQUENCE users_id_seq RESTART WITH 1000;
ALTER SEQUENCE users_id_seq MAXVALUE 9999;
ALTER SEQUENCE users_id_seq NO CYCLE;

ALTER SEQUENCE members_id_seq RESTART WITH 1000;
ALTER SEQUENCE members_id_seq MAXVALUE 9999;
ALTER SEQUENCE members_id_seq NO CYCLE;
```

### برای دیتابیس موجود (با داده)

اگر قبلاً کاربر یا عضو اضافه کردید:

```sql
-- اجرای این اسکریپت:
\i backend/scripts/add-unique-4digit-ids.sql
```

این اسکریپت:
1. ID های موجود رو به محدوده 1000-9999 تبدیل می‌کنه
2. Foreign key ها رو آپدیت می‌کنه
3. Sequence ها رو تنظیم می‌کنه

## ویژگی‌ها

### 1. محدوده ID
- **شروع**: 1000
- **پایان**: 9999
- **ظرفیت**: 9000 رکورد برای هر جدول

### 2. بررسی خودکار ظرفیت
سیستم به صورت خودکار قبل از ایجاد رکورد جدید، ظرفیت رو بررسی می‌کنه:

```javascript
// در backend/middleware/checkIdCapacity.js
// اگر ظرفیت پر باشه، خطا میده
// اگر به 90% برسه، هشدار میده
```

### 3. API برای بررسی ظرفیت

```bash
# دریافت وضعیت ظرفیت (فقط Super Admin)
GET /api/system/capacity
```

پاسخ:
```json
{
  "success": true,
  "data": {
    "users": {
      "tableName": "users",
      "totalCapacity": 9000,
      "usedCount": 5,
      "remaining": 8995,
      "usagePercentage": "0.06",
      "isNearLimit": false,
      "isFull": false
    },
    "members": {
      "tableName": "members",
      "totalCapacity": 9000,
      "usedCount": 80,
      "remaining": 8920,
      "usagePercentage": "0.89",
      "isNearLimit": false,
      "isFull": false
    },
    "idRange": {
      "min": 1000,
      "max": 9999,
      "total": 9000
    }
  }
}
```

### 4. بررسی دستی در دیتابیس

```sql
-- بررسی تنظیمات sequence
SELECT 
    'users_id_seq' as sequence_name,
    last_value,
    max_value,
    is_called
FROM users_id_seq
UNION ALL
SELECT 
    'members_id_seq',
    last_value,
    max_value,
    is_called
FROM members_id_seq;

-- بررسی ظرفیت
SELECT * FROM check_id_capacity('users');
SELECT * FROM check_id_capacity('members');
```

## مراحل نصب

### مرحله 1: اجرای اسکریپت SQL

**دیتابیس جدید:**
```bash
psql -U postgres -d gym_management -f backend/scripts/setup-4digit-ids-fresh.sql
```

**دیتابیس موجود:**
```bash
psql -U postgres -d gym_management -f backend/scripts/add-unique-4digit-ids.sql
```

### مرحله 2: راه‌اندازی مجدد سرور

```bash
cd backend
npm start
```

### مرحله 3: تست

```bash
# ایجاد یک عضو جدید
curl -X POST http://localhost:5000/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "firstName": "تست",
    "lastName": "کاربر",
    "phone": "09123456789",
    "memberType": "ورزشکار",
    "membershipLevel": "برنزی"
  }'

# بررسی ID (باید 1000 یا بیشتر باشه)
```

## هشدارها

### ⚠️ هشدار 90%
وقتی به 90% ظرفیت برسید (8100 رکورد)، در console هشدار نمایش داده میشه:

```
⚠️  هشدار: ظرفیت members به 90.00% رسیده است
   باقیمانده: 900 رکورد
```

### 🚫 خطای ظرفیت پر
وقتی به 9000 رکورد برسید، API خطا میده:

```json
{
  "success": false,
  "error": "ظرفیت اعضا پر شده است",
  "message": "حداکثر تعداد مجاز (9000) به پایان رسیده است. لطفاً رکوردهای قدیمی را حذف کنید.",
  "capacity": {
    "usedCount": 9000,
    "remaining": 0,
    "isFull": true
  }
}
```

## راه‌حل در صورت پر شدن ظرفیت

### گزینه 1: حذف رکوردهای قدیمی
```sql
-- حذف اعضای غیرفعال قدیمی
DELETE FROM members 
WHERE subscription_status = 'غیرفعال' 
AND updated_at < NOW() - INTERVAL '1 year';
```

### گزینه 2: آرشیو کردن
```sql
-- ایجاد جدول آرشیو
CREATE TABLE members_archive AS 
SELECT * FROM members WHERE subscription_status = 'غیرفعال';

-- حذف از جدول اصلی
DELETE FROM members WHERE subscription_status = 'غیرفعال';
```

### گزینه 3: افزایش محدوده (توصیه نمیشه)
```sql
-- تغییر به 5 رقمی (10000-99999)
ALTER SEQUENCE members_id_seq MAXVALUE 99999;
```

## نکات مهم

1. ✅ ID ها یکتا هستن و تکرار نمیشن
2. ✅ به صورت خودکار از 1000 شروع میشن
3. ✅ حداکثر 9000 رکورد برای هر جدول
4. ✅ بررسی خودکار ظرفیت قبل از insert
5. ⚠️ اگر به maximum رسیدید، باید رکوردها رو مدیریت کنید
6. 🔒 NO CYCLE یعنی بعد از 9999 دوباره از 1000 شروع نمیشه

## مانیتورینگ

برای مانیتورینگ مداوم، می‌تونید یک cron job تنظیم کنید:

```javascript
// در backend/server.js
const { logCapacityStatus } = require('./middleware/checkIdCapacity');

// هر 24 ساعت یکبار
setInterval(() => {
  logCapacityStatus();
}, 24 * 60 * 60 * 1000);
```

## پشتیبانی

اگر مشکلی پیش اومد:
1. لاگ‌های console رو بررسی کنید
2. وضعیت sequence ها رو چک کنید
3. تعداد رکوردها رو بشمارید
4. از تابع `check_id_capacity()` استفاده کنید
