// import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const secretRouter = router({
    ping: publicProcedure.query(() => {
        return { message: 'pong from tRPC' };
    }),

});
