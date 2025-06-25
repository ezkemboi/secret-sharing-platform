import { trpc } from '@/utils/trpc';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // this will only run on client
  }, []);

  const ping = trpc.secret.ping.useQuery(undefined, {
    enabled: isClient,
  });

  if (!isClient || ping.isLoading) return <p>Loading...</p>;
  if (ping.error) return <p>Error: {ping.error.message}</p>;

  return <p>Response: {ping.data?.message}</p>;
}
