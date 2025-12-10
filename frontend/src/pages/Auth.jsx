import React, { useContext, useState } from 'react';
import { Avatar, Button, CssBaseline, TextField, Paper, Box, Grid, Typography, Snackbar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';

const defaultTheme = createTheme();

const Auth = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState(0); // 0 for login, 1 for register
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { handleRegister, handleLogin } = useContext(AuthContext)
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    username: '',
    password: ''
  });


    const validateForm = () => {
    const errors = {
      name: '',
      username: '',
      password: ''
    };
    let isValid = true;

    if (formState === 1 && !name.trim()) {
      errors.name = 'Full name is required';
      isValid = false;
    }

    if (!username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    } 

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } 

    setFormErrors(errors);
    return isValid;
  };


  const handleAuth = async () => {

    if (!validateForm()) return;

    try {
      if (formState === 0) {
        let result = await handleLogin(username, password);    // Login logic
        console.log(result)
        setOpenSnackbar(true);

      } else {
        let result = await handleRegister(name, username, password);   // Register logic
        console.log(result)
        console.log('Register result');
        setMessage('Registration successful');
        setOpenSnackbar(true);
        setError('');
        setFormState(0);
        setPassword('');
        setUsername('');
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred');
    }
  };


  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container sx={{ marginTop: "2rem", height: '70vh', display: "flex", justifyContent: "center"}}>

        <Grid
          xs={12}
          sm={4}
          md={5}
          component={Paper}
          elevation={6}
          square
          sx={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >

          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: 400
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>  
              <LockOutlinedIcon />
            </Avatar>

            <Box sx={{ mb: 2 }}>
              <Button
                variant={formState === 0 ? 'contained' : 'outlined'}
                onClick={() => setFormState(0)}
                sx={{ mr: 1 }}
              >
                Login
              </Button>

              <Button
                variant={formState === 1 ? 'contained' : 'outlined'}
                onClick={() => setFormState(1)}
              >
                Register
              </Button>
            </Box>

            <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
              {formState === 1 && (
                <TextField margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}

                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  
                />
              )}

              <TextField margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                autoFocus={formState === 0}
                onChange={(e) => setUsername(e.target.value)}

                      
                error={!!formErrors.username}
                helperText={formErrors.username}
              />
              <TextField margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                value={password}
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}

                      
                  error={!!formErrors.password}
                  helperText={formErrors.password}
              />

              <p style={{color: "red"}}>{error}</p>   {/* For Error */}

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
                {formState === 0 ? 'Login' : 'Register'}

              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={message}
      />

    </ThemeProvider>
  );
};


export default Auth;