const { sequelize, Sequelize } = require("../models");
var Token = require("../models/token")(sequelize, Sequelize);
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const schedule = require('node-schedule');
const moment = require("moment")
const expTokenTime = {
  accessToken : '7d',
  refreshToken : '30d',
}

function processText(inputText) {
  var data = inputText.replace(/\'/g, '').split(/(\d+)/).filter(Boolean)
  data[0] = parseInt(data[0])
  switch(data[1]){
    case 's':
      data[1] = 'second';break;
    case 'm':
      data[1] = 'minutes';break;
    case 'h':
      data[1] = 'hours';break;
    case 'd': 
      data[1] = 'days';break;
    case 'm': 
      data[1] = 'months';break;
    case 'y': 
      data[1] = 'years';break;
  }
  return data
}

// làm sạch db sau một ngày 
schedule.scheduleJob({ hour: 3, minute: 00 }, async function () {
  try {
    var accessTokenExp = processText(expTokenTime.accessToken)
    var accessTokenExp_subtracted = moment().subtract(accessTokenExp[0], accessTokenExp[1])
    var refreshTokenExp = processText(expTokenTime.refreshToken)
    var refreshTokenExp_subtracted = moment().subtract(refreshTokenExp[0], refreshTokenExp[1])
    console.log('Time for work!');
    const deletedData = await Token.destroy({ where: {
      [Op.and]: [
        {state : false },
        {accessTokenUpdateAt : {[Op.lte]: accessTokenExp_subtracted } },
        {createAt : {[Op.lte]: refreshTokenExp_subtracted } },
      ]
    } })
  } catch (error) {
    console.log(error)
  }
});

// generate token 
module.exports.generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_ACCESS_TOKEN, { expiresIn: expTokenTime.accessToken });
};
module.exports.generateRefreshToken = (tokenInfo) => {
  return jwt.sign(tokenInfo, process.env.JWT_REFRESH_TOKEN, { expiresIn: expTokenTime.refreshToken })
}

module.exports.postToken = async (data) => {
  try {
    data.state = 1;
    const token = await Token.create(data);
    return token;
  } catch (error) {
    throw error;
  }
};

module.exports.invalidToken = async (token) => {
  try {
    const changedTokenState = await Token.update(
      { state: false },
      {
        where: {
          [Op.or]: [{ refreshToken: token }, { accessToken: token }],
        },
      }
    );
    return changedTokenState;
  } catch (error) {
    // error.statusCode = 500;
    // error.message = "error when try to change state";
    throw error;
  }
};

module.exports.getTokenState = async (token) => {
  try {
    const data = await Token.findOne({
      where: {
        [Op.or]: [{ refreshToken: token }, { accessToken: token }],
      },
    });
    if (!data) {
      return null
    }
    return data.state
  } catch (error) {
    throw error;
  }
};

module.exports.checkToken = async (id, token) => {
  try {
    const tokenCheckResult = await Token.findOne({
      where: { userId: id, refreshToken: token },
    });
    try {
      var tokenDecode = await jwt.verify(
        tokenCheckResult.accessToken,
        process.env.JWT_ACCESS_TOKEN
      );
    } catch (error) {
      try {
        var RefreshTokenDecode = await jwt.verify(tokenCheckResult.refreshToken, process.env.JWT_refresh_TOKEN)
      } catch (error) {
        async () => {
          await Token.destroy({ where: { refreshToken: tokenCheckResult.refreshToken } })
        }
      }
      return null;
    }
    return tokenCheckResult.accessToken;
  } catch (error) {
    console.error(error)
    throw error;
  }
};

module.exports.generateAccessTokenSave = async (data, refreshToken) => {
  try {
    const newAccessToken = this.generateAccessToken(data);
    await Token.update(
      { accessToken: newAccessToken , accessTokenUpdateAt : Sequelize.fn("NOW") },
      { where: { refreshToken: refreshToken } }
    );
    return newAccessToken;
  } catch (error) {
    throw error;
  }
};
