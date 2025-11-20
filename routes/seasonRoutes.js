import express from 'express';
import {
    createSeason,
    getSeasons,
    getSeasonById,
    updateSeason,
    deleteSeason,
    getSeasonsByLeague,
    updateSeasonStatus
} from '../controllers/seasonController.js';
import checkAuth from '../middleware/checkAuth.js';
import { checkRole } from '../middleware/checkRole.js';
const router = express.Router();

router.use(checkAuth)

router.post('/', checkRole(), createSeason);
router.get('/', getSeasons);
router.get('/league/:leagueId', getSeasonsByLeague);
router.get('/:id', getSeasonById);
router.put('/:id', checkRole(), updateSeason);
router.patch('/:id/status', checkRole(), updateSeasonStatus);

router.delete('/:id', checkRole(),deleteSeason);

export default router;