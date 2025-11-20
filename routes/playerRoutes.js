import express from 'express';
import {
    createPlayer,
    getPlayersByTeam,
    getPlayerById,
    updatePlayer,
    deletePlayer
} from '../controllers/playerController.js';
import checkAuth from '../middleware/checkAuth.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

router.use(checkAuth);

router.post('/', checkRole(['Coach']), createPlayer);
router.get('/team/:teamId', checkRole(['Coach']), getPlayersByTeam);
router.get('/:id', checkRole(['Coach']), getPlayerById);
router.put('/:id', checkRole(['Coach']), updatePlayer);
router.delete('/:id', checkRole(['Coach']), deletePlayer);

export default router;