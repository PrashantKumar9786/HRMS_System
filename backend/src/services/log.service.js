const prisma = require("../utils/prisma");
const logger = require("../utils/logger");

const writeLog = async (org, action) => {
  // org can be the full org object {id, email} or just an id string
  const orgId = typeof org === "string" ? org : org.id;
  const identifier = typeof org === "string" ? org : org.email || org.id;

  // Replace ID placeholder with email in the action string
  const logAction = action.replace(`'${orgId}'`, `'${identifier}'`);

  try {
    await prisma.log.create({
      data: { orgId, action: logAction },
    });
    logger.info(logAction);
  } catch (err) {
    logger.error(`Failed to write log: ${err.message}`);
  }
};

module.exports = { writeLog };
