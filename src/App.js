import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Container, Fade, Paper, ToggleButtonGroup, ToggleButton, IconButton, Typography, Stack, Button, BottomNavigation, BottomNavigationAction, useMediaQuery } from '@mui/material';
import { Brightness4, Brightness7, TodayOutlined, DashboardOutlined, FlagOutlined, RepeatOutlined, AssessmentOutlined, LogoutOutlined } from '@mui/icons-material';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { GoalManagement } from './components/goals/GoalManagement';
import { HabitManagement } from './components/habits/HabitManagement';
import { Today } from './components/today/Today';
import { Review } from './components/review/Review';
import { YearSelector } from './components/common/YearSelector';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppProvider } from './context/AppContext';
import { YearProvider, useYear } from './context/YearContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/auth/Login';
import { lightTheme, darkTheme } from './theme/mobileTheme';
import ErrorBoundary from './components/ErrorBoundary';

const AppContent = () => {
  const { user, loading, logout, error } = useAuth();
  const { selectedYear, setSelectedYear } = useYear();
  const [currentTab, setCurrentTab] = useState(0);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const theme = darkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', gap: 2, p: 3 }}>
          <Typography variant="h5" color="error">Authentication Error</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>{error}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>Please enable Authentication in Firebase Console</Typography>
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
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', pb: { xs: 7, md: 0 } }}>
        {!isMobile && (
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
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <IconButton onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? <Brightness7 /> : <Brightness4 />}
                  </IconButton>
                  <Button onClick={logout} variant="outlined" startIcon={<LogoutOutlined />}>
                    Logout
                  </Button>
                </Stack>
              </Stack>

              <Box sx={{ pb: 2.5 }}>
                <ToggleButtonGroup
                  value={currentTab}
                  exclusive
                  onChange={(e, v) => v !== null && setCurrentTab(v)}
                  sx={{
                    gap: 1,
                    '& .MuiToggleButton-root': {
                      border: 'none',
                      borderRadius: 2,
                      px: 2.5,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 500,
                      color: 'text.secondary',
                      minHeight: 44,
                      '&:hover': { bgcolor: 'grey.100' },
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }
                    }
                  }}
                >
                  {navItems.map((item, index) => (
                    <ToggleButton key={index} value={index}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {item.icon}
                        {item.label}
                      </Stack>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            </Container>
          </Paper>
        )}

        {isMobile && (
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
                sx={{ py: 2 }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #6B7FD7 0%, #8B7FB8 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {navItems[currentTab].label}
                </Typography>
                
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <IconButton onClick={() => setDarkMode(!darkMode)} size="small">
                    {darkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
                  </IconButton>
                  <IconButton onClick={logout} size="small">
                    <LogoutOutlined fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Container>
          </Paper>
        )}
        
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 5 }, flex: 1 }}>
          {!isMobile && (
            <YearSelector 
              selectedYear={selectedYear} 
              onYearChange={setSelectedYear}
            />
          )}
          <Fade in={true} timeout={300} key={currentTab}>
            <Box>
              {currentTab === 0 && <Today />}
              {currentTab === 1 && <DashboardScreen />}
              {currentTab === 2 && <GoalManagement />}
              {currentTab === 3 && <HabitManagement />}
              {currentTab === 4 && <Review />}
            </Box>
          </Fade>
        </Container>

        {isMobile && (
          <Paper 
            elevation={3}
            sx={{ 
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1100,
              borderTop: 1,
              borderColor: 'divider'
            }}
          >
            <BottomNavigation
              value={currentTab}
              onChange={(e, v) => setCurrentTab(v)}
              showLabels
              sx={{
                height: 64,
                '& .MuiBottomNavigationAction-root': {
                  minWidth: 'auto',
                  padding: '6px 0',
                  '&.Mui-selected': {
                    color: 'primary.main'
                  }
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  '&.Mui-selected': {
                    fontSize: '0.75rem'
                  }
                }
              }}
            >
              {navItems.map((item, index) => (
                <BottomNavigationAction
                  key={index}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </BottomNavigation>
          </Paper>
        )}
      </Box>
    </ThemeProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <YearProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </YearProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;