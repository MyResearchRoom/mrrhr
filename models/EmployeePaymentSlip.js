"use strict";

const { Model } = require("sequelize");


module.exports = (sequelize, DataTypes) => {
  class EmployeePaymentSlip extends Model {
    static associate(models) {
        EmployeePaymentSlip.belongsTo(models.Employee, {
            foreignKey: "empId",
            as: "employee",
        });
     }
  }
   EmployeePaymentSlip.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      empId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      month: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      year: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paymentSlip: {
        type: DataTypes.BLOB("long"),
        allowNull: false,
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, 
      },
    },
    {
      sequelize,
      modelName: "EmployeePaymentSlip",
      tableName: "employee_payment_slip",
      timestamps: true,
    }
  );

  EmployeePaymentSlip.prototype.toJSON = function () {
    const values = { ...this.get() };
    if (values.paymentSlip) {
      values.paymentSlip = values.paymentSlip.toString("utf8"); 
    }
    return values;
  };
   return EmployeePaymentSlip;
};