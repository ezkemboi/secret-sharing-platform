// import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const secretRouter = router({
    getSecrets: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.secret.findMany({
            orderBy: {createdAt: 'desc'},
        });
    }),
});
