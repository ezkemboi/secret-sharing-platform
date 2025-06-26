import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import CredentialsProvider, { type CredentialsConfig } from "next-auth/providers/credentials";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcrypt";
import type { JWT as JWTType } from "next-auth/jwt";

interface CustomToken extends JWTType {
    id?: string;
    email?: string | null;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                return { id: user.id, email: user.email };
            },
        }) as CredentialsConfig<{
            email: { label: string; type: string };
            password: { label: string; type: string };
        }>,
    ],
    callbacks: {
        async session({ session, token }): Promise<Session> {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email ?? '';
            }
            return session;
        },
        async jwt({ token, user }): Promise<CustomToken> {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: "/",
    },
};

export default NextAuth(authOptions);
