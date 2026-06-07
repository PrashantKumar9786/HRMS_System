const { validationResult } = require("express-validator");
const prisma = require("../utils/prisma");
const { writeLog } = require("../services/log.service");

const getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { orgId: req.org.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        teams: {
          select: {
            team: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = employees.map((emp) => ({
      ...emp,
      teams: emp.teams.map((t) => t.team),
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await prisma.employee.findFirst({
      where: { id: req.params.id, orgId: req.org.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        teams: {
          select: {
            team: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found." });
    }

    res.status(200).json({
      ...employee,
      teams: employee.teams.map((t) => t.team),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createEmployee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, role } = req.body;

  try {
    const employee = await prisma.employee.create({
      data: { name, email, role, orgId: req.org.id },
    });

    await writeLog(
      req.org,
      `User '${req.org.id}' added new employee '${employee.name}'.`,
    );

    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateEmployee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, role } = req.body;

  try {
    const existing = await prisma.employee.findFirst({
      where: { id: req.params.id, orgId: req.org.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Employee not found." });
    }

    const updated = await prisma.employee.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      },
    });

    await writeLog(
      req.org,
      `User '${req.org.id}' updated employee '${updated.name}'.`,
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const existing = await prisma.employee.findFirst({
      where: { id: req.params.id, orgId: req.org.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Employee not found." });
    }

    await prisma.employee.delete({ where: { id: req.params.id } });
    const toDelete = await prisma.employee.findFirst({
      where: { id: req.params.id, orgId: req.org.id },
    });
    await writeLog(
      req.org,
      `User '${req.org.id}' deleted employee '${toDelete.name}'.`,
    );

    res.status(200).json({ message: "Employee deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
