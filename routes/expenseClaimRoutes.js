//final
const express = require("express");
const { upload } = require("../middlewares/upload");
const {
  addExpenseClaim,
  getAllExpenseClaim,
  approveExpenseClaim,
  recjectExpenseClaim,
  reimburseExpenseClaim,
  reclaimExpenseClaim,
  deleteExpenseClaim,
  getExpenseClaimCount,
  getExpenseClaimOfEmployee,
  getExpenseClaimCountOfEmployee,
  getCategoryOfExpense,
} = require("../controllers/expenseClaimController");
const authenticate = require("../middlewares/authMiddleware");
const router = express.Router();

router.get(
  "/getCategoryOfExpense",
   authenticate(["EMPLOYEE","HR_EMPLOYEE", "HR_MANAGER"]),
   getCategoryOfExpense
)

router.post(
  "/",
  authenticate(["EMPLOYEE"]),
  upload.single("receipt"),
  addExpenseClaim
);

router.get(
  "/getAllExpenseClaims",
  authenticate(["EMPLOYEE", "HR_EMPLOYEE", "HR_MANAGER"]),
  getAllExpenseClaim
);

router.put(
  "/approve/:id",
  authenticate(["HR_EMPLOYEE", "HR_MANAGER"]),
  approveExpenseClaim
);

router.put(
  "/reject/:id",
  authenticate(["HR_EMPLOYEE", "HR_MANAGER"]),
  recjectExpenseClaim
);

router.put(
  "/reimburse/:id",
  authenticate(["HR_EMPLOYEE", "HR_MANAGER"]),
  reimburseExpenseClaim
);

router.put(
  "/reclaim/:id",
  authenticate(["EMPLOYEE"]),
  upload.single("receipt"),
  reclaimExpenseClaim
);

router.delete(
  "/delete/:id",
  authenticate(["HR_EMPLOYEE", "HR_MANAGER"]),
  deleteExpenseClaim
);

router.get(
  "/getExpenseClaimCount",
  authenticate(["HR_EMPLOYEE", "HR_MANAGER"]),
  getExpenseClaimCount
);

router.get(
  "/getExpenseClaimsOfEmployee",
  authenticate(["EMPLOYEE"]),
  getExpenseClaimOfEmployee
);

router.get(
  "/getExpenseClaimCountOfEmployee",
  authenticate(["EMPLOYEE"]),
  getExpenseClaimCountOfEmployee
);


module.exports = router;
