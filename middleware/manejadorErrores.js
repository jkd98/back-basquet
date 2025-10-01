import { validationResult } from "express-validator";

import { Respuesta } from "../models/Respuesta.js";

// Middleware para manejar errores de validación
export const manejarErrores = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    let respuesta = new Respuesta();
    respuesta.status = 'error';
    respuesta.msg = 'Se detectaron campos con errores';
    respuesta.data = errores.array();
    return res.status(400).json(respuesta);
  }
  next();
};