"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Password_reset_otp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
     

    }
  }
  Password_reset_otp.init(
    {
        email: { type: DataTypes.STRING, allowNull: false },
        otpHash: { type: DataTypes.STRING, allowNull: false },
        expiresAt: { type: DataTypes.DATE, allowNull: false },
        usedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "Password_reset_otp",
    }
  );
  return Password_reset_otp;
};
