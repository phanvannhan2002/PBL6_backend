const { template } = require("lodash");
const Template = require("../models/template.model");

class UserRepository {
  static async newTemplate({ tem_name, tem_html }) {
    return await Template.create({
      tem_name,
      tem_html,
    });
  }

  static async getTemplate({ tem_name }) {
    return await Template.findOne({ tem_name });
  }
}

module.exports = UserRepository;
