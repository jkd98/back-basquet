import Invitation from "../models/Invitation.js";
import { generateSixDigitToken } from "../helpers/genSixDigitToken.js";

export const createInvitation = async (req, res) => {
    try {
        const { season, expireAt } = req.body;
        const code = generateSixDigitToken();

        const newInvitation = new Invitation({
            seasonId:season,
            code,
            expireAt
        });

        await newInvitation.save();

        const respuesta = createResponse('success', 'Invitación creada correctamente', newInvitation);
        return res.status(201).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al crear la invitación', null);
        return res.status(500).json(respuesta);
    }
}