const db = require('../config/database');

// GET all attendance records
exports.getAllAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT a.id, a.date, a.notes, a.created_at, a.updated_at,
             json_agg(
               json_build_object(
                 'member_id', ar.member_id,
                 'status', ar.status,
                 'reason', ar.reason,
                 'first_name', m.first_name,
                 'last_name', m.last_name
               )
             ) as records
      FROM attendance a
      LEFT JOIN attendance_records ar ON a.id = ar.attendance_id
      LEFT JOIN members m ON ar.member_id = m.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND a.date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND a.date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ' GROUP BY a.id, a.date, a.notes, a.created_at, a.updated_at ORDER BY a.date DESC';

    const result = await db.query(query, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET attendance by date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    const result = await db.query(
      `SELECT a.id, a.date, a.notes, a.created_at, a.updated_at,
              json_agg(
                json_build_object(
                  'member_id', ar.member_id,
                  'status', ar.status,
                  'reason', ar.reason,
                  'first_name', m.first_name,
                  'last_name', m.last_name
                )
              ) as records
       FROM attendance a
       LEFT JOIN attendance_records ar ON a.id = ar.attendance_id
       LEFT JOIN members m ON ar.member_id = m.id
       WHERE a.date = $1
       GROUP BY a.id, a.date, a.notes, a.created_at, a.updated_at`,
      [date]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Attendance not found for this date' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST create or update attendance
exports.saveAttendance = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const { date, records, notes } = req.body;

    console.log('Received attendance data:', { date, records, notes });

    // Validation
    if (!date || !records) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    await client.query('BEGIN');

    // Check if attendance exists for this date
    const existingAttendance = await client.query(
      'SELECT id FROM attendance WHERE date = $1',
      [date]
    );

    let attendanceId;

    if (existingAttendance.rows.length > 0) {
      // Update existing attendance
      attendanceId = existingAttendance.rows[0].id;
      await client.query(
        'UPDATE attendance SET notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [notes, attendanceId]
      );
      
      // Delete old records
      await client.query('DELETE FROM attendance_records WHERE attendance_id = $1', [attendanceId]);
    } else {
      // Create new attendance
      const newAttendance = await client.query(
        'INSERT INTO attendance (date, notes) VALUES ($1, $2) RETURNING id',
        [date, notes]
      );
      attendanceId = newAttendance.rows[0].id;
    }

    // Insert attendance records
    for (const [memberId, record] of Object.entries(records)) {
      await client.query(
        `INSERT INTO attendance_records (attendance_id, member_id, status, reason)
         VALUES ($1, $2, $3, $4)`,
        [attendanceId, memberId, record.status, record.reason || '']
      );
    }

    await client.query('COMMIT');

    res.status(201).json({ 
      success: true, 
      message: 'Attendance saved successfully',
      data: { id: attendanceId, date, notes }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving attendance:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
};

// DELETE attendance
exports.deleteAttendance = async (req, res) => {
  try {
    const { date } = req.params;
    const result = await db.query('DELETE FROM attendance WHERE date = $1 RETURNING *', [date]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Attendance not found' });
    }

    res.json({ 
      success: true, 
      message: 'Attendance deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET attendance statistics
exports.getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate, memberId } = req.query;
    
    let query = `
      SELECT 
        COUNT(DISTINCT a.date) as total_days,
        COUNT(*) FILTER (WHERE ar.status = 'حاضر') as total_present,
        COUNT(*) FILTER (WHERE ar.status = 'غایب') as total_absent,
        COUNT(*) FILTER (WHERE ar.status = 'مرخصی') as total_leave
      FROM attendance a
      JOIN attendance_records ar ON a.id = ar.attendance_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND a.date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND a.date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    if (memberId) {
      query += ` AND ar.member_id = $${paramCount}`;
      params.push(memberId);
      paramCount++;
    }

    const result = await db.query(query, params);
    
    const stats = result.rows[0];
    const totalRecords = parseInt(stats.total_present) + parseInt(stats.total_absent) + parseInt(stats.total_leave);
    const attendancePercentage = totalRecords > 0 
      ? ((parseInt(stats.total_present) / totalRecords) * 100).toFixed(1)
      : 0;

    res.json({ 
      success: true, 
      data: {
        ...stats,
        attendance_percentage: parseFloat(attendancePercentage)
      }
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET member attendance report
exports.getMemberAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        m.id,
        m.first_name,
        m.last_name,
        COUNT(*) FILTER (WHERE ar.status = 'حاضر') as present_count,
        COUNT(*) FILTER (WHERE ar.status = 'غایب') as absent_count,
        COUNT(*) FILTER (WHERE ar.status = 'مرخصی') as leave_count,
        COUNT(*) as total_records
      FROM members m
      LEFT JOIN attendance_records ar ON m.id = ar.member_id
      LEFT JOIN attendance a ON ar.attendance_id = a.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND a.date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND a.date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ' GROUP BY m.id, m.first_name, m.last_name ORDER BY m.first_name';

    const result = await db.query(query, params);
    
    // Calculate attendance percentage for each member
    const report = result.rows.map(row => {
      const totalRecords = parseInt(row.total_records);
      const presentCount = parseInt(row.present_count);
      const attendancePercentage = totalRecords > 0 
        ? ((presentCount / totalRecords) * 100).toFixed(1)
        : 0;
      
      return {
        ...row,
        attendance_percentage: parseFloat(attendancePercentage)
      };
    });

    res.json({ 
      success: true, 
      count: report.length,
      data: report
    });
  } catch (error) {
    console.error('Error fetching member attendance report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
