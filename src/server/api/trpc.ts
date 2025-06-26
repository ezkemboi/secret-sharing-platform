import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { prisma } from '../db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { type NextApiRequest, type NextApiResponse } from 'next';

// Updated context type
export const createContext = async ({ req, res }: { req: NextApiRequest; res: NextApiResponse }) => {
    const session = await getServerSession(req, res, authOptions);
    console.log(session);
    return {
        prisma,
        session,
    };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
    transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
        throw new Error('Not authenticated');
    }

    return next({
        ctx: {
            ...ctx,
            session: ctx.session,
        },
    });
});
