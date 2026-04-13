import { getDB, saveDB } from '../database/init.js'

export const getCart = (req, res) => {
  try {
    const db = getDB()
    const userId = req.user.id

    const result = db.exec(`
      SELECT c.*, p.name, p.price, p.images, p.stock
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId])

    if (result.length === 0) {
      return res.json({ items: [], total: 0 })
    }

    const items = result[0].values.map(row => ({
      id: row[0],
      user_id: row[1],
      product_id: row[2],
      quantity: row[3],
      created_at: row[4],
      name: row[5],
      price: row[6],
      images: row[7] ? JSON.parse(row[7]) : [],
      stock: row[8]
    }))

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    res.json({ items, total })
  } catch (error) {
    console.error('Get cart error:', error)
    res.status(500).json({ error: 'Failed to get cart' })
  }
}

export const addToCart = (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body
    const db = getDB()
    const userId = req.user.id

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' })
    }

    const existing = db.exec(`SELECT * FROM cart WHERE user_id = ? AND product_id = ?`, [userId, product_id])

    if (existing.length > 0 && existing[0].values.length > 0) {
      db.run(`UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?`, [quantity, userId, product_id])
    } else {
      db.run(`INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`, [userId, product_id, quantity])
    }

    saveDB()
    res.json({ message: 'Added to cart' })
  } catch (error) {
    console.error('Add to cart error:', error)
    res.status(500).json({ error: 'Failed to add to cart' })
  }
}

export const updateCartItem = (req, res) => {
  try {
    const { quantity } = req.body
    const db = getDB()
    const userId = req.user.id

    if (quantity <= 0) {
      db.run(`DELETE FROM cart WHERE user_id = ? AND product_id = ?`, [userId, req.params.productId])
    } else {
      db.run(`UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?`, [quantity, userId, req.params.productId])
    }

    saveDB()
    res.json({ message: 'Cart updated' })
  } catch (error) {
    console.error('Update cart error:', error)
    res.status(500).json({ error: 'Failed to update cart' })
  }
}

export const removeFromCart = (req, res) => {
  try {
    const db = getDB()
    const userId = req.user.id

    db.run(`DELETE FROM cart WHERE user_id = ? AND product_id = ?`, [userId, req.params.productId])
    saveDB()
    res.json({ message: 'Removed from cart' })
  } catch (error) {
    console.error('Remove from cart error:', error)
    res.status(500).json({ error: 'Failed to remove from cart' })
  }
}

export const clearCart = (req, res) => {
  try {
    const db = getDB()
    const userId = req.user.id

    db.run(`DELETE FROM cart WHERE user_id = ?`, [userId])
    saveDB()
    res.json({ message: 'Cart cleared' })
  } catch (error) {
    console.error('Clear cart error:', error)
    res.status(500).json({ error: 'Failed to clear cart' })
  }
}
