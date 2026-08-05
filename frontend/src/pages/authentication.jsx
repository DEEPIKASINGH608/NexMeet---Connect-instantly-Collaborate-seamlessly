import React from 'react';
import { Grid, TextField, Button, Paper, Box, Avatar, CssBaseline, ThemeProvider, Snackbar, createTheme, FormControlLabel, Checkbox } from "@mui/material";
import { LockOutlined as LockOutlinedIcon } from "@mui/icons-material";
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const blueAuthTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#3b82f6' },
        background: { default: '#0f172a', paper: '#041228' }
    }
});

const blueInputStyles = {
    '& .MuiInputBase-input': { color: '#ffffff' },
    '& .MuiInputLabel-root': { color: '#e4e8ef' },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#b1bfd3' },
        '&:hover fieldset': { borderColor: '#0c2c5f' },
        '&.Mui-focused fieldset': { borderColor: '#0b2b5d' },
    },
};

export default function AuthForm() {
    const [name, setName] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [message, setMessage] = React.useState('');
    const location = useLocation();
    const initialFormState = location.state?.defaultForm !== undefined ? location.state.defaultForm : 0;
    const [formState, setFormState] = React.useState(initialFormState);
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            setError('');
            if (formState === 0) {
                await handleLogin(username, password);
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                setMessage(result);
                setUsername("");
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
            }
        } catch (err) {
            let errorMessage = err.response?.data?.message || err.message || "An error occurred";
            setError(errorMessage);
        }
    };

    return (
        <ThemeProvider theme={blueAuthTheme}>
            <Grid container component="main" sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#0f172a' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={11}
                    sm={7}
                    md={4}
                    component={Paper}
                    elevation={12}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: '16px',
                        backgroundColor: '#1e293b',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: '#2563eb' }}>
                        <LockOutlinedIcon />
                    </Avatar>

                    <Box sx={{ mb: 3, mt: 1, bgcolor: '#0f172a', p: '4px', borderRadius: '8px' }}>
                        <Button
                            variant="text"
                            onClick={() => setFormState(0)}
                            sx={{ px: 3, bgcolor: formState === 0 ? '#2563eb' : 'transparent', color: '#ffffff', '&:hover': { bgcolor: formState === 0 ? '#1d4ed8' : 'rgba(255,255,255,0.05)' } }}
                        >
                            Sign In
                        </Button>
                        <Button
                            variant="text"
                            onClick={() => setFormState(1)}
                            sx={{ px: 3, bgcolor: formState === 1 ? '#2563eb' : 'transparent', color: '#ffffff', '&:hover': { bgcolor: formState === 1 ? '#1d4ed8' : 'rgba(255,255,255,0.05)' } }}
                        >
                            Sign Up
                        </Button>
                    </Box>

                    <Box component="form" noValidate sx={{ width: '100%' }}>
                        {formState === 1 && (
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Full Name"
                                name="name"
                                autoFocus
                                sx={blueInputStyles}
                                onChange={(e)=>setName(e.target.value)}
                            />
                        )}

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            value={username}
                            sx={blueInputStyles}
                            onChange={(e)=>setUsername(e.target.value)}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="password"
                            label="Password"
                            name="password"
                            type="password"
                            value={password}
                            sx={blueInputStyles}
                            onChange={(e)=>setPassword(e.target.value)}
                        />

                        <FormControlLabel
                            control={<Checkbox value="remember" sx={{ color: '#cad2df', '&.Mui-checked': { color: '#3b82f6' } }} />}
                            label="Remember me"
                            sx={{ color: '#94a3b8', mt: 1 }}
                        />

                        {error && <p style={{ color: "#ef4444", marginTop: '8px', fontSize: '0.9rem' }}>{error}</p>}

                        <Button
                            type="button"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.2, bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, fontWeight: 'bold', color: '#ffffff', borderRadius: '8px' }}
                            onClick={handleAuth}
                        >
                            {formState === 0 ? "Login" : "Register"}
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)} message={message} />
        </ThemeProvider>
    );
}



