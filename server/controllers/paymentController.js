import { getDB, saveDB } from '../database/init.js'

export const initiateRazorpayPayment = async (req, res) => {
  try {
    const { orderId } = req.body
    const Razorpay = (await import('razorpay')).default

    const db = getDB()
    const orderResult = db.exec(`SELECT * FROM orders WHERE id = ?`, [orderId])

    if (orderResult.length === 0 || orderResult[0].values.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = {
      id: orderResult[0].values[0][0],
      total: orderResult[0].values[0][3]
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })

    const options = {
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: `order_${order.id}`,
      notes: { orderId: order.id }
    }

    const razorpayOrder = await razorpay.orders.create(options)

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: order.total,
      currency: 'INR'
    })
  } catch (error) {
    console.error('Razorpay payment error:', error)
    res.status(500).json({ error: 'Failed to initiate payment' })
  }
}

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body

    const crypto = await import('crypto')
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature === razorpay_signature) {
      const db = getDB()
      db.run(`UPDATE orders SET payment_status = 'paid' WHERE id = ?`, [orderId])
      saveDB()
      res.json({ success: true, message: 'Payment verified' })
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' })
    }
  } catch (error) {
    console.error('Verify payment error:', error)
    res.status(500).json({ error: 'Failed to verify payment' })
  }
}

export const initiateStripePayment = async (req, res) => {
  try {
    const { orderId } = req.body
    const stripe = (await import('stripe')).default

    const db = getDB()
    const orderResult = db.exec(`SELECT * FROM orders WHERE id = ?`, [orderId])

    if (orderResult.length === 0 || orderResult[0].values.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = {
      id: orderResult[0].values[0][0],
      total: orderResult[0].values[0][3]
    }

    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY)

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: 'inr',
      metadata: { orderId: order.id }
    })

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: order.total
    })
  } catch (error) {
    console.error('Stripe payment error:', error)
    res.status(500).json({ error: 'Failed to initiate payment' })
  }
}

export const verifyStripePayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body
    const stripe = (await import('stripe')).default

    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY)
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      const db = getDB()
      db.run(`UPDATE orders SET payment_status = 'paid' WHERE id = ?`, [orderId])
      saveDB()
      res.json({ success: true, message: 'Payment verified' })
    } else {
      res.status(400).json({ success: false, message: 'Payment not completed' })
    }
  } catch (error) {
    console.error('Verify Stripe payment error:', error)
    res.status(500).json({ error: 'Failed to verify payment' })
  }
}

export const codConfirmation = (req, res) => {
  try {
    const { orderId } = req.body
    const db = getDB()

    db.run(`UPDATE orders SET payment_status = 'pending', status = 'confirmed' WHERE id = ?`, [orderId])
    saveDB()
    res.json({ success: true, message: 'Cash on Delivery order confirmed' })
  } catch (error) {
    console.error('COD confirmation error:', error)
    res.status(500).json({ error: 'Failed to confirm order' })
  }
}
