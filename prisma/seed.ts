// prisma/seed.ts
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            password,
        },
    });

    console.log('Seeded user: demo@example.com / password123');
}

main().finally(() => prisma.$disconnect());
