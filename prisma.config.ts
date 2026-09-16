import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations run over a direct (non-pooled) connection — pgbouncer's
// pooled connections don't support the DDL Prisma Migrate needs.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Generation/builds do not connect to a database. CLI database commands
    // still require this variable; Prisma reports a missing URL for those.
    url: process.env.POSTGRES_URL_NON_POOLING,
  },
});
