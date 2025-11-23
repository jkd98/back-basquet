import bcrypt from "bcrypt";

import { emailRegistro, emailCodigoVerificacion, emailOlvidePass } from "../helpers/email.js"
import { generateSixDigitToken } from "../helpers/genSixDigitToken.js";
import { generarJWT } from '../helpers/generarJWT.js'

import User from "../models/User.js";
import { ServerResponse } from "../models/ServerResponse.js";
import Token, { tokenTypes } from "../models/Token.js";
import { crearLog, obtenerIP } from "../helpers/crearLog.js";
import { NivelesLog } from "../helpers/crearLog.js";

// Función para registrar un nuevo usuario
export const registerUser = async (req, res) => {
    let userResponse = new ServerResponse();

    try {
        const { fullname, email, pass } = req.body;
        console.log(req.body);
        // Verificar si el email ya está registrado
        const existeUsuario = await User.findOne({ email });

        if (existeUsuario) {
            userResponse.status = 'error';
            userResponse.msg = 'El email ya está registrado';
            return res.status(400).json(userResponse);
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(pass, salt);
        console.log(pass)

        const isFirstUSer = await User.countDocuments({});
        //Generar usuario
        const nwUser = new User({
            fullname,
            email,
            pass: hashedPassword,
            role: isFirstUSer === 0 ? '4DMlN' : 'Coach'
        });

        console.log("Preregistro:\n", nwUser);

        // Generar token
        const token = await generateToken(nwUser);

        //Guardar usuario
        await nwUser.save()

        console.log(token);
        //TODO: Habilitar emails
        //emailRegistro({ email, name, token: token.code });

        userResponse.status = 'success';
        userResponse.msg = 'Registro completado, confirma tu cuenta para activarla';
        return res.status(201).json(userResponse);

    } catch (error) {
        console.log(error);
        userResponse.status = 'error';
        userResponse.msg = 'Error al registrar el usuario';
        return res.status(500).json(userResponse);
    }
};

export const confirmAccount = async (req, res) => {

    let confirmResponse = new ServerResponse();
    const { code } = req.body;
    try {
        // new Date() => hora en UTC igual que en mongo 
        const isValidToken = await Token.findOne({
            code,
            expiresAt: { $gte: new Date() },
            typeCode: tokenTypes.ACCOUNT_CONFIRMATION
        });
        if (!isValidToken) {
            confirmResponse.status = 'error';
            confirmResponse.msg = 'El código no es válido o ya expiró';
            return res.status(404).json(confirmResponse);
        }


        const userExists = await User.findById(isValidToken.userId);

        if (userExists.emailConfirm) {
            confirmResponse.status = 'error';
            confirmResponse.msg = 'La cuenta ya ha sido confirmada';
            return res.status(401).json(confirmResponse);
        }

        userExists.emailConfirm = true;

        await Promise.allSettled([userExists.save(), isValidToken.deleteOne()]);

        confirmResponse.status = 'success';
        confirmResponse.msg = 'Cuenta confirmada, ya puedes iniciar sesión';
        confirmResponse.data = null;
        return res.status(201).json(confirmResponse);

    } catch (error) {
        console.log(error);
        confirmResponse.status = 'error';
        confirmResponse.msg = 'Error al confirmar la cuenta';
        return res.status(500).json(confirmResponse);
    }
}

export const requestConfirmationCode = async (req, res) => {
    let respuesta = new ServerResponse();

    try {
        const { email } = req.body;

        // Verificar si el email ya está registrado
        const existeUsuario = await User.findOne({ email });
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
        const token = await generateToken(existeUsuario);


        //emailRegistro({ email, name: existeUsuario.name, token: token.code });

        respuesta.status = 'success';
        respuesta.msg = 'Nuevo token enviado al email';
        return res.status(201).json(respuesta);

    } catch (error) {
        console.log(error);
        respuesta.status = 'error';
        respuesta.msg = 'Error al generar el token';
        return res.status(500).json(respuesta);
    }
}

export const login = async (req, res) => {
    let loginResponse = new ServerResponse();

    try {
        const { email, pass } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            loginResponse.status = 'error';
            loginResponse.msg = 'El usuario no existe';
            return res.status(404).json(loginResponse);
        }

        const passCorrect = await bcrypt.compare(pass, user.pass);
        if (!passCorrect) {
            loginResponse.status = 'error';
            loginResponse.msg = 'Contraseña incorrecta';
            await crearLog({
                nivel: NivelesLog.ERROR,
                mensaje: `El codigo ingresado no es válido`,
                ruta: req.originalUrl,
                ip: obtenerIP(req)
            })
            return res.status(401).json(loginResponse);
        }

        if (!user.emailConfirm) {
            // Generar token
            const token = await generateToken(user);

            //emailRegistro({ email, name: user.name, token: token.code });
            loginResponse.status = 'error';
            loginResponse.msg = 'La cuenta no ha sido confirmada. Se ha enviado un codigo de confirmación a tu email';
            return res.status(401).json(loginResponse);
        }

        if (user.isLogged) {
            loginResponse.status = 'error';
            loginResponse.msg = 'Ya hay una sesión iniciada';
            return res.status(401).json(loginResponse);
        }

        user.isLogged = true;

        await user.save();
        const tkn = generarJWT({ userId: user._id });

        loginResponse.status = 'success';
        loginResponse.msg = 'Inicio se sesión exitoso';
        loginResponse.data = {
            user: {
                fullname: user.fullname,
                email: user.email,
                role: user.role
            },
            tkn
        };
        return res.status(200).json(loginResponse);

    } catch (error) {
        console.log(error)
        loginResponse.status = 'error';
        loginResponse.msg = 'Error al iniciar sesión';
        return res.status(500).json(loginResponse);
    }
}

export const logOut = async (req, res) => {
    let respuesta = new ServerResponse();
    const { email } = req.body;
    try {
        const existsUser = await User.findOne({ email });
        console.log(existsUser)

        if (!existsUser) {
            respuesta.status = 'error';
            respuesta.msg = 'El usuario no existe';
            return res.status(404).json(respuesta);
        }

        existsUser.isLogged = false;

        await existsUser.save()
        respuesta.status = 'success';
        respuesta.msg = 'Se ha cerrado la sesión';
        return res.status(200).json(respuesta);


    } catch (error) {
        console.log(error);

        respuesta.status = 'error';
        respuesta.msg = 'Error al cerrar sesión';
        return res.status(500).json(respuesta);
    }
}

export const requestNewPassword = async (req, res) => {

    let respuesta = new ServerResponse();
    try {
        const { email } = req.body;
        const existsUser = await User.findOne({ email });

        if (!existsUser) {
            respuesta.status = 'error';
            respuesta.msg = 'El usuario no existe';
            return res.status(404).json(respuesta);
        }

        //  Generar token
        const nwToken = await generateToken(existsUser, tokenTypes.PASSWORD_RESET);

        //  TODO: Enviar email con token
        //emailOlvidePass({ email, name: existsUser.name, token: nwToken.code });

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

export const verifyTokenAtNewPass = async (req, res) => {

    let respuesta = new ServerResponse();
    try {
        const { code } = req.body;
        const isValidToken = await Token.findOne({ code, typeCode: tokenTypes.PASSWORD_RESET });
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

export const resetPassword = async (req, res) => {

    let respuesta = new ServerResponse();
    try {
        const { pass, code } = req.body;

        const isValidToken = await Token.findOne({ code, typeCode: tokenTypes.PASSWORD_RESET });

        if (!isValidToken) {
            respuesta.status = 'error';
            respuesta.msg = 'El token no es válido o ya fue utilizado';
            return res.status(400).json(respuesta);
        }

        const isValidUser = await User.findById(isValidToken.userId);


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

export const requestNewPassCode = async (req, res) => {
    let respuesta = new ServerResponse();

    try {
        const { email } = req.body;

        // Verificar si el email ya está registrado
        const existsUser = await User.findOne({ email });
        if (!existsUser) {
            respuesta.status = 'error';
            respuesta.msg = 'El usuario no esta registrado';
            return res.status(404).json(respuesta);
        }

        //Verificar si no ha confirmado la cuenta
        if (!existsUser.emailConfirm) {
            respuesta.status = 'error';
            respuesta.msg = 'Esta cuenta no ha sido confirmada';
            return res.status(401).json(respuesta);
        }

        // Generar token
        const token = await generateToken(existsUser, tokenTypes.PASSWORD_RESET);

        //emailOlvidePass({ email, name: existsUser.name, token: token.code });

        respuesta.status = 'success';
        respuesta.msg = 'Nuevo token enviado al email';
        return res.status(201).json(respuesta);

    } catch (error) {
        console.log(error);
        respuesta.status = 'error';
        respuesta.msg = 'Error al generar el token';
        return res.status(500).json(respuesta);
    }
}

export const listAllUsers = async (req, res) => {
    let respuesta = new ServerResponse();
    try {
        const users = await User.find();
        respuesta.status = 'success';
        respuesta.msg = 'Listado de usuarios';
        respuesta.data = users;
        return res.status(200).json(respuesta);
    } catch (error) {
        console.log(error);
        respuesta.status = 'error';
        respuesta.msg = 'Error del servidor';
        return res.status(500).json(respuesta);
    }
}

async function generateToken(user, typeCode) {
    const nwToken = await Token.create({
        userId: user._id,
        code: generateSixDigitToken(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),  // -> 300,000 milisegundos (5 minutos)
        used: false,
        typeCode: typeCode || tokenTypes.ACCOUNT_CONFIRMATION
    })
    return nwToken
}

