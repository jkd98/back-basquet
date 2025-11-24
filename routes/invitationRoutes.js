import express from 'express';
import checkAuth from '../middleware/checkAuth.js';
import { checkRole } from '../middleware/checkRole.js';
import { createInvitation, getInvitationsBySeason, validateInvitation } from '../controllers/invitationController.js';

const router = express.Router();

router.use(checkAuth);
router.route('/')
    .post(checkRole(), createInvitation);

router.post('/validate', validateInvitation);
router.get('/season/:seasonId', checkRole(), getInvitationsBySeason);


export default router;