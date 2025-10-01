import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  nivel: { type: String, enum: ['info', 'warn', 'error'], required: true },
  mensaje: { type: String, required: true },
  usuario: { type: String }, // opcional: ID del usuario logueado
  ruta: { type: String }, // opcional: la ruta donde ocurrió
  ip: { type: String },
  fecha: { type: Date, default: Date.now }
});

const Log =  mongoose.model('Log', logSchema);
export default Log