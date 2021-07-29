const { sequelize, Sequelize } = require("../models");
var SecretCode = require("../models/forgetpasswordcode")(sequelize, Sequelize);
const { Op } = require("sequelize");

module.exports.postSecret = async (data) => {
  try {
    var checkTime = Date.now();
    checkTime = checkTime - 3000000 // 5 mins
    await SecretCode.destroy({ where: { updatedAt: { [Op.lte]: checkTime } } });
    const secret = await SecretCode.findOne({ where: { email: data.email } });
    if (!secret) {
      var saveSecret = await SecretCode.create(data);
      console.log(saveSecret)
      return saveSecret.uuid;
    } else {
      var saveSecret = await SecretCode.update(
        { secretCode: data.secretCode },
        { where: { email: data.email } }
      );
      console.log(saveSecret)
      return secret.uuid;

    }
  } catch (error) {
    throw error;
  }
};
module.exports.checkSecret = async (secret, uuid) => {
  try {
    var checkTime = Date.now();
    checkTime = checkTime - 3000000 // 5 mins
    await SecretCode.destroy({ where: { updatedAt: { [Op.lte]: checkTime } } });
    const data = await SecretCode.findOne({ where: { secretCode: secret, uuid: uuid } })
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}