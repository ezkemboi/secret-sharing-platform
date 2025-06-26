import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    TextField,
    Button,
    Alert,
} from '@mui/material';
import { useRouter } from 'next/router';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';

export default function SecretViewPage() {
    const router = useRouter();
    const { id } = router.query;

    const [enteredPassword, setEnteredPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [revealedContent, setRevealedContent] = useState<string | null>(null);

    const {
        data: secretLink,
        isLoading,
        error,
    } = trpc.secret.getSecretLink.useQuery(
        { encryptedId: id as string },
        { enabled: !!id }
    );

    const verifyPassword = trpc.secret.verifyPassword.useMutation({
        onSuccess: (data) => {
            setRevealedContent(data.content);
        },
        onError: () => {
            setPasswordError('Invalid password. Please try again.');
        },
    });

    const handleSubmitPassword = () => {
        setPasswordError('');
        verifyPassword.mutate({
            encryptedId: id as string,
            password: enteredPassword,
        });
    };

    if (isLoading) {
        return (
            <Box textAlign="center" mt={8}>
                <CircularProgress />
                <Typography>Loading secret...</Typography>
            </Box>
        );
    }

    if (error || !secretLink) {
        return (
            <Box textAlign="center" mt={8}>
                <Alert severity="error">
                    {error?.message ?? 'Secret not found or already expired.'}
                </Alert>
            </Box>
        );
    }

    const isExpired = new Date(secretLink.expiresAt) < new Date();
    if (isExpired) {
        return (
            <Box textAlign="center" mt={8}>
                <Alert severity="warning">This secret has expired.</Alert>
            </Box>
        );
    }

    const hasPassword = !!secretLink.password;

    return (
        <Box display="flex" justifyContent="center" mt={8}>
            <Paper sx={{ p: 4, width: '100%', maxWidth: 600 }}>
                <Typography variant="h5" gutterBottom>
                    🔐 Secret Message
                </Typography>

                {!revealedContent && hasPassword ? (
                    <>
                        <Typography sx={{ mb: 2 }}>
                            This secret is protected. Please enter the password to view it.
                        </Typography>

                        {passwordError && <Alert severity="error">{passwordError}</Alert>}

                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            value={enteredPassword}
                            onChange={(e) => setEnteredPassword(e.target.value)}
                            sx={{ mt: 2 }}
                        />

                        <Button
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={handleSubmitPassword}
                            disabled={verifyPassword.isLoading}
                        >
                            {verifyPassword.isLoading ? 'Verifying...' : 'View Secret'}
                        </Button>
                    </>
                ) : (
                    <>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            You may now view the secret.
                        </Alert>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Typography component="pre" sx={{ wordBreak: 'break-word' }}>
                                {revealedContent ?? secretLink?.secret?.content}
                            </Typography>
                        </Paper>
                    </>
                )}
            </Paper>
        </Box>
    );
}
