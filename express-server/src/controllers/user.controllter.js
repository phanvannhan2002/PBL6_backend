"use strict";

const { OK } = require("../core/success.response");
const UserService = require("../services/user.service");

class UserController {
  static async getUsers(req, res, next) {
    const { limit, page, ...filter } = req.query;
    new OK("Success", await UserService.getUsers({ limit, page, filter })).send(
      res
    );
  }

  static async getUserById(req, res, next) {
    new OK("Success", await UserService.getUserById(req.params)).send(res);
  }

  static async updateUserById(req, res, next) {
    new OK(
      "Update success",
      await UserService.updateUserById({ ...req.params, newData: req.body })
    ).send(res);
  }

  static async changeAvatar(req, res, next) {
    const { file } = req;
    new OK(
      "Change avatar success",
      await UserService.changeAvatar({ user_id: req.params.user_id, file })
    ).send(res);
  }
}

module.exports = UserController;
