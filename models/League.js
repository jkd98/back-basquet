import mongoose from "mongoose";

const leaguesSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    logo: { type: String }
});

const League = mongoose.model('League', leaguesSchema);

export default League;