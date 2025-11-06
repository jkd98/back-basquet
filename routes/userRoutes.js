import express from "express";

import {
    confirmAccount,
    listAllUsers,
    login,
    logOut,
    registerUser,
    requestConfirmationCode,
    requestNewPassCode,
    requestNewPassword,
    resetPassword,
    verifyTokenAtNewPass
} from '../controllers/userController.js'

import {
    validateUserRegistration,
    validateRequestConfirmationCode,
    validateLogin,
    validateEmail,
    validateCode,
    validateNewPass,

} from "../validators/userValidators.js";

import { handlingErrors } from "../middleware/handlingErrors.js";
import { checkBloquedIP } from "../middleware/checkBlockIp.js";
import checkAuth from "../middleware/checkAuth.js";
import { checkRole } from "../middleware/checkRole.js";

// con esto puedo usar los metodos http
const router = express.Router();


router.post('/regist', validateUserRegistration, handlingErrors, registerUser);
router.post('/confirm-account', validateCode, handlingErrors, confirmAccount);
router.post('/request-code', validateRequestConfirmationCode, handlingErrors, requestConfirmationCode);
router.post('/login', validateLogin, handlingErrors, checkBloquedIP, login);
router.post('/logout', validateEmail, handlingErrors, logOut);
router.post('/request-pass', validateEmail, handlingErrors, requestNewPassword);
router.post('/verify-passcode', validateCode, handlingErrors, verifyTokenAtNewPass);
router.post('/reset-pass', validateNewPass, handlingErrors, resetPassword);
router.post('/request-code-pass',validateEmail,handlingErrors,requestNewPassCode);
router.get('/users', checkAuth, checkRole ,listAllUsers)

export default router;

//Para este viernes 1 nivel