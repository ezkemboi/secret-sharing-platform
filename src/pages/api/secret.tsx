import { useRouter } from 'next/router';
import { trpc } from '@/utils/trpc';

export default function SecretViewPage() {
    const router = useRouter();
    const { id } = router.query;

    const { data: secret, isLoading, error } = trpc.secret.getSecretLink.useQuery({
        encryptedId: id as string,
    }, {
        enabled: !!id
    });

    // add enter password for generated password
    console.log('----->>>>>>', secret);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!secret) return <p>No secret found or it has expired.</p>;

    return (
        <div>
            <h2>Secret</h2>
            <pre>{secret.content}</pre>
        </div>
    );
}
