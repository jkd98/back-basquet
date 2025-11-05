import { body } from 'express-validator';

export const validateUserRegistration = [
  // Sanitiza y valida 'name' (elimina espacios, verifica que no esté vacío)
  body('fullname')
    .trim()
    .escape()
    .notEmpty().withMessage('El nombre es obligatorio')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/).withMessage('El nombre solo puede contener letras y espacios')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
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

export const validateCode = [
  // Valida 'email'
  body('code')
    .trim()
    .escape()
    .notEmpty().withMessage('El código es obligatorio')
    .isNumeric().withMessage('Solo se admiten números')
    .isLength({ min: 6, max: 6 }).withMessage('El código debe de tener 6 digitos')

];

export const validateRequestConfirmationCode = [
  // Valida 'email'
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(), // Convierte a minúsculas y limpia formato
];

export const validateLogin = [
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
];

export const validateEmail = [
  // Valida 'email'
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(), // Convierte a minúsculas y limpia formato
];

export const validateNewPass = [
  body('pass')
    .trim()
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe contener al menos una mayúscula')
    .matches(/[0-9]/).withMessage('Debe contener al menos un número')
    .matches(/[-_!@#$%^&*()+={};:,.<>?~]/).withMessage('Debe contener un carácter especial'),
  body('code')
    .trim()
    .escape()
    .notEmpty().withMessage('El código es obligatorio')
    .isNumeric().withMessage('Solo se admiten números')
    .isLength({ min: 6, max: 6 }).withMessage('El código debe de tener 6 digitos')
];