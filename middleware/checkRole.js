import { ServerResponse } from "../models/ServerResponse.js";

export function checkRole(rol='4DMlN') {
    return async (req, res, next) => {
        let respuesta = new ServerResponse();
        try {
            const { role } = req.usuario;
            if (role !== rol) {
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