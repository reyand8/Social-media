import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Service for managing database connections and interactions using Prisma.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	async onModuleInit(): Promise<void> {
		await this.$connect();
	}
}