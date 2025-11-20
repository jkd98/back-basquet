import League from '../models/League.js';
import Team from '../models/Team.js';
import { createResponse } from '../helpers/createResponse.js';
import upload from '../middleware/procesImage.js';
export const createLeague = async (req, res) => {
    const { _id } = req.usuario;
    try {
        // Convertir upload.single a promesa
        await new Promise((resolve, reject) => {
            upload.single('logo')(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        const { name, category } = req.body;
        const leagueExists = await League.findOne({ name, category, userId: _id });
        if (leagueExists) {
            const response = createResponse('error', 'Ya tienes una liga con ese nombre y categoría');
            return res.status(400).json(response);
        }

        const league = new League({
            name,
            category,
            userId: _id,
            logo: req.file ? req.file.filename : null
        });

        const savedLeague = await league.save();
        const response = createResponse('success', 'Liga creada correctamente', savedLeague);
        return res.status(201).json(response);
    } catch (error) {
        const response = createResponse('error', 'Error al crear la liga', error.message);
        return res.status(500).json(response);
    }
}

export const getLeaguesByUser = async (req, res) => {
    const { _id } = req.usuario;
    try {
        const leagues = await League.find({ userId: _id })
            .populate('teams', 'name logo coach availabilityDays')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        const response = createResponse('success', 'Ligas obtenidas correctamente', leagues);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error)
        const response = createResponse('error', 'Error al obtener las ligas', error.message);
        return res.status(500).json(response);
    }
}

export const getLeagueById = async (req, res) => {
    const { id } = req.params;
    const { _id: userId } = req.usuario;

    try {
        const league = await League.findById(id)
            .populate('teams', 'name logo coach availabilityDays')
            .populate('userId', 'name email');

        if (!league) {
            const response = createResponse('error', 'Liga no encontrada', null);
            return res.status(404).json(response);
        }

        // Verificar que el usuario es el dueño de la liga
        if (league.userId._id.toString() !== userId.toString()) {
            const response = createResponse('error', 'No tienes permisos para acceder a esta liga', null);
            return res.status(403).json(response);
        }

        const response = createResponse('success', 'Liga obtenida correctamente', league);
        return res.status(200).json(response);
    } catch (error) {
        const response = createResponse('error', 'Error al obtener la liga', error.message);
        return res.status(500).json(response);
    }
}

export const updateLeague = async (req, res) => {
    const { id } = req.params;
    const { _id: userId } = req.usuario;

    try {
        // Convertir upload.single a promesa
        await new Promise((resolve, reject) => {
            upload.single('logo')(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        const { name, category } = req.body;

        const league = await League.findById(id);

        if (!league) {
            const response = createResponse('error', 'Liga no encontrada', null);
            return res.status(404).json(response);
        }

        // Verificar que el usuario es el dueño de la liga
        if (league.userId.toString() !== userId.toString()) {
            const response = createResponse('error', 'No tienes permisos para actualizar esta liga', null);
            return res.status(403).json(response);
        }

        // Verificar si ya existe otra liga con el mismo nombre y categoría
        if (name && category) {
            const leagueExists = await League.findOne({
                name,
                category,
                userId,
                _id: { $ne: id } // Excluir la liga actual
            });

            if (leagueExists) {
                const response = createResponse('error', 'Ya tienes una liga con ese nombre y categoría');
                return res.status(400).json(response);
            }
        }

        if (name !== undefined && name.trim() !== '') {
            league.name = name;
        }
        
        if (category !== undefined && category.trim() !== ''){
            league.category = category;
        }
        if (req.file) {
            league.logo = req.file.filename;
        }

        const updatedLeague = await league.save();

        const response = createResponse('success', 'Liga actualizada correctamente', updatedLeague);
        return res.status(200).json(response);
    } catch (error) {
        const response = createResponse('error', 'Error al actualizar la liga', error.message);
        return res.status(500).json(response);
    }
}

export const deleteLeague = async (req, res) => {
    const { id } = req.params;
    const { _id: userId } = req.usuario;

    try {
        const league = await League.findById(id);

        if (!league) {
            const response = createResponse('error', 'Liga no encontrada', null);
            return res.status(404).json(response);
        }

        // Verificar que el usuario es el dueño de la liga
        if (league.userId.toString() !== userId.toString()) {
            const response = createResponse('error', 'No tienes permisos para eliminar esta liga', null);
            return res.status(403).json(response);
        }

        await League.findByIdAndDelete(id);
        const response = createResponse('success', 'Liga eliminada correctamente', null);
        return res.status(200).json(response);
    } catch (error) {
        const response = createResponse('error', 'Error al eliminar la liga', error.message);
        return res.status(500).json(response);
    }
}

export const addTeamToLeague = async (req, res) => {
    const { id } = req.params;
    const { _id: userId } = req.usuario;
    const { teamId } = req.body;

    try {
        if (!teamId) {
            const response = createResponse('error', 'El teamId es requerido', null);
            return res.status(400).json(response);
        }

        const league = await League.findById(id);
        if (!league) {
            const response = createResponse('error', 'Liga no encontrada', null);
            return res.status(404).json(response);
        }

        // Verificar que el usuario es el dueño de la liga
        if (league.userId.toString() !== userId.toString()) {
            const response = createResponse('error', 'No tienes permisos para modificar esta liga', null);
            return res.status(403).json(response);
        }

        // Verificar que el equipo existe y pertenece al usuario
        const team = await Team.findById(teamId);
        if (!team) {
            const response = createResponse('error', 'Equipo no encontrado', null);
            return res.status(404).json(response);
        }

        /* if (team.coach.toString() !== userId.toString()) {
            const response = createResponse('error', 'No tienes permisos para agregar este equipo a la liga', null);
            return res.status(403).json(response);
        } */

        // Verificar si el equipo ya está en la liga
        if (league.teams.includes(teamId)) {
            const response = createResponse('error', 'El equipo ya está en la liga', null);
            return res.status(400).json(response);
        }

        // Agregar equipo a la liga
        league.teams.push(teamId);
        const updatedLeague = await league.save();

        await updatedLeague.populate('teams', 'name logo coach availabilityDays');

        const response = createResponse('success', 'Equipo agregado a la liga correctamente', updatedLeague);
        return res.status(200).json(response);
    } catch (error) {
        const response = createResponse('error', 'Error al agregar equipo a la liga', error.message);
        return res.status(500).json(response);
    }
}

export const removeTeamFromLeague = async (req, res) => {
    const { id } = req.params;
    const { _id: userId } = req.usuario;
    const { teamId } = req.body;

    try {
        if (!teamId) {
            const response = createResponse('error', 'El teamId es requerido', null);
            return res.status(400).json(response);
        }

        const league = await League.findById(id);
        if (!league) {
            const response = createResponse('error', 'Liga no encontrada', null);
            return res.status(404).json(response);
        }

        // Verificar que el usuario es el dueño de la liga
        if (league.userId.toString() !== userId.toString()) {
            const response = createResponse('error', 'No tienes permisos para modificar esta liga', null);
            return res.status(403).json(response);
        }

        // Verificar si el equipo está en la liga
        if (!league.teams.includes(teamId)) {
            const response = createResponse('error', 'El equipo no está en la liga', null);
            return res.status(400).json(response);
        }

        // Remover equipo de la liga
        league.teams = league.teams.filter(team => team.toString() !== teamId);
        const updatedLeague = await league.save();

        await updatedLeague.populate('teams', 'name logo coach availabilityDays');

        const response = createResponse('success', 'Equipo removido de la liga correctamente', updatedLeague);
        return res.status(200).json(response);
    } catch (error) {
        const response = createResponse('error', 'Error al remover equipo de la liga', error.message);
        return res.status(500).json(response);
    }
}

export const getAvailableTeamsForLeague = async (req, res) => {
    const { id } = req.params;
    const { _id: userId } = req.usuario;

    try {
        const league = await League.findById(id);
        if (!league) {
            const response = createResponse('error', 'Liga no encontrada', null);
            return res.status(404).json(response);
        }

        // Verificar que el usuario es el dueño de la liga
        if (league.userId.toString() !== userId.toString()) {
            const response = createResponse('error', 'No tienes permisos para acceder a esta liga', null);
            return res.status(403).json(response);
        }

        // Obtener todos los equipos del usuario que no están en la liga
        const userTeams = await Team.find({ coach: userId });
        const availableTeams = userTeams.filter(team =>
            !league.teams.some(leagueTeam => leagueTeam.toString() === team._id.toString())
        );

        const response = createResponse('success', 'Equipos disponibles obtenidos correctamente', availableTeams);
        return res.status(200).json(response);
    } catch (error) {
        const response = createResponse('error', 'Error al obtener equipos disponibles', error.message);
        return res.status(500).json(response);
    }
}

export const getLeagueStats = async (req, res) => {
    const { id } = req.params;
    const { _id: userId } = req.usuario;

    try {
        const league = await League.findById(id)
            .populate('teams', 'name logo coach')
            .populate('userId', 'name email');

        if (!league) {
            const response = createResponse('error', 'Liga no encontrada', null);
            return res.status(404).json(response);
        }

        // Verificar que el usuario es el dueño de la liga
        if (league.userId._id.toString() !== userId.toString()) {
            const response = createResponse('error', 'No tienes permisos para acceder a esta liga', null);
            return res.status(403).json(response);
        }

        const stats = {
            totalTeams: league.teams.length,
            teams: league.teams.map(team => ({
                id: team._id,
                name: team.name,
                logo: team.logo
            })),
            category: league.category,
            created: league.createdAt
        };

        const response = createResponse('success', 'Estadísticas de la liga obtenidas correctamente', stats);
        return res.status(200).json(response);
    } catch (error) {
        const response = createResponse('error', 'Error al obtener estadísticas de la liga', error.message);
        return res.status(500).json(response);
    }
}