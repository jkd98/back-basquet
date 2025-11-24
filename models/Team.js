import mongoose from "mongoose";

const teamSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    coach: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    availabilityDays: [String],
    logo: {
        type: String,
        required: false,
        default: ''
    }
});

const Team = mongoose.model("Team", teamSchema);

export default Team;