import Roleplay from '../models/Roleplay.js';
import League from '../models/League.js';
import Season from '../models/Season.js';
import Team from '../models/Team.js';
import Player from '../models/Player.js';
import { createResponse } from '../helpers/createResponse.js';



export const getRoleplays = async (req, res) => {
    try {
        const roleplays = await Roleplay.find()
            .populate('leagueId', 'name sport')
            .populate('season', 'year status')
            .populate('teamOne.teamId', 'name logo')
            .populate('teamTwo.teamId', 'name logo')
            .populate('teamOne.playersStats.playerId', 'fullname picture jersey')
            .populate('teamTwo.playersStats.playerId', 'fullname picture jersey')
            .sort({ date: -1 });

        const respuesta = createResponse('success', 'Partidos obtenidos correctamente', roleplays);
        return res.status(200).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener los partidos', null);
        return res.status(500).json(respuesta);
    }
}

export const getRoleplayById = async (req, res) => {
    try {
        const { id } = req.params;
        const roleplay = await Roleplay.findById(id)
            .populate('leagueId', 'name sport')
            .populate('season', 'year status')
            .populate('teamOne.teamId', 'name logo')
            .populate('teamTwo.teamId', 'name logo')
            .populate('teamOne.playersStats.playerId', 'fullname picture jersey')
            .populate('teamTwo.playersStats.playerId', 'fullname picture jersey');

        if (!roleplay) {
            const respuesta = createResponse('error', 'Partido no encontrado', null);
            return res.status(404).json(respuesta);
        }

        const respuesta = createResponse('success', 'Partido obtenido correctamente', roleplay);
        return res.status(200).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener el partido', null);
        return res.status(500).json(respuesta);
    }
}

export const updateRoleplay = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const existingRoleplay = await Roleplay.findById(id);
        if (!existingRoleplay) {
            const respuesta = createResponse('error', 'Partido no encontrado', null);
            return res.status(404).json(respuesta);
        }

        // Validar referencias si se están actualizando
        if (updates.leagueId) {
            const leagueExists = await League.findById(updates.leagueId);
            if (!leagueExists) {
                const respuesta = createResponse('error', 'La liga especificada no existe', null);
                return res.status(404).json(respuesta);
            }
        }

        if (updates.season) {
            const seasonExists = await Season.findById(updates.season);
            if (!seasonExists) {
                const respuesta = createResponse('error', 'La temporada especificada no existe', null);
                return res.status(404).json(respuesta);
            }
        }

        const updatedRoleplay = await Roleplay.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        )
            .populate('leagueId', 'name sport')
            .populate('season', 'year status')
            .populate('teamOne.teamId', 'name logo')
            .populate('teamTwo.teamId', 'name logo')
            .populate('teamOne.playersStats.playerId', 'fullname picture jersey')
            .populate('teamTwo.playersStats.playerId', 'fullname picture jersey');

        const respuesta = createResponse('success', 'Partido actualizado correctamente', updatedRoleplay);
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al actualizar el partido', null);
        return res.status(500).json(respuesta);
    }
}

export const deleteRoleplay = async (req, res) => {
    try {
        const { id } = req.params;

        const roleplay = await Roleplay.findById(id);
        if (!roleplay) {
            const respuesta = createResponse('error', 'Partido no encontrado', null);
            return res.status(404).json(respuesta);
        }

        await Roleplay.findByIdAndDelete(id);
        const respuesta = createResponse('success', 'Partido eliminado correctamente', null);
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al eliminar el partido', null);
        return res.status(500).json(respuesta);
    }
}

export const updatePlayerPoints = async (req, res) => {
    try {
        const { id } = req.params;
        const { teamSide, playerId, points } = req.body;

        // Validaciones
        if (!teamSide || !playerId || points === undefined) {
            const respuesta = createResponse('error', 'teamSide, playerId y points son requeridos', null);
            return res.status(400).json(respuesta);
        }

        if (teamSide !== 'teamOne' && teamSide !== 'teamTwo') {
            const respuesta = createResponse('error', 'teamSide debe ser "teamOne" o "teamTwo"', null);
            return res.status(400).json(respuesta);
        }

        const roleplay = await Roleplay.findById(id);
        if (!roleplay) {
            const respuesta = createResponse('error', 'Partido no encontrado', null);
            return res.status(404).json(respuesta);
        }

        // Verificar que el jugador existe
        const playerExists = await Player.findById(playerId);
        if (!playerExists) {
            const respuesta = createResponse('error', 'El jugador especificado no existe', null);
            return res.status(404).json(respuesta);
        }

        // Buscar el índice del jugador en el equipo especificado
        const teamPlayers = roleplay[teamSide].playersStats;
        const playerIndex = teamPlayers.findIndex(p => p.playerId.toString() === playerId);

        let updatedRoleplay;

        if (playerIndex > -1) {
            // Actualizar puntos del jugador existente
            const updateQuery = {};
            updateQuery[`${teamSide}.playersStats.${playerIndex}.points`] = points;

            updatedRoleplay = await Roleplay.findByIdAndUpdate(
                id,
                { $set: updateQuery },
                { new: true, runValidators: true }
            );
        } else {
            // Agregar nuevo jugador con sus puntos
            const newPlayerStat = {
                playerId: playerId,
                points: points
            };

            updatedRoleplay = await Roleplay.findByIdAndUpdate(
                id,
                { $push: { [`${teamSide}.playersStats`]: newPlayerStat } },
                { new: true, runValidators: true }
            );
        }

        await updatedRoleplay.populate([
            { path: 'leagueId', select: 'name sport' },
            { path: 'season', select: 'year status' },
            { path: 'teamOne.teamId', select: 'name logo' },
            { path: 'teamTwo.teamId', select: 'name logo' },
            { path: 'teamOne.playersStats.playerId', select: 'fullname picture jersey' },
            { path: 'teamTwo.playersStats.playerId', select: 'fullname picture jersey' }
        ]);

        const respuesta = createResponse('success', 'Puntos del jugador actualizados correctamente', updatedRoleplay);
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al actualizar los puntos del jugador', null);
        return res.status(500).json(respuesta);
    }
}

// TODO: Esto se puede ir actualizando segun la suma de puntos de los jugadores
export const updateTeamScore = async (req, res) => {
    try {
        const { id } = req.params;
        const { teamSide, score } = req.body;

        // Validaciones
        if (!teamSide || score === undefined) {
            const respuesta = createResponse('error', 'teamSide y score son requeridos', null);
            return res.status(400).json(respuesta);
        }

        if (teamSide !== 'teamOne' && teamSide !== 'teamTwo') {
            const respuesta = createResponse('error', 'teamSide debe ser "teamOne" o "teamTwo"', null);
            return res.status(400).json(respuesta);
        }

        if (score < 0) {
            const respuesta = createResponse('error', 'El score no puede ser negativo', null);
            return res.status(400).json(respuesta);
        }

        const updatedRoleplay = await Roleplay.findByIdAndUpdate(
            id,
            { $set: { [`${teamSide}.score`]: score } },
            { new: true, runValidators: true }
        )
            .populate('leagueId', 'name sport')
            .populate('season', 'year status')
            .populate('teamOne.teamId', 'name logo')
            .populate('teamTwo.teamId', 'name logo')
            .populate('teamOne.playersStats.playerId', 'fullname picture jersey')
            .populate('teamTwo.playersStats.playerId', 'fullname picture jersey');

        if (!updatedRoleplay) {
            const respuesta = createResponse('error', 'Partido no encontrado', null);
            return res.status(404).json(respuesta);
        }

        const respuesta = createResponse('success', 'Score del equipo actualizado correctamente', updatedRoleplay);
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al actualizar el score del equipo', null);
        return res.status(500).json(respuesta);
    }
}

export const updateRoleplayStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['scheduled', 'in-progress', 'completed', 'postponed'].includes(status)) {
            const respuesta = createResponse('error', 'Estado no válido. Los valores permitidos son: scheduled, in-progress, completed, postponed', null);
            return res.status(400).json(respuesta);
        }

        const updatedRoleplay = await Roleplay.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        )
            .populate('leagueId', 'name sport')
            .populate('season', 'year status')
            .populate('teamOne.teamId', 'name logo')
            .populate('teamTwo.teamId', 'name logo')
            .populate('teamOne.playersStats.playerId', 'fullname picture jersey')
            .populate('teamTwo.playersStats.playerId', 'fullname picture jersey');

        if (!updatedRoleplay) {
            const respuesta = createResponse('error', 'Partido no encontrado', null);
            return res.status(404).json(respuesta);
        }

        const respuesta = createResponse('success', 'Estado del partido actualizado correctamente', updatedRoleplay);
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al actualizar el estado del partido', null);
        return res.status(500).json(respuesta);
    }
}

export const getRoleplaysByLeague = async (req, res) => {
    try {
        const { leagueId } = req.params;

        const roleplays = await Roleplay.find({ leagueId })
            .populate('leagueId', 'name sport')
            .populate('season', 'year status')
            .populate('teamOne.teamId', 'name logo')
            .populate('teamTwo.teamId', 'name logo')
            .populate('teamOne.playersStats.playerId', 'fullname picture jersey')
            .populate('teamTwo.playersStats.playerId', 'fullname picture jersey')
            .sort({ date: -1 });

        const respuesta = createResponse('success', 'Partidos de la liga obtenidos correctamente', roleplays);
        return res.status(200).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener los partidos de la liga', null);
        return res.status(500).json(respuesta);
    }
}

export const getRoleplaysByTeam = async (req, res) => {
    try {
        const { teamId } = req.params;

        const roleplays = await Roleplay.find({
            $or: [
                { 'teamOne.teamId': teamId },
                { 'teamTwo.teamId': teamId }
            ]
        })
            .populate('leagueId', 'name sport')
            .populate('season', 'year status')
            .populate('teamOne.teamId', 'name logo')
            .populate('teamTwo.teamId', 'name logo')
            .populate('teamOne.playersStats.playerId', 'fullname picture jersey')
            .populate('teamTwo.playersStats.playerId', 'fullname picture jersey')
            .sort({ date: -1 });

        const respuesta = createResponse('success', 'Partidos del equipo obtenidos correctamente', roleplays);
        return res.status(200).json(respuesta);
    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener los partidos del equipo', null);
        return res.status(500).json(respuesta);
    }
}


// TODO corregisr la generación automática
export const generateLeagueRoleplays = async (req, res) => {
    try {
        const { leagueId, seasonId, startDate, matchIntervalDays = 7 } = req.body;

        // Validaciones básicas
        if (!leagueId) {
            const respuesta = createResponse('error', 'leagueId es requerido', null);
            return res.status(400).json(respuesta);
        }

        // Verificar que la liga existe
        const league = await League.findById(leagueId);
        if (!league) {
            const respuesta = createResponse('error', 'La liga especificada no existe', null);
            return res.status(404).json(respuesta);
        }

        //Verificar que la temporada existe si se proporciona
        const season = await Season.findById(seasonId);
        if (!season) {
            const respuesta = createResponse('error', 'La temporada especificada no existe', null);
            return res.status(404).json(respuesta);
        }

        // Obtener todos los equipos de la liga
        const teams = await Team.find({ _id: { $in: season.teams || [] } });

        if (teams.length < 2) {
            const respuesta = createResponse('error', 'La liga debe tener al menos 2 equipos para generar partidos', null);
            return res.status(400).json(respuesta);
        }

        // Generar todas las combinaciones posibles de partidos (todos contra todos)
        const fixtures = generateRoundRobinFixtures(teams);

        // Si se proporciona una fecha de inicio, programar los partidos
        let scheduledFixtures = [];
        if (startDate) {
            scheduledFixtures = scheduleFixtures(fixtures, new Date(startDate), matchIntervalDays);
        } else {
            scheduledFixtures = fixtures.map(fixture => ({
                ...fixture,
                date: null
            }));
        }

        // Crear los partidos en la base de datos
        const createdRoleplays = [];

        for (const fixture of scheduledFixtures) {
            const newRoleplay = new Roleplay({
                leagueId,
                season: seasonId || null,
                teamOne: {
                    teamId: fixture.homeTeam._id,
                    score: 0,
                    playersStats: []
                },
                teamTwo: {
                    teamId: fixture.awayTeam._id,
                    score: 0,
                    playersStats: []
                },
                date: fixture.date,
                status: fixture.date ? 'scheduled' : 'scheduled',
                officials: []
            });

            const roleplaySaved = await newRoleplay.save();
            await roleplaySaved.populate([
                { path: 'leagueId', select: 'name sport' },
                { path: 'season', select: 'year status' },
                { path: 'teamOne.teamId', select: 'name logo' },
                { path: 'teamTwo.teamId', select: 'name logo' }
            ]);

            createdRoleplays.push(roleplaySaved);
        }

        const respuesta = createResponse('success', `Se generaron ${createdRoleplays.length} partidos para la liga`, createdRoleplays);
        return res.status(201).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', error.message, null);
        return res.status(500).json(respuesta);
    }
}

// Función para generar el formato todos contra todos (round-robin)
const generateRoundRobinFixtures = (teams) => {
    const fixtures = [];
    const teamCount = teams.length;

    // Si el número de equipos es impar, agregar un "bye" (descanso)
    const hasBye = teamCount % 2 !== 0;
    const totalRounds = hasBye ? teamCount : teamCount - 1;
    const matchesPerRound = Math.floor(teamCount / 2);

    // Crear array de equipos (si es impar, agregar null para el bye)
    const teamArray = [...teams];
    if (hasBye) {
        teamArray.push(null);
    }

    // Generar rondas
    for (let round = 0; round < totalRounds; round++) {
        const roundFixtures = [];

        for (let i = 0; i < matchesPerRound; i++) {
            const homeIndex = i;
            const awayIndex = teamArray.length - 1 - i;

            // Saltar si alguno de los equipos es el "bye"
            if (teamArray[homeIndex] && teamArray[awayIndex]) {
                // Alternar localía entre rondas
                if (round % 2 === 0) {
                    roundFixtures.push({
                        homeTeam: teamArray[homeIndex],
                        awayTeam: teamArray[awayIndex]
                    });
                } else {
                    roundFixtures.push({
                        homeTeam: teamArray[awayIndex],
                        awayTeam: teamArray[homeIndex]
                    });
                }
            }
        }

        fixtures.push(...roundFixtures);

        // Rotar equipos (excepto el primero)
        const fixedTeam = teamArray[0];
        const rotatingTeams = teamArray.slice(1);
        rotatingTeams.unshift(rotatingTeams.pop());
        teamArray.length = 0;
        teamArray.push(fixedTeam, ...rotatingTeams);
    }

    return fixtures;
}

// Función para programar las fechas de los partidos
const scheduleFixtures = (fixtures, startDate, intervalDays) => {
    const scheduledFixtures = [];
    let currentDate = new Date(startDate);

    for (const fixture of fixtures) {
        scheduledFixtures.push({
            ...fixture,
            date: new Date(currentDate)
        });

        // Avanzar la fecha según el intervalo
        currentDate.setDate(currentDate.getDate() + intervalDays);
    }

    return scheduledFixtures;
}

// Función adicional para generar partidos con formato específico (opcional)
export const generateCustomRoleplays = async (req, res) => {
    try {
        const { leagueId, seasonId, format = 'round-robin', startDate, matchIntervalDays = 7 } = req.body;

        if (!leagueId) {
            const respuesta = createResponse('error', 'leagueId es requerido', null);
            return res.status(400).json(respuesta);
        }

        const league = await League.findById(leagueId);
        if (!league) {
            const respuesta = createResponse('error', 'La liga especificada no existe', null);
            return res.status(404).json(respuesta);
        }

        const teams = await Team.find({ _id: { $in: league.teams || [] } });

        if (teams.length < 2) {
            const respuesta = createResponse('error', 'La liga debe tener al menos 2 equipos para generar partidos', null);
            return res.status(400).json(respuesta);
        }

        let fixtures = [];

        switch (format) {
            case 'round-robin':
                fixtures = generateRoundRobinFixtures(teams);
                break;
            case 'double-round-robin':
                // Ida y vuelta
                const firstLeg = generateRoundRobinFixtures(teams);
                const secondLeg = firstLeg.map(fixture => ({
                    homeTeam: fixture.awayTeam,
                    awayTeam: fixture.homeTeam
                }));
                fixtures = [...firstLeg, ...secondLeg];
                break;
            case 'single-elimination':
                // Eliminación directa (para torneos)
                fixtures = generateSingleEliminationFixtures(teams);
                break;
            default:
                fixtures = generateRoundRobinFixtures(teams);
        }

        // Programar fechas si se proporciona startDate
        let scheduledFixtures = [];
        if (startDate) {
            scheduledFixtures = scheduleFixtures(fixtures, new Date(startDate), matchIntervalDays);
        } else {
            scheduledFixtures = fixtures.map(fixture => ({
                ...fixture,
                date: null
            }));
        }

        // Crear partidos en la base de datos
        const createdRoleplays = [];

        for (const fixture of scheduledFixtures) {
            const newRoleplay = new Roleplay({
                leagueId,
                season: seasonId || null,
                teamOne: {
                    teamId: fixture.homeTeam._id,
                    score: 0,
                    playersStats: []
                },
                teamTwo: {
                    teamId: fixture.awayTeam._id,
                    score: 0,
                    playersStats: []
                },
                date: fixture.date,
                status: 'scheduled',
                officials: []
            });

            const roleplaySaved = await newRoleplay.save();
            await roleplaySaved.populate([
                { path: 'leagueId', select: 'name sport' },
                { path: 'season', select: 'year status' },
                { path: 'teamOne.teamId', select: 'name logo' },
                { path: 'teamTwo.teamId', select: 'name logo' }
            ]);

            createdRoleplays.push(roleplaySaved);
        }

        const respuesta = createResponse('success', `Se generaron ${createdRoleplays.length} partidos con formato ${format}`, createdRoleplays);
        return res.status(201).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', error.message, null);
        return res.status(500).json(respuesta);
    }
}

// Función para generar formato de eliminación directa
const generateSingleEliminationFixtures = (teams) => {
    const fixtures = [];
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5); // Mezclar equipos

    let currentRoundTeams = shuffledTeams;

    while (currentRoundTeams.length > 1) {
        const nextRoundTeams = [];

        for (let i = 0; i < currentRoundTeams.length; i += 2) {
            if (i + 1 < currentRoundTeams.length) {
                fixtures.push({
                    homeTeam: currentRoundTeams[i],
                    awayTeam: currentRoundTeams[i + 1]
                });
                // En eliminación directa, no especificamos quién avanza
            }
        }

        currentRoundTeams = nextRoundTeams;
    }

    return fixtures;
}

// Función para eliminar todos los partidos de una liga (útil para regenerar)
export const deleteLeagueRoleplays = async (req, res) => {
    try {
        const { leagueId } = req.params;

        const result = await Roleplay.deleteMany({ leagueId });

        const respuesta = createResponse('success', `Se eliminaron ${result.deletedCount} partidos de la liga`, {
            deletedCount: result.deletedCount
        });
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al eliminar los partidos de la liga', null);
        return res.status(500).json(respuesta);
    }
}

// Función para obtener el calendario generado de una liga
export const getLeagueSchedule = async (req, res) => {
    try {
        const { leagueId } = req.params;

        const roleplays = await Roleplay.find({ leagueId })
            .populate('leagueId', 'name sport')
            .populate('season', 'year status')
            .populate('teamOne.teamId', 'name logo')
            .populate('teamTwo.teamId', 'name logo')
            .sort({ date: 1 });

        const respuesta = createResponse('success', 'Calendario de la liga obtenido correctamente', roleplays);
        return res.status(200).json(respuesta);

    } catch (error) {
        const respuesta = createResponse('error', 'Error al obtener el calendario de la liga', null);
        return res.status(500).json(respuesta);
    }
}