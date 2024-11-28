"use strict";

const { s3, GetObjectCommand } = require("../config/config.s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { randomName, generateSignedUrl } = require("../utils");
const { BadRequestError } = require("../core/error.response");

class UploadSerivce {
  static async uploadVideoFromLocal({ file }) {
    console.log(process.env.AWS_BUCKET_NAME);
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.name,
      Body: file.buffer,
      ContentType: "video/mp4",
    });
    const result = s3.send(command);
    return result;
  }

  static async uploadImageFromLocal({ file }) {
    const imageName = randomName();
    const bucketName = process.env.AWS_BUCKET_NAME;
    // const command = new PutObjectCommand({
    //     Bucket: bucketName,
    //     Key: imageName,
    //     Body: file.buffer,
    //     ContentType: "image/JPEG"
    // });
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucketName,
        Key: imageName,
        Body: file.buffer,
        ContentType: "image/JPEG",
      },
    });
    // s3.send(command);
    await upload.done();

    // export url
    const url = await generateSignedUrl(imageName);
    return {
      imageName,
      url,
    };
  }
}

module.exports = UploadSerivce;
