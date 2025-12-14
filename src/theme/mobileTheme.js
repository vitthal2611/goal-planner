import { createTheme } from '@mui/material/styles';

const baseTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3 },
  h2: { fontSize: 'clamp(1.5rem, 4vw, 1.75rem)', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 },
  h3: { fontSize: 'clamp(1.25rem, 3.5vw, 1.5rem)', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.5 },
  h4: { fontSize: 'clamp(1.125rem, 3vw, 1.25rem)', fontWeight: 600, letterSpacing: '0', lineHeight: 1.5 },
  h5: { fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.6 },
  h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.6 },
  body1: { fontSize: '1rem', lineHeight: 1.75, letterSpacing: '0.01em', fontWeight: 400 },
  body2: { fontSize: '0.875rem', lineHeight: 1.7, fontWeight: 400 }
};

const baseComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        borderRadius: 12,
        padding: '12px 24px',
        minHeight: 44,
        boxShadow: 'none'
      }
    }
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        minWidth: 44,
        minHeight: 44
      }
    }
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 500,
        borderRadius: 10,
        height: 32,
        fontSize: '0.875rem'
      }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        transition: 'all 0.2s ease'
      }
    },
    defaultProps: { elevation: 0 }
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: '20px',
        '&:last-child': { paddingBottom: '20px' }
      }
    }
  }
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5B7C99', light: '#7B9AB8', dark: '#3D5A75' },
    secondary: { main: '#7B68A6', light: '#9B88C6', dark: '#5B4886' },
    success: { main: '#4CAF50', light: '#6FBF73', dark: '#388E3C' },
    warning: { main: '#FF9800', light: '#FFB74D', dark: '#F57C00' },
    error: { main: '#E57373', light: '#EF9A9A', dark: '#D32F2F' },
    info: { main: '#64B5F6', light: '#90CAF9', dark: '#1976D2' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
    text: { primary: '#2C3E50', secondary: '#7F8C8D' },
    divider: '#E8EAED'
  },
  typography: baseTypography,
  shape: { borderRadius: 16 },
  components: {
    ...baseComponents,
    MuiButton: {
      styleOverrides: {
        ...baseComponents.MuiButton.styleOverrides,
        root: {
          ...baseComponents.MuiButton.styleOverrides.root,
          '&:hover': { boxShadow: '0 2px 8px rgba(91, 124, 153, 0.15)' }
        },
        contained: {
          '&:hover': { boxShadow: '0 4px 12px rgba(91, 124, 153, 0.2)' }
        }
      }
    }
  }
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7B9AB8', light: '#9BB8D3', dark: '#5B7C99' },
    secondary: { main: '#9B88C6', light: '#BBA8E0', dark: '#7B68A6' },
    success: { main: '#6FBF73', light: '#8FD19E', dark: '#4CAF50' },
    warning: { main: '#FFB74D', light: '#FFCC80', dark: '#FF9800' },
    error: { main: '#EF9A9A', light: '#FFCDD2', dark: '#E57373' },
    info: { main: '#90CAF9', light: '#BBDEFB', dark: '#64B5F6' },
    background: { default: '#1A1F2E', paper: '#252B3B' },
    text: { primary: '#E8EAED', secondary: '#9CA3AF' },
    divider: '#3A4556'
  },
  typography: baseTypography,
  shape: { borderRadius: 16 },
  components: {
    ...baseComponents,
    MuiButton: {
      styleOverrides: {
        ...baseComponents.MuiButton.styleOverrides,
        root: {
          ...baseComponents.MuiButton.styleOverrides.root,
          '&:hover': { boxShadow: '0 2px 8px rgba(123, 154, 184, 0.25)' }
        },
        contained: {
          '&:hover': { boxShadow: '0 4px 12px rgba(123, 154, 184, 0.3)' }
        }
      }
    }
  }
});
