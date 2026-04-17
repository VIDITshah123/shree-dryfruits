import { Router } from 'express'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, getCart)
router.post('/', authenticate, addToCart)
router.put('/:cartId', authenticate, updateCartItem)
router.delete('/:cartId', authenticate, removeFromCart)
router.delete('/', authenticate, clearCart)

export default router
