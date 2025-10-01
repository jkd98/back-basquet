import Log from '../models/Logs.js'

export const crearLog = async ({ nivel, mensaje, usuario, ruta, ip }) => {
    try {
        const log = new Log({nivel,mensaje,usuario,ruta,ip});
        await log.save()
    } catch (error) {
        console.log("Error al gaurdar el log: ",error)
    }
}

export const NivelesLog = Object.freeze({
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
});

export const obtenerIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
};