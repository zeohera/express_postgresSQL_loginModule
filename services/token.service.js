const moment = require('moment');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const schedule = require('node-schedule');

const { sequelize, Sequelize } = require('../models');
const Token = require('../models/token')(sequelize, Sequelize);

const expTokenTime = {
  accessToken: '7d',
  refreshToken: '30d',
};

function processText(inputText) {
  // eslint-disable-next-line no-useless-escape
  const data = inputText.replace(/\'/g, '').split(/(\d+)/).filter(Boolean);
  data[0] = parseInt(data[0], 10);
  switch (data[1]) {
    case 's':
      data[1] = 'second'; break;
    case 'm':
      data[1] = 'minutes'; break;
    case 'h':
      data[1] = 'hours'; break;
    case 'd':
      data[1] = 'days'; break;
    default: data[1] = null;
  }
  return data;
}

// làm sạch db sau một ngày
schedule.scheduleJob({ hour: 10, minute: 25 }, async () => {
  try {
    const accessExp = processText(expTokenTime.accessToken);
    const accessExpSubtracted = moment().subtract(accessExp[0], accessExp[1]).valueOf();
    const refreshExp = processText(expTokenTime.refreshToken);
    const refreshExpSubtracted = moment().subtract(refreshExp[0], refreshExp[1]).valueOf();
    console.log('Time for work!', refreshExpSubtracted);
    await Token.destroy({
      where: {
        [Op.and]: [
          { state: false },
          { accessTokenUpdateAt: { [Op.lte]: accessExpSubtracted } },
          { createdAt: { [Op.lte]: refreshExpSubtracted } },
        ],
      },
    });
  } catch (error) {
    console.log(error);
  }
});

// generate token
module.exports.generateAccessToken = (user) => jwt.sign(
  user, process.env.JWT_ACCESS_TOKEN, { expiresIn: expTokenTime.accessToken },
);

module.exports.generateRefreshToken = (tokenInfo) => jwt.sign(
  tokenInfo, process.env.JWT_REFRESH_TOKEN, { expiresIn: expTokenTime.refreshToken },
);

module.exports.postToken = async (data) => {
  try {
    data.state = 1;
    const token = await Token.create(data);
    return token;
  } catch (error) {
    error.message += 'error when save token';
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
      },
    );
    return changedTokenState;
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }
};

module.exports.invalidTokenById = async (id) => {
  try {
    const changeTokenState = await Token.update({ state: false }, { where: { userId: id } });
    return changeTokenState;
  } catch (error) {
    error.message += 'error when try to change token state';
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
      return null;
    }
    return data.state;
  } catch (error) {
    error.message += 'cant find token';
    throw error;
  }
};

module.exports.getRefreshTokenState = async (token) => {
  try {
    const data = await Token.findOne({ refreshToken: token });
    if (!data) return null;
    return data.state;
  } catch (error) {
    error.message += 'cant find token';
    throw error;
  }
};

module.exports.checkToken = async (id, token) => {
  try {
    const tokenCheckResult = await Token.findOne({
      where: { userId: id, refreshToken: token },
    });
    try {
      await jwt.verify(
        tokenCheckResult.accessToken,
        process.env.JWT_ACCESS_TOKEN,
      );
    } catch (error) {
      try {
        await jwt.verify(tokenCheckResult.refreshToken, process.env.JWT_refresh_TOKEN);
      } catch (err) {
        await Token.destroy({ where: { refreshToken: tokenCheckResult.refreshToken } });
      }
      return null;
    }
    return tokenCheckResult.accessToken;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports.generateAccessTokenSave = async (data, refreshToken) => {
  try {
    const newAccessToken = this.generateAccessToken(data);
    await Token.update(
      { accessToken: newAccessToken, accessTokenUpdateAt: Sequelize.fn('NOW') },
      { where: { refreshToken } },
    );
    return newAccessToken;
  } catch (error) {
    error.message += 'cant generate token';
    throw error;
  }
};
