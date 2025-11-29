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

        const { name, availabilityDays, players} = req.body;
        const { _id } = req.usuario;

        // Validaciones
        if (!name || !availabilityDays) {
            return res.status(400).json({
                status: 'error',
                msg: 'Nombre y días de disponibilidad son requeridos',
                data: null
            });
        }

        //Crear equipo
        const newTeam = new Team({
            name,
            coach: _id,
            availabilityDays: availabilityDays,
            logo: req.file ? req.file.filename : null
        });
        
        await newTeam.save();

         if (players) {
            let parsedPlayers;

            // `players` llega como string JSON desde el FormData
            try {
                parsedPlayers = Array.isArray(players) ? players : JSON.parse(players);
            } catch (e) {
                console.error('Error al parsear players:', e);
                return res.status(400).json({
                status: 'error',
                msg: 'Formato de jugadores inválido',
                data: null,
                });
            }

            if (Array.isArray(parsedPlayers) && parsedPlayers.length > 0) {
                const playersToInsert = parsedPlayers.map((p) => ({
                fullname: p.fullname,
                birthday: p.birthday,      // el front ya envía la fecha
                jersey: p.jersey,          // Mongoose lo castea a Number
                teamId: newTeam._id,
                isLider: !!p.isLider,
                picture: p.picture || '',  // por ahora viene vacío
                }));

                await Player.insertMany(playersToInsert);
            }
            }

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

        if (team.coach.toString() !== req.usuario._id.toString()) {
            const respuesta = createResponse('error', 'No autorizado para ver este equipo', null);
            return res.status(403).json(respuesta);
        }

        const respuesta = createResponse('success', 'Equipo obtenido correctamente', team);
        return res.status(200).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener el equipo', null);
        return res.status(500).json(respuesta);
    }
}

export const addTeamToSeason = async (req, res) => {
    const { teamId,code } = req.body;
    try {
        // Validar codigo se temporada
        const fechaDeHoyUTC = new Date();
        const invitation = await Invitation.findOne({ code: code });

        if (!invitation) {
            const respuesta = createResponse('error', 'Código de invitación no encontrado');
            return res.status(404).json(respuesta);
        }

        if (invitation.expireAt < fechaDeHoyUTC) {
            const respuesta = createResponse('error', 'La invitación ha expirado');
            return res.status(400).json(respuesta);
        }

        const season = await Season.findById(invitation.seasonId);
        if (!season) {
            const respuesta = createResponse('error', 'Temporada no encontrada para el código de invitación proporcionado');
            return res.status(400).json(respuesta);
        }

        const team = await Team.findById(teamId);
        if (!team) {
            const respuesta = createResponse('error', 'Equipo no encontrado');
            return res.status(404).json(respuesta);
        }

        if (season.teams.includes(team._id)) {
            const respuesta = createResponse('error', 'El equipo ya está agregado a la temporada');
            return res.status(400).json(respuesta);
        }

        //Guardar equipo en la season
        season.teams.push(team._id);

        await season.save();
        const respuesta = createResponse('success', 'Equipo agregado a la temporada correctamente');
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al agregar el equipo');
        return res.status(500).json(respuesta);
    }
}