"use strict";
const redis = require("redis");
const { RedisError } = require("../core/error.response");
const statusCodes = require("../utils/statusCodes");
require("dotenv").config();

let client = {},
  statusConnectRedis = {
    CONNECT: "connect",
    END: "end",
    RECONNECT: "reconnecting",
    ERROR: "error",
  },
  connectionTimeOut;

const REDIS_CONNECT_TIMEOUT = 1000,
  REDIS_CONNECT_MESSAGE = {
    code: -99,
    message: "Service connection timeout",
  };

const redisConfig = { url: process.env.REDIS_URI };

const handleTimeOutError = () => {
  connectionTimeOut = setTimeout(() => {
    console.log("ConnectionRedis - ConnectionStatus: timeout");
    throw new RedisError(
      (message = REDIS_CONNECT_MESSAGE.message),
      (statusCodes = REDIS_CONNECT_MESSAGE.code)
    );
  }, REDIS_CONNECT_TIMEOUT);
};

const handleEventConnect = (connectionRedis) => {
  connectionRedis.on(statusConnectRedis.CONNECT, () => {
    console.log("ConnectionRedis - ConnectionStatus: connected");
    clearTimeout(connectionTimeOut);
  });

  connectionRedis.on(statusConnectRedis.END, () => {
    console.log("ConnectionRedis - ConnectionStatus: disconnected");
    handleTimeOutError();
  });

  connectionRedis.on(statusConnectRedis.RECONNECT, () => {
    console.log("ConnectionRedis - ConnectionStatus: reconnecting");
    clearTimeout(connectionTimeOut);
  });

  connectionRedis.on(statusConnectRedis.ERROR, (err) => {
    console.log(`ConnectionRedis - ConnectionStatus: error ${err}`);
    handleTimeOutError();
  });
};

const initRedis = () => {
  const instanceRedis = redis.createClient(redisConfig);
  client.instanceConnect = instanceRedis;
  instanceRedis.connect();
  handleEventConnect(instanceRedis);
};

const getRedis = () => client;

const closeRedis = () => {};

module.exports = {
  initRedis,
  getRedis,
  closeRedis,
};
