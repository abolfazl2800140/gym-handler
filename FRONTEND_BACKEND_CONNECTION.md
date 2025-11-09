# راهنمای اتصال Frontend به Backend

## ✅ تغییرات انجام شده

### 1. ساخت API Service Layer
**فایل:** `src/services/api.js`

این فایل شامل تمام توابع برای ارتباط با Backend است:
- `membersAPI` - عملیات مربوط به اعضا
- `transactionsAPI` - عملیات مربوط به تراکنش‌ها
- `attendanceAPI` - عملیات مربوط به حضور و غیاب
- `reportsAPI` - عملیات مربوط به گزارشات

### 2. ساخت Data Transformers
**فایل:** `src/utils/dataTransform.js`

تبدیل داده‌ها بین فرمت Backend (snake_case) و Frontend (camelCase):
- `transformMemberFromAPI` / `transformMemberToAPI`
- `transformTransactionFromAPI` / `transformTransactionToAPI`
- `transformAttendanceFromAPI` / `transformAttendanceToAPI`

### 3. به‌روزرسانی صفحات

#### ✅ Members.jsx
- استفاده از `membersAPI` به جای localStorage
- اضافه شدن `loading` و `error` states
- توابع async برای CRUD operations

#### ✅ Financial.jsx
- استفاده از `transactionsAPI` به جای localStorage
- اضافه شدن `loading` و `error` states
- توابع async برای CRUD operations

#### ✅ Attendance.jsx
- استفاده از `attendanceAPI` به جای localStorage
- اضافه شدن `loading` و `error` states
- توابع async برای CRUD operations

---

## 🚀 راه‌اندازی

### مرحله 1: راه‌اندازی Backend

```bash
# ترمینال 1 - Backend
cd backend
npm install
npm run init-db
npm run dev
```

Backend روی `http://localhost:5000` اجرا می‌شه

### مرحله 2: راه‌اندازی Frontend

```bash
# ترمینال 2 - Frontend
npm install
npm run dev
```

Frontend روی `http://localhost:5173` اجرا می‌شه

### مرحله 3: تنظیم Environment Variables

فایل `.env` در ریشه پروژه Frontend:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 نحوه کار API

### مثال: دریافت لیست اعضا

```javascript
import { membersAPI } from '../services/api';

// در کامپوننت
const fetchMembers = async () => {
  try {
    setLoading(true);
    const response = await membersAPI.getAll();
    setMembers(response.data); // داده‌ها به فرمت camelCase
  } catch (error) {
    console.error('Error:', error);
    setError('خطا در دریافت اطلاعات');
  } finally {
    setLoading(false);
  }
};
```

### مثال: ایجاد عضو جدید

```javascript
const handleCreateMember = async (formData) => {
  try {
    await membersAPI.create(formData);
    await fetchMembers(); // رفرش لیست
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🔄 تبدیل داده‌ها

### Backend → Frontend (snake_case → camelCase)

```javascript
// Backend Response
{
  "id": 1,
  "first_name": "علی",
  "last_name": "احمدی",
  "member_type": "ورزشکار"
}

// Frontend (بعد از transform)
{
  "id": 1,
  "firstName": "علی",
  "lastName": "احمدی",
  "memberType": "ورزشکار"
}
```

این تبدیل به صورت خودکار در `api.js` انجام می‌شه.

---

## 🛡️ مدیریت خطا

### Fallback به localStorage

اگر Backend در دسترس نباشه، برنامه از localStorage استفاده می‌کنه:

```javascript
try {
  const response = await membersAPI.getAll();
  setMembers(response.data);
} catch (err) {
  // Fallback to localStorage
  const savedMembers = localStorage.getItem("members");
  if (savedMembers) {
    setMembers(JSON.parse(savedMembers));
  }
}
```

### نمایش خطا به کاربر

```javascript
{error && (
  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
    {error}
  </div>
)}
```

---

## 📊 وضعیت اتصال صفحات

| صفحه | وضعیت | توضیحات |
|------|-------|---------|
| Members | ✅ متصل | CRUD کامل |
| Financial | ✅ متصل | CRUD کامل |
| Attendance | ✅ متصل | CRUD کامل |
| Reports | ⏳ در انتظار | نیاز به به‌روزرسانی |

---

## 🔍 تست اتصال

### 1. Health Check

```bash
curl http://localhost:5000/api/health
```

باید پاسخ بده:
```json
{
  "status": "OK",
  "message": "Gym Management API is running"
}
```

### 2. تست API از مرورگر

باز کردن Developer Tools (F12) و در Console:

```javascript
// تست دریافت اعضا
fetch('http://localhost:5000/api/members')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## ⚠️ مشکلات رایج

### 1. CORS Error

**خطا:**
```
Access to fetch at 'http://localhost:5000/api/members' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**راه حل:**
- مطمئن شو Backend در حال اجراست
- چک کن `FRONTEND_URL` در `.env` Backend درست باشه

### 2. Network Error

**خطا:**
```
Failed to fetch
```

**راه حل:**
- مطمئن شو Backend روی پورت 5000 اجراست
- چک کن `VITE_API_URL` در `.env` Frontend درست باشه

### 3. 404 Not Found

**خطا:**
```
GET http://localhost:5000/api/members 404 (Not Found)
```

**راه حل:**
- مطمئن شو دیتابیس initialize شده (`npm run init-db`)
- چک کن route ها در Backend درست تعریف شدن

---

## 📝 نکات مهم

1. **همیشه Backend رو اول اجرا کن**
2. **از async/await برای API calls استفاده کن**
3. **همیشه error handling داشته باش**
4. **از loading state برای UX بهتر استفاده کن**
5. **Fallback به localStorage برای offline mode**

---

## 🎯 مرحله بعدی

- [ ] اضافه کردن Authentication
- [ ] به‌روزرسانی صفحه Reports
- [ ] اضافه کردن Gemini AI
- [ ] بهبود Error Handling
- [ ] اضافه کردن Loading Skeletons
- [ ] اضافه کردن Toast Notifications

---

**تاریخ به‌روزرسانی:** 1403/08/17
