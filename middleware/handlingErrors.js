import { validationResult } from "express-validator";

import { ServerResponse } from "../models/ServerResponse.js";

// Middleware para manejar errores de validación
export const handlingErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let respuesta = new ServerResponse();
    respuesta.status = 'error';
    respuesta.msg = errors.array().map(e => `\n${e.msg}\n`);
    respuesta.data = errors.array();
    return res.status(400).json(respuesta);
  }
  next();
};