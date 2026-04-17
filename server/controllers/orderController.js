import { getDB, saveDB } from '../database/init.js'

export const createOrder = (req, res) => {
  try {
    const { address, payment_method } = req.body
    const db = getDB()
    const userId = req.user.id

    if (!address || !payment_method) {
      return res.status(400).json({ error: 'Address and payment method are required' })
    }

    const cartResult = db.exec(`
      SELECT c.*, p.name, p.price, p.stock
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId])

    if (cartResult.length === 0 || cartResult[0].values.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    const cartItems = cartResult[0].values.map(row => ({
      id: row[0],
      product_id: row[2],
      weight: row[3],
      price: row[4],
      quantity: row[5],
      name: row[7],
      stock: row[9]
    }))

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${item.name}` })
      }
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const payment_status = payment_method === 'cod' ? 'pending' : 'paid'

    db.run(`
      INSERT INTO orders (user_id, status, total, address, payment_method, payment_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, 'confirmed', total, JSON.stringify(address), payment_method, payment_status])

    const orderResult = db.exec(`SELECT last_insert_rowid() as id`)
    const orderId = orderResult[0].values[0][0]

    for (const item of cartItems) {
      db.run(`
        INSERT INTO order_items (order_id, product_id, weight, quantity, price)
        VALUES (?, ?, ?, ?, ?)
      `, [orderId, item.product_id, item.weight, item.quantity, item.price])

      db.run(`UPDATE products SET stock = stock - ? WHERE id = ?`, [item.quantity, item.product_id])
    }

    db.run(`DELETE FROM cart WHERE user_id = ?`, [userId])
    saveDB()

    res.status(201).json({ message: 'Order created successfully', orderId })
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
}

export const getOrders = (req, res) => {
  try {
    const db = getDB()
    const userId = req.user.id

    const result = db.exec(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `, [userId])

    if (result.length === 0) {
      return res.json([])
    }

    const orders = result[0].values.map(row => ({
      id: row[0],
      user_id: row[1],
      status: row[2],
      total: row[3],
      address: row[4] ? JSON.parse(row[4]) : {},
      payment_method: row[5],
      payment_status: row[6],
      created_at: row[7]
    }))

    for (const order of orders) {
      const itemsResult = db.exec(`
        SELECT oi.*, p.name, p.images
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id])

      if (itemsResult.length > 0) {
        order.items = itemsResult[0].values.map(item => ({
          id: item[0],
          order_id: item[1],
          product_id: item[2],
          hamper_id: item[3],
          quantity: item[4],
          price: item[5],
          name: item[6],
          images: item[7] ? JSON.parse(item[7]) : []
        }))
      } else {
        order.items = []
      }
    }

    res.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Failed to get orders' })
  }
}

export const getOrderById = (req, res) => {
  try {
    const db = getDB()
    const userId = req.user.id

    const result = db.exec(`SELECT * FROM orders WHERE id = ? AND user_id = ?`, [req.params.id, userId])

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = {
      id: result[0].values[0][0],
      user_id: result[0].values[0][1],
      status: result[0].values[0][2],
      total: result[0].values[0][3],
      address: result[0].values[0][4] ? JSON.parse(result[0].values[0][4]) : {},
      payment_method: result[0].values[0][5],
      payment_status: result[0].values[0][6],
      created_at: result[0].values[0][7]
    }

    const itemsResult = db.exec(`
      SELECT oi.*, p.name, p.images
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [order.id])

    if (itemsResult.length > 0) {
      order.items = itemsResult[0].values.map(item => ({
        id: item[0],
        order_id: item[1],
        product_id: item[2],
        hamper_id: item[3],
        quantity: item[4],
        price: item[5],
        name: item[6],
        images: item[7] ? JSON.parse(item[7]) : []
      }))
    }

    res.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ error: 'Failed to get order' })
  }
}

export const getAllOrders = (req, res) => {
  try {
    const db = getDB()
    const result = db.exec(`SELECT * FROM orders ORDER BY created_at DESC`)

    if (result.length === 0) {
      return res.json([])
    }

    const orders = result[0].values.map(row => ({
      id: row[0],
      user_id: row[1],
      status: row[2],
      total: row[3],
      address: row[4] ? JSON.parse(row[4]) : {},
      payment_method: row[5],
      payment_status: row[6],
      created_at: row[7]
    }))

    for (const order of orders) {
      const userResult = db.exec(`SELECT name, email, phone FROM users WHERE id = ?`, [order.user_id])
      if (userResult.length > 0 && userResult[0].values.length > 0) {
        order.customer = {
          name: userResult[0].values[0][0],
          email: userResult[0].values[0][1],
          phone: userResult[0].values[0][2]
        }
      }
    }

    res.json(orders)
  } catch (error) {
    console.error('Get all orders error:', error)
    res.status(500).json({ error: 'Failed to get orders' })
  }
}

export const updateOrderStatus = (req, res) => {
  try {
    const { status } = req.body
    const db = getDB()

    db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, req.params.id])
    saveDB()
    res.json({ message: 'Order status updated' })
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ error: 'Failed to update order status' })
  }
}

export const updatePaymentStatus = (req, res) => {
  try {
    const { payment_status } = req.body
    const db = getDB()

    db.run(`UPDATE orders SET payment_status = ? WHERE id = ?`, [payment_status, req.params.id])
    saveDB()
    res.json({ message: 'Payment status updated' })
  } catch (error) {
    console.error('Update payment status error:', error)
    res.status(500).json({ error: 'Failed to update payment status' })
  }
}

export const getDashboardStats = (req, res) => {
  try {
    const db = getDB()

    const today = new Date().toISOString().split('T')[0]

    const totalOrdersResult = db.exec(`SELECT COUNT(*) FROM orders`)
    const totalOrders = totalOrdersResult[0]?.values[0]?.[0] || 0

    const pendingOrdersResult = db.exec(`SELECT COUNT(*) FROM orders WHERE status = 'confirmed'`)
    const pendingOrders = pendingOrdersResult[0]?.values[0]?.[0] || 0

    const todayOrdersResult = db.exec(`SELECT COUNT(*) FROM orders WHERE date(created_at) = ?`, [today])
    const todayOrders = todayOrdersResult[0]?.values[0]?.[0] || 0

    const totalRevenueResult = db.exec(`SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = 'paid'`)
    const totalRevenue = totalRevenueResult[0]?.values[0]?.[0] || 0

    const lowStockResult = db.exec(`SELECT COUNT(*) FROM products WHERE stock < 10`)
    const lowStock = lowStockResult[0]?.values[0]?.[0] || 0

    const recentOrdersResult = db.exec(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 5`)
    const recentOrders = recentOrdersResult.length > 0 ? recentOrdersResult[0].values.map(row => ({
      id: row[0],
      status: row[2],
      total: row[3],
      payment_status: row[6],
      created_at: row[7]
    })) : []

    res.json({
      totalOrders,
      pendingOrders,
      todayOrders,
      totalRevenue,
      lowStock,
      recentOrders
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({ error: 'Failed to get dashboard stats' })
  }
}
