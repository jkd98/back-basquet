import Team from '../models/Team.js';
import { createResponse } from '../helpers/createResponse.js';
import upload from '../middleware/procesImage.js';
import Invitation from '../models/Invitation.js';
import Season from '../models/Season.js';

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

        const { name, availabilityDays, code } = req.body;
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
        console.log('Fecha de hoy UTC:', fechaDeHoyUTC);
        const isValidInvitationCode = await Invitation.findOne({ code: code, expireAt: { $gte: fechaDeHoyUTC } });
        if (!isValidInvitationCode) {
            const respuesta = createResponse('error', 'Código de invitación inválido o expirado');
            return res.status(400).json(respuesta)
        }
        console.log(isValidInvitationCode);
        const season = await Season.findById(isValidInvitationCode.seasonId);
        console.log(season);
        if (!season) {
            const respuesta = createResponse('error', 'Temporada no encontrada para el código de invitación proporcionado');
            return res.status(400).json(respuesta);
        }

        //Crear equipo
        const newTeam = new Team({
            name,
            coach: _id,
            availabilityDays,
            logo: req.file ? req.file.filename : null
        });

        //Guardar equipo en la season
        season.teams.push(newTeam._id);
        await Promise.allSettled([season.save(), newTeam.save()])


        const respuesta = createResponse('success', 'Equipo creado correctamente');
        return res.status(201).json(respuesta);

    } catch (error) {
        // Aquí capturamos tanto errores de Multer como de la base de datos
        const statusCode = error.message.includes('Tipo de archivo') ? 400 : 500;
        const respuesta = createResponse('error', error.message, null);
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
        const respuesta = createResponse('error', 'Error al obtener equipos del usuatio', );
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