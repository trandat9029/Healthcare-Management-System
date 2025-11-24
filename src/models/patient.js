"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    //   Patient.belongsTo(models.Allcode, {foreignKey: 'positionId', targetKey: 'keyMap', as: 'positionData'});
    //   Patient.belongsTo(models.Allcode, {foreignKey: 'gender', targetKey: 'keyMap', as: 'genderData'});

    //   Patient.hasOne(models.Markdown, {foreignKey: 'doctorId'});

    //   Patient.hasOne(models.Doctor_info, {foreignKey: 'doctorId'});

    //   Patient.hasMany(models.Schedule, {foreignKey: 'doctorId', as: 'doctorData'});

    //   Patient.hasMany(models.Booking, {foreignKey: 'patientId', as: 'patientData'});


    }
  }
  Patient.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      address: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      gender: DataTypes.STRING,
      image: DataTypes.STRING,
      roleId: DataTypes.STRING,

    },
    {
      sequelize,
      modelName: "Patient",
    }
  );
  return Patient;
};
