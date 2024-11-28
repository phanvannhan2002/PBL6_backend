"use strict";

const UserRepository = require("../repositories/user.repo");
const { BadRequestError } = require("../core/error.response");
const { getInforData } = require("../utils");
const UploadSerivce = require("./upload.service");

class UserService {
  static async getUsers({ limit, page, filter }) {
    const unSelect = ["password", "__v"];
    const users = await UserRepository.getUsers({
      limit,
      page,
      filter,
      unSelect,
    });
    if (!users) {
      throw new BadRequestError("user not found");
    }
    return users;
  }

  static async getUserById({ user_id }) {
    const unSelect = ["password", "__v"];
    const user = await UserRepository.getUserById({ user_id, unSelect });

    if (!user) {
      throw new BadRequestError("user not found");
    }
    return user;
  }

  static async updateUserById({ user_id, newData }) {
    const holder = await UserRepository.getUserById({ user_id });
    if (!holder) {
      throw new BadRequestError("user not found");
    }
    const newUser = await UserRepository.updateUser({ user_id, newData });
    return getInforData(newUser, [
      "username",
      "email",
      "avatar",
      "gender",
      "birthday",
    ]);
  }

  static async changeAvatar({user_id, file}) {
    const holder = await UserRepository.getUserById({user_id});
    if(!file) {
      throw new BadRequestError("file missing");
    }
    if(!holder) {
      throw new BadRequestError("User not found");
    }
    const {url, imageName} = await UploadSerivce.uploadImageFromLocal({file});
    const newData = {avatar: imageName};
    await UserRepository.updateUser({user_id, newData});
    return url;
  }
}

module.exports = UserService;
