import { getDB, saveDB } from '../database/init.js'

export const getAllProducts = (req, res) => {
  try {
    const db = getDB()
    const { category, search, sort, minPrice, maxPrice } = req.query

    let query = `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`
    const params = []

    if (category) {
      query += ` AND p.category_id = ?`
      params.push(category)
    }

    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }

    if (minPrice) {
      query += ` AND p.price >= ?`
      params.push(parseFloat(minPrice))
    }

    if (maxPrice) {
      query += ` AND p.price <= ?`
      params.push(parseFloat(maxPrice))
    }

    if (sort === 'price_asc') {
      query += ` ORDER BY p.price ASC`
    } else if (sort === 'price_desc') {
      query += ` ORDER BY p.price DESC`
    } else if (sort === 'newest') {
      query += ` ORDER BY p.created_at DESC`
    } else {
      query += ` ORDER BY p.name ASC`
    }

    const result = db.exec(query, params)

    if (result.length === 0) {
      return res.json([])
    }

    const products = result[0].values.map(row => ({
      id: row[0],
      name: row[1],
      category_id: row[2],
      price: row[3],
      description: row[4],
      images: row[5] ? JSON.parse(row[5]) : [],
      stock: row[6],
      weight_options: row[7] ? JSON.parse(row[7]) : [],
      created_at: row[8],
      category_name: row[9]
    }))

    res.json(products)
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ error: 'Failed to get products' })
  }
}

export const getProductById = (req, res) => {
  try {
    const db = getDB()
    const result = db.exec(
      `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`,
      [req.params.id]
    )

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const product = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      category_id: result[0].values[0][2],
      price: result[0].values[0][3],
      description: result[0].values[0][4],
      images: result[0].values[0][5] ? JSON.parse(result[0].values[0][5]) : [],
      stock: result[0].values[0][6],
      weight_options: result[0].values[0][7] ? JSON.parse(result[0].values[0][7]) : [],
      created_at: result[0].values[0][8],
      category_name: result[0].values[0][9]
    }

    res.json(product)
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ error: 'Failed to get product' })
  }
}

export const createProduct = (req, res) => {
  try {
    const { name, category_id, price, description, images, stock, weight_options } = req.body
    const db = getDB()

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' })
    }

    db.run(
      `INSERT INTO products (name, category_id, price, description, images, stock, weight_options) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, category_id, price, description, JSON.stringify(images || []), stock || 0, JSON.stringify(weight_options || [])]
    )
    saveDB()

    const result = db.exec(`SELECT * FROM products ORDER BY id DESC LIMIT 1`)
    const product = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      category_id: result[0].values[0][2],
      price: result[0].values[0][3],
      description: result[0].values[0][4],
      images: result[0].values[0][5] ? JSON.parse(result[0].values[0][5]) : [],
      stock: result[0].values[0][6],
      weight_options: result[0].values[0][7] ? JSON.parse(result[0].values[0][7]) : [],
      created_at: result[0].values[0][8]
    }

    res.status(201).json({ message: 'Product created', product })
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ error: 'Failed to create product' })
  }
}

export const updateProduct = (req, res) => {
  try {
    const { name, category_id, price, description, images, stock, weight_options } = req.body
    const db = getDB()

    db.run(
      `UPDATE products SET name = ?, category_id = ?, price = ?, description = ?, images = ?, stock = ?, weight_options = ? WHERE id = ?`,
      [name, category_id, price, description, JSON.stringify(images || []), stock, JSON.stringify(weight_options || []), req.params.id]
    )
    saveDB()

    const result = db.exec(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`, [req.params.id])

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const product = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      category_id: result[0].values[0][2],
      price: result[0].values[0][3],
      description: result[0].values[0][4],
      images: result[0].values[0][5] ? JSON.parse(result[0].values[0][5]) : [],
      stock: result[0].values[0][6],
      weight_options: result[0].values[0][7] ? JSON.parse(result[0].values[0][7]) : [],
      created_at: result[0].values[0][8],
      category_name: result[0].values[0][9]
    }

    res.json({ message: 'Product updated', product })
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ error: 'Failed to update product' })
  }
}

export const deleteProduct = (req, res) => {
  try {
    const db = getDB()
    db.run(`DELETE FROM products WHERE id = ?`, [req.params.id])
    saveDB()
    res.json({ message: 'Product deleted' })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ error: 'Failed to delete product' })
  }
}

export const getFeaturedProducts = (req, res) => {
  try {
    const db = getDB()
    const result = db.exec(
      `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY RANDOM() LIMIT 8`
    )

    if (result.length === 0) {
      return res.json([])
    }

    const products = result[0].values.map(row => ({
      id: row[0],
      name: row[1],
      category_id: row[2],
      price: row[3],
      description: row[4],
      images: row[5] ? JSON.parse(row[5]) : [],
      stock: row[6],
      weight_options: row[7] ? JSON.parse(row[7]) : [],
      created_at: row[8],
      category_name: row[9]
    }))

    res.json(products)
  } catch (error) {
    console.error('Get featured products error:', error)
    res.status(500).json({ error: 'Failed to get featured products' })
  }
}
