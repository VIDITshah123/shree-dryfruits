import { Router } from 'express'
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getFeaturedProducts } from '../controllers/productController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', getAllProducts)
router.get('/featured', getFeaturedProducts)
router.get('/:id', getProductById)
router.post('/', authenticate, requireAdmin, createProduct)
router.put('/:id', authenticate, requireAdmin, updateProduct)
router.delete('/:id', authenticate, requireAdmin, deleteProduct)

export default router
