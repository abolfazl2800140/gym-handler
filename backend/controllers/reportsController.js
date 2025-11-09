const db = require('../config/database');

// GET dashboard summary
exports.getDashboardSummary = async (req, res) => {
  try {
    // Get member stats
    const memberStats = await db.query(`
      SELECT 
        COUNT(*) as total_members,
        COUNT(*) FILTER (WHERE subscription_status = 'فعال') as active_members
      FROM members
    `);

    // Get financial stats (current month)
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const financialStats = await db.query(`
      SELECT 
        SUM(CASE WHEN type = 'درآمد' THEN amount ELSE 0 END) as monthly_income,
        SUM(CASE WHEN type = 'هزینه' THEN amount ELSE 0 END) as monthly_expense
      FROM transactions
      WHERE date >= $1 AND date <= $2
    `, [startOfMonth, endOfMonth]);

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE ar.status = 'حاضر') as present_today,
        COUNT(*) FILTER (WHERE ar.status = 'غایب') as absent_today
      FROM attendance a
      JOIN attendance_records ar ON a.id = ar.attendance_id
      WHERE a.date = $1
    `, [today]);

    // Get recent transactions
    const recentTransactions = await db.query(`
      SELECT t.*, m.first_name, m.last_name
      FROM transactions t
      LEFT JOIN members m ON t.member_id = m.id
      ORDER BY t.date DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        members: memberStats.rows[0],
        financial: financialStats.rows[0],
        attendance: todayAttendance.rows[0],
        recentTransactions: recentTransactions.rows
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET monthly financial report
exports.getMonthlyFinancialReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ 
        success: false, 
        error: 'Year and month are required' 
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const result = await db.query(`
      SELECT 
        DATE(date) as transaction_date,
        SUM(CASE WHEN type = 'درآمد' THEN amount ELSE 0 END) as daily_income,
        SUM(CASE WHEN type = 'هزینه' THEN amount ELSE 0 END) as daily_expense,
        json_agg(
          json_build_object(
            'id', id,
            'type', type,
            'amount', amount,
            'title', title,
            'category', category
          )
        ) as transactions
      FROM transactions
      WHERE date >= $1 AND date <= $2
      GROUP BY DATE(date)
      ORDER BY transaction_date
    `, [startDate, endDate]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching monthly financial report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET member growth report
exports.getMemberGrowthReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        DATE(join_date) as date,
        COUNT(*) as new_members
      FROM members
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND join_date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND join_date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ' GROUP BY DATE(join_date) ORDER BY date';

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching member growth report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET comprehensive report
exports.getComprehensiveReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Member statistics
    const memberStats = await db.query(`
      SELECT 
        COUNT(*) as total_members,
        COUNT(*) FILTER (WHERE subscription_status = 'فعال') as active_members,
        COUNT(*) FILTER (WHERE member_type = 'ورزشکار') as athletes,
        COUNT(*) FILTER (WHERE member_type = 'مربی') as coaches
      FROM members
    `);

    // Financial statistics
    let financialQuery = `
      SELECT 
        SUM(CASE WHEN type = 'درآمد' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'هزینه' THEN amount ELSE 0 END) as total_expense,
        COUNT(*) as total_transactions
      FROM transactions
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (startDate) {
      financialQuery += ` AND date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      financialQuery += ` AND date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    const financialStats = await db.query(financialQuery, params);

    // Attendance statistics
    let attendanceQuery = `
      SELECT 
        COUNT(DISTINCT a.date) as total_days,
        COUNT(*) FILTER (WHERE ar.status = 'حاضر') as total_present,
        COUNT(*) FILTER (WHERE ar.status = 'غایب') as total_absent
      FROM attendance a
      JOIN attendance_records ar ON a.id = ar.attendance_id
      WHERE 1=1
    `;
    const attendanceParams = [];
    let attendanceParamCount = 1;

    if (startDate) {
      attendanceQuery += ` AND a.date >= $${attendanceParamCount}`;
      attendanceParams.push(startDate);
      attendanceParamCount++;
    }

    if (endDate) {
      attendanceQuery += ` AND a.date <= $${attendanceParamCount}`;
      attendanceParams.push(endDate);
      attendanceParamCount++;
    }

    const attendanceStats = await db.query(attendanceQuery, attendanceParams);

    res.json({
      success: true,
      data: {
        members: memberStats.rows[0],
        financial: financialStats.rows[0],
        attendance: attendanceStats.rows[0],
        period: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Error fetching comprehensive report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
