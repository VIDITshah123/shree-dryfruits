import { Router } from 'express'
import { createQuery, getAllQueries, updateQueryStatus, deleteQuery } from '../controllers/queryController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.post('/', createQuery)
router.get('/', authenticate, requireAdmin, getAllQueries)
router.put('/:id', authenticate, requireAdmin, updateQueryStatus)
router.delete('/:id', authenticate, requireAdmin, deleteQuery)

export default router
