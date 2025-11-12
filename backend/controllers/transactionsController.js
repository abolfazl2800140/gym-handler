const db = require('../config/database');

// GET all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { search, type, category, startDate, endDate } = req.query;
    
    let query = `
      SELECT t.*, 
             m.first_name, m.last_name
      FROM transactions t
      LEFT JOIN members m ON t.member_id = m.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (t.title ILIKE $${paramCount} OR m.first_name ILIKE $${paramCount} OR m.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (type) {
      query += ` AND t.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (category) {
      query += ` AND t.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (startDate) {
      query += ` AND t.date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND t.date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ' ORDER BY t.date DESC';

    const result = await db.query(query, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET single transaction
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT t.*, m.first_name, m.last_name
       FROM transactions t
       LEFT JOIN members m ON t.member_id = m.id
       WHERE t.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST create transaction
exports.createTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      title,
      description,
      category,
      date,
      memberId
    } = req.body;

    // Validation
    if (!type || !amount || !title || !category || !date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const result = await db.query(
      `INSERT INTO transactions 
       (type, amount, title, description, category, date, member_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [type, amount, title, description, category, date, memberId || null]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Transaction created successfully',
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      amount,
      title,
      description,
      category,
      date,
      memberId
    } = req.body;

    const result = await db.query(
      `UPDATE transactions 
       SET type = $1, amount = $2, title = $3, description = $4,
           category = $5, date = $6, member_id = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [type, amount, title, description, category, date, memberId || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    res.json({ 
      success: true, 
      message: 'Transaction updated successfully',
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const deletedTransaction = result.rows[0];

    res.json({ 
      success: true, 
      message: 'Transaction deleted successfully',
      deletedTransaction: {
        title: deletedTransaction.title,
        type: deletedTransaction.type,
        amount: deletedTransaction.amount,
        id: deletedTransaction.id
      }
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET financial statistics
exports.getFinancialStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        SUM(CASE WHEN type = 'درآمد' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'هزینه' THEN amount ELSE 0 END) as total_expense,
        SUM(CASE WHEN type = 'درآمد' THEN amount ELSE -amount END) as net_profit,
        COUNT(*) as total_transactions
      FROM transactions
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    const result = await db.query(query, params);
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching financial stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
