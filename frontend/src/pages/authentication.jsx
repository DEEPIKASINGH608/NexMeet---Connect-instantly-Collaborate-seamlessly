import React from 'react';
import { Grid, TextField, Button,Paper, Box, Avatar, CssBaseline, ThemeProvider, Snackbar, createTheme, FormControlLabel } from "@mui/material";
import { LockOutlined as LockOutlinedIcon } from "@mui/icons-material";
import { AuthContext } from '../contexts/AuthContext';

const defaultTheme = createTheme();

export default function AuthForm() {
    const [name, setName] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [message, setMessage] = React.useState('');
    const location = useLocation();
    const [formState, setFormState] = React.useState(intialFormState);
    const [open, setOpen] = React.useState(false);
    const initialFormState = location.state?.defaultForm !== undefined ? location.state.defaultForm : 0;
    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            setError('');
            if (formState === 0) {
                let result = await handleLogin(username, password);
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setMessage(result);
                setUsername("");
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
            }
        } catch (err) {
            let errorMessage = err.response?.data?.message || err.message || "An error occurred";
            setError(errorMessage);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={12}
                    sm={4}
                    md={7}
                    sx={{
                        my: 8,
                        mx: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>

                    <div>
                        <Button
                            variant={formState === 0 ? "contained" : "text"}
                            onClick={() => setFormState(0)}
                        >
                            Sign In
                        </Button>
                        <Button
                            variant={formState === 1 ? "contained" : "text"}
                            onClick={() => setFormState(1)}
                        >
                            Sign Up
                        </Button>
                    </div>

                    <Box component="form" noValidate sx={{ mt: 1 }}>
                        <p>{name}</p>
                        {formState === 1 ?  <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Full Name"
                                name="username"
                                autoFocus
                                onChange={(e)=>setName(e.target.value)}
                                /> : <></>
                        }

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoFocus
                            onChange={(e)=>setUsername(e.target.value)}
                            />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="password"
                            label="Password"
                            type="password"
                            onChange={(e)=>setPassword(e.target.value)}
                            />

                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary" />}
                                label="Remember me"
                            />

                        {error && <p style={{ color: "red" }}>{error}</p>}

                        <Button
                            type="button"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            onClick={handleAuth}
                        >
                            {formState === 0 ? "Login" : "Register"}
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                message={message}
            />
        </ThemeProvider>
    );
}


