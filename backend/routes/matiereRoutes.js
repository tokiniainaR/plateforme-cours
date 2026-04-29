import express from 'express';
import { getMatieres, getMatiere, createMatiereHandler, updateMatiereHandler, deleteMatiereHandler } from '../controllers/matiereController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getMatieres);
router.get('/:id', getMatiere);
router.post('/', protect, authorize('admin'), createMatiereHandler);
router.put('/:id', protect, authorize('admin'), updateMatiereHandler);
router.delete('/:id', protect, authorize('admin'), deleteMatiereHandler);

export default router;
