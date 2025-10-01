import { body } from 'express-validator';

export const validarRegistro = [
  // Sanitiza y valida 'name' (elimina espacios, verifica que no esté vacío)
  body('name')
    .trim() // Elimina espacios al inicio/final
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    
  // Valida 'lastN' (apellido)
  body('lastN')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres'),
    
  // Valida 'email'
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(), // Convierte a minúsculas y limpia formato
    
  // Valida 'pass' (contraseña)
  body('pass')
    .trim()
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe contener al menos una mayúscula')
    .matches(/[0-9]/).withMessage('Debe contener al menos un número')
    .matches(/[-_!@#$%^&*()+={};:,.<>?~]/).withMessage('Debe contener un carácter especial').custom((value) => {
    if (value.includes("'")) {
      throw new Error('La contraseña no puede contener comillas simples');
    }
    return true;
  })
];

export const validConfirmAccount = [    
  // Valida 'email'
  body('token')
    .trim()
    .notEmpty().withMessage('El token es obligatorio')
];

export const validarNuevoTknConfirm = [    
  // Valida 'email'
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(), // Convierte a minúsculas y limpia formato

];

export const validarLogin = [
  // Valida 'email'
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(), // Convierte a minúsculas y limpia formato
    
  // Valida 'pass' (contraseña)
  body('pass')
    .trim()
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
];

export const validarNwPass = [
  body('pass')
    .trim()
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe contener al menos una mayúscula')
    .matches(/[0-9]/).withMessage('Debe contener al menos un número')
    .matches(/[-_!@#$%^&*()+={};:,.<>?~]/).withMessage('Debe contener un carácter especial'),
];