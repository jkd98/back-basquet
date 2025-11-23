import express from 'express';
import checkAuth from '../middleware/checkAuth.js';
import { checkRole } from '../middleware/checkRole.js';
import { createInvitation } from '../controllers/invitationController.js';

const router = express.Router();

router.use(checkAuth);
router.route('/')
    .post(checkRole(), createInvitation);


export default router;