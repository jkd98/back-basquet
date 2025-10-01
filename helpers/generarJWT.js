import jwt from "jsonwebtoken";

export const generarJWT = (datos) => jwt.sign(datos, process.env.JWT_SECRET, { expiresIn: '5h' });

