import { useState } from 'react';
import {
    Button,
    TextField,
    Typography,
    Box,
    Paper,
} from '@mui/material';

interface Props {
    onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <Box
            minHeight="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Secure Secret Share — Login
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                        label="Email"
                        fullWidth
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        fullWidth
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        onClick={() => {
                            localStorage.setItem('token', 'demo-token');
                            onLogin();
                        }}
                    >
                        Log In
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
