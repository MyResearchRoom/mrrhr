"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.changeColumn("employees", "joiningDate", {
        type: Sequelize.DATE,
        allowNull: true,
      }, { transaction });

      await queryInterface.changeColumn("employees", "departmentId", {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });

      await queryInterface.changeColumn("employees", "designationId", {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });

      await queryInterface.changeColumn("employees", "workLocationId", {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });

      await queryInterface.changeColumn("employees", "employeeType", {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });

      await queryInterface.changeColumn("employees", "assignSalaryStructure", {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });

      await queryInterface.changeColumn("employees", "payrollEligibility", {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      }, { transaction });

      await queryInterface.changeColumn("employees", "ctc", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      }, { transaction });

      await queryInterface.changeColumn("employees", "roleId", {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });

      await queryInterface.changeColumn("employees", "levelId", {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });

      await queryInterface.changeColumn("employees", "salarySlabId", {
        type: Sequelize.INTEGER,
        allowNull: true,
      }, { transaction });

      await queryInterface.changeColumn("employees", "paymentMethod", {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });

      await queryInterface.addColumn("employees", "onboardingStatus", {
        type: Sequelize.ENUM(
          "employee_pending",
          "employee_completed",
          "hr_pending",
          "completed"
        ),
        allowNull: false,
        defaultValue: "employee_pending",
      }, { transaction });

      // await queryInterface.addColumn('employee_salary_structures', 'ctc', {
      //   type: Sequelize.DECIMAL(10, 2),
      //   allowNull: false,  
      //   defaultValue: 0.00, 
      // });

      // increament null allow
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.removeColumn("employees", "onboardingStatus", { transaction });

      await queryInterface.changeColumn("employees", "joiningDate", {
        type: Sequelize.DATE,
        allowNull: false,
      }, { transaction });

      await queryInterface.changeColumn("employees", "departmentId", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, { transaction });

      await queryInterface.changeColumn("employees", "designationId", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, { transaction });

      await queryInterface.changeColumn("employees", "workLocationId", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, { transaction });

      await queryInterface.changeColumn("employees", "employeeType", {
        type: Sequelize.STRING,
        allowNull: false,
      }, { transaction });

      await queryInterface.changeColumn("employees", "assignSalaryStructure", {
        type: Sequelize.STRING,
        allowNull: false,
      }, { transaction });

      await queryInterface.changeColumn("employees", "payrollEligibility", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      }, { transaction });

      await queryInterface.changeColumn("employees", "ctc", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      }, { transaction });

      await queryInterface.changeColumn("employees", "roleId", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, { transaction });

      await queryInterface.changeColumn("employees", "levelId", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, { transaction });

      await queryInterface.changeColumn("employees", "salarySlabId", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, { transaction });

      await queryInterface.changeColumn("employees", "paymentMethod", {
        type: Sequelize.STRING,
        allowNull: false,
      }, { transaction });

      // await queryInterface.removeColumn('employee_salary_structures', 'ctc');

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
