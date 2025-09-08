import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { useAuth } from '../../layouts/auth/AuthContext'; // ✅ Auth hook

export function RegisterView() {
    const router = useRouter();
    const { register } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
     const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSignIn = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setError(null);

            try {
                await register({ username, email, password }); // ✅ actual sign-in
                router.push('/'); // redirect to dashboard
            } catch (err: any) {
                setError(err.message || 'Invalid credentials');
            }
        },
        [register, username, email, password, router]
    );

    return (
        <>
            <Box
                sx={{
                    gap: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 5,
                }}
            >
                <Typography variant="h5">Register</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Already have an account?{' '}
                    <Link href="/sign-in" component={RouterLink} variant="subtitle2" sx={{ ml: 0.5 }}>
                        Sign in
                    </Link>
                </Typography>
            </Box>

            <Box
                component="form"
                onSubmit={handleSignIn}
                sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    flexDirection: 'column',
                }}
            >

                <TextField
                    fullWidth
                    name="Username"
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ mb: 3 }}
                    slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                    fullWidth
                    name="email"
                    label="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 3 }}
                    slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    sx={{ mb: 3 }}
                    slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                {error && (
                    <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <Button fullWidth size="large" type="submit" color="inherit" variant="contained">
                    Register
                </Button>
            </Box>

            <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
                <Typography
                    variant="overline"
                    sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
                >
                    OR
                </Typography>
            </Divider>

            <Box sx={{ gap: 1, display: 'flex', justifyContent: 'center' }}>
                <IconButton color="inherit">
                    <Iconify width={22} icon="socials:google" />
                </IconButton>
                <IconButton color="inherit">
                    <Iconify width={22} icon="socials:github" />
                </IconButton>
                <IconButton color="inherit">
                    <Iconify width={22} icon="socials:twitter" />
                </IconButton>
            </Box>
        </>
    );
}
