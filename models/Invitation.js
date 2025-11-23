import mongoose from "mongoose";


const invitationSchema = mongoose.Schema({
    seasonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Season'
    },
    code:{
        type: String,
        required: true,
        unique: true
    },
    expireAt: {
        type: Date,
        required: true
    }
});

const Invitation = mongoose.model('Invitation',invitationSchema);

export default Invitation;