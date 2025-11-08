import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const theme = {
    colors: {
      background: '#0f0f0f',
      surface: '#1a1a1a',
      surfaceElevated: '#252525',
      primary: '#d4a5c7',
      primaryLight: '#e8c4dc',
      primaryDark: '#b886a8',
      secondary: '#c8a2c4',
      accent: '#e6b8d9',
      text: '#f5f5f5',
      textSecondary: '#d0d0d0',
      textMuted: '#a0a0a0',
      border: '#333333',
      borderLight: '#404040',
      success: '#d4a5c7',
      error: '#e6a5a5',
      rating: '#f4c2d7',
      shadow: 'rgba(0, 0, 0, 0.5)',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
    },
    typography: {
      h1: {
        fontSize: 32,
        fontWeight: '600',
        letterSpacing: 0.5,
      },
      h2: {
        fontSize: 24,
        fontWeight: '600',
        letterSpacing: 0.3,
      },
      h3: {
        fontSize: 20,
        fontWeight: '500',
      },
      body: {
        fontSize: 16,
        fontWeight: '400',
      },
      caption: {
        fontSize: 14,
        fontWeight: '400',
      },
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

