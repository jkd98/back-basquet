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
    },
    status: {
        type: String,
        enum: ['pending', 'used', 'expired'],
        default: 'pending'
    },
    usedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    usedAt: {
        type: Date,
        default: null
    }
});

const Invitation = mongoose.model('Invitation',invitationSchema);

export default Invitation;