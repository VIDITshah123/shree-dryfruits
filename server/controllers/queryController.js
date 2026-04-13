import { getDB, saveDB } from '../database/init.js'

export const createQuery = (req, res) => {
  try {
    const { name, email, phone, message } = req.body
    const db = getDB()

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' })
    }

    const userId = req.user?.id || null

    db.run(`
      INSERT INTO queries (user_id, name, email, phone, message)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, name, email, phone, message])
    saveDB()

    res.status(201).json({ message: 'Query submitted successfully' })
  } catch (error) {
    console.error('Create query error:', error)
    res.status(500).json({ error: 'Failed to submit query' })
  }
}

export const getAllQueries = (req, res) => {
  try {
    const db = getDB()
    const result = db.exec(`SELECT * FROM queries ORDER BY created_at DESC`)

    if (result.length === 0) {
      return res.json([])
    }

    const queries = result[0].values.map(row => ({
      id: row[0],
      user_id: row[1],
      name: row[2],
      email: row[3],
      phone: row[4],
      message: row[5],
      status: row[6],
      created_at: row[7]
    }))

    res.json(queries)
  } catch (error) {
    console.error('Get queries error:', error)
    res.status(500).json({ error: 'Failed to get queries' })
  }
}

export const updateQueryStatus = (req, res) => {
  try {
    const { status } = req.body
    const db = getDB()

    db.run(`UPDATE queries SET status = ? WHERE id = ?`, [status, req.params.id])
    saveDB()
    res.json({ message: 'Query status updated' })
  } catch (error) {
    console.error('Update query error:', error)
    res.status(500).json({ error: 'Failed to update query' })
  }
}

export const deleteQuery = (req, res) => {
  try {
    const db = getDB()
    db.run(`DELETE FROM queries WHERE id = ?`, [req.params.id])
    saveDB()
    res.json({ message: 'Query deleted' })
  } catch (error) {
    console.error('Delete query error:', error)
    res.status(500).json({ error: 'Failed to delete query' })
  }
}
