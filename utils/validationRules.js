// utils/validationRules.js
import { body } from 'express-validator';


const validationSchemas = {
  firstname: body('firstname')
    .notEmpty().withMessage('First name is required')
    .isAlpha().withMessage('First name must contain only letters'),

  lastname: body('lastname')
    .optional({ checkFalsy: true })
    .isAlpha().withMessage('Last name must contain only letters'),

  email: body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),
    
  password: body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isAlphanumeric().withMessage('Password must contain only letters and numbers'),

  confirmPassword: body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })

};

function validate(fields = []) {
  return fields.map(field => validationSchemas[field]).filter(Boolean);
}

export default validate;
