import Season from '../models/Season.js';
import League from '../models/League.js';
import Team from '../models/Team.js';
import Player from '../models/Player.js';
import { createResponse } from '../helpers/createResponse.js';

export const createSeason = async (req, res) => {
    try {
        const { league, year, startDate, endDate, status } = req.body;

        // TODO: Validar que no exista otra temporada con el mismo año en la misma liga

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
        await seasonSaved.populate('league', 'name');

        const respuesta = createResponse('success', 'Temporada creada correctamente', seasonSaved);
        return res.status(201).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', error.message, null);
        return res.status(500).json(respuesta);
    }
}

// TODO: Creo que este no se necesita
export const getSeasons = async (req, res) => {
    try {
        const seasons = await Season.find()
            .populate('league', 'name')
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
            .populate('league', 'name category')
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
        const {
            league,
            year,
            startDate,
            endDate,
            status,
            championTeamId,
            mvpPlayerId,
            weekMvplayerId,
            standings
        } = req.body;

        // Verificar si la temporada existe
        const existingSeason = await Season.findById(id);
        if (!existingSeason) {
            const respuesta = createResponse('error', 'Temporada no encontrada', null);
            return res.status(404).json(respuesta);
        }

        // Validar referencias si se están actualizando
        if (league) {
            const leagueExists = await League.findById(league);
            if (!leagueExists) {
                const respuesta = createResponse('error', 'La liga especificada no existe', null);
                return res.status(404).json(respuesta);
            }
        }

        if (championTeamId) {
            const teamExists = await Team.findById(championTeamId);
            if (!teamExists) {
                const respuesta = createResponse('error', 'El equipo campeón especificado no existe', null);
                return res.status(404).json(respuesta);
            }
        }

        if (mvpPlayerId) {
            const playerExists = await Player.findById(mvpPlayerId);
            if (!playerExists) {
                const respuesta = createResponse('error', 'El jugador MVP especificado no existe', null);
                return res.status(404).json(respuesta);
            }
        }

        if (weekMvplayerId) {
            const playerExists = await Player.findById(weekMvplayerId);
            if (!playerExists) {
                const respuesta = createResponse('error', 'El jugador MVP de la semana especificado no existe', null);
                return res.status(404).json(respuesta);
            }
        }

        // Crear objeto de actualización solo con los campos que vinieron
        const updateData = {};
        if (league !== undefined) updateData.league = league;
        if (year !== undefined) updateData.year = year;
        if (startDate !== undefined) updateData.startDate = startDate;
        if (endDate !== undefined) updateData.endDate = endDate;
        if (status !== undefined) updateData.status = status;
        if (championTeamId !== undefined) updateData.championTeamId = championTeamId;
        if (mvpPlayerId !== undefined) updateData.mvpPlayerId = mvpPlayerId;
        if (weekMvplayerId !== undefined) updateData.weekMvplayerId = weekMvplayerId;
        if (standings !== undefined) updateData.standings = standings;

        const updatedSeason = await Season.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('league', 'name category')
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


export const getSeasonsByLeague = async (req, res) => {
    try {
        const { leagueId } = req.params;

        const seasons = await Season.find({ league: leagueId })
            .populate('league', 'name category')
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
            .populate('league', 'name category')
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


export const getSeasonTeams = async (req, res) => {
    try {
        const { id } = req.params;
        const season = await Season.findById(id).populate({
            path: 'teams',
            populate: { path: 'coach', select: 'fullname' }
        });

        if (!season) {
            const respuesta = createResponse('error', 'Temporada no encontrada', null);
            return res.status(404).json(respuesta);
        }

        const teamsWithStats = await Promise.all(season.teams.map(async (team) => {
            const playerCount = await Player.countDocuments({ teamId: team._id });
            return {
                ...team.toObject(),
                playerCount
            };
        }));

        const respuesta = createResponse('success', 'Equipos de la temporada obtenidos correctamente', teamsWithStats);
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener los equipos de la temporada', null);
        return res.status(500).json(respuesta);
    }
}
