const express = require('express');
const router = express.Router();
const CatchAsync = require('../../utils/CatchAsync');
const accessController = require('../../controllers/access.controller');
const { authentication } = require('../../auth/authUtils');
const { signUp } = require('../../validators/user.validator');

router.post('/signup', signUp, CatchAsync(accessController.signUp));
router.post('/login', CatchAsync(accessController.login));
router.post('/get-access-token', CatchAsync(accessController.getAccessToken));
router.post('/forgot-password', CatchAsync(accessController.forgotPassword));
router.put('/reset-password', CatchAsync(accessController.resetPassword));

// Authentication
router.use(authentication);
///////////////////////////////
router.post('/logout', CatchAsync(accessController.logout));
router.put('/change-password', CatchAsync(accessController.changePassword));

module.exports = router;