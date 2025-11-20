import express from 'express';
import {
    createSeason,
    getSeasons,
    getSeasonById,
    updateSeason,
    deleteSeason,
    updateStandings,
    getSeasonsByLeague,
    updateSeasonStatus
} from '../controllers/seasonController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.use(checkAuth)

router.post('/seasons', createSeason);
router.get('/seasons', getSeasons);
router.get('/seasons/league/:leagueId', getSeasonsByLeague);
router.get('/seasons/:id', getSeasonById);
router.put('/seasons/:id', updateSeason);
router.patch('/seasons/:id/status', updateSeasonStatus);
router.patch('/seasons/:id/standings', updateStandings);
router.delete('/seasons/:id', deleteSeason);

export default router;