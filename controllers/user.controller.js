const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const service = require('../services/user.service');
const tokenService = require('../services/token.service');

module.exports.getUsers = async (req, res, next) => {
  const page = req.params.page ? req.params.page : 0;
  const limit = req.params.limit ? req.params.limit : 10;
  try {
    const data = await service.getUsers(page, limit);
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
    const deletedUser = await service.deleteUser(id);
    console.log(deletedUser);
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
    console.log(data);
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

module.exports.changePassword = async (req, res, next) => {
  try {
    const {
      password,
      newPassword,
      retypePassword,
      userId,
      userIdParam,
    } = req.body;
    if (userId !== userIdParam) {
      const error = new Error('you can not change other user\'s password');
      error.statusCode(401);
      throw error;
    }
    if (newPassword.localeCompare(retypePassword) !== 0) {
      const error = new Error('password not match');
      error.statusCode(400);
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
    console.log(error);
    next(error);
  }
};
