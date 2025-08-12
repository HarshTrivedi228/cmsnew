const { body } = require('express-validator');

const loginValidation = [
  body('username')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Username must be between 1 and 20 characters long'),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password must be at least 5 characters long')
];




module.exports = {loginValidation};
