/**
 * ===============================================================
 * Gemini Neural Swarm UI - API Router
 * ===============================================================
 *
 * This file defines the Express router and maps API endpoints to their
 * corresponding handler functions.
 */
import { Router } from 'express';
import { handleMessage, handleAction } from './handlers';

const router = Router();

router.post('/message', handleMessage);
router.post('/action', handleAction);

export default router;
