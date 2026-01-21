// controllers/employeePaymentSlipController.js
const { EmployeePaymentSlip, 
        Employee,User,
        Department,
        Designation, 
        sequelize 
    } = require("../models");

exports.addEmployeePaymentSlip = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { empId, month, year } = req.body;

    if (!empId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "empId, month, year and paymentSlip are required",
      });
    }

    const employee = await Employee.findByPk(empId, { transaction });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const existingSlip = await EmployeePaymentSlip.findOne({
      where: { empId, month, year },
      transaction,
    });

    if (existingSlip) {
      return res.status(400).json({
        success: false,
        message: "Payslip already exists for this month and year",
      });
    }

    const slip = await EmployeePaymentSlip.create(
      {
        empId,
        month,
        year,
        // paymentSlip, 
        paymentSlip: req.files.paymentSlip
        ? `data:${
            req.files.paymentSlip[0].mimetype
          };base64,${req.files.paymentSlip[0].buffer.toString("base64")}`
        : null,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Payment slip added successfully",
      data: slip,
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Add Payment Slip Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllPaymentSlips = async (req, res) => {
  try {
    const {
      empId,
      month,
      year,
      page = 1,
      limit = 10,
    } = req.query;
    
    const offset = (page - 1) * limit;
    const role=req.user.role;

    const where = {};
    if (empId) where.empId = empId;

    if (month) {
      where.month = month.toLowerCase();
    }

    if (year) where.year = year;

    if (role === "EMPLOYEE") {
      where.isPublished = true;
    }

    console.log("where data",where);
    

    const { rows, count } = await EmployeePaymentSlip.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: [
            "id",
            "userId",
            "departmentId",
            "designationId",
            "ctc"
          ],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
            {
              model: Department,
              as: "department",
              attributes: ["id", "name"],
            },
            {
              model: Designation,
              as: "designation_",
              attributes: ["id", "designation"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "Payment slips retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get Payment Slips Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.publishPaymentSlip = async (req, res) => {
  const { paymentSlipId } = req.query;

  const paymentSlip = await EmployeePaymentSlip.findByPk(paymentSlipId);

  if (!paymentSlip) {
    return res.status(404).json({ success: false, message: "Payment slip not found" });
  }

  const isPublishing = !paymentSlip.isPublished;
  paymentSlip.isPublished=isPublishing;
  await paymentSlip.save();

  res.json({
    success: true,
    message: `Payemnt slip ${
        isPublishing ? "published" : "unpublished"
      } successfully.`,
  });
};

exports.deletePaymentSlip = async (req, res) => {
  try {
    const { paymentSlipId } = req.params;

    const paymentSlip = await EmployeePaymentSlip.findByPk(paymentSlipId);

    if (!paymentSlip) {
      return res.status(404).json({
        success: false,
        message: "Payment slip not found",
      });
    }

    await paymentSlip.destroy();

    res.status(200).json({
      success: true,
      message: "Payment slip deleted successfully",
    });
  } catch (error) {
    console.error("Delete Payment Slip Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


