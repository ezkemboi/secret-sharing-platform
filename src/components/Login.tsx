import { useState } from "react";
import { Button, TextField, Typography, Box, Paper } from "@mui/material";
import { signIn } from "next-auth/react";

export default function Login({ onLogin }: { onLogin: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (res?.error) {
            setError("Invalid credentials");
        } else {
            onLogin();
        }
    };

    return (
        <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
            <Paper elevation={3} sx={{ padding: 4 }}>
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
                    <Button variant="contained" onClick={handleLogin}>
                        Log In
                    </Button>
                    {error && <Typography color="error">{error}</Typography>}
                </Box>
            </Paper>
        </Box>
    );
}
