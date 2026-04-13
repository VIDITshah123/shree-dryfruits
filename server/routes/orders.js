import { Router } from 'express'
import { createOrder, getOrders, getOrderById, getAllOrders, updateOrderStatus, updatePaymentStatus, getDashboardStats } from '../controllers/orderController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.post('/', authenticate, createOrder)
router.get('/', authenticate, getOrders)
router.get('/all', authenticate, requireAdmin, getAllOrders)
router.get('/stats', authenticate, requireAdmin, getDashboardStats)
router.get('/:id', authenticate, getOrderById)
router.put('/:id/status', authenticate, requireAdmin, updateOrderStatus)
router.put('/:id/payment', authenticate, requireAdmin, updatePaymentStatus)

export default router
