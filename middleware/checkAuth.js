import jwt from "jsonwebtoken"
import User from "../models/User.js";
import { ServerResponse } from "../models/ServerResponse.js";

const checkAuth = async (req, res, next) => {
    let token;
    let respuesta = new ServerResponse();

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.usuario = await User.findById(decoded.userId)
                .select("-pass -emailConfirm -policityAccepted -createdAt -updatedAt -__v");
            return next();
        } catch (error) {
            // Diferenciar entre tipos de errores del token
            if (error.name === 'TokenExpiredError') {
                respuesta.status = 'error'
                respuesta.msg = 'Token expirado'
                return res.status(401).json(respuesta); // 401 para token expirado
            } else if (error.name === 'JsonWebTokenError') {
                respuesta.status = 'error'
                respuesta.msg = 'Token no válido'
                return res.status(401).json(respuesta); // 401 para token inválido
            } else {
                respuesta.status = 'error'
                respuesta.msg = 'Error al verificar el token'
                return res.status(500).json(respuesta); // 500 para otros errores
            }
        }
    };

    if (!token) {
        respuesta.status = 'error'
        respuesta.msg = 'Token de autorización requerido'
        return res.status(401).json(respuesta);
    }

    next();
}

export default checkAuth;