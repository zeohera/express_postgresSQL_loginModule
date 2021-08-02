"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      username: { type: DataTypes.STRING, require: true },
      password: { type: DataTypes.STRING, require: true },
      firstName: { type: DataTypes.STRING, require: true },
      middleName: { type: DataTypes.STRING, require: true },
      lastName: { type: DataTypes.STRING, require: true },
      email: { type: DataTypes.STRING, require: true },
      avatar: { type: DataTypes.STRING, require: false },
      billing: { type: DataTypes.BOOLEAN, require: true },
      userPermission: { type: DataTypes.STRING, require: true, defaultValue: 'User' },
      passwordChangeAt: { type: DataTypes.DATE, require : false, defaultValue : DataTypes.NOW},
      active : {type : DataTypes.BOOLEAN, require : true, defaultValue: false},
      facebookId : {type :DataTypes.STRING, require:  false}
    },
    {
      sequelize,
      paranoid: true,
      modelName: "User",  
    }
  );
  return User;
};
