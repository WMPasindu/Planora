import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config({ path: process.env.BACKEND_ENV_FILE || '.env' });

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function envNumber(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function envBool(name: string, fallback = false): boolean {
  const value = process.env[name];
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export function createServiceApp(service: string) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/health', (_req, res) => {
    res.json({ service, status: 'ok', now: new Date().toISOString() });
  });
  return app;
}

export function servicePort(envName: string, fallback: number): number {
  return envNumber(envName, fallback);
}

