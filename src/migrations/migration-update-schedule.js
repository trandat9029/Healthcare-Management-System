// migration add default currentNumber
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Schedules', 'currentNumber', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Schedules', 'currentNumber', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
  }
};
