import Invitation from "../models/Invitation.js";
import { generateSixDigitToken } from "../helpers/genSixDigitToken.js";
import { createResponse } from "../helpers/createResponse.js";
import { DateTime } from 'luxon';

export const createInvitation = async (req, res) => {
    try {
        const { season, expireAt, clientTimeZone } = req.body;
        const code = generateSixDigitToken();
        // 1. Tomar la fecha del cliente y la zona horaria que envió.
        //    Creamos la fecha como 23:59:59 en la ZONA HORARIA DEL CLIENTE.
        const localTimeLimit = DateTime.fromISO(expireAt, { zone: clientTimeZone })
            .set({ hour: 23, minute: 59, second: 59, millisecond: 999 });

        // 2. Convertir ese punto temporal a un objeto Date (que es UTC) para Mongoose.
        const horaDeCorteUTC = localTimeLimit.toJSDate();
        const newInvitation = new Invitation({
            seasonId: season,
            code,
            expireAt: horaDeCorteUTC
        });

        await newInvitation.save();

        const respuesta = createResponse('success', 'Invitación creada correctamente', newInvitation);
        return res.status(201).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al crear la invitación', null);
        return res.status(500).json(respuesta);
    }
}