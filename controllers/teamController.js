import Team from '../models/Team.js';
import { createResponse } from '../helpers/createResponse.js';
import upload from '../middleware/procesImage.js';
import Invitation from '../models/Invitation.js';
import Season from '../models/Season.js';
import Player from '../models/Player.js';

export const createTeam = async (req, res) => {
    try {
        // Convertir upload.single a promesa
        await new Promise((resolve, reject) => {
            upload.single('logo')(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log('Body después de upload:', req.body);
        console.log('File:', req.file);

        const { name, availabilityDays, code, players } = req.body;
        const { _id } = req.usuario;

        // Validaciones
        if (!name || !availabilityDays) {
            return res.status(400).json({
                status: 'error',
                msg: 'Nombre y días de disponibilidad son requeridos',
                data: null
            });
        }

        // Validar codigo se temporada
        const fechaDeHoyUTC = new Date();
        const invitation = await Invitation.findOne({ code: code });

        if (!invitation) {
            const respuesta = createResponse('error', 'Código de invitación no encontrado');
            return res.status(404).json(respuesta);
        }

        if (invitation.status !== 'pending') {
            const respuesta = createResponse('error', 'Esta invitación ya ha sido utilizada o expiró');
            return res.status(400).json(respuesta);
        }

        if (invitation.expireAt < fechaDeHoyUTC) {
            invitation.status = 'expired';
            await invitation.save();
            const respuesta = createResponse('error', 'La invitación ha expirado');
            return res.status(400).json(respuesta);
        }

        const season = await Season.findById(invitation.seasonId);
        if (!season) {
            const respuesta = createResponse('error', 'Temporada no encontrada para el código de invitación proporcionado');
            return res.status(400).json(respuesta);
        }

        //Crear equipo
        const newTeam = new Team({
            name,
            coach: _id,
            availabilityDays: JSON.parse(availabilityDays), // Parse stringified array
            logo: req.file ? req.file.filename : null
        });

        await newTeam.save();

        // Crear jugadores
        if (players) {
            const playersList = JSON.parse(players); // Parse stringified array
            if (Array.isArray(playersList)) {
                const playerPromises = playersList.map(playerData => {
                    const newPlayer = new Player({
                        ...playerData,
                        teamId: newTeam._id
                    });
                    return newPlayer.save();
                });
                await Promise.all(playerPromises);
            }
        }

        //Guardar equipo en la season
        season.teams.push(newTeam._id);

        // Actualizar invitación
        invitation.status = 'used';
        invitation.usedBy = _id;
        invitation.usedAt = new Date();

        await Promise.all([season.save(), invitation.save()]);

        const respuesta = createResponse('success', 'Equipo registrado correctamente');
        return res.status(201).json(respuesta);

    } catch (error) {
        console.error(error);
        const statusCode = error.message && error.message.includes('Tipo de archivo') ? 400 : 500;
        const respuesta = createResponse('error', error.message || 'Error al crear el equipo', null);
        return res.status(statusCode).json(respuesta);
    }
}

export const getTeams = async (req, res) => {
    try {
        const teams = await Team.find();
        const respuesta = createResponse('success', 'Equipos obtenidos correctamente', teams);
        return res.status(200).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener los equipos', null);
        return res.status(500).json(respuesta);
    }
}

export const getTeamsByUser = async (req, res) => {
    try {
        const { _id } = req.usuario;
        const teams = await Team.find({ coach: _id });
        const respuesta = createResponse('success', 'Equipos obtenidos correctamente', teams);
        return res.status(200).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener equipos del usuatio',);
        return res.status(500).json(respuesta);
    }
}

export const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findById(id);
        if (!team) {
            const respuesta = createResponse('error', 'Equipo no encontrado', null);
            return res.status(404).json(respuesta);
        }
        const respuesta = createResponse('success', 'Equipo obtenido correctamente', team);
        return res.status(200).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener el equipo', null);
        return res.status(500).json(respuesta);
    }
}