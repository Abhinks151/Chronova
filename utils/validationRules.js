// utils/validationRules.js
import { body } from 'express-validator';


const validationSchemas = {
  firstName: body('firstName')
    .notEmpty().withMessage('First name is required')
    .isAlpha().withMessage('First name must contain only letters'),

  lastName: body('lastName')
    .optional({ checkFalsy: true })
    .isAlpha().withMessage('Last name must contain only letters'),

  email: body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),

  password: body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  confirmPassword: body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
};

function validate(fields = []) {
  return fields.map(field => validationSchemas[field]).filter(Boolean);
}

export default validate;
