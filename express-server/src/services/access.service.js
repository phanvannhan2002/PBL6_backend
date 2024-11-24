"use strict";
// repository
const UserRepository = require("../repositories/user.repo");
///////////////////////////////
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { BadRequestError } = require("../core/error.response");
const { getInforData, replacePlaceHolder } = require("../utils/index");
const {
  createAccessToken,
  createRefreshToken,
  verifyToken,
  createTokenResetPassword,
} = require("../auth/authUtils");
const RedisService = require("./redis.service");
const EmailService = require("./email.service");
const TemplateService = require("./template.service");
require("dotenv").config();

class AcessService {
  static async signUp({ email, username, password }) {
    const holderEmail = await UserRepository.findUserByEmail(email);
    if (holderEmail) {
      throw new BadRequestError("Email already in use");
    }
    const holderUsername = await UserRepository.findUserByUsername(username);
    if (holderUsername) {
      throw new BadRequestError("Username already in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await UserRepository.createUser({
      email,
      username,
      password: hashPassword,
    });
    RedisService.setCachedData({
      key: `user:${newUser._id}`,
      data: newUser,
      tlt: 24 * 60 * 60,
    });
    return getInforData(newUser, ["user_id", "email", "username"]);
  }

  static async login({ email, password }) {
    const [holder] = await UserRepository.findUserByEmail(email);
    if (!holder) {
      throw new BadRequestError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, holder.password);
    if (!isMatch) {
      throw new BadRequestError("Invalid email or password");
    }
    const user_id = holder._id;
    let refreshToken = await RedisService.getRefreshToken({ userId: user_id });
    const accessTokenKey = process.env.ACCESS_TOKEN_SECRET,
      refreshTokenKey = process.env.REFRESH_TOKEN_SECRET;
    let accessToken;
    if (!refreshToken) {
      refreshToken = createRefreshToken(
        { userId: user_id, email },
        refreshTokenKey
      );
    }
    accessToken = createAccessToken({ userId: user_id, email }, accessTokenKey);
    // save refreshToken to redis
    RedisService.setRefreshToken({
      userId: user_id,
      refreshToken: refreshToken,
      exp: process.env.REFRESH_TOKEN_EXPIRY,
    });
    return {
      user: getInforData(holder, ["user_id", "email"]),
      token: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }

  static async logout({ user_id }) {
    await RedisService.deleteRefreshToken({ userId: user_id.toString() });
  }

  static async changePassword({
    userId,
    oldPassword,
    newPassword,
    repeatPassword,
  }) {
    if (newPassword !== repeatPassword) {
      throw new BadRequestError("Password does not match");
    }
    RedisService.timeToLive = 3600;
    const callback = () => UserRepository.getUserById(userId);
    const holder = await RedisService.getCachedData({
      key: `user:${userId}`,
      callback,
    });
    if (!holder) {
      throw new BadRequestError("Invalid request");
    }
    const isMatch = await bcrypt.compare(oldPassword, holder.password);
    if (!isMatch) {
      throw new BadRequestError("Invalid password");
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    const newUser = await UserRepository.updateUser(userId, {
      password: hashPassword,
    });
    const refreshToken = createRefreshToken(
      { userId: userId, username: holder.username },
      process.env.REFRESH_TOKEN_SECRET
    );
    const accessToken = createAccessToken(
      { userId: userId, username: holder.username },
      process.env.ACCESS_TOKEN_SECRET
    );
    // update refreshToken to redis
    RedisService.timeToLive = 120 * 24 * 60 * 60;
    RedisService.setRefreshToken({
      userId: newUser.user_id,
      refreshToken: refreshToken,
    });
    // update user to redis
    RedisService.timeToLive = 3600;
    RedisService.setCachedData({ key: `user:${userId}`, data: newUser });
    return {
      user: getInforData(newUser, ["user_id", "username"]),
      token: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }

  static async getAccessToken({ userId, refreshToken }) {
    const decode = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (decode.userId !== userId) {
      throw new BadRequestError("Invalid token");
    }
    const accessToken = createAccessToken(
      { userId, username: decode.username },
      process.env.ACCESS_TOKEN_SECRET
    );
    return { accessToken };
  }

  static async forgotPassword({ email }) {
    const [holder] = await UserRepository.findUserByEmail(email);
    if (!holder) {
      throw new BadRequestError("User not found!");
    }
    const token = createTokenResetPassword({ email });
    const resetURL = `${process.env.RESET_PASSWORD_FE_URL}/${token}`;
    const template = (
      await TemplateService.getTemplate({ tem_name: "HTML RESETPASSWORD" })
    ).tem_html;
    const params = {
      username: holder.username,
      url: resetURL,
    };
    const content = replacePlaceHolder(template, params);
    console.log(content);
    await EmailService.sendEmailResetPassword(email, undefined, undefined, content);
  }

  static async resetPassword({token, newPassword, repeatPassword}) {
    const decode = verifyToken(token, process.env.RESETPASSWORD_SECRET);
    if(!decode) {
      throw new BadRequestError("Invalid token");
    }
    const email = decode.email;
    const holder = await UserRepository.findUserByEmail({email});
    if(!holder) {
      throw new BadRequestError("Invalid request");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    UserRepository.updateUser(holder._id, {password: hashPassword});
    if (newPassword !== repeatPassword) {
      throw new BadRequestError("Password does not match");
    }
    return getInforData(holder, ["user_id", "email", "username"]);
  }
}

module.exports = AcessService;
