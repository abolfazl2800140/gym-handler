# راهنمای رفع خطای CORS

## ✅ تغییرات انجام شده

### 1. به‌روزرسانی تنظیمات CORS در Backend
**فایل:** `backend/server.js`

تنظیمات CORS به صورت زیر به‌روز شد:
- پشتیبانی از چندین origin
- قبول درخواست‌های بدون origin
- اضافه شدن methods و headers مورد نیاز

### 2. ساخت فایل .env برای Backend
**فایل:** `backend/.env`

---

## 🚀 مراحل رفع مشکل

### مرحله 1: بستن Backend (اگر در حال اجراست)

در ترمینالی که Backend اجرا شده، `Ctrl+C` بزن

### مرحله 2: اطمینان از وجود فایل .env

```bash
cd backend
```

مطمئن شو فایل `.env` وجود داره و محتوای زیر رو داره:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database config
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gym_management
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD_HERE
```

### مرحله 3: راه‌اندازی مجدد Backend

```bash
npm run dev
```

باید این پیام‌ها رو ببینی:
```
🚀 Server is running on port 5000
📍 API URL: http://localhost:5000/api
🏥 Health check: http://localhost:5000/api/health
✅ Connected to PostgreSQL database
```

### مرحله 4: تست اتصال

باز کردن مرورگر و رفتن به:
```
http://localhost:5173
```

---

## 🔍 تست CORS

### از مرورگر (Developer Tools - Console):

```javascript
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ CORS OK:', data))
  .catch(err => console.error('❌ CORS Error:', err));
```

اگه پاسخ زیر رو دیدی، CORS درست کار می‌کنه:
```json
{
  "status": "OK",
  "message": "Gym Management API is running"
}
```

---

## ⚠️ مشکلات رایج و راه حل

### 1. خطا: "CORS policy: No 'Access-Control-Allow-Origin' header"

**علت:** Backend در حال اجرا نیست یا پورت اشتباهه

**راه حل:**
```bash
# چک کن Backend اجراست
cd backend
npm run dev

# چک کن روی پورت 5000 اجراست
# باید ببینی: "Server is running on port 5000"
```

### 2. خطا: "Failed to fetch"

**علت:** آدرس API در Frontend اشتباهه

**راه حل:**
```bash
# چک کن فایل .env در ریشه پروژه Frontend
cat .env

# باید این خط رو داشته باشه:
VITE_API_URL=http://localhost:5000/api
```

### 3. خطا: "ERR_CONNECTION_REFUSED"

**علت:** Backend اصلاً اجرا نشده

**راه حل:**
```bash
cd backend
npm install
npm run dev
```

### 4. Backend اجرا نمیشه

**علت:** PostgreSQL نصب نیست یا اجرا نیست

**راه حل:**
```bash
# Windows: باز کردن pgAdmin و چک کردن PostgreSQL
# یا از Services چک کن که PostgreSQL در حال اجراست

# اگه دیتابیس نداری:
cd backend
npm run init-db
```

---

## 🔧 تنظیمات پیشرفته CORS

اگه هنوز مشکل داری، می‌تونی CORS رو کاملاً باز کنی (فقط برای Development):

**فایل:** `backend/server.js`

```javascript
// CORS کاملاً باز (فقط برای Development)
app.use(cors({
  origin: '*',
  credentials: false
}));
```

⚠️ **هشدار:** این تنظیمات فقط برای Development هست! در Production نباید استفاده بشه.

---

## ✅ چک‌لیست نهایی

- [ ] Backend روی پورت 5000 اجراست
- [ ] Frontend روی پورت 5173 اجراست
- [ ] فایل `.env` در Backend وجود داره
- [ ] فایل `.env` در Frontend وجود داره
- [ ] PostgreSQL در حال اجراست
- [ ] دیتابیس initialize شده (`npm run init-db`)
- [ ] هیچ خطایی در Console مرورگر نیست
- [ ] هیچ خطایی در Terminal Backend نیست

---

## 📞 اگه هنوز مشکل داری

1. **Console مرورگر رو باز کن** (F12)
2. **Tab Network رو باز کن**
3. **یه درخواست به API بفرست**
4. **روی درخواست کلیک کن و Headers رو ببین**

اگه این header رو دیدی، CORS درست کار می‌کنه:
```
Access-Control-Allow-Origin: http://localhost:5173
```

---

## 🎯 تست سریع

### ترمینال 1 (Backend):
```bash
cd backend
npm run dev
```

### ترمینال 2 (Frontend):
```bash
npm run dev
```

### مرورگر:
```
http://localhost:5173
```

اگه صفحه باز شد و داده‌ها لود شدن، همه چیز درسته! ✅

---

**تاریخ به‌روزرسانی:** 1403/08/17
