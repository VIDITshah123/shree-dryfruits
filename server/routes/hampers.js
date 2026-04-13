import { Router } from 'express'
import { getAllHampers, getHamperById, createHamper, updateHamper, deleteHamper } from '../controllers/hamperController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', getAllHampers)
router.get('/:id', getHamperById)
router.post('/', authenticate, requireAdmin, createHamper)
router.put('/:id', authenticate, requireAdmin, updateHamper)
router.delete('/:id', authenticate, requireAdmin, deleteHamper)

export default router
