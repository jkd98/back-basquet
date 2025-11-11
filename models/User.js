import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true,
            minLength: [2, "El nombre debe tener al menos 2 caracteres."]
        },
        pass: {
            type: String,
            required: true,
            trim: true,
            minLength: [8, "La contraseña debe tener al menos 8 caracteres."]
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email no válido"]
        },
        emailConfirm: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            default: 'Coach',
            enum: ['Coach', '4DMlN','Arbiter']
        },
        isLogged:{
            type:Boolean,
            required:true,
            default:false
        },
        policityAccepted:{
            type:Boolean,
            default:false
        },
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);
export default User;