const express = require("express");
const CatchAsync = require("../../utils/CatchAsync");
const UserController = require("../../controllers/user.controllter");
const {
  authentication,
  checkUserOwnership,
  restrictTo,
} = require("../../auth/authUtils");
const { updateInformationUser } = require("../../validators/user.validator");
const { uploadDisk, uploadMemory } = require("../../config/config.multer");
const router = express.Router();

// Authentication
router.use(authentication);
////////////////////////////
router.route("/").get(restrictTo(["admin"]), CatchAsync(UserController.getUsers));

router
  .route("/:user_id")
  .get(CatchAsync(UserController.getUserById))
  .patch(updateInformationUser, checkUserOwnership, CatchAsync(UserController.updateUserById));

router.use(checkUserOwnership)
  .route("/:user_id/change-avatar")
  .patch(uploadMemory.single("file"), CatchAsync(UserController.changeAvatar));

module.exports = router;
