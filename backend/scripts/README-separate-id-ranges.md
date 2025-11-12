# راهنمای محدوده‌های جداگانه ID

## محدوده‌های تعریف شده

### 👥 Users (کاربران)
- **محدوده**: 1000-1999
- **ظرفیت**: 1000 نفر
- **شامل**: Super Admin، Admin، آشپز، نیروی خدماتی

### 👤 Members (اعضا)
- **محدوده**: 2000-9999
- **ظرفیت**: 8000 نفر
- **شامل**: ورزشکاران، مربی‌ها، پرسنل باشگاه

## نصب و راه‌اندازی

### روش 1: اجرای اسکریپت Node.js (توصیه می‌شود)

```bash
node backend/scripts/setupSeparateIdRanges.js
```

### روش 2: اجرای اسکریپت SQL

```bash
psql -U postgres -d gym_management -f backend/scripts/setup-separate-id-ranges.sql
```

## نتیجه

بعد از اجرا:
- اولین کاربر جدید: ID = **1000**
- اولین عضو جدید: ID = **2000**

## مثال

```javascript
// ایجاد کاربر جدید
POST /api/users
{
  "username": "admin1",
  "email": "admin1@gym.com",
  ...
}
// نتیجه: ID = 1000

// ایجاد عضو جدید
POST /api/members
{
  "firstName": "علی",
  "lastName": "احمدی",
  ...
}
// نتیجه: ID = 2000
```

## بررسی وضعیت

### API Endpoint
```bash
GET /api/system/capacity
```

### پاسخ نمونه
```json
{
  "success": true,
  "data": {
    "users": {
      "tableName": "users",
      "totalCapacity": 1000,
      "idRange": "1000-1999",
      "usedCount": 3,
      "remaining": 997,
      "usagePercentage": "0.30",
      "isNearLimit": false,
      "isFull": false
    },
    "members": {
      "tableName": "members",
      "totalCapacity": 8000,
      "idRange": "2000-9999",
      "usedCount": 0,
      "remaining": 8000,
      "usagePercentage": "0.00",
      "isNearLimit": false,
      "isFull": false
    },
    "idRanges": {
      "users": {
        "min": 1000,
        "max": 1999,
        "capacity": 1000
      },
      "members": {
        "min": 2000,
        "max": 9999,
        "capacity": 8000
      }
    }
  }
}
```

## مزایا

✅ **تفکیک واضح**: کاربران و اعضا محدوده‌های جدا دارن
✅ **شناسایی آسان**: با دیدن ID می‌تونید بفهمید کاربر یا عضو هست
✅ **مدیریت بهتر**: ظرفیت مناسب برای هر گروه
✅ **امنیت بیشتر**: جلوگیری از تداخل ID ها

## هشدارها

### ⚠️ Users (90% = 900 نفر)
```
⚠️  هشدار: ظرفیت users به 90.00% رسیده است
   باقیمانده: 100 رکورد
```

### ⚠️ Members (90% = 7200 نفر)
```
⚠️  هشدار: ظرفیت members به 90.00% رسیده است
   باقیمانده: 800 رکورد
```

## نکات مهم

1. ✅ ID های کاربران: **1000-1999** (هرگز از 2000 شروع نمیشن)
2. ✅ ID های اعضا: **2000-9999** (هرگز کمتر از 2000 نمیشن)
3. ✅ بررسی خودکار ظرفیت قبل از insert
4. ⚠️ اگر ظرفیت پر شد، باید رکوردهای قدیمی رو حذف کنید
5. 🔒 NO CYCLE یعنی بعد از رسیدن به maximum، خطا میده

## تست

```bash
# تست ایجاد کاربر
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "Test@123",
    "role": "admin"
  }'
# انتظار: ID بین 1000-1999

# تست ایجاد عضو
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
# انتظار: ID بین 2000-9999
```

## عیب‌یابی

### مشکل: ID ها از 1 شروع میشن

**راه‌حل:**
```bash
node backend/scripts/setupSeparateIdRanges.js
```

### مشکل: خطای "sequence does not exist"

**راه‌حل:**
```sql
-- بررسی وجود sequences
SELECT * FROM pg_sequences 
WHERE sequencename IN ('users_id_seq', 'members_id_seq');
```

### مشکل: ظرفیت پر شده

**راه‌حل:**
```sql
-- حذف رکوردهای قدیمی
DELETE FROM users WHERE is_active = false AND updated_at < NOW() - INTERVAL '1 year';
DELETE FROM members WHERE subscription_status = 'غیرفعال' AND updated_at < NOW() - INTERVAL '1 year';
```

## پشتیبانی

برای مشاهده وضعیت فعلی:
```bash
node backend/scripts/setupSeparateIdRanges.js
```

یا از API:
```bash
curl http://localhost:5000/api/system/capacity \
  -H "Authorization: Bearer YOUR_TOKEN"
```
