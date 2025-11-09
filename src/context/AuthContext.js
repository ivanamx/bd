import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthAPI from '../services/api';

// Importar biometría solo si está disponible
let LocalAuthentication;
try {
  LocalAuthentication = require('expo-local-authentication');
} catch (e) {
  console.log('expo-local-authentication no disponible');
  LocalAuthentication = null;
}

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      setLoading(true);
      const storedTokens = await AsyncStorage.getItem('authTokens');
      const storedUser = await AsyncStorage.getItem('authUser');

      if (storedTokens && storedUser) {
        const tokens = JSON.parse(storedTokens);
        const userData = JSON.parse(storedUser);

        // Verificar si el token sigue siendo válido
        AuthAPI.setAuthToken(tokens.accessToken);
        
        try {
          const currentUser = await AuthAPI.getCurrentUser();
          setUser(currentUser.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token expirado, intentar renovar
          try {
            const newTokens = await AuthAPI.refreshToken(tokens.refreshToken);
            const updatedTokens = {
              ...tokens,
              accessToken: newTokens.accessToken,
            };
            await AsyncStorage.setItem('authTokens', JSON.stringify(updatedTokens));
            AuthAPI.setAuthToken(newTokens.accessToken);
            
            const currentUser = await AuthAPI.getCurrentUser();
            setUser(currentUser.user);
            setIsAuthenticated(true);
          } catch (refreshError) {
            // Refresh token también expirado, limpiar todo
            await clearSession();
          }
        }
      }
    } catch (error) {
      console.error('Error cargando sesión:', error);
      await clearSession();
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    try {
      await AsyncStorage.removeItem('authTokens');
      await AsyncStorage.removeItem('authUser');
      await AsyncStorage.removeItem('biometricEnabled');
      AuthAPI.clearAuthToken();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error limpiando sesión:', error);
    }
  };

  const signIn = async (usernameOrEmail, password) => {
    try {
      const response = await AuthAPI.login(usernameOrEmail, password);
      
      // Guardar tokens y usuario
      await AsyncStorage.setItem('authTokens', JSON.stringify(response.tokens));
      await AsyncStorage.setItem('authUser', JSON.stringify(response.user));
      
      AuthAPI.setAuthToken(response.tokens.accessToken);
      setUser(response.user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al iniciar sesión',
      };
    }
  };

  const signUp = async (username, email, password) => {
    try {
      const response = await AuthAPI.register(username, email, password);
      
      // Guardar tokens y usuario
      await AsyncStorage.setItem('authTokens', JSON.stringify(response.tokens));
      await AsyncStorage.setItem('authUser', JSON.stringify(response.user));
      
      AuthAPI.setAuthToken(response.tokens.accessToken);
      setUser(response.user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al registrar usuario',
      };
    }
  };

  const signOut = async () => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      await clearSession();
    }
  };

  // Verificar si la biometría está disponible
  const checkBiometricAvailability = async () => {
    if (!LocalAuthentication) {
      return { available: false, error: 'Biometría no disponible' };
    }
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        return { available: false, error: 'Biometría no disponible en este dispositivo' };
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        return { available: false, error: 'No hay biometría configurada en el dispositivo' };
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return {
        available: true,
        types,
      };
    } catch (error) {
      return { available: false, error: error.message };
    }
  };

  // Autenticación biométrica
  const authenticateWithBiometrics = async () => {
    if (!LocalAuthentication) {
      return { success: false, error: 'Biometría no disponible' };
    }
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticación requerida',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Si la biometría es exitosa, cargar la sesión guardada
        await loadStoredSession();
        return { success: true };
      } else {
        return { success: false, error: 'Autenticación biométrica cancelada' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    checkBiometricAvailability,
    authenticateWithBiometrics,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

