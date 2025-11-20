import express from 'express';
import checkAuth from '../middleware/checkAuth.js';
import { checkRole } from '../middleware/checkRole.js';
import {
    createLeague,
    getLeaguesByUser,
    getLeagueById,
    updateLeague,
    deleteLeague,
    addTeamToLeague,
    removeTeamFromLeague,
    getAvailableTeamsForLeague,
    getLeagueStats
} from '../controllers/leagueController.js';

const router = express.Router();

router.use(checkAuth);

// Rutas básicas CRUD
router.route('/')
    .post(checkRole(), createLeague)
    .get(checkRole(), getLeaguesByUser);

router.route('/:id')
    .get(checkRole(), getLeagueById)
    .put(checkRole(), updateLeague)
    .delete(checkRole(), deleteLeague);

// Rutas para gestión de equipos en la liga
router.route('/:id/teams')
    .post(checkRole(), addTeamToLeague)
    .delete(checkRole(), removeTeamFromLeague);

router.get('/:id/teams/available', checkRole(), getAvailableTeamsForLeague);

// Ruta para estadísticas
router.get('/:id/stats', checkRole(), getLeagueStats);

export default router;