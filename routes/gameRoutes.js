import express from 'express';
import { getGamesBySeason, generateGames } from '../controllers/gameController.js';
import checkAuth from '../middleware/checkAuth.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

router.use(checkAuth);

router.get('/season/:seasonId', checkRole(['Admin', 'Coach', 'Player']), getGamesBySeason);
router.post('/generate', checkRole(['Admin']), generateGames);

export default router;
