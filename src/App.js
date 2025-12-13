import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Container, Fade, Paper, ToggleButtonGroup, ToggleButton, IconButton, Typography, Stack, Button } from '@mui/material';
import { Brightness4, Brightness7, TodayOutlined, DashboardOutlined, FlagOutlined, RepeatOutlined, AssessmentOutlined, LogoutOutlined } from '@mui/icons-material';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { GoalManagement } from './components/goals/GoalManagement';
import { HabitManagement } from './components/habits/HabitManagement';
import { Today } from './components/today/Today';
import { Review } from './components/review/Review';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/auth/Login';
import { lightTheme, darkTheme } from './theme/theme';

const AppContent = () => {
  const { user, loading, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const theme = darkMode ? darkTheme : lightTheme;

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', gap: 2 }}>
          <FlagOutlined sx={{ fontSize: 64, color: 'primary.main' }} />
          <Typography variant="h5" color="text.secondary">Loading...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login />
      </ThemeProvider>
    );
  }

  const navItems = [
    { label: 'Today', icon: <TodayOutlined /> },
    { label: 'Dashboard', icon: <DashboardOutlined /> },
    { label: 'Goals', icon: <FlagOutlined /> },
    { label: 'Habits', icon: <RepeatOutlined /> },
    { label: 'Review', icon: <AssessmentOutlined /> }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
        <Paper 
          elevation={0} 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper',
            position: 'sticky',
            top: 0,
            zIndex: 1100
          }}
        >
          <Container maxWidth="xl">
            <Stack 
              direction="row" 
              alignItems="center" 
              justifyContent="space-between"
              sx={{ py: 3 }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6B7FD7 0%, #8B7FB8 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                Goal Planner
              </Typography>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {user?.email}
                </Typography>
                <IconButton 
                  onClick={() => setDarkMode(!darkMode)}
                  size="small"
                >
                  {darkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
                </IconButton>
                <Button 
                  onClick={logout} 
                  variant="outlined" 
                  size="small"
                  startIcon={<LogoutOutlined />}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  Logout
                </Button>
                <IconButton onClick={logout} size="small" sx={{ display: { xs: 'flex', sm: 'none' } }}>
                  <LogoutOutlined fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            <Box sx={{ pb: 2.5 }}>
              <ToggleButtonGroup
                value={currentTab}
                exclusive
                onChange={(e, v) => v !== null && setCurrentTab(v)}
                sx={{
                  gap: { xs: 0.5, sm: 1 },
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    borderRadius: 2,
                    px: { xs: 1.5, sm: 2.5 },
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
                    color: 'text.secondary',
                    minHeight: 44,
                    '&:hover': {
                      bgcolor: 'grey.100'
                    },
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark'
                      }
                    }
                  }
                }}
              >
                {navItems.map((item, index) => (
                  <ToggleButton key={index} value={index}>
                    <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center">
                      <Box sx={{ fontSize: { xs: 20, sm: 24 } }}>{item.icon}</Box>
                      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{item.label}</Box>
                    </Stack>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Container>
        </Paper>
        
        <Container maxWidth="xl" sx={{ py: 5, flex: 1 }}>
          <Fade in={true} timeout={400} key={currentTab}>
            <Box>
              {currentTab === 0 && <Today />}
              {currentTab === 1 && <DashboardScreen />}
              {currentTab === 2 && <GoalManagement />}
              {currentTab === 3 && <HabitManagement />}
              {currentTab === 4 && <Review />}
            </Box>
          </Fade>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;