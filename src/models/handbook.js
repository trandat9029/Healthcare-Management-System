"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Handbook extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Handbook.belongsTo(models.Allcode, {foreignKey: 'statusId', targetKey: 'keyMap', as: 'statusTypeData'});
    }
  }
  Handbook.init(
    {
      name: DataTypes.STRING,
      author: DataTypes.STRING,
      datePublish: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      descriptionHTML: DataTypes.TEXT,
      descriptionMarkdown: DataTypes.TEXT,
      image: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Handbook",
    }
  );
  return Handbook;
};
