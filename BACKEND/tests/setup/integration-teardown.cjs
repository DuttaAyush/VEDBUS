'use strict';

module.exports = async function integrationTeardown() {
  // This process inherits DATABASE_URL only after test-env validated it. The
  // disconnect itself does not query the database and prevents health-only
  // suites from leaving a Prisma handle behind.
  const { PrismaClient } = require('@prisma/client');
  const client = new PrismaClient();
  await client.$disconnect();
};
