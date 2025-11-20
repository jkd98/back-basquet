import { ServerResponse } from "../models/ServerResponse.js";

export function checkRole(rol=[]) {
    return async (req, res, next) => {
        let respuesta = new ServerResponse();
        let roles = ['4DMlN',...rol]
        try {
            const { role } = req.usuario;
            if (!roles.includes(role)) {
                respuesta.status = 'error';
                respuesta.msg = 'No tienes los permisos necesarios';
                return res.status(401).json(respuesta);
            }
            next();
        } catch (error) {
            respuesta.status = 'error';
            respuesta.msg = 'No estas autenticado';
            respuesta.data = error.message;
            return res.status(500).json(respuesta);
        }
    }
} 