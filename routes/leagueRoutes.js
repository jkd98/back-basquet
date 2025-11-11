//--dep
import express from 'express';
//--midleware
import checkAuth from '../middleware/checkAuth.js';
import { checkRole } from '../middleware/checkRole.js';
//--controllers
import { createLeague, getLeaguesByUser } from '../controllers/leagueController.js';

const router = express.Router();

router.use(checkAuth);
router.route('/')
    .post(checkRole(), createLeague)
    .get(checkRole(), getLeaguesByUser);

export default router;