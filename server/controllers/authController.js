import bcrypt from 'bcryptjs'
import { getDB } from '../database/init.js'
import { generateToken } from '../middleware/auth.js'

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }

    const db = getDB()

    const existingUser = db.exec(`SELECT id FROM users WHERE email = ?`, [email])
    if (existingUser.length > 0 && existingUser[0].values.length > 0) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    db.run(
      `INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone || null, 'customer']
    )

    const user = db.exec(`SELECT id, name, email, phone, role FROM users WHERE email = ?`, [email])
    const userData = {
      id: user[0].values[0][0],
      name: user[0].values[0][1],
      email: user[0].values[0][2],
      phone: user[0].values[0][3],
      role: user[0].values[0][4]
    }

    const token = generateToken(userData)

    res.status(201).json({ message: 'Registration successful', token, user: userData })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const db = getDB()
    const result = db.exec(`SELECT * FROM users WHERE email = ?`, [email])

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      email: result[0].values[0][2],
      password: result[0].values[0][3],
      phone: result[0].values[0][4],
      role: result[0].values[0][5],
      created_at: result[0].values[0][6]
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(user)
    const { password: _, ...userData } = user

    res.json({ message: 'Login successful', token, user: userData })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
}

export const getProfile = (req, res) => {
  try {
    const db = getDB()
    const result = db.exec(`SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?`, [req.user.id])

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

    res.json(user)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to get profile' })
  }
}

export const updateProfile = (req, res) => {
  try {
    const { name, phone } = req.body
    const db = getDB()

    db.run(`UPDATE users SET name = ?, phone = ? WHERE id = ?`, [name, phone, req.user.id])

    const result = db.exec(`SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?`, [req.user.id])
    const user = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      email: result[0].values[0][2],
      phone: result[0].values[0][3],
      role: result[0].values[0][4],
      created_at: result[0].values[0][5]
    }

    res.json({ message: 'Profile updated', user })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@shreedryfruits.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' })
    }

    const db = getDB()
    let result = db.exec(`SELECT * FROM users WHERE email = ? AND role = 'admin'`, [email])

    if (result.length === 0 || result[0].values.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10)
      db.run(
        `INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)`,
        ['Admin', email, hashedPassword, null, 'admin']
      )
      result = db.exec(`SELECT * FROM users WHERE email = ? AND role = 'admin'`, [email])
    }

    const user = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      email: result[0].values[0][2],
      password: result[0].values[0][3],
      phone: result[0].values[0][4],
      role: result[0].values[0][5],
      created_at: result[0].values[0][6]
    }

    const token = generateToken(user)
    const { password: _, ...userData } = user

    res.json({ message: 'Admin login successful', token, user: userData })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ error: 'Admin login failed' })
  }
}
