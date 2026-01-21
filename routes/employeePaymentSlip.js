const express = require("express");
const router = express.Router();
// const { paymentSlipValidationRules } = require("../validators/paymentSlip.validator");
const { addEmployeePaymentSlip, getAllPaymentSlips, publishPaymentSlip, deletePaymentSlip } = require("../controllers/employeePaymentSlip");
const { validate } = require("../middlewares/validations");
const { paymentSlipValidationRules } = require("../validations/paymentSlip.validator");
const { upload } = require("../middlewares/upload");
const authenticate = require("../middlewares/authMiddleware");

router.post(
  "/upload-payment-slip",
  upload.fields([{ name: "paymentSlip", maxCount: 1 }]),
  paymentSlipValidationRules,
  validate,
  authenticate(["HR_MANAGER", "HR_EMPLOYEE"]),
  addEmployeePaymentSlip
);

router.get(
  "/getAllPaymentSlips",
  authenticate(["HR_MANAGER", "HR_EMPLOYEE","EMPLOYEE"]),
  getAllPaymentSlips
);

router.patch(
  "/changeStatus",
  authenticate(["HR_MANAGER", "HR_EMPLOYEE"]),
  publishPaymentSlip
);

router.delete(
  "/:paymentSlipId",
  authenticate(["HR_MANAGER", "HR_EMPLOYEE"]),
  deletePaymentSlip
);

module.exports = router;
module.exports = router;
