const moment = require("moment");
const {
  getPayrollHistory,
  getMonthlyPayrollData,
  getCurrentMonthPayrollData,
  pays,
  getStats,
  getCurrentStats,
  getPayrollDetails,
  getPays,
} = require("../services/payrollService");

exports.getMonthlyPayrollData = async (req, res) => {
  try {
    const data = await getMonthlyPayrollData({
      month: req.query.month || moment().format("YYYY-MM"),
      departmentId: req.query.departmentId,
      status: req.query.status,
      searchTerm: req.query.searchTerm,
    });
    res
      .status(200)
      .json({ success: true, message: "Monthly Payroll Data", data });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getPayrollDetails = async (req, res) => {
  try {
    const data = await getPayrollDetails({ employeeId: req.params.employeeId });
    res.status(200).json({ success: true, message: "Payroll Details", data });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getPayrollHistory = async (req, res) => {
  try {
    const data = await getPayrollHistory({ employeeId: req.params.employeeId });
    res.status(200).json({ success: true, message: "Payroll History", data });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getCurrentMonthPayrollData = async (req, res) => {
  try {
    const data = await getCurrentMonthPayrollData({
      departmentId: req.query.departmentId,
      status: req.query.status,
      month: req.query.targetMonth,
      searchTerm: req.query.searchTerm,
    });
    res
      .status(200)
      .json({ success: true, message: "Monthly Payroll Data", data });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.pays = async (req, res) => {
  try {
    const { employeeIds, month } = req.body;

    if (!employeeIds || !month) {
      throw new Error("Employee IDs and month are required");
    }

    // Validate month format
    if (!moment(month, "YYYY-MM", true).isValid()) {
      throw new Error("Invalid month format. Use YYYY-MM");
    }

    const inputMonth = moment(month, "YYYY-MM");
    const currentMonth = moment().startOf("month");
    const isLastDayOfCurrentMonth = moment().isSame(
      moment().endOf("month"),
      "day"
    );

    // Allow only previous months OR current month if today is the last day
    if (inputMonth.isAfter(currentMonth)) {
      throw new Error("Future months are not allowed");
    }

    // if (inputMonth.isSame(currentMonth, "month") && !isLastDayOfCurrentMonth) {
    //   throw new Error(
    //     "Payroll for the current month is allowed only on the last day"
    //   );
    // }

    const result = await pays({ employeeIds, month });
    console.log("Pay data in controller",result);

    res.status(200).json({
      success: true,
      message: "Payment successful",
      data: result,
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getPays = async (req, res) => {
  try {
    const { month } = req.query;
    const pays = await getPays({
      month: month ? month : moment().format("YYYY-MM"),
    });

    res.status(200).json({
      success: true,
      message: "Payroll Pays",
      data: pays,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { month } = req.query;
    const stats = await getStats({
      month: month ? month : moment().format("YYYY-MM"),
    });

    res.status(200).json({
      success: true,
      message: "Payroll Stats",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getCurrentStats = async (req, res) => {
  try {
    const { month } = req.query;
    const stats = await getCurrentStats({
      month: month ? month : moment().format("YYYY-MM"),
    });
    res.status(200).json({
      success: true,
      message: "Payroll Stats for Current Month",
      data: stats,
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: error.message, success: false });
  }
};
