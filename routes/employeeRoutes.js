const express = require("express");
const {
  hrManagerRegistration,
  employeeRegistration,
  getEmployee,
  getEmployeeById,
  getUser,
  getMe,
  getHre,
  getEmployees,
  verifyEmployee,
  getStats,
  updateEmployee,
  getUserInfo,
  employeeCredentialRegistration,
  empRegistrationByEmp,
  updateEmpByHR,
} = require("../controllers/employeeController");
const { hrmValidationRules } = require("../validations/hrmValidations");
const {
  validateFiles,
  validateFilesForUpdate,
} = require("../middlewares/fileValidation");
const {
  employeeValidationRules,
  employeeUpdateValidationRules,
} = require("../validations/employeeValidations");
const { validate } = require("../middlewares/validations");
const { upload } = require("../middlewares/upload");
const separateFilesByField = require("../middlewares/separateFilesByField");
const authenticate = require("../middlewares/authMiddleware");
const hasPermission = require("../middlewares/hasPermission");

const router = express.Router();

router.post(
  "/hrm-registration",
  upload.fields([{ name: "profilePicture", maxCount: 1 }]),
  validateFiles,
  hrmValidationRules,
  validate,
  hrManagerRegistration
);

router.post(
  "/employee-registration",
  upload.fields([{ name: "profilePicture", maxCount: 1 }]),
  validateFiles,
  hrmValidationRules,
  validate,
  employeeCredentialRegistration
);

router.post(
  "/registration",
  upload.any(),
  separateFilesByField,
  validateFiles,
  // employeeValidationRules,
  // validate,
  authenticate(["HR_MANAGER", "HR_EMPLOYEE"]),
  employeeRegistration
);

router.post(
  "/hr/registration",
  upload.any(),
  separateFilesByField,
  validateFiles,
  // employeeValidationRules,
  // validate,
  authenticate(["HR_MANAGER", "HR_EMPLOYEE"]),
  employeeRegistration
);

router.put(
  "/:employeeId",
  upload.fields([
    { name: "aadharDoc" },
    { name: "panDoc" },
    { name: "profilePicture" },
    { name: "passbookDoc" },
    { name: "relivingLetter" },
  ]),
  validateFilesForUpdate,
  // employeeUpdateValidationRules,
  // validate,
  authenticate(["HR_MANAGER", "HR_EMPLOYEE"]),
  // hasPermission("employee"),
  updateEmployee
);

router.get(
  "/:employeeId/details",
  authenticate(["HR_MANAGER", "HR_EMPLOYEE"]),
  getEmployee
);

router.get(
  "/details",
  authenticate(["HR_EMPLOYEE", "EMPLOYEE"]),
  getEmployeeById
);

router.get(
  "/:employeeId/user",
  authenticate(["HR_MANAGER", "HR_EMPLOYEE", "EMPLOYEE"]),
  getUser
);

router.get(
  "/me",
  authenticate(["HR_MANAGER", "HR_EMPLOYEE", "EMPLOYEE"]),
  getMe
);

router.get("/hre", authenticate(["HR_MANAGER"]), getHre);

router.get(
  "/",
  authenticate(["HR_MANAGER", "HR_EMPLOYEE"]),
  hasPermission("employee"),
  getEmployees
);

router.post(
  "/verify/:employeeId",
  authenticate(["HR_MANAGER"]),
  verifyEmployee
);

router.get("/stats", authenticate(["HR_MANAGER", "HR_EMPLOYEE"]), getStats);

router.get(
  "/getUserInfo",
  authenticate(["HR_MANAGER", "HR_EMPLOYEE", "EMPLOYEE"]),
  getUserInfo
);


//new by JB 01-03-2026

router.post(
  "/emp-add",
  upload.any(),
  separateFilesByField,
  validateFiles,
  authenticate(["EMPLOYEE","HR_EMPLOYEE"]),
  empRegistrationByEmp
);

router.patch(
  "/emp-info-addByHR",
  authenticate(["HR_MANAGER", "HR_EMPLOYEE"]),
  updateEmpByHR
);


module.exports = router;
