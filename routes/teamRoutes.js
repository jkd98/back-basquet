import express from 'express';
//--midleware
import checkAuth from '../middleware/checkAuth.js';
import { checkRole } from '../middleware/checkRole.js';
//--controllers
import { createTeam, getTeamById, getTeamsByUser } from '../controllers/teamController.js';


const router = express.Router();
router.use(checkAuth);

router.post('/', checkRole(), createTeam);
router.get('/by-user', checkRole(), getTeamsByUser);
router.get('/:id', checkRole(), getTeamById);

export default router;