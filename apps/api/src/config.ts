import 'dotenv/config';

function int(value: string | undefined, fallback: number): number {
  const n = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: int(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://rfl:rfl@localhost:5432/rfl',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-insecure-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  ai: {
    apiKey: process.env.AI_SERVICE_API_KEY ?? '',
    model: process.env.AI_SERVICE_MODEL ?? '',
  },
  processingConcurrency: int(process.env.PROCESSING_CONCURRENCY, 5),
  objectStorage: {
    endpoint: process.env.OBJECT_STORAGE_ENDPOINT ?? '',
    bucket: process.env.OBJECT_STORAGE_BUCKET ?? '',
    accessKey: process.env.OBJECT_STORAGE_ACCESS_KEY ?? '',
    secretKey: process.env.OBJECT_STORAGE_SECRET_KEY ?? '',
  },
  maxUploadSizeMb: int(process.env.MAX_UPLOAD_SIZE_MB, 10),
  get isProduction() {
    return this.env === 'production';
  },
} as const;
