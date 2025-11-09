const db = require('../config/database');

// GET all members
exports.getAllMembers = async (req, res) => {
  try {
    const { search, memberType, status } = req.query;
    
    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR phone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (memberType) {
      query += ` AND member_type = $${paramCount}`;
      params.push(memberType);
      paramCount++;
    }

    if (status) {
      query += ` AND subscription_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET single member
exports.getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM members WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST create member
exports.createMember = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      birthDate,
      memberType,
      membershipLevel,
      subscriptionStatus
    } = req.body;

    // Validation
    if (!firstName || !lastName || !phone || !memberType || !membershipLevel) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const result = await db.query(
      `INSERT INTO members 
       (first_name, last_name, phone, birth_date, member_type, membership_level, join_date, subscription_status)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7)
       RETURNING *`,
      [firstName, lastName, phone, birthDate, memberType, membershipLevel, subscriptionStatus || 'فعال']
    );

    res.status(201).json({ 
      success: true, 
      message: 'Member created successfully',
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error creating member:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number already exists' 
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT update member
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      birthDate,
      memberType,
      membershipLevel,
      subscriptionStatus
    } = req.body;

    const result = await db.query(
      `UPDATE members 
       SET first_name = $1, last_name = $2, phone = $3, birth_date = $4,
           member_type = $5, membership_level = $6, subscription_status = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [firstName, lastName, phone, birthDate, memberType, membershipLevel, subscriptionStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    res.json({ 
      success: true, 
      message: 'Member updated successfully',
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE member
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM members WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    res.json({ 
      success: true, 
      message: 'Member deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET member statistics
exports.getMemberStats = async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_members,
        COUNT(*) FILTER (WHERE subscription_status = 'فعال') as active_members,
        COUNT(*) FILTER (WHERE member_type = 'ورزشکار') as athletes,
        COUNT(*) FILTER (WHERE member_type = 'مربی') as coaches,
        COUNT(*) FILTER (WHERE member_type = 'پرسنل') as staff
      FROM members
    `);

    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    console.error('Error fetching member stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
