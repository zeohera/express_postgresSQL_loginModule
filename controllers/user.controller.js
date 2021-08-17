const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const service = require('../services/user.service');
const tokenService = require('../services/token.service');

module.exports.getUsers = async (req, res, next) => {
  const page = req.query.page ? req.query.page : 0;
  const limit = req.query.limit ? req.query.limit : 10;
  const type = req.query.type ? req.query.type : null;
  const billing = req.query.billing ? req.query.billing : null;
  const authType = req.query.authType ? req.query.authType : 'all';
  try {
    const data = await service.getUsers(page, limit, type, billing, authType);
    res.status(200).json(data);
  } catch (err) {
    err.message = err.message ? err.message : 'error when get users';
    err.statusCode = err.statusCode ? err.statusCode : 400;
    next(err);
  }
};

module.exports.getUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await service.getOneUser(id);
    res.status(200).json(data);
  } catch (err) {
    err.message = err.message ? err.message : 'error when get user';
    err.statusCode = err.statusCode ? err.statusCode : 400;
    next(err);
  }
};

module.exports.postUser = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = result.errors;
      throw error;
    }
    const data = {
      ...req.body,
    };
    data.userPermission = 'admin';
    bcrypt.hash(data.password, 12, async (err, hash) => {
      data.password = hash;
      await service.postUser(data);
      res.status(200).json({ message: 'data saved', data });
    });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await service.getOneUser(id);
    if (user === null) {
      const error = new Error('user need to delete not found');
      error.statusCode = 404;
      throw error;
    }
    await service.deleteUser(id);
    res.status(200).json({ message: 'delete success' });
  } catch (error) {
    next(error);
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = result.errors;
      throw error;
    }
    const id = req.decodedJWT.userId;
    const data = req.body;
    const user = await service.getOneUser(id);
    if (user === null) {
      const error = new Error('user need to update not found');
      error.statusCode = 400;
      throw error;
    }
    await service.updateUser(id, data);
    const userReturn = await service.getOneUser(id);
    res.status(200).json({ message: 'update successful', data: userReturn });
  } catch (error) {
    error.message = error.message ? error.message : '';
    error.statusCode = error.statusCode ? error.statusCode : 400;
    next(error);
  }
};

module.exports.addPasswordOauth = async (req, res, next) => {
  try {
    const { password, retypePassword } = req.body;
    if (password.localeCompare(retypePassword) !== 0) {
      const error = new Error('password not match');
      error.statusCode = 400;
      throw error;
    }
    const checkUser = service.getOneUser(req.decodedJWT.username);
    if (checkUser.password !== undefined) {
      const error = new Error('your can only sign first time password one time');
      error.statusCode = 400;
      throw error;
    }
    const paramsId = parseInt(req.params.id, 10);
    if (req.decodedJWT.userId !== paramsId) {
      const error = new Error('you can change other user\'s password');
      error.statusCode = 400;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await service.updateUser(req.decodedJWT.userId, { password: hashedPassword });
    res.status(200).json({ message: 'password added' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports.changePassword = async (req, res, next) => {
  try {
    const {
      password,
      newPassword,
      retypePassword,
    } = req.body;
    let { userId } = req.decodedJWT;
    let userIdParam = req.params.id;
    userId = parseInt(userId, 10);
    userIdParam = parseInt(userIdParam, 10);
    console.log(userId, userIdParam);
    if (userId !== userIdParam) {
      const error = new Error('you can not change other user\'s password');
      error.statusCode = 401;
      throw error;
    }
    if (newPassword.localeCompare(retypePassword) !== 0) {
      const error = new Error('password not match');
      error.statusCode = 400;
      throw error;
    }
    const user = await service.getOneUser(userId);
    const result = await bcrypt.compare(password, user.password);
    if (result === false) {
      const error = new Error('wrong password');
      throw error;
    }
    const hash = await bcrypt.hash(newPassword, 12);
    await service.updateUser(userId, { password: hash });
    await tokenService.invalidTokenById(userId);
    res.status(204)
      .json({ message: 'change password successful' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
