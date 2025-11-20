import Player from '../models/Player.js';
import Team from '../models/Team.js';
import { createResponse } from '../helpers/createResponse.js';
import upload from '../middleware/procesImage.js';

export const createPlayer = async (req, res) => {
    try {
        // Convertir upload.single a promesa
        await new Promise((resolve, reject) => {
            upload.single('picture')(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log('Body después de upload:', req.body);
        console.log('File:', req.file);

        const { fullname, birthday, jersey, teamId } = req.body;
        const { _id: coachId } = req.usuario;

        // Validaciones básicas
        if (!fullname || !birthday || !jersey || !teamId) {
            return res.status(400).json({
                status: 'error',
                msg: 'Todos los campos son requeridos: fullname, birthday, jersey, teamId',
                data: null
            });
        }

        // Verificar que el equipo existe y pertenece al coach
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                status: 'error',
                msg: 'Equipo no encontrado',
                data: null
            });
        }

        // Verificar que el coach es el dueño del equipo
        if (team.coach.toString() !== coachId.toString()) {
            return res.status(403).json({
                status: 'error',
                msg: 'No tienes permisos para agregar jugadores a este equipo',
                data: null
            });
        }

        // Verificar si ya existe un jugador con el mismo número en el equipo
        const existingPlayer = await Player.findOne({
            teamId,
            jersey: parseInt(jersey)
        });

        if (existingPlayer) {
            return res.status(400).json({
                status: 'error',
                msg: 'Ya existe un jugador con este número en el equipo',
                data: null
            });
        }

        const newPlayer = new Player({
            fullname,
            birthday,
            jersey: parseInt(jersey),
            teamId,
            picture: req.file ? req.file.filename : null
        });

        const playerSaved = await newPlayer.save();

        // Populate para devolver información del equipo
        //await playerSaved.populate('teamId', 'name logo');

        const respuesta = createResponse('success', 'Jugador creado correctamente', playerSaved);
        return res.status(201).json(respuesta);

    } catch (error) {
        const statusCode = error.message.includes('Tipo de archivo') ? 400 : 500;
        const respuesta = createResponse('error', error.message, null);
        return res.status(statusCode).json(respuesta);
    }
}

export const getPlayersByTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { _id: coachId } = req.usuario;

        // Verificar que el equipo existe y pertenece al coach
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                status: 'error',
                msg: 'Equipo no encontrado',
                data: null
            });
        }

        // Verificar que el coach es el dueño del equipo (opcional, dependiendo de si quieres que otros vean los jugadores)
        if (team.coach.toString() !== coachId.toString()) {
            return res.status(403).json({
                status: 'error',
                msg: 'No tienes permisos para ver los jugadores de este equipo',
                data: null
            });
        }

        const players = await Player.find({ teamId }).populate('teamId', 'name logo');
        const respuesta = createResponse('success', 'Jugadores obtenidos correctamente', players);
        return res.status(200).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener los jugadores', null);
        return res.status(500).json(respuesta);
    }
}

export const getPlayerById = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: coachId } = req.usuario;

        const player = await Player.findById(id).populate('teamId', 'name logo coach');
        if (!player) {
            const respuesta = createResponse('error', 'Jugador no encontrado', null);
            return res.status(404).json(respuesta);
        }

        // Verificar que el coach es el dueño del equipo del jugador
        if (player.teamId.coach.toString() !== coachId.toString()) {
            return res.status(403).json({
                status: 'error',
                msg: 'No tienes permisos para ver este jugador',
                data: null
            });
        }

        const respuesta = createResponse('success', 'Jugador obtenido correctamente', player);
        return res.status(200).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener el jugador', null);
        return res.status(500).json(respuesta);
    }
}

export const updatePlayer = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: coachId } = req.usuario;
        const updates = req.body;

        // Buscar jugador y verificar permisos
        const player = await Player.findById(id).populate('teamId', 'coach');
        if (!player) {
            return res.status(404).json({
                status: 'error',
                msg: 'Jugador no encontrado',
                data: null
            });
        }

        // Verificar que el coach es el dueño del equipo del jugador
        if (player.teamId.coach.toString() !== coachId.toString()) {
            return res.status(403).json({
                status: 'error',
                msg: 'No tienes permisos para actualizar este jugador',
                data: null
            });
        }

        // Si se está actualizando el jersey, verificar que no exista otro jugador con el mismo número en el equipo
        if (updates.jersey) {
            const existingPlayer = await Player.findOne({
                teamId: player.teamId._id,
                jersey: parseInt(updates.jersey),
                _id: { $ne: id } // Excluir el jugador actual
            });

            if (existingPlayer) {
                return res.status(400).json({
                    status: 'error',
                    msg: 'Ya existe otro jugador con este número en el equipo',
                    data: null
                });
            }
        }

        const updatedPlayer = await Player.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('teamId', 'name logo');

        const respuesta = createResponse('success', 'Jugador actualizado correctamente', updatedPlayer);
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al actualizar el jugador', null);
        return res.status(500).json(respuesta);
    }
}

export const deletePlayer = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: coachId } = req.usuario;

        // Buscar jugador y verificar permisos
        const player = await Player.findById(id).populate('teamId', 'coach');
        if (!player) {
            return res.status(404).json({
                status: 'error',
                msg: 'Jugador no encontrado',
                data: null
            });
        }

        // Verificar que el coach es el dueño del equipo del jugador
        if (player.teamId.coach.toString() !== coachId.toString()) {
            return res.status(403).json({
                status: 'error',
                msg: 'No tienes permisos para eliminar este jugador',
                data: null
            });
        }

        await Player.findByIdAndDelete(id);
        const respuesta = createResponse('success', 'Jugador eliminado correctamente', null);
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al eliminar el jugador', null);
        return res.status(500).json(respuesta);
    }
}