const express = require("express");
const { body } = require("express-validator");
const {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  assignEmployee,
  removeEmployee,
} = require("../controllers/team.controller");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/", getAllTeams);
router.get("/:id", getTeamById);

router.post(
  "/",
  [body("name").trim().notEmpty().withMessage("Team name is required.")],
  createTeam,
);

router.put(
  "/:id",
  [body("name").trim().notEmpty().withMessage("Team name is required.")],
  updateTeam,
);

router.delete("/:id", deleteTeam);

// Assignment routes
router.post("/:id/assign", assignEmployee);
router.delete("/:id/assign/:employeeId", removeEmployee);

module.exports = router;
