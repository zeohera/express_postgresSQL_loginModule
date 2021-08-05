const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const service = require("../services/user.service");
const tokenService = require("../services/token.service");

module.exports.getUsers = async (req, res, next) => {
  var page = req.params.page ? req.params.page : 0;
  var limit = req.params.limit ? req.params.limit : 10;
  try {
    var data = await service.getUsers(page, limit);
    res.status(200).json(data);
  } catch (err) {
    err.message = err.message ? err.message : "error when get users";
    err.statusCode = err.statusCode ? err.statusCode : 400;
    next(err);
  }
};

module.exports.getUser = async (req, res, next) => {
  try {
    var id = req.params.id;
    var data = await service.getOneUser(id);
    res.status(200).json(data);
  } catch (error) {
    err.message = err.message ? err.message : "error when get user";
    err.statusCode = err.statusCode ? err.statusCode : 400;
    next(err);
  }
};

module.exports.postUser = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = result.errors;
      throw error;
    }
    var data = {
      ...req.body,
    };
    data.userPermission = "admin";
    bcrypt.hash(data.password, 12, async (err, hash) => {
      data.password = hash;
      var modelResult = await service.postUser(data);
      res.status(200).json({ message: "data saved", data: data });
    });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteUser = async (req, res, next) => {
  try {
    id = req.params.id;
    const user = await service.getOneUser(id);
    if (user === null) {
      var error = new Error("user need to delete not found");
      error.statusCode = 400;
      throw error;
    }
    const deletedUser = await service.deleteUser(id);
    console.log(deletedUser);
    res.status(200).json({ message: "delete success" });
  } catch (error) {
    next(error);
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = result.errors;
      throw error;
    }
    id = req.params.id;
    data = req.body;
    console.log(data);
    var user = await service.getOneUser(id);
    if (user === null) {
      var error = new Error("user need to update not found");
      error.statusCode = 400;
      throw error;
    }
    await service.updateUser(id, data);
    var user = await service.getOneUser(id);
    res.status(200).json({ message: "update successful", data: user });
  } catch (error) {
    error.message = error.message ? error.message : "";
    error.statusCode = error.statusCode ? error.statusCode : 400;
    next(error);
  }
};

module.exports.changePassword = async (req, res, next) => {
  try {
    const password = req.body.password;
    const retypePassword = req.body.retypePassword;
    const newPassword = req.body.newPassword;
    const userId = req.decodedJWT.userId;
    if (newPassword.localeCompare(retypePassword) !== 0) {
      var error = new Error("password not match");
      error.statusCode(400);
      throw error;
    }
    var user = await service.getOneUser(userId);
    var result = await bcrypt.compare(password, user.password);
    if (result === false) {
      var error = new Error("wrong password");
      throw error
    }
    const hash = await bcrypt.hash(newPassword, 12);
    await service.updateUser(userId, { password: hash });
    await tokenService.invalidTokenById(userId)
    res
      .json({ message: "change password successful", data: modelResult });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

