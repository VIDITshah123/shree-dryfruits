import { getDB } from '../database/init.js'

export const getAllUsers = (req, res) => {
  try {
    const db = getDB()
    const result = db.exec(`SELECT id, name, email, phone, role, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC`)

    if (result.length === 0) {
      return res.json([])
    }

    const users = result[0].values.map(row => ({
      id: row[0],
      name: row[1],
      email: row[2],
      phone: row[3],
      role: row[4],
      created_at: row[5]
    }))

    for (const user of users) {
      const orderCountResult = db.exec(`SELECT COUNT(*) FROM orders WHERE user_id = ?`, [user.id])
      user.orderCount = orderCountResult[0]?.values[0]?.[0] || 0
    }

    res.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Failed to get users' })
  }
}

export const getUserById = (req, res) => {
  try {
    const db = getDB()
    const result = db.exec(`SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?`, [req.params.id])

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      email: result[0].values[0][2],
      phone: result[0].values[0][3],
      role: result[0].values[0][4],
      created_at: result[0].values[0][5]
    }

    const ordersResult = db.exec(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`, [user.id])
    user.orders = ordersResult.length > 0 ? ordersResult[0].values.map(row => ({
      id: row[0],
      status: row[2],
      total: row[3],
      payment_status: row[6],
      created_at: row[7]
    })) : []

    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
}

export const toggleUserStatus = (req, res) => {
  try {
    const db = getDB()
    const userId = req.params.id

    const result = db.exec(`SELECT role FROM users WHERE id = ?`, [userId])
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const currentRole = result[0].values[0][0]
    const newRole = currentRole === 'customer' ? 'disabled' : 'customer'

    db.run(`UPDATE users SET role = ? WHERE id = ?`, [newRole, userId])
    require('../database/init.js').saveDB()

    res.json({ message: `User ${newRole === 'disabled' ? 'disabled' : 'enabled'} successfully` })
  } catch (error) {
    console.error('Toggle user status error:', error)
    res.status(500).json({ error: 'Failed to update user status' })
  }
}
