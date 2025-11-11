import mongoose from "mongoose";

const roleplaySchema = mongoose.Schema({
    leagueId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    season: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Season'
    },
    teamOne: {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
        },
        score: { type: Number, default: 0 },
        playersStats: [
            {
                playerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Player',
                },
                points: { type: Number, default: 0 },
            }
        ]
    },
    teamTwo: {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
        },
        score: { type: Number, default: 0 },
        playersStats: [
            {
                playerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Player',
                },
                points: { type: Number, default: 0 },
            }
        ]
    },
    date: {
        type: Date,
    },
    status: {
        type: String,
        enum: {
            values: ["scheduled", "in-progress", "completed", "postponed"],
            message: '{VALUE} is not supported'
        }
    },
    officials: [String]
});

const Roleplay = mongoose.model("Roleplay", roleplaySchema);

export default Roleplay;