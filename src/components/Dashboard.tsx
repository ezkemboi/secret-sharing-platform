import {
    Typography,
    Button,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { useState } from 'react';

interface Props {
    onLogout: () => void;
}

const mockSecrets = [
    {
        id: '1',
        content: 'My secret message...',
        viewed: false,
        oneTime: true,
        expiresAt: '2025-06-30T10:00',
    },
    {
        id: '2',
        content: 'Another one',
        viewed: true,
        oneTime: false,
        expiresAt: '2024-06-24T12:00',
    },
];

export default function Dashboard({ onLogout }: Props) {
    const [open, setOpen] = useState(false);
    const [secret, setSecret] = useState('');
    const [viewOnce, setViewOnce] = useState(true);
    const [requirePassword, setRequirePassword] = useState(true);
    const [password, setPassword] = useState('');

    const defaultExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16);
    const [expiresAt, setExpiresAt] = useState(defaultExpiry);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSubmit = () => {
        const payload = {
            content: secret,
            oneTime: viewOnce,
            password: requirePassword ? password : undefined,
            expiresAt,
        };
        console.log('Submitting Secret:', payload);
        // Reset form
        setSecret('');
        setPassword('');
        setExpiresAt(defaultExpiry);
        setRequirePassword(true);
        setViewOnce(true);
        handleClose();
    };

    const isExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date();
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4">🔐 Secrets Dashboard</Typography>
                <Box display="flex" gap={2}>
                    <Button variant="contained" onClick={handleOpen}>
                        Add Secret
                    </Button>
                    <Button variant="outlined" onClick={onLogout}>
                        Logout
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Your Secrets
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Preview</TableCell>
                                <TableCell>One-Time</TableCell>
                                <TableCell>Viewed</TableCell>
                                <TableCell>Expires At</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mockSecrets.map((secret) => (
                                <TableRow key={secret.id}>
                                    <TableCell>{secret.content.slice(0, 30)}...</TableCell>
                                    <TableCell>{secret.oneTime ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{secret.viewed ? '✅' : '❌'}</TableCell>
                                    <TableCell>{new Date(secret.expiresAt).toLocaleString()}</TableCell>
                                    <TableCell>
                                        {isExpired(secret.expiresAt)
                                            ? 'Expired'
                                            : secret.viewed && secret.oneTime
                                                ? 'Deleted'
                                                : 'Active'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* 👇 Secret Creation Modal */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Create a New Secret</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            label="Enter Secret"
                            fullWidth
                            multiline
                            minRows={3}
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={viewOnce}
                                    onChange={(e) => setViewOnce(e.target.checked)}
                                />
                            }
                            label="View Once (default)"
                        />

                        <TextField
                            label="Expiration Time"
                            type="datetime-local"
                            InputLabelProps={{ shrink: true }}
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={requirePassword}
                                    onChange={(e) => setRequirePassword(e.target.checked)}
                                />
                            }
                            label="Require Password (default)"
                        />

                        {requirePassword && (
                            <TextField
                                label="Password"
                                type="password"
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Save Secret
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
