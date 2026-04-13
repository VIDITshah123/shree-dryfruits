import { getDB, saveDB } from '../database/init.js'

export const getAllCategories = (req, res) => {
  try {
    const db = getDB()
    const result = db.exec(`SELECT * FROM categories ORDER BY name`)

    if (result.length === 0) {
      return res.json([])
    }

    const categories = result[0].values.map(row => ({
      id: row[0],
      name: row[1],
      description: row[2],
      image: row[3],
      created_at: row[4]
    }))

    res.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Failed to get categories' })
  }
}

export const getCategoryById = (req, res) => {
  try {
    const db = getDB()
    const result = db.exec(`SELECT * FROM categories WHERE id = ?`, [req.params.id])

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const category = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      description: result[0].values[0][2],
      image: result[0].values[0][3],
      created_at: result[0].values[0][4]
    }

    res.json(category)
  } catch (error) {
    console.error('Get category error:', error)
    res.status(500).json({ error: 'Failed to get category' })
  }
}

export const createCategory = (req, res) => {
  try {
    const { name, description, image } = req.body
    const db = getDB()

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' })
    }

    db.run(`INSERT INTO categories (name, description, image) VALUES (?, ?, ?)`, [name, description, image])
    saveDB()

    const result = db.exec(`SELECT * FROM categories WHERE name = ? ORDER BY id DESC LIMIT 1`, [name])
    const category = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      description: result[0].values[0][2],
      image: result[0].values[0][3],
      created_at: result[0].values[0][4]
    }

    res.status(201).json({ message: 'Category created', category })
  } catch (error) {
    console.error('Create category error:', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
}

export const updateCategory = (req, res) => {
  try {
    const { name, description, image } = req.body
    const db = getDB()

    db.run(`UPDATE categories SET name = ?, description = ?, image = ? WHERE id = ?`, 
      [name, description, image, req.params.id])

    const result = db.exec(`SELECT * FROM categories WHERE id = ?`, [req.params.id])

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }

    saveDB()
    const category = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      description: result[0].values[0][2],
      image: result[0].values[0][3],
      created_at: result[0].values[0][4]
    }

    res.json({ message: 'Category updated', category })
  } catch (error) {
    console.error('Update category error:', error)
    res.status(500).json({ error: 'Failed to update category' })
  }
}

export const deleteCategory = (req, res) => {
  try {
    const db = getDB()
    db.run(`DELETE FROM categories WHERE id = ?`, [req.params.id])
    saveDB()
    res.json({ message: 'Category deleted' })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({ error: 'Failed to delete category' })
  }
}
