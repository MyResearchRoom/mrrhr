const {
  hrManagerRegistration,
  employeeRegistration,
  getEmployee,
  getMe,
  getHre,
  getEmployees,
  verifyEmployee,
  getStats,
  updateEmployee,
  getUserInfo,
  employeeCredentialRegistration,
} = require("../services/employeeService");

const { Employee ,Education, Experience,EmployeeSalaryStructure,sequelize} =require("../models");
const { getSalarySlab } = require("../services/salarySlabService");
const { validateQueryParams } = require("../utils/validateQueryParams");

exports.hrManagerRegistration = async (req, res) => {
  try {
    const { name, officialEmail, mobileNumber, password } = req.body;
    const user = await hrManagerRegistration({
      name,
      officialEmail,
      mobileNumber,
      password,
      profilePicture: req.files.profilePicture
        ? `data:${
            req.files.profilePicture[0].mimetype
          };base64,${req.files.profilePicture[0].buffer.toString("base64")}`
        : null,
    });
    res.status(201).json({
      message: "HR Manager Registered Successfully",
      data: user,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in HR Manager Registration", success: false });
  }
};

exports.employeeCredentialRegistration = async (req, res) => {
  try {
    const { name, officialEmail, mobileNumber, password,role } = req.body;
    const user = await employeeCredentialRegistration({
      name,
      officialEmail,
      mobileNumber,
      password,
      profilePicture: req.files.profilePicture
        ? `data:${
            req.files.profilePicture[0].mimetype
          };base64,${req.files.profilePicture[0].buffer.toString("base64")}`
        : null,
      role,
    });
    res.status(201).json({
      message: "Employee Registered Successfully",
      data: user,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Employee registration failed", success: false });
  }
};

exports.employeeRegistration = async (req, res) => {
  try {
    const {
      aadharDoc,
      panDoc,
      profilePicture,
      passbookDoc,
      experience,
      education,
      relivingLetter,
    } = req.files;

    //admin
    const salarySlab = await getSalarySlab(req.body.roleId, req.body.levelId);
    if (!salarySlab) {
      return res
        .status(404)
        .json({ message: "Invalid role or level", success: false });
    }

    const data = await employeeRegistration({
      ...req.body,
      role: req.url === "/registration" ? "EMPLOYEE" : "HR_EMPLOYEE",
      salarySlabId: salarySlab.id,
      aadharDoc: `data:${
        aadharDoc[0].mimetype
      };base64,${aadharDoc[0].buffer.toString("base64")}`,
      panDoc: `data:${panDoc[0].mimetype};base64,${panDoc[0].buffer.toString(
        "base64"
      )}`,
      profilePicture: `data:${
        profilePicture[0].mimetype
      };base64,${profilePicture[0].buffer.toString("base64")}`,
      passbookDoc: `data:${
        passbookDoc[0].mimetype
      };base64,${passbookDoc[0].buffer.toString("base64")}`,
      relivingLetter: `data:${
        relivingLetter[0].mimetype
      };base64,${relivingLetter[0].buffer.toString("base64")}`,
      experienceDoc: experience,
      educationDoc: education,
    });

    res.status(201).json({
      message: "Employee Registered Successfully",
      data,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { aadharDoc, panDoc, profilePicture, passbookDoc, relivingLetter } =
      req.files;

    const salarySlab = await getSalarySlab(req.body.roleId, req.body.levelId);
    if (!salarySlab) {
      return res
        .status(404)
        .json({ message: "Invalid role or level", success: false });
    }
    const data = await updateEmployee({
      ...req.body,
      employeeId: req.params.employeeId,
      salarySlabId: salarySlab.id,
      aadharDoc:
        aadharDoc?.length > 0
          ? `data:${
              aadharDoc[0].mimetype
            };base64,${aadharDoc[0].buffer.toString("base64")}`
          : null,
      panDoc:
        panDoc?.length > 0
          ? `data:${panDoc[0].mimetype};base64,${panDoc[0].buffer.toString(
              "base64"
            )}`
          : null,
      profilePicture:
        profilePicture?.length > 0
          ? `data:${
              profilePicture[0].mimetype
            };base64,${profilePicture[0].buffer.toString("base64")}`
          : null,
      passbookDoc:
        passbookDoc?.length > 0
          ? `data:${
              passbookDoc[0].mimetype
            };base64,${passbookDoc[0].buffer.toString("base64")}`
          : null,
      relivingLetter:
        relivingLetter?.length > 0
          ? `data:${
              relivingLetter[0].mimetype
            };base64,${relivingLetter[0].buffer.toString("base64")}`
          : null,
    });

    res.status(200).json({
      message: "Employee updated Successfully",
      data,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const data = await getEmployee({ employeeId });
    res.status(200).json({ success: true, message: "Employee Details", data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const data = await getEmployee({ employeeId });
    res.status(200).json({ success: true, message: "Employee Details", data });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getUser = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const data = await getMe({ employeeId });
    res.status(200).json({ success: true, message: "Employee Details", data });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getMe = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const data = await getMe({ employeeId });
    res.status(200).json({ success: true, message: "Employee Details", data });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getHre = async (req, res) => {
  try {
    const data = await getHre();
    res.status(200).json({ success: true, message: "HRE Details", data });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const { searchTerm } = validateQueryParams({ ...req.query });
    const data = await getEmployees({
      departmentId: req.query.departmentId,
      status: req.query.status,
      joiningDate: req.query.joiningDate,
      searchTerm,
    });
    res.status(200).json({ success: true, message: "Employees Details", data });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.verifyEmployee = async (req, res) => {
  try {
    if (!["active", "inactive"].includes(req.body.status)) {
      return res
        .status(400)
        .json({ message: "Invalid status", success: false });
    }
    const data = await verifyEmployee({
      employeeId: req.params.employeeId,
      status: req.body.status,
    });
    res.status(200).json({ success: true, message: "Employee Verified", data });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getStats = async (req, res) => {
  try {
    const data = await getStats();
    res.status(200).json({ success: true, message: "Statistics", data });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    await getUserInfo(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve employee information",
    });
  }
};


exports.empRegistrationByEmp = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      gender,
      dateOfBirth,
      email,
      uanNumber,
      aadharNumber,
      panNumber,
      presentAddress,
      permanentAddress,
      presentCountry,
      permanentCountry,
      presentState,
      permanentState,
      presentPostalCode,
      permanentPostalCode,
      totalExperience,
      lastWorkLocation,
      lastCompanyName,
      lastCtc,
      additionalInfo,
      accountHolderName,
      accountNumber,
      bankName,
      branchName,
      ifscCode,
      upiId,
      experience,
      education,
    } = req.body;

    // console.log("Frontend data",req.body);
    

    const eduParsed = education ? JSON.parse(education) : [];
    const expParsed = experience ? JSON.parse(experience) : [];

    const { 
      aadharDoc, 
      panDoc, 
      passbookDoc, 
      relivingLetter 
    } = req.files;

    const convertFileToBase64 = (file) =>
      file ? `data:${file[0].mimetype};base64,${file[0].buffer.toString("base64")}` : null;
    const getFileBuffer = (file) => (file ? file[0].buffer : null);

  const employeeData = {
      userId : req.user.id,
      gender,
      dateOfBirth,
      email,
      uanNumber,
      aadharNumber,
      aadharDoc: getFileBuffer(aadharDoc),
      panNumber,
      panDoc: getFileBuffer(panDoc),
      presentAddress,
      permanentAddress,
      presentCountry,
      permanentCountry,
      presentState,
      permanentState,
      presentPostalCode,
      permanentPostalCode,
      totalExperience,
      lastWorkLocation,
      lastCompanyName,
      lastCtc,
      additionalInfo,
      accountHolderName,
      accountNumber,
      bankName,
      branchName,
      ifscCode,
      upiId,
      passbookDoc: getFileBuffer(passbookDoc),
      relivingLetter: getFileBuffer(relivingLetter),
      onboardingStatus: "employee_completed"
    };

    const employee = await Employee.create(employeeData, { transaction });

    const educationFiles = req.files.education || [];

if (eduParsed.length > 0) {
  const educationData = eduParsed.map((item, index) => {
    const file = educationFiles[index];

    return {
      ...item,
      doc: file
        ? `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
        : null,
      employeeId: employee.id,
    };
  });

  await Education.bulkCreate(educationData, { transaction });
}

const experienceFiles = req.files.experience || [];

if (expParsed.length > 0) {
  const experienceData = expParsed.map((item, index) => {
    const file = experienceFiles[index];

    return {
      ...item,
      experienceLetter: file
        ? `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
        : null,
      employeeId: employee.id,
    };
  });

  await Experience.bulkCreate(experienceData, { transaction });
}



    await transaction.commit();

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEmpByHR = async (req,res) => {
  const transaction = await sequelize.transaction();
  try{
    const {userId} = req.query;
    const {
      joiningDate,
      departmentId,
      designationId,
      workLocationId,
      employeeType,
      assignSalaryStructure,
      payrollEligibility,
      roleId,
      levelId,
      salarySlabId,
      ctc,
      paymentMethod,
      structure,
    } = req.body;

    if (!userId) {
      throw new Error("userId is required");
    }

    const employee = await Employee.findOne({
      where: {
        userId: userId,
      },
      transaction,
    })

    if (!employee) {
      throw new Error("Employee not found");
    }

    await employee.update(
      {
        joiningDate,
        departmentId,
        designationId,
        workLocationId,
        employeeType,
        assignSalaryStructure,
        payrollEligibility,
        ctc,
        paymentMethod,
        roleId,
        levelId,
        salarySlabId,
        onboardingStatus: "completed"
      },
      { transaction }
    );

    // if (structure?.earning || structure?.deduction) {
    //   await EmployeeSalaryStructure.create(
    //       {
    //         employeeId: employee.id,
    //         earnings: structure?.earning || [],
    //         deductions: structure?.deduction || [],
    //         ctc,
    //         effectiveFrom: new Date(),
    //       },
    //       { transaction }
    //   );
    // }

    const latestStructure = await EmployeeSalaryStructure.findOne({
      where: { employeeId: employee.id },
      order: [
        ["effectiveFrom", "DESC"],
        ["createdAt", "DESC"], 
      ],
      transaction,
    });

    const existingCtc = latestStructure ? Number(latestStructure.ctc) : 0;
    const newCtc = Number(ctc || 0);

    const incrementPercent = existingCtc
      ? ((newCtc - existingCtc) / existingCtc) * 100
      : 0;

    if (structure?.earning || structure?.deduction) {
    await EmployeeSalaryStructure.create(
    {
      employeeId: employee.id,
      earnings: structure.earning || [],
      deductions: structure.deduction || [],
      ctc: newCtc,
      increament: incrementPercent,
      effectiveFrom: new Date(),
    },
    { transaction }
    );

  await employee.update(
    { ctc: newCtc },
    { transaction }
  );
}


    await transaction.commit();
    res.status(200).json({
      success: true,
      message: "Employee information added successfully",
    });

  }catch(error){
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


