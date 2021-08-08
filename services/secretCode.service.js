const { Op } = require('sequelize');

const { sequelize, Sequelize } = require('../models');
const SecretCode = require('../models/forgetpasswordcode')(sequelize, Sequelize);

module.exports.postSecret = async (data) => {
  try {
    let checkTime = Date.now();
    checkTime -= 3000000;
    await SecretCode.destroy({ where: { updatedAt: { [Op.lte]: checkTime } } });
    const secret = await SecretCode.findOne({ where: { email: data.email } });
    if (!secret) {
      const saveSecret = await SecretCode.create(data);
      console.log(saveSecret);
      return saveSecret.uuid;
    }
    await SecretCode.update(
      { secretCode: data.secretCode },
      { where: { email: data.email } },
    );
    return secret.uuid;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
module.exports.checkSecret = async (secret, uuid) => {
  try {
    let checkTime = Date.now();
    checkTime -= 3000000;// 5 mins
    await SecretCode.destroy({ where: { updatedAt: { [Op.lte]: checkTime } } });
    const data = await SecretCode.findOne({ where: { secretCode: secret, uuid } });
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
