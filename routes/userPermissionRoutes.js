const express = require("express");
const {
  grantPermission,
  revokePermission,
  getUserPermissions,
  getPermissions,
} = require("../controllers/userPermissionController");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const { isHRManager } = require("../middlewares/isHRManager");

router.post(
  "/", 
  authenticate(["HR_MANAGER"]), 
  isHRManager, 
  grantPermission
);

router.delete(
  "/:id",
  authenticate(["HR_MANAGER"]),
  isHRManager,
  revokePermission
);

router.get(
  "/:userId",
  authenticate(["HR_MANAGER"]),
  isHRManager,
  getUserPermissions
);

router.get(
  "/permissions/list",
  authenticate(["HR_MANAGER"]),
  isHRManager,
  getPermissions
);

module.exports = router;
