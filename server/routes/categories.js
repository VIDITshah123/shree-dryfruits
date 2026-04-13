import { Router } from 'express'
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', getAllCategories)
router.get('/:id', getCategoryById)
router.post('/', authenticate, requireAdmin, createCategory)
router.put('/:id', authenticate, requireAdmin, updateCategory)
router.delete('/:id', authenticate, requireAdmin, deleteCategory)

export default router
