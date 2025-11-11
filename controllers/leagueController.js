import League from '../models/League.js';
import Team from '../models/Team.js';
import { createResponse } from '../helpers/createResponse.js';

export const createLeague = async (req, res) => {
    const { _id } = req.usuario;
    const { name, category } = req.body;
    try {
        const leagueExists = await League.findOne({ name, category, userId: _id });
        if (leagueExists) {
            const response = createResponse('error', 'Ya tienes una liga con ese nombre y categoría');
            return res.status(400).json(response);
        }

        const league = new League({ name, category, userId: _id });
        const savedLeague = await league.save();
        const response = createResponse('success', 'Liga creada correctamente', savedLeague);
        return res.status(201).json(response);
    } catch (error) {
        const response = createResponse('error', 'Error al crear la liga', error.message);
        return res.status(500).json(response);
    }
}



export const getLeaguesByUser  = async (req, res) => {
    const { _id } = req.usuario;
    try {
        const leagues = await League.find({ userId: _id }).populate('teams');
        const response = createResponse('success', 'Ligas obtenidas correctamente', leagues);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error)
        const response = createResponse('error', 'Error al obtener las ligas', error.message);
        return res.status(500).json(response);
    }
}