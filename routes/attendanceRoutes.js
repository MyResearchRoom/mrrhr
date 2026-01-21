//final
const express = require("express");
const {
  checkIn,
  checkOut,
  getAllAttendanceList,
  getEmployeeAttendanceOfWeek,
  getTodaysAttendanceCount,
  getEmployeeAttendanceById,
  getCheckInTime,
  getMonthlyAttendanceCountOfEmployee,
} = require("../controllers/attendanceController");
const authenticate = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/checkIn", authenticate(["EMPLOYEE"]), checkIn);

router.post("/checkOut", authenticate(["EMPLOYEE"]), checkOut);

router.get("/getCheckInTime", authenticate(["EMPLOYEE"]), getCheckInTime);

router.get(
  "/getAllAttendanceList",
  authenticate(["HR_EMPLOYEE", "HR_MANAGER"]),
  getAllAttendanceList
);

router.get(
  "/getEmployeeAttendanceById/:id",
  authenticate(["HR_EMPLOYEE", "HR_MANAGER","EMPLOYEE"]),
  getEmployeeAttendanceById
);

router.get(
  "/getEmployeeAttendanceOfWeek",
  authenticate(["EMPLOYEE"]),
  getEmployeeAttendanceOfWeek
);

router.get(
  "/getTodaysAttendanceCount",
  authenticate(["HR_EMPLOYEE", "HR_MANAGER"]),
  getTodaysAttendanceCount
);

router.get(
  "/getMonthlyAttendanceCountOfEmployee/:id",
  authenticate(["HR_EMPLOYEE", "HR_MANAGER"]),
  getMonthlyAttendanceCountOfEmployee
);

module.exports = router;
