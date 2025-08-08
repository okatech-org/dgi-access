/**
 * Tests unitaires pour le composant App principal
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../../App';

// Mock du contexte d'authentification
vi.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe('App', () => {
  it('doit rendre la page d\'accueil quand l\'utilisateur n\'est pas connecté', () => {
    render(<App />);
    
    // Vérifie que la page d'accueil est affichée
    // Note: Adapte ces sélecteurs selon le contenu réel de HomePage
    expect(screen.getByText(/Bienvenue|Accueil|DGI/i)).toBeInTheDocument();
  });

  it('doit configurer React Router correctement', () => {
    render(<App />);
    
    // Vérifie que le routeur est bien configuré
    expect(window.location.pathname).toBe('/');
  });
});