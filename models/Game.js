import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    season: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Season',
        required: true
    },
    teamA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    teamB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    date: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'played', 'canceled'],
        default: 'pending'
    },
    scoreA: {
        type: Number,
        default: 0
    },
    scoreB: {
        type: Number,
        default: 0
    },
    round: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Game = mongoose.model('Game', gameSchema);
export default Game;
