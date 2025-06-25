import { router } from './trpc';
import { secretRouter } from './routers/secret';

export const appRouter = router({
    secret: secretRouter,
    // Auth Route goes here
});

// Export type definition of API
export type AppRouter = typeof appRouter;
