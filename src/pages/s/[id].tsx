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
    const [showSecret, setShowSecret] = useState(false);
    const [secretContent, setSecretContent] = useState('');

    const {
        data: secretLink,
        isLoading,
        error,
    } = trpc.secret.getSecretLink.useQuery(
        { encryptedId: id as string },
        { enabled: !!id }
    );

    const viewLink = trpc.secret.viewLink.useMutation({
        onSuccess: (data) => {
            setSecretContent(data.content);
            setShowSecret(true);
        },
        onError: (err: unknown) => {
            console.log(err);
            setPasswordError('Invalid password. Please try again.');
        },
    });

    const handleViewSecret = () => {
        setPasswordError('');
        viewLink.mutate({
            encryptedId: id as string,
            password: secretLink?.requirePassword ? enteredPassword : undefined,
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

    if (error) {
        let message = 'An unexpected error occurred.';
        if (error.data?.code === 'FORBIDDEN') {
            message = 'This secret link has expired.';
        } else if (error.data?.code === 'BAD_REQUEST') {
            message = 'This secret was already viewed and is no longer available.';
        } else if (error.data?.code === 'NOT_FOUND') {
            message = 'Secret not found.';
        }
        return (
            <Box textAlign="center" mt={8}>
                <Alert severity="error">{message}</Alert>
            </Box>
        );
    }

    return (
        <Box display="flex" justifyContent="center" mt={8}>
            <Paper sx={{ p: 4, width: '100%', maxWidth: 600 }}>
                <Typography variant="h5" gutterBottom>
                    🔐 Secret Message
                </Typography>

                {showSecret ? (
                    <>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Secret loaded.
                        </Alert>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Typography component="pre" sx={{ wordBreak: 'break-word' }}>
                                {secretContent}
                            </Typography>
                        </Paper>
                    </>
                ) : (
                    <>
                        {secretLink?.requirePassword && (
                            <>
                                <Typography sx={{ mb: 2 }}>
                                    This secret is protected. Please enter the password.
                                </Typography>
                                {passwordError && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {passwordError}
                                    </Alert>
                                )}
                                <TextField
                                    label="Password"
                                    type="password"
                                    fullWidth
                                    value={enteredPassword}
                                    onChange={(e) => setEnteredPassword(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            </>
                        )}

                        <Button
                            variant="contained"
                            onClick={handleViewSecret}
                            disabled={viewLink.status === 'pending'}
                        >
                            {viewLink?.isPending ? 'Loading...' : 'View Secret'}
                        </Button>
                    </>
                )}
            </Paper>
        </Box>
    );
}
