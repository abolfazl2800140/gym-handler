import Swal from 'sweetalert2';

/**
 * سرویس مرکزی برای نمایش پیام‌ها و اعلان‌ها
 * استفاده از SweetAlert2 با تنظیمات RTL و فارسی
 */

// تنظیمات پیش‌فرض برای تمام alert ها
const defaultConfig = {
  confirmButtonText: 'باشه',
  cancelButtonText: 'انصراف',
  confirmButtonColor: '#3b82f6',
  cancelButtonColor: '#6b7280',
  customClass: {
    popup: 'rtl-popup',
    title: 'rtl-title',
    htmlContainer: 'rtl-content',
    confirmButton: 'swal-btn-confirm',
    cancelButton: 'swal-btn-cancel'
  }
};

const notification = {
  /**
   * نمایش پیام موفقیت
   */
  success: (message, title = 'موفقیت!') => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'success',
      title,
      text: message,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: true
    });
  },

  /**
   * نمایش پیام خطا
   */
  error: (message, title = 'خطا!') => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'error',
      title,
      text: message,
      confirmButtonColor: '#ef4444'
    });
  },

  /**
   * نمایش پیام هشدار
   */
  warning: (message, title = 'هشدار!') => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title,
      text: message,
      confirmButtonColor: '#f59e0b'
    });
  },

  /**
   * نمایش پیام اطلاعاتی
   */
  info: (message, title = 'اطلاعات') => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'info',
      title,
      text: message
    });
  },

  /**
   * نمایش دیالوگ تایید
   */
  confirm: (message, title = 'آیا مطمئن هستید؟', options = {}) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: options.confirmText || 'بله',
      cancelButtonText: options.cancelText || 'خیر',
      confirmButtonColor: options.confirmColor || '#3b82f6',
      cancelButtonColor: options.cancelColor || '#6b7280',
      reverseButtons: true
    });
  },

  /**
   * نمایش دیالوگ تایید حذف
   */
  confirmDelete: (itemName = 'این مورد') => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title: 'حذف ' + itemName,
      text: 'آیا از حذف این مورد اطمینان دارید؟ این عملیات قابل بازگشت نیست.',
      showCancelButton: true,
      confirmButtonText: 'بله، حذف کن',
      cancelButtonText: 'انصراف',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });
  },

  /**
   * نمایش Toast (پیام کوچک در گوشه صفحه)
   */
  toast: {
    success: (message) => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });

      return Toast.fire({
        icon: 'success',
        title: message
      });
    },

    error: (message) => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });

      return Toast.fire({
        icon: 'error',
        title: message
      });
    },

    info: (message) => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });

      return Toast.fire({
        icon: 'info',
        title: message
      });
    },

    warning: (message) => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });

      return Toast.fire({
        icon: 'warning',
        title: message
      });
    }
  },

  /**
   * نمایش loading
   */
  loading: (message = 'در حال پردازش...') => {
    return Swal.fire({
      ...defaultConfig,
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },

  /**
   * بستن loading
   */
  close: () => {
    Swal.close();
  }
};

export default notification;
