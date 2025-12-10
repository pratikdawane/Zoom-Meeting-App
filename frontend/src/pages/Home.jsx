
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import withAuth from '../utils/withAuth';     // we not access the History page until Login the page

import {
  Button,
  IconButton,
  TextField,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Container
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { addToUserHistory } = useContext(AuthContext);
  const [meetingCode, setMeetingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinMeeting = async () => {
    if (!meetingCode.trim()) {
      setError('Please enter a meeting code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await addToUserHistory(meetingCode);
      navigate(`/${meetingCode}`);
    } catch (err) {
      setError('Failed to join meeting. Please try again.');
      console.error('Meeting join error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinMeeting();
    }
  };

  const navigateToHistory = () => {
    navigate('/history');
  };

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    // Add any other cleanup needed
    navigate('/auth', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'background.paper' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
            Zoom Meeting App
          </Typography>
          <Box>
            <IconButton 
              color="inherit" 
              onClick={navigateToHistory}
              aria-label="history"
              sx={{ color: 'text.primary' }}
            >
              <RestoreIcon />
              <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                History
              </Typography>
            </IconButton>
            <IconButton 
              color="error" 
              onClick={handleLogout}
              aria-label="logout"
            >
              <LogoutIcon />
              <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                Logout
              </Typography>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          alignItems: 'center',
          gap: 4,
          height: '100%'
        }}>
          {/* Left Panel - Form */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            maxWidth: { md: '600px' }
          }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Providing Quality Video Call Just Like Quality Education
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                label="Meeting Code"
                variant="outlined"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                onKeyPress={handleKeyPress}
                error={!!error}
                helperText={error}
                sx={{ flex: 1, minWidth: '200px' }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleJoinMeeting}
                disabled={isLoading}
                sx={{ height: '56px', px: 4 }}
              >
                {isLoading ? 'Joining...' : 'Join'}
              </Button>
            </Box>
          </Box>

          {/* Right Panel - Image */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2
          }}>
            <Box
              component="img"
              src="/logo3.png"
              alt="Video conference illustration"
              sx={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: { xs: '300px', md: '500px' },
                objectFit: 'contain'
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default withAuth(Home);      // the use of withAuth , jab tak hm log in nhi krte tab tak hm us page pr nhi ja skte