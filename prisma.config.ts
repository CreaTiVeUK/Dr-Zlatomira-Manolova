import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Migrations run over a direct (non-pooled) connection — pgbouncer's
// pooled connections don't support the DDL Prisma Migrate needs.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("POSTGRES_URL_NON_POOLING"),
  },
});
