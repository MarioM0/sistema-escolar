import { body, param, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Errores de validación",
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Validadores para auth
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
];

// Validadores para calificaciones
export const validateCreateCalificacion = [
  body('alumno_id')
    .isInt({ min: 1 })
    .withMessage('El ID del alumno debe ser un número válido'),
  body('materia_id')
    .isInt({ min: 1 })
    .withMessage('El ID de la materia debe ser un número válido'),
  body('maestro_id')
    .isInt({ min: 1 })
    .withMessage('El ID del maestro debe ser un número válido'),
  body('nota')
    .isFloat({ min: 0, max: 100 })
    .withMessage('La nota debe estar entre 0 y 100'),
  body('observaciones')
    .optional()
    .isString()
    .withMessage('Las observaciones deben ser texto'),
  handleValidationErrors
];

export const validateGetAlumnoById = [
  param('alumnoId')
    .isInt({ min: 1 })
    .withMessage('El ID del alumno debe ser un número válido'),
  handleValidationErrors
];

export const validateDeleteCalificacion = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número válido'),
  handleValidationErrors
];
