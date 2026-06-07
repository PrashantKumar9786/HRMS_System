const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const prisma = require("../utils/prisma");
const { writeLog } = require("../services/log.service");

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const existing = await prisma.organisation.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const org = await prisma.organisation.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({
      message: "Organisation registered successfully.",
      org: { id: org.id, name: org.name, email: org.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const org = await prisma.organisation.findUnique({ where: { email } });
    if (!org) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, org.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: org.id, email: org.email, name: org.name },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    await writeLog(org, `User '${org.id}' logged in.`);

    res.status(200).json({
      token,
      org: { id: org.id, name: org.name, email: org.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const logout = async (req, res) => {
  try {
    await writeLog(req.org, `User '${req.org.id}' logged out.`);
    res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, logout };
