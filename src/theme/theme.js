import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6B7FD7',
      light: '#9BAEF5',
      dark: '#4A5FB5',
      50: '#F0F2FF'
    },
    secondary: {
      main: '#8B7FB8',
      light: '#B5A8D9',
      dark: '#6A5F97'
    },
    success: {
      main: '#5FB878',
      light: '#8FD19E',
      dark: '#4A9960',
      50: '#F0F9F3'
    },
    warning: {
      main: '#F0AD4E',
      light: '#F5C77E',
      dark: '#D89A3E',
      50: '#FFF8ED'
    },
    error: {
      main: '#E8927C',
      light: '#F0B5A5',
      dark: '#D67A64',
      50: '#FFF3F0'
    },
    info: {
      main: '#7CB8E8',
      light: '#A5D1F0',
      dark: '#5A9FD6',
      50: '#F0F7FF'
    },
    background: {
      default: '#FAFBFC',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1A2332',
      secondary: '#6B7684'
    },
    grey: {
      50: '#FAFBFC',
      100: '#F4F5F7',
      200: '#E8EAED',
      300: '#D1D5DB',
      400: '#9CA3AF'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0',
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#6B7684'
    }
  },
  shape: {
    borderRadius: 12
  },
  spacing: 8,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)',
            transform: 'translateY(-2px)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 10,
          padding: '10px 20px',
          transition: 'all 0.2s ease',
          '&:active': {
            transform: 'scale(0.98)'
          }
        },
        sizeLarge: {
          padding: '14px 28px',
          fontSize: '1rem'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
          transition: 'all 0.2s ease'
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8
        }
      }
    }
  }
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B9FE8',
      light: '#B5C4F5',
      dark: '#6B7FD7',
      50: '#1A2332'
    },
    secondary: {
      main: '#A594C9',
      light: '#C4B5E0',
      dark: '#8B7FB8'
    },
    success: {
      main: '#6FCC84',
      light: '#9FE0AF',
      dark: '#5FB878',
      50: '#1A2E22'
    },
    warning: {
      main: '#F5BD6E',
      light: '#F8D49E',
      dark: '#F0AD4E',
      50: '#332A1A'
    },
    error: {
      main: '#F0A28C',
      light: '#F5C4B5',
      dark: '#E8927C',
      50: '#331F1A'
    },
    info: {
      main: '#8CC8F0',
      light: '#B5DDF5',
      dark: '#7CB8E8',
      50: '#1A2833'
    },
    background: {
      default: '#0F1419',
      paper: '#1A2332'
    },
    text: {
      primary: '#E8EAED',
      secondary: '#9CA3AF'
    },
    grey: {
      50: '#1A2332',
      100: '#2A3544',
      200: '#3A4556',
      300: '#4A5568',
      400: '#6B7684'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0',
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#9CA3AF'
    }
  },
  shape: {
    borderRadius: 12
  },
  spacing: 8,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
            transform: 'translateY(-2px)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 10,
          padding: '10px 20px',
          transition: 'all 0.2s ease',
          '&:active': {
            transform: 'scale(0.98)'
          }
        },
        sizeLarge: {
          padding: '14px 28px',
          fontSize: '1rem'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
          transition: 'all 0.2s ease'
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8
        }
      }
    }
  }
});
