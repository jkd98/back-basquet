import express from 'express';
//--midleware
import checkAuth from '../middleware/checkAuth.js';
import { checkRole } from '../middleware/checkRole.js';
//--controllers
import { createTeam, getTeamByUser } from '../controllers/teamController.js';


const router = express.Router();
router.use(checkAuth);

router.post('/', checkRole(), createTeam);
router.get('/by-user', checkRole(), getTeamByUser);

export default router;