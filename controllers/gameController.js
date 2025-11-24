import Game from '../models/Game.js';
import Season from '../models/Season.js';
import Team from '../models/Team.js';
import { createResponse } from '../helpers/createResponse.js';

export const getGamesBySeason = async (req, res) => {
    try {
        const { seasonId } = req.params;
        const games = await Game.find({ season: seasonId })
            .populate('teamA', 'name logo')
            .populate('teamB', 'name logo')
            .sort({ round: 1 });

        const respuesta = createResponse('success', 'Juegos obtenidos correctamente', games);
        return res.status(200).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener los juegos', null);
        return res.status(500).json(respuesta);
    }
}

export const generateGames = async (req, res) => {
    try {
        const { seasonId } = req.body;

        // Verificar si ya existen juegos para esta temporada
        const existingGames = await Game.countDocuments({ season: seasonId });
        if (existingGames > 0) {
            const respuesta = createResponse('error', 'Ya existen juegos generados para esta temporada', null);
            return res.status(400).json(respuesta);
        }

        const season = await Season.findById(seasonId).populate('teams');
        if (!season) {
            const respuesta = createResponse('error', 'Temporada no encontrada', null);
            return res.status(404).json(respuesta);
        }

        let teams = season.teams.map(t => t._id);

        // Si el número de equipos es impar, agregar un "bye" (null)
        if (teams.length % 2 !== 0) {
            teams.push(null);
        }

        const numTeams = teams.length;
        const numRounds = numTeams - 1;
        const gamesPerRound = numTeams / 2;
        const generatedGames = [];

        for (let round = 0; round < numRounds; round++) {
            for (let i = 0; i < gamesPerRound; i++) {
                const teamA = teams[i];
                const teamB = teams[numTeams - 1 - i];

                // Si uno de los equipos es "bye" (null), no se crea juego (descanso)
                if (teamA && teamB) {
                    generatedGames.push({
                        season: seasonId,
                        teamA: teamA,
                        teamB: teamB,
                        round: round + 1,
                        status: 'pending'
                    });
                }
            }

            // Rotar equipos para la siguiente ronda (Round Robin)
            // Mantener el primer equipo fijo y rotar el resto
            const firstTeam = teams[0];
            const remainingTeams = teams.slice(1);
            const lastTeam = remainingTeams.pop();
            remainingTeams.unshift(lastTeam);
            teams = [firstTeam, ...remainingTeams];
        }

        await Game.insertMany(generatedGames);

        const games = await Game.find({ season: seasonId })
            .populate('teamA', 'name logo')
            .populate('teamB', 'name logo')
            .sort({ round: 1 });

        const respuesta = createResponse('success', 'Juegos generados correctamente', games);
        return res.status(201).json(respuesta);

    } catch (error) {
        console.error(error);
        const respuesta = createResponse('error', 'Error al generar los juegos', null);
        return res.status(500).json(respuesta);
    }
}

export const updateGameDate = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { date } = req.body;

        if (!date) {
            const respuesta = createResponse('error', 'La fecha es requerida', null);
            return res.status(400).json(respuesta);
        }

        const game = await Game.findById(gameId);
        if (!game) {
            const respuesta = createResponse('error', 'Juego no encontrado', null);
            return res.status(404).json(respuesta);
        }

        game.date = new Date(date);
        game.status = 'scheduled';
        await game.save();

        const updatedGame = await Game.findById(gameId)
            .populate('teamA', 'name logo')
            .populate('teamB', 'name logo');

        const respuesta = createResponse('success', 'Fecha asignada correctamente', updatedGame);
        return res.status(200).json(respuesta);
    } catch (error) {
        console.error(error);
        const respuesta = createResponse('error', 'Error al actualizar la fecha del juego', null);
        return res.status(500).json(respuesta);
    }
}
