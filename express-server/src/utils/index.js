"user strict";
const _ = require("lodash");
const crypto = require("crypto");
const { s3, GetObjectCommand } = require("../config/config.s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const getInforData = (data, pick) => {
  return _.pick(data, pick);
};

const selectData = (fileds = []) => {
  return Object.fromEntries(fileds.map((el) => [el, 1]));
};

const unSelectData = (fileds = []) => {
  return Object.fromEntries(fileds.map((el) => [el, 0]));
};

const replacePlaceHolder = (template, params) => {
  Object.keys(params).forEach((k) => {
    let placeHolder = `{{${k}}}`;
    template = template.replace(new RegExp(placeHolder, "g"), params[k]);
  });
  return template;
};

const randomName = () => crypto.randomBytes(16).toString("hex");

const generateSignedUrl = async (fileName) => {
  const signedUrl = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
  });
  const url = await getSignedUrl(s3, signedUrl, {
    expiresIn: process.env.AVATAR_EXPIRY,
  });
  return url;
};

module.exports = {
  getInforData,
  replacePlaceHolder,
  selectData,
  unSelectData,
  randomName,
  generateSignedUrl
};
