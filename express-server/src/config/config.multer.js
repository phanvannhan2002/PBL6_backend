"use strict";

const multer = require("multer");

const uploadDisk = new multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./src/upload");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix);
    },
  }),
});

const uploadMemory = multer({
  storage: multer.memoryStorage()
});


module.exports = {
  uploadDisk,
  uploadMemory
};
