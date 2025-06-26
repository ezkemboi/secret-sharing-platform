import {
    Typography,
    Button,
    Box,
    Paper,
    TextField,
    Checkbox,
    FormControlLabel,
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
    IconButton,
    Chip
} from '@mui/material';
import { useState } from 'react';
import { Edit, Delete } from '@mui/icons-material';
import { trpc } from '@/utils/trpc';

interface Props {
    onLogout: () => void;
}

interface Secret {
    id: string;
    content: string;
    viewed: boolean;
    oneTime: boolean;
    expiresAt: Date;
    // password: string | null;
    // createdAt: Date;
    // updatedAt: Date;
}

export default function Dashboard({ onLogout }: Props) {
    const createSecret = trpc.secret.createSecret.useMutation();
    const updateSecret = trpc.secret.updateSecret.useMutation();
    const deleteSecret = trpc.secret.deleteSecret.useMutation();
    const utils = trpc.useUtils(); // refetch secrets after mutations
    const { data: secrets } = trpc.secret.getSecrets.useQuery();
    const [search, setSearch] = useState('');

    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [secret, setSecret] = useState('');
    const [viewOnce, setViewOnce] = useState(true);
    const [requirePassword, setRequirePassword] = useState(true);
    const [password, setPassword] = useState('');

    const [deleteTarget, setDeleteTarget] = useState<Secret | null>(null);

    const defaultExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16);
    const [expiresAt, setExpiresAt] = useState(defaultExpiry);

    const isExpired = (expiresAt: Date) => expiresAt < new Date();

    const handleOpenCreate = () => {
        setEditMode(false);
        setEditingId(null);
        resetForm();
        setOpen(true);
    };

    const handleEdit = (secret: Secret) => {
        setEditMode(true);
        setEditingId(secret.id);
        setSecret(secret.content);
        setViewOnce(secret.oneTime);
        setExpiresAt(new Date(secret.expiresAt).toISOString().slice(0, 16));
        setRequirePassword(false); // Optional: assume not needed for edit
        setPassword('');
        setOpen(true);
    };

    // const handleDelete = (id: string) => {
    //     // handle delete here
    // };

    const resetForm = () => {
        setSecret('');
        setPassword('');
        setExpiresAt(defaultExpiry);
        setRequirePassword(true);
        setViewOnce(true);
    };

    const handleClose = () => {
        resetForm();
        setOpen(false);
    };

    const handleSubmit = () => {
        const payload = {
            content: secret,
            oneTime: viewOnce,
            password: requirePassword ? password : undefined,
            expiresAt,
        };

        if (editMode && editingId) {
            updateSecret.mutate(
                { id: editingId, ...payload },
                {
                    onSuccess: () => {
                        utils.secret.getSecrets.invalidate(); // refresh list
                        console.log('Secret updated!');
                    },
                }
            );
        } else {
            createSecret.mutate(payload, {
                onSuccess: () => {
                    console.log('Secret created!');
                    // You can refetch secrets or clear form here
                },
                onError: (err) => {
                    console.error('Failed to create secret:', err);
                },
            });
        }
        handleClose();
    };

    const filteredSecrets = (secrets || []).filter((s) =>
        s.content.toLowerCase().includes(search.toLowerCase())
    );

    const handleDeleteClick = (secret: Secret) => {
        setDeleteTarget(secret);
    };

    const confirmDelete = () => {
        if (deleteTarget) {
            deleteSecret.mutate(
                { id: deleteTarget.id },
                {
                    onSuccess: () => {
                        utils.secret.getSecrets.invalidate();
                        setDeleteTarget(null);
                    },
                }
            );
            setDeleteTarget(null);
        }
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4">🔐 Secrets Dashboard</Typography>
                <Box display="flex" gap={2}>
                    <Button variant="contained" onClick={handleOpenCreate}>
                        Add Secret
                    </Button>
                    <Button variant="outlined" onClick={onLogout}>
                        Logout
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
                <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Your Secrets</Typography>
                    <TextField
                        size="small"
                        placeholder="Search..."
                        value={search}
                        sx={{ width: '60%' }}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Preview</TableCell>
                                <TableCell>One-Time</TableCell>
                                <TableCell>Viewed</TableCell>
                                <TableCell>Expires At</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredSecrets.map((secret) => (
                                <TableRow key={secret.id}>
                                    <TableCell>{secret.content.slice(0, 30)}...</TableCell>
                                    <TableCell>{secret.oneTime ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{secret.viewed ? '✅' : '❌'}</TableCell>
                                    <TableCell>
                                        {new Date(secret.expiresAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {isExpired(secret.expiresAt) ? (
                                            <Chip label="Expired" color="error" />
                                        ) : secret.viewed && secret.oneTime ? (
                                            <Chip label="Viewed" color="secondary" />
                                        ) : (
                                            <Chip label="Active" color="success" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton color={"info"} onClick={() => handleEdit(secret)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton color={"warning"} onClick={() => handleDeleteClick(secret)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Secret Modal */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editMode ? 'Edit Secret' : 'Create a New Secret'}</DialogTitle>
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
                            label="View Once"
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
                            label="Require Password"
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
                        {editMode ? 'Update' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Delete Secret</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this secret?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
