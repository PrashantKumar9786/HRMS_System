const { validationResult } = require("express-validator");
const prisma = require("../utils/prisma");
const { writeLog } = require("../services/log.service");

// GET /api/teams
const getAllTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: { orgId: req.org.id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        members: {
          select: {
            employee: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = teams.map((team) => ({
      ...team,
      members: team.members.map((m) => m.employee),
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/teams/:id
const getTeamById = async (req, res) => {
  try {
    const team = await prisma.team.findFirst({
      where: { id: req.params.id, orgId: req.org.id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        members: {
          select: {
            employee: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found." });
    }

    res.status(200).json({
      ...team,
      members: team.members.map((m) => m.employee),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/teams
const createTeam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    const team = await prisma.team.create({
      data: { name, orgId: req.org.id },
    });

    await writeLog(
      req.org,
      `User '${req.org.id}' created new team '${team.name}'.`,
    );

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/teams/:id
const updateTeam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    const existing = await prisma.team.findFirst({
      where: { id: req.params.id, orgId: req.org.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Team not found." });
    }

    const updated = await prisma.team.update({
      where: { id: req.params.id },
      data: { name },
    });

    await writeLog(
      req.org,
      `User '${req.org.id}' updated team '${updated.name}'.`,
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/teams/:id
const deleteTeam = async (req, res) => {
  try {
    const existing = await prisma.team.findFirst({
      where: { id: req.params.id, orgId: req.org.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Team not found." });
    }

    await prisma.team.delete({ where: { id: req.params.id } });

    await writeLog(
      req.org,
      `User '${req.org.id}' deleted team '${existing.name}'.`,
    );

    res.status(200).json({ message: "Team deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/teams/:id/assign
const assignEmployee = async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ error: "employeeId is required." });
  }

  try {
    // Verify team belongs to org
    const team = await prisma.team.findFirst({
      where: { id: req.params.id, orgId: req.org.id },
    });
    if (!team) {
      return res.status(404).json({ error: "Team not found." });
    }

    // Verify employee belongs to org
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, orgId: req.org.id },
    });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found." });
    }

    // Check if already assigned
    const alreadyAssigned = await prisma.teamEmployee.findUnique({
      where: {
        employeeId_teamId: { employeeId, teamId: req.params.id },
      },
    });
    if (alreadyAssigned) {
      return res.status(409).json({ error: "Employee already in this team." });
    }

    await prisma.teamEmployee.create({
      data: { employeeId, teamId: req.params.id },
    });

    await writeLog(
      req.org,
      `User '${req.org.id}' assigned '${employee.name}' to team '${team.name}'.`,
    );

    res
      .status(200)
      .json({ message: "Employee assigned to team successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/teams/:id/assign/:employeeId
const removeEmployee = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const team = await prisma.team.findFirst({
      where: { id: req.params.id, orgId: req.org.id },
    });
    if (!team) {
      return res.status(404).json({ error: "Team not found." });
    }

    const assignment = await prisma.teamEmployee.findUnique({
      where: {
        employeeId_teamId: { employeeId, teamId: req.params.id },
      },
    });
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }

    await prisma.teamEmployee.delete({
      where: {
        employeeId_teamId: { employeeId, teamId: req.params.id },
      },
    });
    const emp = await prisma.employee.findFirst({ where: { id: employeeId } });
    const teamData = await prisma.team.findFirst({
      where: { id: req.params.id },
    });

    await writeLog(
      req.org,
      `User '${req.org.id}' removed '${emp.name}' from team '${teamData.name}'.`,
    );

    res.status(200).json({ message: "Employee removed from team." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  assignEmployee,
  removeEmployee,
};
