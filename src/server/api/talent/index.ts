import express from 'express';
import { updateTrustScore, getTrustScore, recalculateAllTrustScores } from './trust';
import { authMiddleware } from '../../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Trust score routes
router.get('/trust/:talentId', getTrustScore);
router.post('/trust/:talentId/update', updateTrustScore);
router.post('/trust/recalculate-all', recalculateAllTrustScores);

export default router;