import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { trpc } from '@/utils/trpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import superjson from 'superjson';
import { httpBatchLink } from '@trpc/client';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: '/api/trpc',
                    transformer: superjson,
                }),
            ],
        })
    );

    return (
        <SessionProvider session={session}>
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                    <Component {...pageProps} />
                </QueryClientProvider>
            </trpc.Provider>
        </SessionProvider>
    );
}

export default MyApp;
