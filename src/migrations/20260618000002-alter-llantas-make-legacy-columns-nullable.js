"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("llantas", "modelo", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.changeColumn("llantas", "precio", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    await queryInterface.changeColumn("llantas", "stock", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("llantas", "stock", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("llantas", "precio", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });

    await queryInterface.changeColumn("llantas", "modelo", {
      type: Sequelize.STRING(100),
      allowNull: false,
    });
  },
};
