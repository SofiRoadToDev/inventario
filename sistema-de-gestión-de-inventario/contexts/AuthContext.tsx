
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import repository from '../services/repositoryFactory';

// Definición de UserResponse si no está en types.ts
interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserResponse | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios mock para pruebas
const MOCK_USERS = [
  {
    email: 'admin@ejemplo.com',
    password: 'admin123',
    userData: {
      id: 1,
      name: 'Administrador',
      email: 'admin@ejemplo.com',
      role: 'admin'
    }
  },
  {
    email: 'usuario@ejemplo.com',
    password: 'usuario123',
    userData: {
      id: 2,
      name: 'Usuario Regular',
      email: 'usuario@ejemplo.com',
      role: 'user'
    }
  }
];

// Token mock
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulamos un pequeño retraso para imitar una llamada a la API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verificamos las credenciales con nuestros usuarios mock
    const mockUser = MOCK_USERS.find(
      user => user.email === email && user.password === password
    );
    
    if (!mockUser) {
      throw new Error('Credenciales inválidas');
    }
    
    // Simulamos una respuesta exitosa
    const { userData } = mockUser;
    localStorage.setItem('token', MOCK_TOKEN);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
