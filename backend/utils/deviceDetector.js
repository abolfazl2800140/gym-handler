/**
 * تشخیص نوع دستگاه از User Agent
 */

const detectDevice = (userAgent) => {
  if (!userAgent) return 'نامشخص';

  const ua = userAgent.toLowerCase();

  // موبایل
  if (ua.includes('android')) {
    return '📱 اندروید';
  }
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    return '📱 iOS';
  }
  if (ua.includes('mobile') || ua.includes('phone')) {
    return '📱 موبایل';
  }

  // تبلت
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return '📱 تبلت';
  }

  // دسکتاپ
  if (ua.includes('windows')) {
    return '💻 ویندوز';
  }
  if (ua.includes('mac os') || ua.includes('macintosh')) {
    return '💻 مک';
  }
  if (ua.includes('linux')) {
    return '💻 لینوکس';
  }

  // مرورگر
  if (ua.includes('chrome')) {
    return '🌐 کروم';
  }
  if (ua.includes('firefox')) {
    return '🌐 فایرفاکس';
  }
  if (ua.includes('safari')) {
    return '🌐 سافاری';
  }
  if (ua.includes('edge')) {
    return '🌐 اج';
  }

  return '💻 دسکتاپ';
};

const detectBrowser = (userAgent) => {
  if (!userAgent) return 'نامشخص';

  const ua = userAgent.toLowerCase();

  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('chrome/')) return 'Chrome';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('safari/') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('opera') || ua.includes('opr/')) return 'Opera';

  return 'نامشخص';
};

const detectOS = (userAgent) => {
  if (!userAgent) return 'نامشخص';

  const ua = userAgent.toLowerCase();

  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  if (ua.includes('windows nt 10')) return 'Windows 10/11';
  if (ua.includes('windows nt 6.3')) return 'Windows 8.1';
  if (ua.includes('windows nt 6.2')) return 'Windows 8';
  if (ua.includes('windows nt 6.1')) return 'Windows 7';
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac os')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';

  return 'نامشخص';
};

const getDeviceInfo = (userAgent) => {
  return {
    device: detectDevice(userAgent),
    browser: detectBrowser(userAgent),
    os: detectOS(userAgent),
    full: userAgent
  };
};

module.exports = {
  detectDevice,
  detectBrowser,
  detectOS,
  getDeviceInfo
};
