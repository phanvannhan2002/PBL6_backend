"use strict";
const { Types } = require("mongoose");
const User = require("../models/user.model");
const { unSelectData } = require("../utils");

class UserRepository {
  static async createUser({ username, email, password, gender, dateOfBirth, avatar }) {
    return await User.create({
      username,
      email,
      password,
      gender,
      dateOfBirth,
      avatar
    });
  }

  static async getUserById({ user_id, unSelect = [] }) {
    return await User.findById(new Types.ObjectId(user_id))
      .select(unSelectData(unSelect))
      .lean();
  }

  static async getUsers({ limit, page, filter, unSelect }) {
    const skip = (page - 1) * limit;
    const query = {};
    for (const key in filter) {
      if (filter[key]) {
        query[key] = { $regex: filter[key], $options: "i" };
      }
    }
    query["role"] = "user";
    return await User.find(query)
      .select(unSelectData(unSelect))
      .limit(limit)
      .skip(skip)
      .lean();
  }

  static async searchUser({ searchQuery, unSelect = [] }) {
    return await User.find(searchQuery).select(unSelectData(unSelect)).lean();
  }

  static async findUserByUsername({ username, unSelect = [] }) {
    return await this.searchUser({ username, unSelect });
  }

  static async findUserByEmail({ email, unSelect = [] }) {
    const searchQuery = {email};
    return await this.searchUser({searchQuery, unSelect});
  }

  static async updateUser({ user_id, newData }) {
    return await User.findByIdAndUpdate(new Types.ObjectId(user_id), newData, {
      new: true,
    });
  }
}

module.exports = UserRepository;
