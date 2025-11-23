import express from 'express';
import checkAuth from '../middleware/checkAuth.js';
import { checkRole } from '../middleware/checkRole.js';
import {
    createLeague,
    getLeaguesByUser,
    getLeagueById,
    updateLeague,
    deleteLeague,
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

export default router;