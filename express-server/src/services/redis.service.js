'use strict';
const { getRedis } = require("../dbs/init.redis");
const { instanceConnect } = getRedis();

class RedisService {
  static timeToLive;

  static async setRefreshToken({ userId, refreshToken}) {
    const key = `refreshToken:${userId}`;
    await instanceConnect.set(key, refreshToken, {
      EX: this.timeToLive,
    });
  }

  static async getRefreshToken({ userId }) {
    const key = `refreshToken:${userId}`;
    const exists = await instanceConnect.exists(key); // Sử dụng await để chờ kết quả từ exists

    if (exists) {
      const refreshToken = await instanceConnect.get(key); // Sử dụng await để chờ kết quả từ get
      return refreshToken;
    }

    return null; // Trả về null nếu không tìm thấy refreshToken
  }

  static async deleteRefreshToken({ userId }) {
    const key = `refreshToken:${userId}`;
    await instanceConnect.del(key);
  }

  static async getCachedData({ key, callback}) {
    const data = await instanceConnect.get(key);
    if(!data) {
      const newData = await callback();
      await this.setCachedData({ key, data: newData});
      return newData;
    }
    return JSON.parse(data);
  }

  static async setCachedData({ key, data, tlt }) {
    instanceConnect.set(key, JSON.stringify(data), {
      EX: tlt || this.timeToLive,
    });
  }
}

module.exports = RedisService;
