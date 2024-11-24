const express = require("express");
const { uploadVideo } = require("../../controllers/file.controller");
const { upload } = require("../../services/file.service");
const router = express.Router();

router.post("/upload", upload.single('video'));

module.exports = router;