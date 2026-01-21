const { Op, where } = require("sequelize");
const moment = require("moment-timezone");
const {
  Employee,
  User,
  Attendance,
  Designation,
  Department,
} = require("../models");
const { determineStatus } = require("../utils/determineAttendanceStatus");

exports.checkIn = async (req, res) => {
  try {
    // const { employeeId } = req.query;
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Employee ID is required." });
    }

    const employee = await Employee.findOne({ where: { userId } });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    const employeeId = employee.id;

    const today = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

    const alreadyChecked = await Attendance.findOne({
      where: { employeeId, date: today },
    });

    if (alreadyChecked && alreadyChecked.inTime) {
      return res.status(400).json({ message: "Already checked in." });
    }

    const istInTime = moment().tz("Asia/Kolkata").toDate();
    const officialCheckInMinutes = 9 * 60 + 15;
    const nowIST = moment().tz("Asia/Kolkata");
    const inTimeMinutes = nowIST.hours() * 60 + nowIST.minutes();

    const status = inTimeMinutes <= officialCheckInMinutes ? "on-time" : "late";


    const attendance = await Attendance.create({
      employeeId,
      date: today,
      inTime: istInTime,
      status,
    });

    res.status(200).json({
      success: true,
      message: "Checked in successfully.",
      // data: attendance,
      data: {
        ...attendance.toJSON(),
        inTime: moment(attendance.inTime)
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss"),
        createdAt: moment(attendance.createdAt)
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment(attendance.updatedAt)
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss"),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Checked in successfully.",
      data: response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Check-in.",
      error: error.message,
    });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Employee ID is required." });
    }

    const employee = await Employee.findOne({ where: { userId } });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    const employeeId = employee.id;

    const today = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

    const attendance = await Attendance.findOne({
      where: { employeeId, date: today },
    });

    if (!attendance || attendance.outTime) {
      return res
        .status(400)
        .json({ message: "Not checked in or already checked out." });
    }

    const inTime = moment(attendance.inTime, "HH:mm:ss");
    const outTime = moment().tz("Asia/Kolkata").format("HH:mm:ss");
    const checkOutMoment = moment(outTime, "HH:mm:ss");
    const totalHours = moment.duration(checkOutMoment.diff(inTime)).asHours();
    const status = determineStatus(attendance.inTime, outTime);

    attendance.outTime = outTime;
    // attendance.totalHours = totalHours.toFixed(2);
    const hours = Math.floor(totalHours);
    const minutes = Math.floor((totalHours - hours) * 60);
    attendance.totalHours = `${hours}h ${minutes}m`;
    attendance.status = status;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Checked out successfully.",
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to Check-out.",
    });
  }
};

exports.getCheckInTime = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const employee = await Employee.findOne({ where: { userId } });
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee not found.",
      });
    }
    const employeeId = employee.id;

    const today = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

    const attendance = await Attendance.findOne({
      where: {
        employeeId,
        date: today,
      },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "No check-in record found for today.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Check-in time retrieved successfully.",
      inTime: attendance.inTime,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get check-in time.",
    });
  }
};

// exports.getAllAttendanceList = async (req, res) => {
//     try {

//         const today = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

//         const attendanceList = await Attendance.findAll({ where: { date: today } });
//         res.status(200).json({
//             success: true,
//             message: "Attendance list retrieved successfully.",
//             data: attendanceList
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to retrieve attendance list.",
//         });
//     }
// };

exports.getAllAttendanceList = async (req, res) => {
  try {
    const { status, date, page = 1, searchTerm } = req.query;
    const today = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

    const limit = 10;
    const offset = (page - 1) * limit;

    const where = { date: date || today };
    if (status) where.status = status;

    if (searchTerm && searchTerm.length > 0) {
      where[Op.or] = [
        { "$user.name$": { [Op.like]: `%${searchTerm}%` } },
        { employeeId: { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    const rawData = await Attendance.findAll({
      where,
      limit,
      offset,
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["userId", "departmentId", "designationId", "status"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["name", "profilePicture"],
            },
            {
              model: Designation,
              as: "designation_",
              attributes: ["designation"],
            },
            {
              model: Department,
              as: "department",
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    const total = await Attendance.count({ where });

    const attendanceData = rawData.map((item) => ({
      id: item.employee?.userId || null,
      // employeeId: item.employeeId,
      name: item.employee?.user?.name || "",
      profilePicture:
        item.employee?.user?.profilePicture.toString("utf8") || null,
      departmentId: item.employee?.departmentId || null,
      departmentName: item.employee?.department?.name || "",
      designationId: item.employee?.designationId || null,
      designationName: item.employee?.designation_.designation || "",
      employeeStatus: item.employee?.status || "",
      date: item.date,
      inTime: item.inTime,
      outTime: item.outTime,
      totalHours: item.totalHours,
      status: item.status,
    }));

    res.status(200).json({
      success: true,
      message: "Attendance list retrieved successfully.",
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      perPage: limit,
      data: attendanceData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve attendance list.",
    });
  }
};

exports.getEmployeeAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { fromDate, toDate } = req.query;

    const employee = await Employee.findOne({
      where: { userId: id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "profilePicture"],
        },
        {
          model: Designation,
          as: "designation_",
          attributes: ["id", "designation"],
        },
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    const whereClause = { employeeId: employee.id };

    if (fromDate && toDate) {
      whereClause.date = {
        [Op.between]: [fromDate, toDate],
      };
    } else {
      const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
      const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");
      whereClause.date = {
        [Op.between]: [startOfMonth, endOfMonth],
      };
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      order: [["date", "ASC"]],
    });

    const attendanceData = attendance.map((record) => ({
      date: moment(record.date).format("D MMM YYYY"),
      inTime: record.inTime || "--",
      outTime: record.outTime || "--",
      status: record.status,
      totalHours: record.totalHours || "--",
    }));

    res.status(200).json({
      success: true,
      message: "Attendance data retrieved.",
      employeeData: {
        id: employee.userId,
        name: employee.user?.name || "",
        profilePicture: employee.user?.profilePicture.toString("utf8") || null,
        designation_: {
          designationId: employee.designation_.id || "",
          designation: employee.designation_?.designation || "",
        },
        department: employee.department?.name || "",
      },
      attendanceData: attendanceData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve attendance data.",
    });
  }
};

// exports.getEmployeeAttendanceOfWeek = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required.",
//       });
//     }

//     const employee = await Employee.findOne({ where: { userId } });

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found.",
//       });
//     }

//     const employeeId = employee.id;

//     const today = moment().tz("Asia/Kolkata");
//     const startOfWeek = today
//       .clone()
//       .startOf("week")
//       .add(1, "day")
//       .format("YYYY-MM-DD");
//     const endOfWeek = today
//       .clone()
//       .endOf("week")
//       .add(1, "day")
//       .format("YYYY-MM-DD");

//     const attendance = (
//       await Attendance.findAll({
//         where: {
//           employeeId,
//           date: {
//             [Op.between]: [startOfWeek, endOfWeek],
//           },
//         },
//       })
//     ).map((record) => {
//         const dayName = moment(record.date).format("dddd");

//         return {
//           ...record.toJSON(),
//           day: dayName,
//           status:
//             dayName === "Saturday" || dayName === "Sunday"
//               ? "Weekend"
//               : record.status,
//         };
//       });

//     return res.status(200).json({
//       success: true,
//       message: "Current Week Attendance List retrieved successfully.",
//       weekRange: { from: startOfWeek, to: endOfWeek },
//       data: attendance,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to retrieve Current Week Attendance List.",
//     });
//   }
// };

exports.getEmployeeAttendanceOfWeek = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const employee = await Employee.findOne({ where: { userId } });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }

    const employeeId = employee.id;

    // Current date in IST
    const today = moment().tz("Asia/Kolkata");

    // Start of week (Monday) and end of week (Sunday)
    const startOfWeek = today.clone().startOf("week").add(1, "day"); // Monday
    const endOfWeek = today.clone().endOf("week").add(1, "day"); // Sunday

    const attendanceRecords = await Attendance.findAll({
      where: {
        employeeId,
        date: {
          [Op.between]: [
            startOfWeek.format("YYYY-MM-DD"),
            endOfWeek.format("YYYY-MM-DD"),
          ],
        },
      },
    });

    // const attendance = attendanceRecords.map((record) => {
    //   // Convert record.date to IST
    //   const recordDateIST = moment(record.date).tz("Asia/Kolkata");
    //   const dayName = recordDateIST.format("dddd");

    //   return {
    //     ...record.toJSON(),
    //     date: recordDateIST.format("YYYY-MM-DD"), // formatted in IST
    //     day: dayName,
    //     status: dayName === "Saturday" || dayName === "Sunday" ? "Weekend" : record.status,
    //   };
    // });

    const attendance = attendanceRecords.map((record) => {
  // Convert date to IST
  const recordDateIST = moment.utc(record.date).tz("Asia/Kolkata");
  const dayName = recordDateIST.format("dddd");

  return {
    ...record.toJSON(),
    date: recordDateIST.format("YYYY-MM-DD"), // corrected date
    day: dayName,
    status: dayName === "Saturday" || dayName === "Sunday" ? "Weekend" : record.status,
    inTime: record.inTime,   // keep inTime as-is
    outTime: record.outTime,
  };
});

    return res.status(200).json({
      success: true,
      message: "Current Week Attendance List retrieved successfully.",
      weekRange: { from: startOfWeek.format("YYYY-MM-DD"), to: endOfWeek.format("YYYY-MM-DD") },
      data: attendance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve Current Week Attendance List.",
    });
  }
};


exports.getTodaysAttendanceCount = async (req, res) => {
  try {
    const today = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

    const onTimeCount = await Attendance.count({
      where: { status: "on-time", date: today },
    });
    const absentCount = await Attendance.count({
      where: { status: "absent", date: today },
    });
    const lateCount = await Attendance.count({
      where: { status: "late", date: today },
    });
    const overTimeCount = await Attendance.count({
      where: { status: "over-time", date: today },
    });
    const halfDayCount = await Attendance.count({
      where: { status: "half-day", date: today },
    });

    const presentCount = onTimeCount + lateCount + overTimeCount;

    res.status(200).json({
      success: true,
      message: "Attendance Count retrieved successfully.",
      data: {
        presentCount,
        onTimeCount,
        absentCount,
        lateCount,
        overTimeCount,
        halfDayCount,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve Attendance Count.",
    });
  }
};

exports.getMonthlyAttendanceCountOfEmployee = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const employee = await Employee.findOne({ where: { userId } });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    const employeeId = employee.id;

    const now = moment();
    const startOfMonth = now.clone().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = now.clone().endOf("month").format("YYYY-MM-DD");

    const attendanceRecords = await Attendance.findAll({
      where: {
        employeeId,
        date: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    let present = 0,
      absent = 0,
      late = 0;

    attendanceRecords.forEach((record) => {
      const status = record.status?.toLowerCase();

      if (["on-time", "over-time", "late"].includes(status)) present++;
      else if (status === "absent") absent++;
      else if (status === "late") late++;
    });

    return res.status(200).json({
      success: true,
      data: {
        present,
        absent,
        late,
        month: now.format("MMMM YYYY"),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance summary",
    });
  }
};
