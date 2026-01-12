const { check } = require("express-validator");

const paymentSlipValidationRules = [

  check("empId")
    .notEmpty()
    .withMessage("Employee ID is required.")
    .isInt({ gt: 0 })
    .withMessage("Employee ID must be a valid number."),

  check("month")
    .notEmpty()
    .withMessage("Month is required.")
    .isString()
    .withMessage("Month must be a string.")
    .trim(),

  check("year")
    .notEmpty()
    .withMessage("Year is required.")
    .isLength({ min: 4, max: 4 })
    .withMessage("Year must be 4 digits.")
    .isNumeric()
    .withMessage("Year must be numeric."),

];

module.exports = {
  paymentSlipValidationRules,
};
