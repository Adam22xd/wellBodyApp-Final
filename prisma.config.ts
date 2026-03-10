// Load only DATABASE_URL for Prisma CLI so app env vars like PORT do not
// interfere with `prisma dev`, which manages its own ports.
import { existsSync, readFileSync } from "node:fs";
import { parse } from "dotenv";
import { defineConfig } from "prisma/config";

const envFile = existsSync(".env")
  ? parse(readFileSync(".env"))
  : {};

const databaseUrl = envFile.DATABASE_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
