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

