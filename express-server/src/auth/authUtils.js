"use strict";
const jwt = require("jsonwebtoken");
const { AuthFailureError, BadRequestError, ForbiddenRequestError } = require("../core/error.response");
const CatchAsync = require("../utils/CatchAsync");
const RedisService = require("../services/redis.service");
const UserRepository = require("../repositories/user.repo");
require("dotenv").config();

const HEADER = {
  AUTHORIZATION: "authorization",
  CLIENT_ID: "x-client-id",
};

const createRefreshToken = (payload, refreshTokenSecret) => {
  const refreshToken = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
  return refreshToken;
};

const createAccessToken = (payload, accessTokenSecret) => {
  const accessToken = jwt.sign(payload, accessTokenSecret, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
  return accessToken;
};

const createTokenResetPassword = (payload) => {
  return jwt.sign(payload, process.env.RESETPASSWORD_SECRET, {
    expiresIn: process.env.RESETPASSWORD_EXPIRY,
  });
};

const verifyToken = (token, secret) => {
  return jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.log(err);
      throw new BadRequestError("Invalid token");
    }
    return decoded;
  });
};

const authentication = CatchAsync(async (req, res, next) => {
  const clientId = req.headers[HEADER.CLIENT_ID];
  if (!clientId) {
    throw new AuthFailureError("Invalid request");
  }
  const accessToken = req.headers[HEADER.AUTHORIZATION]?.split(" ")[1];
  if (!accessToken) {
    throw new AuthFailureError("Invalid request");
  }
  const decoded = verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET);
  if (!decoded || decoded.userId !== clientId) {
    throw new AuthFailureError("Invalid request");
  }
  const user = await UserRepository.getUserById({ user_id: decoded.userId });
  if (!user) {
    throw new AuthFailureError("Invalid request");
  }
  // if(user.updatedAt > decoded.iat) {
  //   throw new AuthFailureError("Invalid request");
  // }
  req.user = user;
  next();
});

const checkUserOwnership = (req, res, next) => {
  if(req.params.user_id !== req.user._id) {
    throw new ForbiddenRequestError("not permission!");
  }
  next();
}

const restrictTo = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if(roles.includes(userRole)) {
      return next();
    }
    throw new ForbiddenRequestError("not permission");
  };
};

module.exports = {
  createRefreshToken,
  createAccessToken,
  verifyToken,
  authentication,
  createTokenResetPassword,
  checkUserOwnership,
  restrictTo
};
