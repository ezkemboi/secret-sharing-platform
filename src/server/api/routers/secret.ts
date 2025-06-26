import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { encrypt, decrypt } from '@/utils/encryption';

export const secretRouter = router({
    getSecrets: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.secret.findMany({
            // add get by user, the secrets
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
        const secret = await ctx.prisma.secret.create({
            data: {
                // add user_id for creation of user
                content: input.content,
                oneTime: input.oneTime,
                password: input.password,
                expiresAt: new Date(input.expiresAt),
            },
        });

        const link = await ctx.prisma.secretLink.create({
            data: {
                secretId: secret.id, // encrypt this id
                expiresAt: new Date(input.expiresAt),
            },
        });
        const encryptedId = encrypt(link.id);
        // can see if we can save in a DB or not, since, if we encrypt, the same results is received
        return {
            ...secret,
            shareableLink: `${process.env.DOMAIN}/s/${encodeURIComponent(encryptedId)}`
        };
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
        // check if this user from the token is the same as the one who created, so as to enable editing
        const secret = await ctx.prisma.secret.update({
            where: { id: input.id },
            data: {
                content: input.content,
                oneTime: input.oneTime,
                password: input.password,
                expiresAt: new Date(input.expiresAt)
            }
        })
        // update expiredAt for link
        await ctx.prisma.secretLink.update({
            where: { secretId: secret.id },
            data: {
                expiresAt: secret.expiresAt
            }
        })

        return secret
    }),

    deleteSecret: publicProcedure.input(
        z.object({ id: z.string() })
    ).mutation(async ({ ctx, input }) => {
        // Make sure the original person is the one deleting the secret (use token for this)
        return ctx.prisma.secret.delete({
            where: {id: input.id},
        });
    }),

    getSecretLink: publicProcedure.input(
        z.object({ encryptedId: z.string()})
    ).query(async ({ ctx, input }) => {
            const decryptedId = decrypt(input.encryptedId);

            const link = await ctx.prisma.secretLink.findUnique({
                where: { id: decryptedId },
                include: { secret: true },
            });

            if (!link) throw new Error('Invalid or expired link');
            if (link.expiresAt < new Date()) throw new Error('Link expired');

            // Optional: mark viewed
            await ctx.prisma.secret.update({
                where: { id: link.secretId },
                data: { viewed: true }
            });

            return link.secret; // what to send
        }
    )
});
