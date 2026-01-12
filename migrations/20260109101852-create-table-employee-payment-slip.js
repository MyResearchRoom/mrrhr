"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("employee_payment_slip", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      empId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "employees",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      month: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      year: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      paymentSlip: {
        type: Sequelize.BLOB("long"),
        allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addConstraint("employee_payment_slip", {
      fields: ["empId", "month", "year"],
      type: "unique",
      name: "unique_emp_month_year_slip",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "employee_payment_slip",
      "unique_emp_month_year_slip"
    );

    await queryInterface.dropTable("employee_payment_slip");
  },
};
