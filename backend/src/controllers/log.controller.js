const prisma = require("../utils/prisma");

// GET /api/logs
const getLogs = async (req, res) => {
  try {
    const logs = await prisma.log.findMany({
      where: { orgId: req.org.id },
      orderBy: { createdAt: "desc" },
      take: 100, // Return last 100 logs
    });

    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getLogs };
