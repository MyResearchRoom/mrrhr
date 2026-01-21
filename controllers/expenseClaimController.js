//final
const { where, Op } = require("sequelize");
const { User, Employee, ExpenseClaim, ExpenseLimit } = require("../models");
const { generateClaimId } = require("../utils/idGenerator");

exports.addExpenseClaim = async (req, res) => {
  try {
    const userId = req.user?.id;

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
    const roleId = employee.roleId;

    const {
      expenseTitle,
      date,
      category,
      description,
      amount,
      paymentMethod,
      notes,
      status,
    } = req.body;

    const receipt = req.file;

    if (
      !expenseTitle ||
      !date ||
      !category ||
      !description ||
      !amount ||
      !paymentMethod ||
      !notes
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill the required fields.",
      });
    }

    const expenseLimit = await ExpenseLimit.findOne({
      where: { roleId },
    });

    if (!expenseLimit) {
      return res.status(404).json({
        success: false,
        message: "Expense limit not set for this role.",
      });
    }

    const structure = expenseLimit.expenseStructure.find(
      (item) => item.category === category
    );

    if (!structure) {
      return res.status(400).json({
        success: false,
        message: `No limit defined for category "${category}" under this role.`,
      });
    }

    if (parseFloat(amount) > parseFloat(structure.limit)) {
      return res.status(400).json({
        success: false,
        message: `Claim amount exceeds the allowed limit of ₹${structure.limit} for "${category}".`,
      });
    }

    const newClaim = await ExpenseClaim.create({
      claimId: generateClaimId(),
      employeeId,
      expenseTitle,
      date,
      category,
      description,
      amount,
      paymentMethod,
      notes,
      receipt: receipt.buffer,
      status: status || "pending",
      rejectReason: "",
    });

    res.status(200).json({
      success: true,
      message: "Expense Claim submitted successfully.",
      data: newClaim,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to submit Expense Claim.",
    });
  }
};

exports.getAllExpenseClaim = async (req, res) => {
  try {
    const { status, category, date, page = 1, searchTerm } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (category) {
      whereClause.category = category;
    }

    if (date) {
      whereClause.date = date;
    }

    if (searchTerm && searchTerm.trim() !== "") {
      whereClause[Op.or] = [
        { id: { [Op.like]: `%${searchTerm}%` } },
        { "$user.name$": { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    const claims = await ExpenseClaim.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["userId"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      limit,
      offset,
    });

    const total = await ExpenseClaim.count({ where: whereClause });

    const claimData = claims.map((claim) => {
      const data = claim.toJSON();
      return {
        ...data,
        receipt: data.receipt
          ? `data:application/pdf;base64,${data.receipt.toString("base64")}`
          : null,
        id: data.employee?.userId || null,
        name: data.employee?.user?.name || "",
      };
    });

    res.status(200).json({
      success: true,
      message: "Expense Claims retrieved successfully.",
      data: claimData,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        perPage: limit,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve Expense Claims.",
    });
  }
};

exports.approveExpenseClaim = async (req, res) => {
  try {
    const { id: claimId } = req.params;
    const claim = await ExpenseClaim.findOne({ where: { claimId } });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Expense Claim not found.",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending claims can be approved.",
      });
    }

    // change status to approved
    claim.status = "approved";
    await claim.save();

    res.status(200).json({
      success: true,
      message: "Expense Claim approved successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to approve Expense Claim.",
    });
  }
};

exports.recjectExpenseClaim = async (req, res) => {
  try {
    const { id: claimId } = req.params;
    const { rejectReason } = req.body;

    if (!rejectReason) {
      return res.status(400).json({
        success: false,
        message: "Reject Reason is required.",
      });
    }
    const claim = await ExpenseClaim.findOne({ where: { claimId } });
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Expense Claim not found.",
      });
    }
    if (claim.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending claims can be rejected.",
      });
    }

    claim.status = "rejected";
    claim.rejectReason = rejectReason;
    await claim.save();

    res.status(200).json({
      success: true,
      message: "Expense Claim rejected.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to reject Expense Claim.",
    });
  }
};

exports.reclaimExpenseClaim = async (req, res) => {
  try {
    const { id: claimId } = req.params;
    const {
      expenseTitle,
      date,
      category,
      description,
      amount,
      paymentMethod,
      notes,
    } = req.body;
    const receipt = req.file;

    const claim = await ExpenseClaim.findOne({ where: { claimId } });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Expense Claim not found.",
      });
    }
    if (claim.status !== "rejected") {
      return res.status(400).json({
        success: false,
        message: "Only rejected claims can be reclaimed.",
      });
    }

    claim.expenseTitle = expenseTitle || claim.expenseTitle;
    claim.date = date || claim.date;
    claim.category = category || claim.category;
    claim.description = description || claim.description;
    claim.amount = amount || claim.amount;
    claim.paymentMethod = paymentMethod || claim.paymentMethod;
    claim.notes = notes || claim.notes;

    if (receipt) {
      claim.receipt = receipt.buffer;
    }

    claim.status = "pending";
    claim.rejectReason = "";
    await claim.save();

    res.status(200).json({
      success: true,
      message: "Expense Claim reclaimed successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to reclaim expense claim.",
    });
  }
};

exports.reimburseExpenseClaim = async (req, res) => {
  try {
    const { id: claimId } = req.params;

    const claim = await ExpenseClaim.findOne({ where: { claimId } });
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Expense Claim not found.",
      });
    }

    if (claim.status !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Only approved claims can be reimbursed.",
      });
    }

    claim.status = "reimbursed";
    await claim.save();

    res.status(200).json({
      success: true,
      message: "Expense Claim reimbursed.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to reimburse Expense Claim.",
    });
  }
};

exports.deleteExpenseClaim = async (req, res) => {
  try {
    const { id: claimId } = req.params;

    const claim = await ExpenseClaim.findOne({ where: { claimId } });
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Expense Claim not found.",
      });
    }

    await claim.destroy();

    res.status(200).json({
      success: true,
      message: "Expense Claim deleted successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to delete Expense Claim.",
    });
  }
};

exports.getExpenseClaimCount = async (req, res) => {
  try {
    const totalClaims = await ExpenseClaim.count();
    const pendingClaims = await ExpenseClaim.count({
      where: { status: "pending" },
    });
    const approvedClaims = await ExpenseClaim.count({
      where: { status: "approved" },
    });
    const rejectedClaims = await ExpenseClaim.count({
      where: { status: "rejected" },
    });
    const reimbursedClaims = await ExpenseClaim.count({
      where: { status: "reimbursed" },
    });

    res.status(200).json({
      success: true,
      data: {
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        reimbursedClaims,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to get Expense Claim count.",
    });
  }
};

exports.getExpenseClaimOfEmployee = async (req, res) => {
  try {
    const { status, category, date, page = 1 } = req.query;

    const limit = 10;
    const offset = (page - 1) * limit;

    const userId = req.user.id;
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

    const whereClause = { employeeId: employee.id };


    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    if (date) whereClause.date = date;

    const claims = await ExpenseClaim.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["userId"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      limit,
      offset,
    });

    const total = await ExpenseClaim.count({ where: whereClause });

    const claimData = claims.map((claim) => {
      const data = claim.toJSON();
      return {
        ...data,
        receipt: data.receipt
          ? `data:application/pdf;base64,${data.receipt.toString("base64")}`
          : null,
        id: data.employee?.userId || null,
        name: data.employee?.user?.name || "",
      };
    });

    res.status(200).json({
      success: true,
      message: "Expense Claims retrieved successfully.",
      data: claimData,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        perPage: limit,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve Expense Claims.",
    });
  }
};

exports.getExpenseClaimCountOfEmployee = async (req, res) => {
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
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    const employeeId = employee.id;

    const totalClaims = await ExpenseClaim.count({ where: { employeeId } });
    const pendingClaims = await ExpenseClaim.count({
      where: { employeeId, status: "pending" },
    });
    const approvedClaims = await ExpenseClaim.count({
      where: { employeeId, status: "approved" },
    });
    const rejectedClaims = await ExpenseClaim.count({
      where: { employeeId, status: "rejected" },
    });
    const reimbursedClaims = await ExpenseClaim.count({
      where: { employeeId, status: "reimbursed" },
    });

    res.status(200).json({
      success: true,
      data: {
        employeeId,
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        reimbursedClaims,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to get expense claim count for employee.",
    });
  }
};

exports.getCategoryOfExpense = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // 1️⃣ Get employee
    const employee = await Employee.findOne({
      where: { userId },
      attributes: ["id", "roleId"],
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // 2️⃣ Get ALL expense limits for roleId
    const expenseLimits = await ExpenseLimit.findAll({
      where: { roleId: employee.roleId },
      attributes: ["expenseStructure"],
    });

    if (!expenseLimits.length) {
      return res.status(404).json({
        success: false,
        message: "No expense structure found for this role",
      });
    }

    // 3️⃣ Extract categories
    const categories = expenseLimits
      .flatMap(row => row.expenseStructure || [])
      .map(item => item.category)
      .filter(Boolean);

    // 4️⃣ Remove duplicates
    const uniqueCategories = [...new Set(categories)];

    return res.status(200).json({
      success: true,
      data: uniqueCategories,
    });

  } catch (err) {
    console.error("Error fetching expense categories:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to get expense claim category",
    });
  }
};
