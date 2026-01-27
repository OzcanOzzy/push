import 'dotenv/config';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required for Prisma.');
    }

    const ssl =
      databaseUrl.includes('sslmode=require') ||
      databaseUrl.includes('sslmode=verify-ca') ||
      databaseUrl.includes('sslmode=verify-full')
        ? { rejectUnauthorized: false }
        : undefined;
    const pool = new Pool({ connectionString: databaseUrl, ssl });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
