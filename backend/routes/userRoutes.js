import express from 'express';
import { getUsers, getUser, suspendAccount, blockAccount, unblockAccount, removeAccount } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/public/:id', getUser);
router.use(protect);
router.use(authorize('admin'));
router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/:id/suspend', suspendAccount);
router.post('/:id/block', blockAccount);
router.post('/:id/unblock', unblockAccount);
router.delete('/:id', removeAccount);

export default router;
