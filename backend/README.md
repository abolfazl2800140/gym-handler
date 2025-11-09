# Gym Management System - Backend API

Backend API برای سیستم مدیریت باشگاه با Node.js, Express و PostgreSQL

## 📋 فهرست مطالب
- [نصب و راه‌اندازی](#نصب-و-راه‌اندازی)
- [API Endpoints](#api-endpoints)
- [ساختار پروژه](#ساختار-پروژه)
- [تکنولوژی‌ها](#تکنولوژی‌ها)

---

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها:
- Node.js (v16 یا بالاتر)
- PostgreSQL (v13 یا بالاتر)
- npm یا yarn

### مراحل نصب:

#### 1. نصب PostgreSQL
```bash
# Windows
# دانلود از: https://www.postgresql.org/download/windows/

# بعد از نصب، pgAdmin رو باز کن و یه database جدید بساز:
# نام database: gym_management
```

#### 2. نصب پکیج‌ها
```bash
cd backend
npm install
```

#### 3. تنظیم متغیرهای محیطی
```bash
# کپی کردن فایل .env.example
copy .env.example .env

# ویرایش فایل .env و مقادیر رو پر کن:
# DB_PASSWORD=رمز PostgreSQL خودت
# JWT_SECRET=یه رشته تصادفی و امن
```

#### 4. ساخت جداول و داده‌های نمونه
```bash
npm run init-db
```

#### 5. اجرای سرور
```bash
# حالت Development
npm run dev

# حالت Production
npm start
```

سرور روی `http://localhost:5000` اجرا می‌شه

---

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Members (اعضا)
```
GET    /api/members              # لیست تمام اعضا
GET    /api/members/:id          # جزئیات یک عضو
POST   /api/members              # ایجاد عضو جدید
PUT    /api/members/:id          # ویرایش عضو
DELETE /api/members/:id          # حذف عضو
GET    /api/members/stats/summary # آمار اعضا
```

**Query Parameters برای GET /api/members:**
- `search`: جستجو در نام، نام خانوادگی، شماره تلفن
- `memberType`: فیلتر بر اساس نوع عضویت (ورزشکار، مربی، پرسنل)
- `status`: فیلتر بر اساس وضعیت (فعال، غیرفعال)

**نمونه Request برای POST:**
```json
{
  "firstName": "علی",
  "lastName": "احمدی",
  "phone": "09121234567",
  "birthDate": "1995-05-15",
  "memberType": "ورزشکار",
  "membershipLevel": "طلایی",
  "subscriptionStatus": "فعال"
}
```

### Transactions (تراکنش‌ها)
```
GET    /api/transactions              # لیست تمام تراکنش‌ها
GET    /api/transactions/:id          # جزئیات یک تراکنش
POST   /api/transactions              # ایجاد تراکنش جدید
PUT    /api/transactions/:id          # ویرایش تراکنش
DELETE /api/transactions/:id          # حذف تراکنش
GET    /api/transactions/stats/summary # آمار مالی
```

**Query Parameters:**
- `search`: جستجو در عنوان
- `type`: فیلتر بر اساس نوع (درآمد، هزینه)
- `category`: فیلتر بر اساس دسته‌بندی
- `startDate`: از تاریخ
- `endDate`: تا تاریخ

**نمونه Request برای POST:**
```json
{
  "type": "درآمد",
  "amount": 2000000,
  "title": "شهریه علی احمدی",
  "description": "پرداخت شهریه ماه آذر",
  "category": "شهریه",
  "date": "2024-11-01T10:00:00Z",
  "memberId": 1
}
```

### Attendance (حضور و غیاب)
```
GET    /api/attendance                    # لیست تمام رکوردهای حضور
GET    /api/attendance/date/:date         # حضور و غیاب یک روز خاص
POST   /api/attendance                    # ثبت/ویرایش حضور و غیاب
DELETE /api/attendance/date/:date         # حذف رکورد حضور
GET    /api/attendance/stats/summary      # آمار حضور و غیاب
GET    /api/attendance/stats/members      # گزارش حضور اعضا
```

**Query Parameters:**
- `startDate`: از تاریخ
- `endDate`: تا تاریخ
- `memberId`: فیلتر بر اساس عضو (برای stats)

**نمونه Request برای POST:**
```json
{
  "date": "2024-11-07",
  "records": {
    "1": {
      "status": "حاضر",
      "reason": ""
    },
    "2": {
      "status": "غایب",
      "reason": "بیماری"
    }
  },
  "notes": "تمرین سنگین امروز"
}
```

### Reports (گزارشات)
```
GET /api/reports/dashboard              # خلاصه داشبورد
GET /api/reports/financial/monthly      # گزارش مالی ماهانه
GET /api/reports/members/growth         # گزارش رشد اعضا
GET /api/reports/comprehensive          # گزارش جامع
```

---

## 📁 ساختار پروژه

```
backend/
├── config/
│   └── database.js           # تنظیمات دیتابیس
├── controllers/
│   ├── membersController.js
│   ├── transactionsController.js
│   ├── attendanceController.js
│   └── reportsController.js
├── routes/
│   ├── auth.js
│   ├── members.js
│   ├── transactions.js
│   ├── attendance.js
│   └── reports.js
├── scripts/
│   └── initDatabase.js       # اسکریپت ساخت جداول
├── .env.example
├── .env
├── server.js                 # فایل اصلی سرور
├── package.json
└── README.md
```

---

## 🛠️ تکنولوژی‌ها

- **Node.js** - Runtime
- **Express** - Web Framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL Client
- **dotenv** - Environment Variables
- **cors** - Cross-Origin Resource Sharing
- **bcryptjs** - Password Hashing (برای مرحله بعد)
- **jsonwebtoken** - JWT Authentication (برای مرحله بعد)

---

## 🔐 امنیت

- همه endpoint ها در مرحله بعد با JWT محافظت می‌شن
- رمزهای عبور با bcrypt هش می‌شن
- SQL Injection با استفاده از Parameterized Queries جلوگیری می‌شه
- CORS برای محدود کردن دسترسی تنظیم شده

---

## 📝 نکات مهم

1. **Database Connection**: مطمئن شو PostgreSQL در حال اجراست
2. **Environment Variables**: حتماً فایل `.env` رو تنظیم کن
3. **Port**: پورت پیش‌فرض 5000 هست، می‌تونی توی `.env` تغییرش بدی
4. **CORS**: آدرس frontend رو توی `.env` تنظیم کن

---

## 🐛 عیب‌یابی

### خطای اتصال به دیتابیس:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**راه حل**: مطمئن شو PostgreSQL در حال اجراست

### خطای authentication:
```
Error: password authentication failed
```
**راه حل**: رمز عبور رو توی `.env` چک کن

### خطای port in use:
```
Error: listen EADDRINUSE: address already in use :::5000
```
**راه حل**: پورت رو توی `.env` تغییر بده یا پروسس قبلی رو ببند

---

## 📞 پشتیبانی

برای سوالات و مشکلات، issue باز کنید.

---

## 🚀 مرحله بعد

در مرحله بعد اضافه می‌شه:
- ✅ Authentication & Authorization
- ✅ Gemini AI Integration
- ✅ Rate Limiting
- ✅ Request Validation
- ✅ Error Handling بهتر
- ✅ Logging
- ✅ Unit Tests
