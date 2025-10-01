import Log from '../models/Logs.js'
import {obtenerIP} from '../helpers/crearLog.js'
const LIMITE_INTENTOS = 3;
const VENTANA_TIEMPO_MIN = 3; // Tiempo que se reta a la hora actual
const BLOQUEO_MIN = 3; // Tiempo que bloquea la ip

const bloqueos = new Map(); // Guarda IPs bloqueadas en memoria

export const checkBloquedIP = async (req, res, next) => {
    const ip = obtenerIP(req);

    // Si la IP está en lista de bloqueo
    if (bloqueos.has(ip)) {
        const tiempoBloqueo = bloqueos.get(ip);
        if (Date.now() < tiempoBloqueo) {
            return res.status(429).json({ message: 'Demasiados intentos. Intenta más tarde.' });
        } else {
            bloqueos.delete(ip); // Ya pasó el tiempo
        }
    }

    // Buscar intentos fallidos recientes en Mongo
    const desde = new Date(Date.now() - VENTANA_TIEMPO_MIN * 60 * 1000); // últimos 10 minutos

    const intentosFallidos = await Log.countDocuments({
        ip,
        ruta: '/auth/verify-2fa',
        nivel: 'error',
        fecha: { $gte: desde }
    });



    if (intentosFallidos >= LIMITE_INTENTOS) {
        bloqueos.set(ip, Date.now() + BLOQUEO_MIN * 60 * 1000);
        return res.status(429).json({ message: 'Demasiados intentos. Intenta más tarde.' });
    }

    next();
};
