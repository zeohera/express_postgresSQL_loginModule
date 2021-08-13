/* eslint-disable */
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class forgetPasswordCode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  forgetPasswordCode.init({
    email: DataTypes.STRING,
    secretCode: DataTypes.STRING,
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV1 },
  }, {
    sequelize,
    modelName: 'forgetPasswordCode',
  });
  return forgetPasswordCode;
};