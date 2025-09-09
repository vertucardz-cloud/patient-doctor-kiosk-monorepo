import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

class PrismaService {
  private static instance: PrismaService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });
    this.attachMiddleware();
    this.attachEventHandlers();
  }

  public static get(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  public get client(): PrismaClient {
    return this.prisma;
  }

  private attachEventHandlers(): void {
    // this.prisma.$on(
    //   'query',
    //   (e: { query?: string; params?: any; duration?: number }) => {
    //     console.log(`Query: ${e?.query}`);
    //     console.log(`Params: ${e?.params}`);
    //     console.log(`Duration: ${e?.duration}ms`);
    //   }
    // );
    // this.prisma.$on('warn', (e: { message: string }) => {
    //   console.warn(e.message);
    // });
    // this.prisma.$on('info', (e: { message: string }) => {
    //   console.info(e.message);
    // });
    // this.prisma.$on('error', (e: { message: string }) => {
    //   console.error(e.message);
    // });
  }

  private attachMiddleware(): void {
    const confidentialFields: Record<string, string[]> = {
      User: ['apikey'], // add more fields as needed
      // Token: ['refreshToken'],
    };

    // this.prisma.$use(async (params, next) => {
    //   const { model, action, args } = params;

    //   // ✅ 1. Hash password before saving
    //   if (model === 'User' && ['create', 'update', 'upsert'].includes(action)) {
    //     const userData = args.data;

    //     if (userData?.password) {
    //       const saltRounds = 10;
    //       const hashed = await bcrypt.hash(userData.password, saltRounds);
    //       args.data.password = hashed;
    //     }
    //   }

    //   const result = await next(params);

    //   // ✅ 2. Strip confidential fields from returned result
    //   const removeFields = (data: any, fields: string[]) => {
    //     if (!data || typeof data !== 'object') return data;
    //     const clone = { ...data };
    //     for (const field of fields) {
    //       delete clone[field];
    //     }
    //     return clone;
    //   };

    //   const fieldsToRemove = confidentialFields[model ?? ''];
    //   if (!model || !fieldsToRemove) return result;

    //   if (Array.isArray(result)) {
    //     return result.map((item) => removeFields(item, fieldsToRemove));
    //   } else {
    //     return removeFields(result, fieldsToRemove);
    //   }
    // });
  }

  public async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

const Prisma = PrismaService.get();
export { Prisma };
