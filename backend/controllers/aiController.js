const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to get gym data
const getGymData = async () => {
  try {
    // Get members data
    const membersResult = await db.query(`
      SELECT 
        COUNT(*) as total_members,
        COUNT(*) FILTER (WHERE subscription_status = 'فعال') as active_members,
        COUNT(*) FILTER (WHERE member_type = 'ورزشکار') as athletes,
        COUNT(*) FILTER (WHERE member_type = 'مربی') as coaches,
        COUNT(*) FILTER (WHERE member_type = 'پرسنل') as staff
      FROM members
    `);

    // Get financial data
    const financialResult = await db.query(`
      SELECT 
        SUM(CASE WHEN type = 'درآمد' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'هزینه' THEN amount ELSE 0 END) as total_expense,
        COUNT(*) as total_transactions
      FROM transactions
    `);

    // Get attendance data
    const attendanceResult = await db.query(`
      SELECT 
        COUNT(DISTINCT a.date) as total_days,
        COUNT(*) FILTER (WHERE ar.status = 'حاضر') as total_present,
        COUNT(*) FILTER (WHERE ar.status = 'غایب') as total_absent,
        COUNT(*) FILTER (WHERE ar.status = 'مرخصی') as total_leave
      FROM attendance a
      LEFT JOIN attendance_records ar ON a.id = ar.attendance_id
    `);

    // Get member attendance details
    const memberAttendanceResult = await db.query(`
      SELECT 
        m.id,
        m.first_name,
        m.last_name,
        COUNT(*) FILTER (WHERE ar.status = 'حاضر') as present_count,
        COUNT(*) FILTER (WHERE ar.status = 'غایب') as absent_count,
        COUNT(*) as total_records
      FROM members m
      LEFT JOIN attendance_records ar ON m.id = ar.member_id
      GROUP BY m.id, m.first_name, m.last_name
      HAVING COUNT(*) > 0
    `);

    // Calculate attendance percentages
    const memberAttendance = memberAttendanceResult.rows.map(row => {
      const percentage = row.total_records > 0 
        ? ((parseInt(row.present_count) / parseInt(row.total_records)) * 100).toFixed(1)
        : 0;
      return {
        name: `${row.first_name} ${row.last_name}`,
        present: parseInt(row.present_count),
        absent: parseInt(row.absent_count),
        total: parseInt(row.total_records),
        percentage: parseFloat(percentage)
      };
    });

    return {
      members: membersResult.rows[0],
      financial: financialResult.rows[0],
      attendance: attendanceResult.rows[0],
      memberAttendance: memberAttendance
    };
  } catch (error) {
    console.error('Error getting gym data:', error);
    throw error;
  }
};

// POST /api/ai/ask - Ask AI a question
exports.askAI = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'سوال الزامی است'
      });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(503).json({
        success: false,
        error: 'API Key هوش مصنوعی تنظیم نشده است'
      });
    }

    // Get gym data
    const gymData = await getGymData();

    // Prepare context for AI
    const context = `
شما یک دستیار هوشمند برای مدیریت باشگاه هستید. اطلاعات زیر را دارید:

📊 اطلاعات اعضا:
- تعداد کل اعضا: ${gymData.members.total_members}
- اعضای فعال: ${gymData.members.active_members}
- ورزشکاران: ${gymData.members.athletes}
- مربیان: ${gymData.members.coaches}
- پرسنل: ${gymData.members.staff}

💰 اطلاعات مالی:
- کل درآمد: ${parseInt(gymData.financial.total_income).toLocaleString('fa-IR')} تومان
- کل هزینه: ${parseInt(gymData.financial.total_expense).toLocaleString('fa-IR')} تومان
- سود خالص: ${(parseInt(gymData.financial.total_income) - parseInt(gymData.financial.total_expense)).toLocaleString('fa-IR')} تومان
- تعداد تراکنش‌ها: ${gymData.financial.total_transactions}

📋 اطلاعات حضور و غیاب:
- تعداد روزهای ثبت شده: ${gymData.attendance.total_days}
- کل حضورها: ${gymData.attendance.total_present}
- کل غیبت‌ها: ${gymData.attendance.total_absent}
- کل مرخصی‌ها: ${gymData.attendance.total_leave}

👥 جزئیات حضور اعضا:
${gymData.memberAttendance.map(m => 
  `- ${m.name}: ${m.percentage}% حضور (${m.present} حاضر، ${m.absent} غایب از ${m.total} روز)`
).join('\n')}

لطفاً به سوال زیر به زبان فارسی و با جزئیات پاسخ دهید:
`;

    // Call Gemini AI
    const prompt = `${context}\n\nسوال: ${question}`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    res.json({
      success: true,
      data: {
        question: question,
        answer: answer,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in AI controller:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
      return res.status(401).json({
        success: false,
        error: 'کلید API نامعتبر است'
      });
    }

    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return res.status(503).json({
        success: false,
        error: 'خطا در اتصال به سرویس هوش مصنوعی. لطفاً VPN خود را چک کنید.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'خطا در پردازش سوال',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// GET /api/ai/suggestions - Get AI suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = [
      "چند درصد از اعضا بالای 80% حضور دارند؟",
      "وضعیت مالی باشگاه چطور است؟",
      "کدام اعضا کمترین حضور را دارند؟",
      "میانگین حضور اعضا چقدر است؟",
      "آیا درآمد باشگاه بیشتر از هزینه‌هاست؟",
      "چند نفر از اعضا فعال هستند؟",
      "پیشنهادی برای افزایش حضور اعضا بده",
      "تحلیل مالی باشگاه را ارائه کن"
    ];

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در دریافت پیشنهادات'
    });
  }
};

// GET /api/ai/test - Test AI connection
exports.testAI = async (req, res) => {
  try {
    console.log('🧪 Testing Gemini AI connection...');
    
    // Check API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(503).json({
        success: false,
        error: 'API Key تنظیم نشده است',
        apiKeySet: false
      });
    }

    console.log('✅ API Key is set');

    // Try simple request
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent("سلام، این یک تست است. لطفاً با یک کلمه جواب بده.");
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini responded:', text);

    res.json({
      success: true,
      message: 'اتصال به Gemini موفق بود',
      apiKeySet: true,
      response: text
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در اتصال به Gemini',
      message: error.message,
      apiKeySet: !!process.env.GEMINI_API_KEY
    });
  }
};
