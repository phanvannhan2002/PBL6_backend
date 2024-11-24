const express = require('express');
const router = express.Router();

router.use("/file", require('./file/index'));
router.use('/', require('./access/index'));
router.use('/user', require('./user/index'));

module.exports = router;
