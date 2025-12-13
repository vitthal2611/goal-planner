import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Container, Tabs, Tab, Box, IconButton, Fade } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { GoalManagement } from './components/goals/GoalManagement';
import { HabitManagement } from './components/habits/HabitManagement';
import { Today } from './components/today/Today';
import { Review } from './components/review/Review';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppProvider } from './context/AppContext';
import { lightTheme, darkTheme } from './theme/theme';

const AppContent = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Daily Planner
            </Typography>
            <IconButton 
              color="inherit" 
              onClick={() => setDarkMode(!darkMode)}
              sx={{ 
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'rotate(180deg)' }
              }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
          <Tabs 
            value={currentTab} 
            onChange={(e, v) => setCurrentTab(v)} 
            sx={{ 
              bgcolor: 'primary.dark',
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500
              }
            }}
            TabIndicatorProps={{
              sx: { height: 3, borderRadius: '3px 3px 0 0' }
            }}
          >
            <Tab label="Today" />
            <Tab label="Dashboard" />
            <Tab label="Goals" />
            <Tab label="Habits" />
            <Tab label="Review" />
          </Tabs>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>
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
      </Box>
    </ThemeProvider>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;