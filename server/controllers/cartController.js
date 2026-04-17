import { getDB, saveDB } from '../database/init.js'

export const getCart = (req, res) => {
  try {
    const db = getDB()
    const userId = req.user.id

    const result = db.exec(`
      SELECT c.*, p.name, p.images, p.stock
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
      weight: row[3],
      price: row[4],
      quantity: row[5],
      created_at: row[6],
      name: row[7],
      images: row[8] ? JSON.parse(row[8]) : [],
      stock: row[9]
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
    const { product_id, weight, price, quantity = 1 } = req.body
    const db = getDB()
    const userId = req.user.id

    if (!product_id || !weight || !price) {
      return res.status(400).json({ error: 'Product ID, weight, and price are required' })
    }

    const existing = db.exec(`SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND weight = ?`, [userId, product_id, weight])

    if (existing.length > 0 && existing[0].values.length > 0) {
      db.run(`UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ? AND weight = ?`, [quantity, userId, product_id, weight])
    } else {
      db.run(`INSERT INTO cart (user_id, product_id, weight, price, quantity) VALUES (?, ?, ?, ?, ?)`, [userId, product_id, weight, price, quantity])
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
    const { quantity, weight } = req.body
    const db = getDB()
    const userId = req.user.id
    const cartId = req.params.cartId

    if (quantity <= 0) {
      db.run(`DELETE FROM cart WHERE id = ? AND user_id = ?`, [cartId, userId])
    } else if (weight) {
      db.run(`UPDATE cart SET quantity = ?, weight = ? WHERE id = ? AND user_id = ?`, [quantity, weight, cartId, userId])
    } else {
      db.run(`UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?`, [quantity, cartId, userId])
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
    const cartId = req.params.cartId

    db.run(`DELETE FROM cart WHERE id = ? AND user_id = ?`, [cartId, userId])
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