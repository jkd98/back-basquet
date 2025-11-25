import express from 'express';
import {
    getRoleplays,
    getRoleplayById,
    updateRoleplay,
    deleteRoleplay,
    updatePlayerPoints,
    updateTeamScore,
    updateRoleplayStatus,
    getRoleplaysByLeague,
    getRoleplaysByTeam,
    generateLeagueRoleplays,
    generateCustomRoleplays,
    getLeagueSchedule,
    deleteLeagueRoleplays
} from '../controllers/roleplayController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router.use(checkAuth);
router.get('/roleplays', getRoleplays);
router.get('/roleplays/league/:leagueId', getRoleplaysByLeague);
router.get('/roleplays/team/:teamId', getRoleplaysByTeam);
router.get('/roleplays/:id', getRoleplayById);
router.put('/roleplays/:id', updateRoleplay);
router.patch('/roleplays/:id/player-points', updatePlayerPoints);
router.patch('/roleplays/:id/team-score', updateTeamScore);
router.patch('/roleplays/:id/status', updateRoleplayStatus);
router.delete('/roleplays/:id', deleteRoleplay);


// Generar partidos automáticamente
router.post('/roleplays/generate', generateLeagueRoleplays);
router.post('/roleplays/generate-custom', generateCustomRoleplays);

// Gestión del calendario
router.get('/roleplays/league/:leagueId/schedule', getLeagueSchedule);
router.delete('/roleplays/league/:leagueId', deleteLeagueRoleplays);

export default router;