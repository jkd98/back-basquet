import express from "express";

import {
    registrarUsuario,
    confirmarCuenta,
    login,
    verify2FA,
    tokenResetPassword,
    confirmarTokenReset,
    resetPassword,
    generarTokenConfirm
} from "../controllers/usuarioController.js";

import {
    validarRegistro,
    validConfirmAccount,
    validarNuevoTknConfirm,
    validarLogin,
    validarNwPass
} from "../validators/usuarioValidator.js";

import { manejarErrores } from "../middleware/manejadorErrores.js";
import { checkBloquedIP } from "../middleware/checkBlockIp.js";

// con esto puedo usar los metodos http
const router = express.Router();


router.post('/registro', validarRegistro, manejarErrores, registrarUsuario);
router.post('/confirmar-cuenta', validConfirmAccount, manejarErrores, confirmarCuenta);
router.post('/new-code-confirm', validarNuevoTknConfirm, manejarErrores, generarTokenConfirm);
router.post('/login', validarLogin, manejarErrores, checkBloquedIP, login);
router.post('/verify-2fa', checkBloquedIP ,verify2FA);


router.post('/tkn-reset', tokenResetPassword);
router.post('/new-pass-tkn', confirmarTokenReset);
router.post('/new-pass', validarNwPass, manejarErrores, resetPassword);


export default router;