import bcrypt from "bcrypt";

import { emailRegistro, emailCodigoVerificacion, emailOlvidePass } from "../helpers/email.js"
import { generateSixDigitToken } from "../helpers/genSixDigitToken.js";
import { generarJWT } from '../helpers/generarJWT.js'

import Usuario from "../models/Usuario.js";
import { Respuesta } from "../models/Respuesta.js";
import Token, { tokenTypes } from "../models/Token.js";
import { crearLog, obtenerIP } from "../helpers/crearLog.js";
import { NivelesLog } from "../helpers/crearLog.js";

// Función para registrar un nuevo usuario
const registrarUsuario = async (req, res) => {
    let respuesta = new Respuesta();

    try {
        const { name, lastN, email, pass } = req.body;
        console.log(req.body);
        // Verificar si el email ya está registrado
        const existeUsuario = await Usuario.findOne({ email });
        if (existeUsuario) {
            respuesta.status = 'error';
            respuesta.msg = 'El email ya está registrado';
            return res.status(400).json(respuesta);
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(pass, salt);
        console.log(pass)

        const isFirstUSer = await Usuario.countDocuments({});
        //Generar usuario
        const nwUser = new Usuario({
            name,
            lastN,
            email,
            pass: hashedPassword,
            role: isFirstUSer === 0 ? '4DMlN' : 'Coach'
        });

        console.log("Preregistro:\n", nwUser);

        // Generar token
        const nwToken = new Token({
            userId: nwUser._id,
            code: generateSixDigitToken(),
            expiresAt: Date.now() + 5 * 60 * 1000,  // -> 300,000 milisegundos (5 minutos)
            used: false,
            typeCode: tokenTypes.ACCOUNT_CONFIRMATION
        })

        //Guardar token y usuario
        await Promise.allSettled([nwToken.save(), nwUser.save()])

        //TODO: Habilitar emails
        //emailRegistro({ email, name, token: nwToken.code });

        respuesta.status = 'success';
        respuesta.msg = 'Registro completado, confirma tu cuenta para activarla';
        respuesta.data = null;
        return res.status(201).json(respuesta);

    } catch (error) {
        console.log(error);
        respuesta.status = 'error';
        respuesta.msg = 'Error al registrar el usuario';
        respuesta.data = error.message;
        return res.status(500).json(respuesta);
    }
};

const confirmarCuenta = async (req, res) => {

    let respuesta = new Respuesta();
    const { token } = req.body;
    try {
        // new Date() => hora en UTC igual que en mongo 
        const isValidToken = await Token.findOne({ code: token, expiresAt: { $gt: new Date() }, typeCode: tokenTypes.ACCOUNT_CONFIRMATION });
        if (!isValidToken) {
            respuesta.status = 'error';
            respuesta.msg = 'El token no es válido o ya expiró';
            return res.status(404).json(respuesta);
        }

        const userExists = await Usuario.findById(isValidToken.userId);
        userExists.emailConfirm = true;

        await Promise.allSettled([userExists.save(), isValidToken.deleteOne()]);

        respuesta.status = 'success';
        respuesta.msg = 'Cuenta confirmada, ya puedes iniciar sesión';
        respuesta.data = null;
        return res.status(201).json(respuesta);

    } catch (error) {
        console.log(error);
        respuesta.status = 'error';
        respuesta.msg = 'Error al confirmar la cuenta';
        respuesta.data = error.message;
        return res.status(500).json(respuesta);
    }
}


const generarTokenConfirm = async (req, res) => {
    let respuesta = new Respuesta();

    try {
        const { email } = req.body;
        // Verificar si el email ya está registrado
        const existeUsuario = await Usuario.findOne({ email });
        if (!existeUsuario) {
            respuesta.status = 'error';
            respuesta.msg = 'El usuario no esta registrado';
            return res.status(400).json(respuesta);
        }

        //Verificar si no ha confirmado la cuenta
        if (existeUsuario.emailConfirm) {
            respuesta.status = 'error';
            respuesta.msg = 'Esta cuenta ya ha sido confirmada';
            return res.status(400).json(respuesta);
        }


        // Generar token
        const nwToken = new Token({
            userId: existeUsuario._id,
            code: generateSixDigitToken(),
            expiresAt: Date.now() + 5 * 60 * 1000,  // -> 300,000 milisegundos (5 minutos)
            used: false,
            typeCode: tokenTypes.ACCOUNT_CONFIRMATION

        })

        //Guardar token y usuario
        await Promise.allSettled([nwToken.save()])


        emailRegistro({ email, name: existeUsuario.name, token: nwToken.code });

        respuesta.status = 'success';
        respuesta.msg = 'Nuevo token enviado al email';
        respuesta.data = null;
        return res.status(201).json(respuesta);

    } catch (error) {
        console.log(error);
        respuesta.status = 'error';
        respuesta.msg = 'Error al generar el token';
        respuesta.data = error.message;
        return res.status(500).json(respuesta);
    }
}

const login = async (req, res) => {
    let respuesta = new Respuesta();

    try {
        const { email, pass } = req.body;
        const user = await Usuario.findOne({ email });
        if (!user) {
            respuesta.status = 'error';
            respuesta.msg = 'El usuario no existe';
            return res.status(404).json(respuesta);
        }

        const passCorrecto = await bcrypt.compare(pass, user.pass);
        if (!passCorrecto) {
            respuesta.status = 'error';
            respuesta.msg = 'Password incorrecto';
            return res.status(404).json(respuesta);
        }

        if (!user.emailConfirm) {
            // Generar token
            const nwToken = new Token({
                userId: user._id,
                code: generateSixDigitToken(),
                expiresAt: Date.now() + 5 * 60 * 1000,  // -> 300,000 milisegundos (5 minutos)
                used: false,
                typeCode: tokenTypes.ACCOUNT_CONFIRMATION

            })

            //Guardar token y usuario
            await Promise.allSettled([nwToken.save()])

            emailRegistro({ email, name: user.name, token: nwToken.code });
            respuesta.status = 'error';
            respuesta.msg = 'La cuenta no ha sido confirmada. Se ha enviado un codigo de confirmación a tu email';
            return res.status(404).json(respuesta);
        }

        // Generar código 2FA
        const twoFactorCode = new Token({
            userId: user._id,
            code: generateSixDigitToken(),
            expiresAt: Date.now() + 5 * 60 * 1000,  // -> 300,000 milisegundos (5 minutos)
            used: false,
            typeCode:tokenTypes.TWO_FACTOR
        })

        //TODO: Activar el envio de emails
        //emailCodigoVerificacion({ name: user.name, email: user.email, code: twoFactorCode.code })

        await twoFactorCode.save();

        respuesta.status = 'success';
        respuesta.msg = 'Token 2FA enviado a correo';
        respuesta.data = user._id;
        return res.status(200).json(respuesta);

    } catch (error) {
        console.log(error);
        if (error.code = 'EDNS') {
            console.log("No hay conexion ")
        }

        respuesta.status = 'error';
        respuesta.msg = 'Error al iniciar sesión';
        respuesta.data = error.message;
        return res.status(500).json(respuesta);
    }
}

const verify2FA = async (req, res) => {

    let respuesta = new Respuesta()
    try {
        const { code, userId } = req.body;


        const validCode = await Token.findOne({
            userId,
            code,
            expiresAt: { $gt: new Date() },
            used: false,
            typeCode: tokenTypes.TWO_FACTOR
        })

        console.log(validCode)
        if (!validCode) {
            //TODO:Crear Log
            await crearLog({
                nivel: NivelesLog.ERROR,
                mensaje: `El codigo ingresado no es válido`,
                ruta: req.originalUrl,
                ip: obtenerIP(req)
            })
            respuesta.status = 'error';
            respuesta.msg = 'El codigo no es correcto o ya expiró';
            return res.status(404).json(respuesta);
        }
        //
        await validCode.deleteOne()
        //  generar JWT
        const tkn = generarJWT({ userId });
        respuesta.status = 'success';
        respuesta.msg = 'Autenticación exitosa';
        respuesta.data = tkn;
        return res.status(200).json(respuesta);


    } catch (error) {
        respuesta.status = 'error';
        respuesta.msg = 'Error al iniciar sesión';
        respuesta.data = error.message;
        return res.status(500).json(respuesta);
    }

}

const tokenResetPassword = async (req, res) => {

    let respuesta = new Respuesta();
    try {
        const { email } = req.body;
        const existsUser = await Usuario.findOne({ email });

        if (!existsUser) {
            respuesta.status = 'error';
            respuesta.msg = 'El usuario no existe';
            return res.status(404).json(respuesta);
        }

        //  Generar token
        const nwToken = new Token({
            userId: existsUser._id,
            code: generateSixDigitToken(),
            expiresAt: Date.now() + 5 * 60 * 1000,  // -> 300,000 milisegundos (5 minutos)
            used: false,
            typeCode: tokenTypes.PASSWORD_RESET

        })

        //  TODO: Enviar email con token
        //emailOlvidePass({ email, name: existsUser.name, token: nwToken.code });

        await nwToken.save()
        respuesta.status = 'success';
        respuesta.msg = 'Se ha enviado un email con las instrucciones';
        return res.status(200).json(respuesta);


    } catch (error) {
        console.log(error);

        respuesta.status = 'error';
        respuesta.msg = 'Error al generar el token';
        respuesta.data = error.message;
        return res.status(500).json(respuesta);
    }
}

const confirmarTokenReset = async (req, res) => {

    let respuesta = new Respuesta();
    try {
        const { token } = req.body;
        const isValidToken = await Token.findOne({ code: token, typeCode: tokenTypes.PASSWORD_RESET });
        if (!isValidToken) {
            respuesta.status = 'error';
            respuesta.msg = 'El token no es válido o ya fue utilizado';
            return res.status(400).json(respuesta);
        }

        respuesta.status = 'success';
        respuesta.msg = 'Token válido';
        return res.status(200).json(respuesta);

    } catch (error) {
        console.log(error);

        respuesta.status = 'error';
        respuesta.msg = 'Error al verficar el token';
        respuesta.data = error.message;
        return res.status(500).json(respuesta);
    }
}

const resetPassword = async (req, res) => {

    let respuesta = new Respuesta();
    try {
        const { pass, token } = req.body;

        const isValidToken = await Token.findOne({ code: token, typeCode: tokenTypes.PASSWORD_RESET });

        if (!isValidToken) {
            respuesta.status = 'error';
            respuesta.msg = 'El token no es válido o ya fue utilizado';
            return res.status(400).json(respuesta);
        }

        const isValidUser = await Usuario.findById(isValidToken.userId);


        //  Nueva password
        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(pass, salt);

        isValidUser.pass = hashedPassword;

        await Promise.allSettled([isValidUser.save(), isValidToken.deleteOne()]);


        respuesta.status = 'success';
        respuesta.msg = 'Nuevo password guardado correctamente';
        return res.status(200).json(respuesta);

    } catch (error) {
        console.log(error);

        respuesta.status = 'error';
        respuesta.msg = 'Error al cambiar el password';
        respuesta.data = error.message;
        return res.status(500).json(respuesta);
    }
}

export {
    registrarUsuario,
    confirmarCuenta,
    login,
    verify2FA,
    tokenResetPassword,
    confirmarTokenReset,
    resetPassword,
    generarTokenConfirm
}