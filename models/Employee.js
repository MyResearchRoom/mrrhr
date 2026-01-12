"use strict";

const { Model } = require("sequelize");
const {
  encryptSensitiveData,
  decryptSensitiveData,
  getDecryptedDocumentAsBase64,
  encryptFileBuffer,
  decryptFileBuffer,
} = require("../utils/cryptography");

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      Employee.hasMany(models.Education, {
        foreignKey: "employeeId",
        as: "education",
        onDelete: "CASCADE",
      });
      Employee.hasMany(models.Experience, {
        foreignKey: "employeeId",
        as: "experience",
        onDelete: "CASCADE",
      });
      Employee.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      Employee.belongsTo(models.Role, {
        foreignKey: "roleId",
        as: "role",
      });
      Employee.belongsTo(models.Level, {
        foreignKey: "levelId",
        as: "level",
      });
      Employee.belongsTo(models.Department, {
        foreignKey: "departmentId",
        as: "department",
      });
      Employee.belongsTo(models.Designation, {
        foreignKey: "designationId",
        as: "designation_",
      });
      Employee.belongsTo(models.WorkLocation, {
        foreignKey: "workLocationId",
        as: "workLocation_",
      });
      Employee.belongsTo(models.SalarySlab, {
        foreignKey: "salarySlabId",
        as: "salarySlab",
      });
      Employee.hasMany(models.EmployeeSalaryStructure, {
        foreignKey: "employeeId",
        as: "salaryStructure",
      });
      Employee.hasMany(models.EmployeePaymentSlip, {
        foreignKey: "empId",
        as: "paymentSlips",
      });
    }
  }

  Employee.init(
    {
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      levelId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      salarySlabId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      designationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      workLocationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: false,
      },
      dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      uanNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      aadharNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      aadharDoc: {
        type: DataTypes.BLOB("long"),
        allowNull: false,
      },
      panNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      panDoc: {
        type: DataTypes.BLOB("long"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "inactive",
      },

      // Present Address
      presentAddress: DataTypes.STRING,
      presentCountry: DataTypes.STRING,
      presentState: DataTypes.STRING,
      presentPostalCode: DataTypes.STRING,

      // Permanent Address
      permanentAddress: DataTypes.STRING,
      permanentCountry: DataTypes.STRING,
      permanentState: DataTypes.STRING,
      permanentPostalCode: DataTypes.STRING,

      // Professional Details
      totalExperience: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastWorkLocation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastCompanyName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastCtc: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      relivingLetter: {
        type: DataTypes.BLOB("long"),
        allowNull: false,
      },
      additionalInfo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // Bank Details
      accountHolderName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bankName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ifscCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      upiId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      branchName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passbookDoc: {
        type: DataTypes.BLOB("long"),
        allowNull: false,
      },

      // Employment Details
      joiningDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      employeeType: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Payroll
      assignSalaryStructure: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payrollEligibility: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      ctc: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      //new added by JB
      onboardingStatus: {
        type: DataTypes.ENUM(
          'employee_pending',
          'employee_completed',
          'hr_pending',
          'completed'
        ),
        allowNull: false,
        defaultValue: 'employee_pending',
      }

    },
    {
      sequelize,
      modelName: "Employee",
      tableName: "employees",
    }
  );

  // const ENCRYPT_FIELDS = [
  //   "uanNumber",
  //   "aadharNumber",
  //   "panNumber",
  //   "accountNumber",
  //   "ifscCode",
  //   "aadharDoc",
  //   "panDoc",
  //   "passbookDoc",
  // ];

  // Encrypt hook
  Employee.addHook("beforeCreate", (employee) => encryptFields(employee));
  Employee.addHook("beforeUpdate", (employee) => encryptFields(employee));

  function encryptFields(instance) {
  ENCRYPT_FIELDS.forEach((field) => {
    if (instance.changed(field) && instance[field]) {
      if (["uanNumber","aadharNumber","panNumber","accountNumber","ifscCode"].includes(field)) {
        if (!instance[field].includes(":")) { // prevent double encryption
          instance[field] = encryptSensitiveData(instance[field]);
        }
      } else {
        // BLOBs
        if (!Buffer.isBuffer(instance[field]) || instance[field].length > 16)
        { 
          instance[field] = require("../utils/cryptography").encryptFileBuffer(instance[field]);
        }
      }
    }
  });
}


  // Employee.prototype.toJSON = function () {
  //   const values = Object.assign({}, this.get());

  //   ENCRYPT_FIELDS.forEach((field) => {
  //     if (
  //       values[field] &&
  //       [
  //         "uanNumber",
  //         "aadharNumber",
  //         "panNumber",
  //         "accountNumber",
  //         "ifscCode",
  //       ].includes(field)
  //     ) {
  //       values[field] = decryptSensitiveData(values[field]);
  //     } else {
  //       values[field] = getDecryptedDocumentAsBase64(values[field]);
  //     }
  //   });

  //   delete values.password;
  //   return values;
  // };

//   Employee.prototype.toJSON = function () {
//   const values = Object.assign({}, this.get());

//   ENCRYPT_FIELDS.forEach((field) => {
//     if (["uanNumber", "aadharNumber", "panNumber", "accountNumber", "ifscCode"].includes(field)) {
//       values[field] = decryptSensitiveData(values[field]); // strings
//     } else if (["aadharDoc", "panDoc", "passbookDoc"].includes(field)) {
//       values[field] = decryptFileBuffer(values[field]); // BLOBs
//     }
//   });

//   delete values.password;
//   return values;
// };


// Employee.prototype.toJSON = function () {
//   const values = Object.assign({}, this.get());

//   ENCRYPT_FIELDS.forEach((field) => {
//     if (["uanNumber", "aadharNumber", "panNumber", "accountNumber", "ifscCode"].includes(field)) {
//       values[field] = decryptSensitiveData(values[field]); // strings
//     } else if (["aadharDoc", "panDoc", "passbookDoc"].includes(field)) {
//       values[field] = decryptFileBuffer(values[field]); // BLOBs
//     }
//   });

//   delete values.password;
//   return values;
// };


const ENCRYPT_FIELDS = [
  "uanNumber",
  "aadharNumber",
  "panNumber",
  "accountNumber",
  "ifscCode",
  "aadharDoc",
  "panDoc",
  "passbookDoc",
  "relivingLetter",
];

Employee.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());

  ENCRYPT_FIELDS.forEach((field) => {
    if (["uanNumber","aadharNumber","panNumber","accountNumber","ifscCode"].includes(field)) {
      if (values[field]) {
        try {
          values[field] = decryptSensitiveData(values[field]);
        } catch {
          values[field] = null; // Prevent crash if data is invalid
        }
      }
    } else if (["aadharDoc","panDoc","passbookDoc","relivingLetter","profilePicture"].includes(field)) {
      if (values[field]) {
        try {
          values[field] = decryptFileBuffer(values[field]);
        } catch {
          values[field] = null;
        }
      }
    }
  });

  delete values.password;
  return values;
};

  return Employee;
};
