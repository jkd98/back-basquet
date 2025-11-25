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

invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const Invitation = mongoose.model('Invitation',invitationSchema);

export default Invitation;