import { Respuesta } from "../models/Respuesta.js"

export const checkRole = async (req, res, next) => {
    let respuesta = new Respuesta();
    try {
        const { role } = req.usuario;
        if (role != '4DMlN') {
            respuesta.status = 'error';
            respuesta.msg = 'No eres administrador';
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