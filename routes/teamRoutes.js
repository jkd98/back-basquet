import express from 'express';
//--midleware
import checkAuth from '../middleware/checkAuth.js';
import { checkRole } from '../middleware/checkRole.js';
//--controllers
import { addTeamToSeason, createTeam, getTeamById, getTeamsByUser } from '../controllers/teamController.js';


const router = express.Router();
router.use(checkAuth);

router.post('/', checkRole(['Coach']), createTeam);
router.post('/season',checkRole(['Coach']), addTeamToSeason);
router.get('/by-user', checkRole(['Coach']), getTeamsByUser);
router.get('/:id', checkRole(['Coach']), getTeamById);


export default router;