import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'RECEPTION';
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulation d'authentification
    if (email === 'admin@dgi.ga' && password === 'admin123') {
      const adminUser: User = {
        id: '1',
        name: 'Administrateur DGI',
        role: 'ADMIN',
        email: 'admin@dgi.ga'
      };
      setUser(adminUser);
      localStorage.setItem('auth_user', JSON.stringify(adminUser));
      return true;
    }
    
    if (email === 'reception@dgi.ga' && password === 'reception123') {
      const receptionUser: User = {
        id: '2',
        name: 'Réceptionniste',
        role: 'RECEPTION',
        email: 'reception@dgi.ga'
      };
      setUser(receptionUser);
      localStorage.setItem('auth_user', JSON.stringify(receptionUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
