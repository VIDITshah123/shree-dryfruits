import { Router } from 'express'
import { getAllUsers, getUserById, toggleUserStatus } from '../controllers/userController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, requireAdmin, getAllUsers)
router.get('/:id', authenticate, requireAdmin, getUserById)
router.put('/:id/toggle', authenticate, requireAdmin, toggleUserStatus)

export default router
