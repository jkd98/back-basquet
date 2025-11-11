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
                .select("-pass -emailConfirm -policityAccepted -createdAt -updatedAt -__v"); // tener sesion con info del usuer
            return next();
        } catch (error) {
            respuesta.status = 'error'
            respuesta.msg = 'No se pudo comprobar el token'
            return res.status(500).json(respuesta);
        }
    };

    if (!token) {
        respuesta.status = 'error'
        respuesta.msg = 'JWToken no válido'
        return res.status(401).json(respuesta);
    }

    next(); // avanza al sig middleware
}

export default checkAuth;