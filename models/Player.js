import mongoose from "mongoose";

playerSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    birthday: {
        type: Date,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    jersey:{
        type:Number,
        required:true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    }
});

const Player = mongoose.model("Player", playerSchema);

export default Player;