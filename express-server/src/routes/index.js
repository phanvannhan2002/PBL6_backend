const express = require('express');
const router = express.Router();

router.use('/users', require('./user/index'));
router.use('/', require('./access/index'));

module.exports = router;
