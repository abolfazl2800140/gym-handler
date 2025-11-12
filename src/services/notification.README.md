# راهنمای استفاده از Notification Service

این سرویس برای نمایش پیام‌ها و اعلان‌ها با استفاده از SweetAlert2 طراحی شده است.

## نصب

```bash
npm install sweetalert2
```

## Import

```javascript
import notification from '../services/notification';
```

## استفاده

### 1. پیام موفقیت (Success)

```javascript
notification.success('عملیات با موفقیت انجام شد');
notification.success('کاربر اضافه شد', 'موفق!');
```

### 2. پیام خطا (Error)

```javascript
notification.error('خطا در انجام عملیات');
notification.error('کاربر یافت نشد', 'خطا!');
```

### 3. پیام هشدار (Warning)

```javascript
notification.warning('این عملیات قابل بازگشت نیست');
```

### 4. پیام اطلاعاتی (Info)

```javascript
notification.info('اطلاعات با موفقیت ذخیره شد');
```

### 5. دیالوگ تایید (Confirm)

```javascript
const result = await notification.confirm(
  'آیا مطمئن هستید؟',
  'حذف کاربر'
);

if (result.isConfirmed) {
  // انجام عملیات
}
```

با گزینه‌های سفارشی:

```javascript
const result = await notification.confirm(
  'آیا می‌خواهید ادامه دهید؟',
  'تایید عملیات',
  {
    confirmText: 'بله، ادامه بده',
    cancelText: 'خیر',
    confirmColor: '#10b981',
    cancelColor: '#ef4444'
  }
);
```

### 6. دیالوگ تایید حذف (Confirm Delete)

```javascript
const result = await notification.confirmDelete('کاربر');

if (result.isConfirmed) {
  // حذف کاربر
}
```

### 7. Toast Notifications

پیام‌های کوچک در گوشه صفحه:

```javascript
// موفقیت
notification.toast.success('ذخیره شد');

// خطا
notification.toast.error('خطا در ذخیره');

// اطلاعات
notification.toast.info('اطلاعات جدید');

// هشدار
notification.toast.warning('توجه کنید');
```

### 8. Loading

نمایش loading در حین پردازش:

```javascript
// نمایش loading
notification.loading('در حال پردازش...');

// انجام عملیات
await someAsyncOperation();

// بستن loading
notification.close();
```

## مثال‌های کاربردی

### حذف کاربر

```javascript
const handleDelete = async (userId) => {
  const result = await notification.confirmDelete('کاربر');
  
  if (result.isConfirmed) {
    try {
      notification.loading('در حال حذف...');
      await deleteUser(userId);
      notification.close();
      notification.success('کاربر با موفقیت حذف شد');
    } catch (error) {
      notification.close();
      notification.error('خطا در حذف کاربر');
    }
  }
};
```

### ذخیره فرم

```javascript
const handleSubmit = async (formData) => {
  try {
    const response = await saveData(formData);
    if (response.success) {
      notification.toast.success('اطلاعات ذخیره شد');
    }
  } catch (error) {
    notification.error(error.message || 'خطا در ذخیره اطلاعات');
  }
};
```

### تغییر وضعیت

```javascript
const handleToggleStatus = async (userId, currentStatus) => {
  const result = await notification.confirm(
    `آیا می‌خواهید این کاربر را ${currentStatus ? 'غیرفعال' : 'فعال'} کنید؟`,
    'تغییر وضعیت'
  );
  
  if (result.isConfirmed) {
    try {
      await toggleUserStatus(userId);
      notification.success('وضعیت با موفقیت تغییر کرد');
    } catch (error) {
      notification.error('خطا در تغییر وضعیت');
    }
  }
};
```

## ویژگی‌ها

- ✅ پشتیبانی کامل از RTL
- ✅ فونت فارسی
- ✅ انیمیشن‌های روان
- ✅ قابلیت سفارشی‌سازی
- ✅ Toast notifications
- ✅ Loading state
- ✅ Confirm dialogs
- ✅ Auto-dismiss برای پیام‌های موفقیت

## نکات مهم

1. همیشه از `async/await` برای confirm dialogs استفاده کنید
2. برای پیام‌های سریع از `toast` استفاده کنید
3. برای عملیات مهم از `confirm` استفاده کنید
4. حتماً `notification.close()` را بعد از loading فراخوانی کنید
