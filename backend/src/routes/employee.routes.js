const express = require("express");
const { body } = require("express-validator");
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employee.controller");
const auth = require("../middleware/auth");

const router = express.Router();

// All employee routes require authentication
router.use(auth);

router.get("/", getAllEmployees);
router.get("/:id", getEmployeeById);

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("Valid email is required."),
    body("role").trim().notEmpty().withMessage("Role is required."),
  ],
  createEmployee,
);

router.put(
  "/:id",
  [body("email").optional().isEmail().withMessage("Valid email is required.")],
  updateEmployee,
);

router.delete("/:id", deleteEmployee);

module.exports = router;
