import Season from '../models/Season.js';
import League from '../models/League.js';
import Team from '../models/Team.js';
import Player from '../models/Player.js';
import { createResponse } from '../helpers/createResponse.js';

export const createSeason = async (req, res) => {
    try {
        const { league, year, startDate, endDate, status } = req.body;

        // Validaciones básicas
        if (!year || !startDate) {
            const respuesta = createResponse('error', 'Año y fecha de inicio son requeridos', null);
            return res.status(400).json(respuesta);
        }

        // Verificar si la liga existe
        if (league) {
            const leagueExists = await League.findById(league);
            if (!leagueExists) {
                const respuesta = createResponse('error', 'La liga especificada no existe', null);
                return res.status(404).json(respuesta);
            }
        }

        const newSeason = new Season({ 
            league,
            year, 
            startDate,
            endDate,
            status: status || 'upcoming'
        });

        const seasonSaved = await newSeason.save();
        await seasonSaved.populate('league', 'name sport');
        
        const respuesta = createResponse('success', 'Temporada creada correctamente', seasonSaved);
        return res.status(201).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', error.message, null);
        return res.status(500).json(respuesta);
    }
}

export const getSeasons = async (req, res) => {
    try {
        const seasons = await Season.find()
            .populate('league', 'name sport')
            .populate('championTeamId', 'name logo')
            .populate('mvpPlayerId', 'fullname picture')
            .populate('weekMvplayerId', 'fullname picture')
            .populate('standings.teamId', 'name logo');
        
        const respuesta = createResponse('success', 'Temporadas obtenidas correctamente', seasons);
        return res.status(200).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener las temporadas', null);
        return res.status(500).json(respuesta);
    }
}

export const getSeasonById = async (req, res) => {
    try {
        const { id } = req.params;
        const season = await Season.findById(id)
            .populate('league', 'name sport')
            .populate('championTeamId', 'name logo')
            .populate('mvpPlayerId', 'fullname picture')
            .populate('weekMvplayerId', 'fullname picture')
            .populate('standings.teamId', 'name logo');

        if (!season) {
            const respuesta = createResponse('error', 'Temporada no encontrada', null);
            return res.status(404).json(respuesta);
        }

        const respuesta = createResponse('success', 'Temporada obtenida correctamente', season);
        return res.status(200).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener la temporada', null);
        return res.status(500).json(respuesta);
    }
}

export const updateSeason = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Verificar si la temporada existe
        const existingSeason = await Season.findById(id);
        if (!existingSeason) {
            const respuesta = createResponse('error', 'Temporada no encontrada', null);
            return res.status(404).json(respuesta);
        }

        // Validar referencias si se están actualizando
        if (updates.league) {
            const leagueExists = await League.findById(updates.league);
            if (!leagueExists) {
                const respuesta = createResponse('error', 'La liga especificada no existe', null);
                return res.status(404).json(respuesta);
            }
        }

        if (updates.championTeamId) {
            const teamExists = await Team.findById(updates.championTeamId);
            if (!teamExists) {
                const respuesta = createResponse('error', 'El equipo campeón especificado no existe', null);
                return res.status(404).json(respuesta);
            }
        }

        if (updates.mvpPlayerId) {
            const playerExists = await Player.findById(updates.mvpPlayerId);
            if (!playerExists) {
                const respuesta = createResponse('error', 'El jugador MVP especificado no existe', null);
                return res.status(404).json(respuesta);
            }
        }

        if (updates.weekMvplayerId) {
            const playerExists = await Player.findById(updates.weekMvplayerId);
            if (!playerExists) {
                const respuesta = createResponse('error', 'El jugador MVP de la semana especificado no existe', null);
                return res.status(404).json(respuesta);
            }
        }

        const updatedSeason = await Season.findByIdAndUpdate(
            id, 
            updates, 
            { new: true, runValidators: true }
        )
        .populate('league', 'name sport')
        .populate('championTeamId', 'name logo')
        .populate('mvpPlayerId', 'fullname picture')
        .populate('weekMvplayerId', 'fullname picture')
        .populate('standings.teamId', 'name logo');

        const respuesta = createResponse('success', 'Temporada actualizada correctamente', updatedSeason);
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al actualizar la temporada', null);
        return res.status(500).json(respuesta);
    }
}

export const deleteSeason = async (req, res) => {
    try {
        const { id } = req.params;

        const season = await Season.findById(id);
        if (!season) {
            const respuesta = createResponse('error', 'Temporada no encontrada', null);
            return res.status(404).json(respuesta);
        }

        await Season.findByIdAndDelete(id);
        const respuesta = createResponse('success', 'Temporada eliminada correctamente', null);
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al eliminar la temporada', null);
        return res.status(500).json(respuesta);
    }
}

export const updateStandings = async (req, res) => {
    try {
        const { id } = req.params;
        const { standings } = req.body;

        if (!standings || !Array.isArray(standings)) {
            const respuesta = createResponse('error', 'El campo standings debe ser un array', null);
            return res.status(400).json(respuesta);
        }

        // Verificar que todos los equipos en el standings existen
        for (const standing of standings) {
            if (standing.teamId) {
                const teamExists = await Team.findById(standing.teamId);
                if (!teamExists) {
                    const respuesta = createResponse('error', `El equipo con ID ${standing.teamId} no existe`, null);
                    return res.status(404).json(respuesta);
                }
            }
        }

        const updatedSeason = await Season.findByIdAndUpdate(
            id,
            { standings },
            { new: true, runValidators: true }
        )
        .populate('league', 'name sport')
        .populate('championTeamId', 'name logo')
        .populate('mvpPlayerId', 'fullname picture')
        .populate('weekMvplayerId', 'fullname picture')
        .populate('standings.teamId', 'name logo');

        if (!updatedSeason) {
            const respuesta = createResponse('error', 'Temporada no encontrada', null);
            return res.status(404).json(respuesta);
        }

        const respuesta = createResponse('success', 'Tabla de posiciones actualizada correctamente', updatedSeason);
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al actualizar la tabla de posiciones', null);
        return res.status(500).json(respuesta);
    }
}

export const getSeasonsByLeague = async (req, res) => {
    try {
        const { leagueId } = req.params;

        const seasons = await Season.find({ league: leagueId })
            .populate('league', 'name sport')
            .populate('championTeamId', 'name logo')
            .populate('mvpPlayerId', 'fullname picture')
            .populate('weekMvplayerId', 'fullname picture')
            .populate('standings.teamId', 'name logo');

        const respuesta = createResponse('success', 'Temporadas de la liga obtenidas correctamente', seasons);
        return res.status(200).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener las temporadas de la liga', null);
        return res.status(500).json(respuesta);
    }
}

export const updateSeasonStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['upcoming', 'active', 'completed', 'cancelled'].includes(status)) {
            const respuesta = createResponse('error', 'Estado no válido. Los valores permitidos son: upcoming, active, completed, cancelled', null);
            return res.status(400).json(respuesta);
        }

        const updatedSeason = await Season.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        )
        .populate('league', 'name sport')
        .populate('championTeamId', 'name logo')
        .populate('mvpPlayerId', 'fullname picture')
        .populate('weekMvplayerId', 'fullname picture')
        .populate('standings.teamId', 'name logo');

        if (!updatedSeason) {
            const respuesta = createResponse('error', 'Temporada no encontrada', null);
            return res.status(404).json(respuesta);
        }

        const respuesta = createResponse('success', 'Estado de la temporada actualizado correctamente', updatedSeason);
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al actualizar el estado de la temporada', null);
        return res.status(500).json(respuesta);
    }
}