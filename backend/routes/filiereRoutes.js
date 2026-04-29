import express from 'express';
import {
  createFiliereHandler,
  deleteFiliereHandler,
  getFiliere,
  getFilieres,
  updateFiliereHandler
} from '../controllers/filiereController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getFilieres);
router.get('/:id', getFiliere);
router.post('/', protect, authorize('admin'), createFiliereHandler);
router.put('/:id', protect, authorize('admin'), updateFiliereHandler);
router.delete('/:id', protect, authorize('admin'), deleteFiliereHandler);

export default router;
