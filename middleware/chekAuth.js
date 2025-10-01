import jwt from "jsonwebtoken"
import Usuario from "../models/Usuario.js";

const checkAuth = async (req,res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.usuario = await Usuario.findById(decoded.userId)
            .select("-pass -confirmado -token -createdAt -updatedAt -__v"); // tener sesion con info del usuer
            return next();
        } catch (error) {
            return res.status(404).json({msg:"Hubo un error"});
        }
    };

    if(!token){
        const error = new Error("JWToken no válido");
        return res.status(401).json({msg:error.message});
    }
    
    next(); // avanza al sig middleware
}

export default checkAuth;