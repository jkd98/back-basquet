import mongoose from "mongoose";

export const tokenTypes = {
    PASSWORD_RESET: "password_reset",
    ACCOUNT_CONFIRMATION: "account_confirmation",
    TWO_FACTOR: "two_factor",
};


const tokenSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        code: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        used: { type: Boolean, required: true },
        typeCode: {
            type: String,
            required: true,
            enum: Object.values(tokenTypes) // Solo valores permitidos
        },
    },
    {
        timestamps: true
    }
);

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const Token = mongoose.model("token", tokenSchema);


export default Token;