import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const secretRouter = router({
    getSecrets: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.secret.findMany({
            orderBy: {createdAt: 'desc'},
        });
    }),

    createSecret: publicProcedure.input(
        z.object({
            content: z.string().min(1),
            oneTime: z.boolean(),
            password: z.string().optional(),
            expiresAt: z.string(),
        })
    ).mutation(async ({ ctx, input }) => {
        return ctx.prisma.secret.create({
            data: {
                content: input.content,
                oneTime: input.oneTime,
                password: input.password,
                expiresAt: new Date(input.expiresAt),
            },
        });
    }),

    updateSecret: publicProcedure.input(
        z.object({
            id: z.string(),
            content: z.string(),
            oneTime: z.boolean(),
            password: z.string().optional(),
            expiresAt: z.string(),
        })
    ).mutation(async ({ ctx, input }) => {
        return ctx.prisma.secret.update({
            where: { id: input.id },
            data: {
                content: input.content,
                oneTime: input.oneTime,
                password: input.password,
                expiresAt: new Date(input.expiresAt)
            }
        })
    }),

    deleteSecret: publicProcedure.input(
        z.object({ id: z.string()
        })
    ).mutation(async ({ ctx, input }) => {
        return ctx.prisma.secret.delete({
            where: {id: input.id},
        });
    }),
});
