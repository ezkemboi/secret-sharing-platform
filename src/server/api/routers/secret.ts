import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { encrypt, decrypt } from '@/utils/encryption';
import bcrypt from 'bcrypt';

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
        const hashedPassword = input.password
            ? await bcrypt.hash(input.password, 10)
            : undefined;
        const secret = await ctx.prisma.secret.create({
            data: {
                // add user_id for creation of user
                content: input.content,
                oneTime: input.oneTime,
                password: hashedPassword,
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
        return {
            secret,
            shareableUrl: `${process.env.DOMAIN}/s/${encodeURIComponent(encryptedId)}`
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

            if (!link) throw new TRPCError({ code: 'NOT_FOUND', message: 'Secret link not found' });

            const now = new Date();
            if (link.expiresAt < now) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'This secret has expired.' });
            }

            const { secret } = link

            if (secret.viewed && secret.oneTime) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'This secret was already viewed.' });
            }

            return {
                expiresAt: link.expiresAt,
                oneTime: secret.oneTime,
                requirePassword: !!secret.password,
                viewed: secret.viewed,
                encryptedId: input.encryptedId
            };
        }
    ),

    viewLink: publicProcedure.input(z.object({
        encryptedId: z.string(),
        password: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
        const link = await ctx.prisma.secretLink.findUnique({
            where: { id: decrypt(input.encryptedId) }, // assuming you're encrypting `id`
            include: { secret: true },
        });

        if (!link) throw new TRPCError({ code: 'NOT_FOUND', message: 'Link not found' });
        if (link.expiresAt < new Date()) throw new TRPCError({ code: 'FORBIDDEN', message: 'Expired link' });
        const { secret } = link;

        // Check if secret was already viewed and was one-time
        if (secret.viewed && secret.oneTime) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'This secret was already viewed.' });
        }

        // Check password
        const hasPassword = !!link.secret?.password;
        if (hasPassword) {
            const valid = await bcrypt.compare(input.password ?? '', link.secret.password ?? '');
            if (!valid) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Incorrect password' });
        }

        // Mark as viewed + delete link if it's a one-time secret
        if (secret.oneTime) {
            await ctx.prisma.secret.update({
                where: { id: secret.id },
                data: { viewed: true },
            });
            await ctx.prisma.secretLink.delete({
                where: { id: link.id },
            });
        }

        return { content: secret.content };
    })
});
