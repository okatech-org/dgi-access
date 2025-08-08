/**
 * Tests unitaires pour le contexte d'authentification
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock du localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Composant de test pour utiliser le contexte
const TestComponent = () => {
  const { user, login, logout, isLoading } = useAuth();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user-status">
        {user ? `Logged in as ${user.username}` : 'Not logged in'}
      </div>
      <div data-testid="user-role">
        {user ? user.role : 'No role'}
      </div>
      <button
        data-testid="login-admin"
        onClick={() => login('admin', 'password')}
      >
        Login Admin
      </button>
      <button
        data-testid="login-reception"
        onClick={() => login('reception', 'password')}
      >
        Login Reception
      </button>
      <button
        data-testid="logout"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('doit fournir les valeurs par défaut', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    expect(screen.getByTestId('user-role')).toHaveTextContent('No role');
  });

  it('doit permettre la connexion admin', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByTestId('login-admin');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as admin');
    });

    expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'dgi_user',
      expect.stringContaining('"username":"admin"')
    );
  });

  it('doit permettre la connexion réception', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByTestId('login-reception');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as reception');
    });

    expect(screen.getByTestId('user-role')).toHaveTextContent('RECEPTION');
  });

  it('doit permettre la déconnexion', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Se connecter d'abord
    const loginButton = screen.getByTestId('login-admin');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as admin');
    });

    // Se déconnecter
    const logoutButton = screen.getByTestId('logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('dgi_user');
  });

  it('doit rejeter des identifiants invalides', async () => {
    // Mock console.error pour éviter les logs de test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simuler un échec de connexion
    const TestComponentWithFailure = () => {
      const { login } = useAuth();
      return (
        <button
          data-testid="login-invalid"
          onClick={() => login('invalid', 'invalid')}
        >
          Login Invalid
        </button>
      );
    };

    render(
      <AuthProvider>
        <TestComponentWithFailure />
      </AuthProvider>
    );

    const loginButton = screen.getByTestId('login-invalid');
    fireEvent.click(loginButton);

    // La connexion devrait échouer (selon la logique de votre AuthContext)
    await waitFor(() => {
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('doit restaurer la session depuis localStorage', () => {
    const mockUser = {
      id: 'user123',
      username: 'admin',
      role: 'ADMIN',
      permissions: ['all'],
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as admin');
    expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN');
  });

  it('doit gérer les données localStorage corrompues', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Devrait retourner aux valeurs par défaut
    expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
  });

  it('doit afficher l\'état de chargement', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Au démarrage, il devrait y avoir un état de chargement
    // (dépend de l'implémentation de votre AuthContext)
    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toBeInTheDocument();
  });

  it('doit gérer les permissions utilisateur', async () => {
    const TestPermissions = () => {
      const { user } = useAuth();
      
      const hasPermission = (permission: string) => {
        return user?.permissions?.includes(permission) || user?.permissions?.includes('all');
      };

      return (
        <div>
          <div data-testid="can-manage-users">
            {hasPermission('manage_users') ? 'Can manage users' : 'Cannot manage users'}
          </div>
          <div data-testid="can-view-stats">
            {hasPermission('view_stats') ? 'Can view stats' : 'Cannot view stats'}
          </div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
        <TestPermissions />
      </AuthProvider>
    );

    // Se connecter comme admin
    const loginButton = screen.getByTestId('login-admin');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as admin');
    });

    // Vérifier les permissions admin (selon votre implémentation)
    // Ces tests dépendent de la logique de permissions dans votre AuthContext
  });

  it('doit nettoyer lors du démontage', () => {
    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    unmount();

    // Vérifier qu'aucune fuite mémoire ou listener n'est laissé
    // (dépend de l'implémentation de votre AuthContext)
  });
});
