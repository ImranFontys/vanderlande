import { z } from "zod";

const rawEnv = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_URL_RO: process.env.DATABASE_URL_RO,
  DATABASE_URL_RW: process.env.DATABASE_URL_RW,
  DATABASE_URL_ADMIN_MIGRATE: process.env.DATABASE_URL_ADMIN_MIGRATE,
  AVG_COST_PER_INCIDENT: process.env.AVG_COST_PER_INCIDENT,
  BASELINE_MINUTES_PER_CASE: process.env.BASELINE_MINUTES_PER_CASE,
  NEW_MINUTES_PER_CASE: process.env.NEW_MINUTES_PER_CASE,
  HOURS_PER_FTE_PER_YEAR: process.env.HOURS_PER_FTE_PER_YEAR,
  COST_PER_CALL: process.env.COST_PER_CALL,
  AVG_PENALTY_AMOUNT: process.env.AVG_PENALTY_AMOUNT,
  AVG_HOURLY_RATE: process.env.AVG_HOURLY_RATE,
  PROJECT_COSTS: process.env.PROJECT_COSTS,
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  ALLOWED_ORIGIN: z.string().url().optional(),
  DATABASE_URL: z.string().optional(),
  DATABASE_URL_RO: z.string().optional(),
  DATABASE_URL_RW: z.string().optional(),
  DATABASE_URL_ADMIN_MIGRATE: z.string().optional(),
  AVG_COST_PER_INCIDENT: z.coerce.number().optional(),
  BASELINE_MINUTES_PER_CASE: z.coerce.number().optional(),
  NEW_MINUTES_PER_CASE: z.coerce.number().optional(),
  HOURS_PER_FTE_PER_YEAR: z.coerce.number().optional(),
  COST_PER_CALL: z.coerce.number().optional(),
  AVG_PENALTY_AMOUNT: z.coerce.number().optional(),
  AVG_HOURLY_RATE: z.coerce.number().optional(),
  PROJECT_COSTS: z.coerce.number().optional(),
});

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  const message = parsed.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ");
  throw new Error(`Env validation failed: ${message}`);
}

const data = parsed.data;
const shared = data.DATABASE_URL ?? data.DATABASE_URL_RW ?? data.DATABASE_URL_RO;

const dbUrls = {
  ro: data.DATABASE_URL_RO ?? shared,
  rw: data.DATABASE_URL_RW ?? shared,
  admin: data.DATABASE_URL_ADMIN_MIGRATE ?? shared,
};

if (!dbUrls.ro || !dbUrls.rw) {
  throw new Error("DATABASE_URL_RW and DATABASE_URL_RO (or DATABASE_URL) must be configured.");
}

export const env = {
  nodeEnv: data.NODE_ENV,
  allowedOrigin: data.ALLOWED_ORIGIN,
  db: dbUrls,
  financeDefaults: {
    avgCostPerIncident: data.AVG_COST_PER_INCIDENT,
    baselineMinutesPerCase: data.BASELINE_MINUTES_PER_CASE,
    newMinutesPerCase: data.NEW_MINUTES_PER_CASE,
    hoursPerFtePerYear: data.HOURS_PER_FTE_PER_YEAR,
    costPerCall: data.COST_PER_CALL,
    avgPenaltyAmount: data.AVG_PENALTY_AMOUNT,
    avgHourlyRate: data.AVG_HOURLY_RATE,
    projectCosts: data.PROJECT_COSTS,
  },
} as const;

export type AppEnv = typeof env;
