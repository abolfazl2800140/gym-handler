# راهنمای سیستم احراز هویت و مجوزدهی

## 📋 مرحله 1: بک‌اند (کامل شد ✅)

این راهنما توضیح می‌دهد که سیستم احراز هویت چگونه کار می‌کند و چطور از آن استفاده کنیم.

---

## 🔐 نقش‌های کاربری

سیستم سه نقش کاربری دارد:

1. **super_admin** - دسترسی کامل به همه چیز (شامل Activity Logs)
2. **admin** - دسترسی به مدیریت کارمندان، حضور و غیاب، تراکنش‌ها
3. **user** - دسترسی محدود (فقط مشاهده)

---

## 🚀 راه‌اندازی اولیه

### 1. ساخت Super Admin پیش‌فرض

```bash
node scripts/createSuperAdmin.js
```

این اسکریپت یک کاربر super_admin با اطلاعات زیر می‌سازد:
- **نام کاربری**: `superadmin`
- **رمز عبور**: `Admin@123`
- **ایمیل**: `superadmin@gym.local`

⚠️ **توجه**: حتماً بعد از اولین ورود، رمز عبور را تغییر دهید!

### 2. تست سیستم احراز هویت

```bash
node test-auth.js
```

این اسکریپت تمام قابلیت‌های احراز هویت را تست می‌کند.

---

## 📡 API Endpoints

### 1. ثبت‌نام (Register)

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "admin1",
  "email": "admin1@gym.local",
  "password": "Admin123",
  "role": "admin"
}
```

**پاسخ موفق:**
```json
{
  "success": true,
  "message": "کاربر با موفقیت ثبت شد",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin1",
    "email": "admin1@gym.local",
    "role": "admin"
  }
}
```

### 2. ورود (Login)

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "superadmin",
  "password": "Admin@123"
}
```

**پاسخ موفق:**
```json
{
  "success": true,
  "message": "ورود موفقیت‌آمیز",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "superadmin",
    "email": "superadmin@gym.local",
    "role": "super_admin"
  }
}
```

### 3. دریافت اطلاعات کاربر جاری

```http
GET /api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**پاسخ موفق:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "superadmin",
    "email": "superadmin@gym.local",
    "role": "super_admin",
    "created_at": "2024-11-10T10:00:00.000Z"
  }
}
```

---

## 🛡️ Middleware ها

### 1. authenticateToken

این middleware توکن JWT را از header میگیرد و اعتبارسنجی می‌کند.

**استفاده:**
```javascript
const { authenticateToken } = require('../middleware/auth');

router.get('/protected', authenticateToken, controller);
```

### 2. checkRole

این middleware نقش کاربر را بررسی می‌کند.

**استفاده:**
```javascript
const { authenticateToken, checkRole } = require('../middleware/auth');

// فقط super_admin
router.get('/admin-only', 
  authenticateToken, 
  checkRole(['super_admin']), 
  controller
);

// admin یا super_admin
router.get('/admin-area', 
  authenticateToken, 
  checkRole(['admin', 'super_admin']), 
  controller
);
```

### 3. Shortcut Middleware ها

```javascript
const { requireSuperAdmin, requireAdmin } = require('../middleware/auth');

// فقط super_admin
router.get('/logs', authenticateToken, requireSuperAdmin, controller);

// admin یا super_admin
router.get('/members', authenticateToken, requireAdmin, controller);
```

---

## 🔒 محافظت از Route ها

### Activity Logs (فقط Super Admin)

```javascript
// backend/routes/activityLogs.js
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, requireSuperAdmin, controller.getActivityLogs);
router.get('/stats', authenticateToken, requireSuperAdmin, controller.getActivityStats);
router.delete('/clear', authenticateToken, requireSuperAdmin, controller.clearOldLogs);
```

### سایر Route ها

می‌توانید به همین روش سایر route ها را هم محافظت کنید:

```javascript
// مثال: محافظت از route های members
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.post('/', authenticateToken, requireAdmin, membersController.createMember);
router.put('/:id', authenticateToken, requireAdmin, membersController.updateMember);
router.delete('/:id', authenticateToken, requireAdmin, membersController.deleteMember);
```

---

## 🧪 تست با cURL

### ورود و دریافت توکن:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"superadmin\",\"password\":\"Admin@123\"}"
```

### استفاده از توکن:
```bash
curl -X GET http://localhost:5000/api/activity-logs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 کدهای وضعیت HTTP

- **200**: موفق
- **201**: ساخته شد (Register موفق)
- **400**: درخواست نامعتبر (اطلاعات ناقص)
- **401**: احراز هویت نشده (توکن نامعتبر یا وجود ندارد)
- **403**: دسترسی ممنوع (نقش کاربر مجاز نیست)
- **409**: تداخل (نام کاربری یا ایمیل تکراری)
- **500**: خطای سرور

---

## 🔧 تنظیمات JWT

در فایل `.env`:

```env
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

⚠️ **مهم**: در محیط production حتماً یک کلید قوی و تصادفی استفاده کنید!

**مدت اعتبار توکن**: 7 روز (قابل تغییر در `authController.js`)

---

## 📝 ساختار Token

توکن JWT شامل اطلاعات زیر است:

```json
{
  "id": 1,
  "username": "superadmin",
  "role": "super_admin",
  "iat": 1699612800,
  "exp": 1700217600
}
```

---

## ✅ چک‌لیست مرحله 1

- [x] ساخت middleware احراز هویت (authenticateToken)
- [x] ساخت middleware بررسی نقش (checkRole)
- [x] محافظت از route های Activity Logs
- [x] محافظت از route دریافت اطلاعات کاربر
- [x] ساخت اسکریپت Super Admin
- [x] ساخت اسکریپت تست
- [x] مستندات کامل

---

## 🎯 مرحله بعدی

مرحله 2: فرانت‌اند
- صفحه Login
- مدیریت Token در localStorage
- Protected Routes
- مخفی کردن منوها بر اساس نقش
- نمایش اطلاعات کاربر

---

## 🐛 عیب‌یابی

### خطای "توکن نامعتبر"
- بررسی کنید که JWT_SECRET در `.env` تنظیم شده باشد
- مطمئن شوید که توکن منقضی نشده (7 روز)

### خطای "دسترسی ممنوع"
- بررسی کنید که نقش کاربر صحیح باشد
- مطمئن شوید که middleware ها به ترتیب صحیح اجرا می‌شوند

### خطای "کاربر یافت نشد"
- ابتدا اسکریپت `createSuperAdmin.js` را اجرا کنید
