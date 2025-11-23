import mongoose from "mongoose";


const seasonSchema = mongoose.Schema({
    league: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League'
    },
    year: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    status: {
        type: String,
        enum: {
            values: ["upcoming", "active", "completed", "cancelled"],
            message: '{VALUE} is not supported'
        }
    },
    teams: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team'
        }
    ],
    championTeamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    mvpPlayerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    weekMvplayerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    standings: [
        {
            teamId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Team'
            },
            position: { type: Number, default: 0 },
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
        }
    ],
});

const Season = mongoose.model("Season",seasonSchema);

export default Season;