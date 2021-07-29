"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here 
    }
  }
  Token.init(
    {
      userId: DataTypes.INTEGER,
      refreshToken: DataTypes.STRING,
      accessToken: DataTypes.STRING,
      accessTokenUpdateAt : {type : DataTypes.DATE, defaultValue : DataTypes.NOW },
      state : DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: "Token",
    }
  );
  return Token;
};
