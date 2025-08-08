# Guide du Développeur - DGI Access Application

## 🚀 Démarrage rapide

### 1. Setup de l'environnement

```bash
# Cloner et installer
git clone <repo-url>
cd IMPOTS_ACCESS
bun install

# Configuration
cp env.example .env
# Éditer .env selon vos besoins

# Lancer en développement
bun dev
```

### 2. Structure des dossiers

```text
src/
├── 📁 components/      # Composants React
│   ├── 📁 modules/     # Modules métier (VisitorManagement, etc.)
│   ├── 📁 ui/          # Composants de base (Button, Card, etc.)
│   ├── 📁 layout/      # Layout components (Header, Sidebar)
│   └── 📁 __tests__/   # Tests des composants
├── 📁 contexts/        # React Contexts (Auth, Theme)
├── 📁 hooks/          # Custom hooks
├── 📁 services/       # Services métier (audit, API)
├── 📁 utils/          # Fonctions utilitaires
├── 📁 types/          # Types TypeScript
└── 📁 data/           # Données statiques/mock
```

## 🧩 Ajouter un nouveau module

### 1. Créer le composant principal

```typescript
// src/components/modules/MonNouveauModule.tsx
import React, { useState } from 'react';
import { useAudit } from '../../services/auditService';
import { useAuth } from '../../contexts/AuthContext';

export const MonNouveauModule: React.FC = () => {
  const { user } = useAuth();
  const { logEvent } = useAudit();

  const handleAction = async () => {
    // Logique métier
    
    // Audit de l'action
    await logEvent({
      userId: user!.id,
      userName: user!.username,
      userRole: user!.role,
      action: 'CUSTOM_ACTION',
      resource: 'Mon Resource',
      details: 'Description de l\'action',
      status: 'success',
      riskLevel: 'low',
    });
  };

  return (
    <div className="space-y-6">
      {/* Votre interface */}
    </div>
  );
};
```

### 2. Ajouter la route dans Dashboard

```typescript
// src/components/Dashboard.tsx
import { MonNouveauModule } from './modules/MonNouveauModule';

// Dans MainContent:
case 'mon-module':
  return <MonNouveauModule />;
```

### 3. Ajouter au Sidebar

```typescript
// src/components/layout/Sidebar.tsx
const menuItems = [
  // ... autres items
  {
    id: 'mon-module',
    label: 'Mon Module',
    icon: MonIcon,
    roles: ['ADMIN', 'RECEPTION']
  }
];
```

### 4. Créer les tests

```typescript
// src/components/modules/__tests__/MonNouveauModule.test.tsx
import { render, screen } from '@testing-library/react';
import { MonNouveauModule } from '../MonNouveauModule';

describe('MonNouveauModule', () => {
  it('doit rendre correctement', () => {
    render(<MonNouveauModule />);
    expect(screen.getByText(/mon module/i)).toBeInTheDocument();
  });
});
```

## 🔧 Patterns et conventions

### Composants

```typescript
// ✅ Bon
interface Props {
  title: string;
  onAction: (id: string) => void;
  isLoading?: boolean;
}

export const MonComposant: React.FC<Props> = ({ 
  title, 
  onAction, 
  isLoading = false 
}) => {
  // Implementation
};

// ❌ Éviter
export const MonComposant = (props: any) => {
  // Props non typées
};
```

### Hooks personnalisés

```typescript
// ✅ Bon
export const useMonHook = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);
  
  const updateValue = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);
  
  return { value, updateValue };
};
```

### Services

```typescript
// ✅ Bon
export class MonService {
  private config: ServiceConfig;
  
  constructor(config: ServiceConfig) {
    this.config = config;
  }
  
  /**
   * Description de la méthode
   * @param param Description du paramètre
   * @returns Description du retour
   */
  async maMethode(param: string): Promise<ResultType> {
    // Implementation
  }
}

export const monService = new MonService(defaultConfig);
```

## 🎨 Système de design

### Couleurs

```typescript
// Palette principale
const colors = {
  primary: 'blue-600',      // Actions principales
  secondary: 'gray-600',    // Actions secondaires  
  success: 'green-600',     // Succès, validation
  warning: 'yellow-600',    // Avertissements
  error: 'red-600',         // Erreurs
  info: 'blue-500',         // Information
};
```

### Composants UI de base

```typescript
// Utiliser les composants existants
import { AppleButton } from '../ui/AppleButton';
import { AppleCard } from '../ui/AppleCard';
import { AppleInput } from '../ui/AppleInput';

// Classes Tailwind communes
const commonClasses = {
  card: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
  button: 'px-4 py-2 rounded-lg font-medium transition-colors',
  input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500',
};
```

## 🧪 Tests

### Tests de composants

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MonComposant', () => {
  const defaultProps = {
    title: 'Test Title',
    onAction: vi.fn(),
  };
  
  it('doit gérer les interactions utilisateur', async () => {
    const user = userEvent.setup();
    const mockAction = vi.fn();
    
    render(<MonComposant {...defaultProps} onAction={mockAction} />);
    
    const button = screen.getByRole('button', { name: /action/i });
    await user.click(button);
    
    expect(mockAction).toHaveBeenCalledWith(expectedValue);
  });
});
```

### Tests de services

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { monService } from '../monService';

describe('MonService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('doit traiter les données correctement', async () => {
    const result = await monService.maMethode('test');
    expect(result).toEqual(expectedResult);
  });
});
```

## 🔒 Sécurité

### Gestion des permissions

```typescript
const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (action: string) => {
    return user?.permissions.includes(action) ?? false;
  };
  
  const canAccess = (module: string) => {
    const modulePermissions = {
      'visitor-management': ['VISITOR_READ', 'VISITOR_WRITE'],
      'staff-management': ['STAFF_READ', 'STAFF_WRITE'],
    };
    
    return modulePermissions[module]?.some(hasPermission) ?? false;
  };
  
  return { hasPermission, canAccess };
};
```

### Audit automatique

```typescript
// Higher-order component pour audit automatique
export const withAudit = <T extends object>(
  Component: React.ComponentType<T>,
  auditAction: string
) => {
  return (props: T) => {
    const { logEvent } = useAudit();
    const { user } = useAuth();
    
    useEffect(() => {
      if (user) {
        logEvent({
          userId: user.id,
          userName: user.username,
          userRole: user.role,
          action: auditAction,
          resource: Component.name,
          details: `Accès au composant ${Component.name}`,
          status: 'success',
          riskLevel: 'low',
        });
      }
    }, []);
    
    return <Component {...props} />;
  };
};

// Usage
export const SensitiveComponent = withAudit(
  MyComponent, 
  'SENSITIVE_DATA_ACCESS'
);
```

## 🚀 Performance

### Optimisations recommandées

```typescript
// 1. Memoization des composants coûteux
const ExpensiveComponent = React.memo(({ data }) => {
  // Rendu coûteux
}, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id;
});

// 2. Lazy loading des modules
const LazyModule = React.lazy(() => import('./MonModule'));

// 3. Hooks optimisés
const useOptimizedData = (id: string) => {
  return useMemo(() => {
    return expensiveCalculation(id);
  }, [id]);
};
```

### Bundle analysis

```bash
# Analyser la taille du bundle
bun build --analyze

# Identifier les gros imports
bun run build && npx vite-bundle-analyzer dist
```

## 🐛 Debugging

### Outils de debug

```typescript
// Debug hooks custom
const useDebugValue = (value: any, label: string) => {
  if (import.meta.env.DEV) {
    console.log(`[DEBUG] ${label}:`, value);
  }
};

// Debug renders
const useWhyDidYouUpdate = (name: string, props: object) => {
  const previous = useRef<object>();
  
  useEffect(() => {
    if (previous.current) {
      const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
        if (previous.current[k] !== v) {
          ps[k] = [previous.current[k], v];
        }
        return ps;
      }, {});
      
      if (Object.keys(changedProps).length > 0) {
        console.log('[WHY-DID-YOU-UPDATE]', name, changedProps);
      }
    }
    previous.current = props;
  });
};
```

## 📦 Build et déploiement

### Build local

```bash
# Build de production
bun build

# Tester le build localement
bun preview

# Analyser le bundle
bun build --analyze
```

### Variables d'environnement par stage

```bash
# .env.development
VITE_AI_PROVIDER=mock
VITE_AUDIT_LEVEL=debug

# .env.staging  
VITE_AI_PROVIDER=openai
VITE_AI_API_KEY=sk-staging-...

# .env.production
VITE_AI_PROVIDER=openai
VITE_AI_API_KEY=sk-prod-...
VITE_AUDIT_ENDPOINT=https://audit.prod.com
```

## 🔄 Workflow Git

### Convention de commit

```bash
# Types de commits
feat: Nouvelle fonctionnalité
fix: Correction de bug
docs: Documentation
style: Formatage, pas de changement de logique
refactor: Refactoring sans nouveau comportement
test: Ajout/modification de tests
chore: Tâches de maintenance

# Exemples
git commit -m "feat(visitor): ajout export CSV"
git commit -m "fix(auth): correction redirection après login"
git commit -m "docs: mise à jour guide développeur"
```

### Workflow branches

```bash
# Feature branch
git checkout -b feat/nouvelle-fonctionnalite
# Développement...
git commit -m "feat: implementation nouvelle fonctionnalité"
git push origin feat/nouvelle-fonctionnalite
# Pull Request vers main

# Hotfix
git checkout -b hotfix/correction-critique
git commit -m "fix: correction critique production"
# Pull Request vers main + deploy immédiat
```

---

## 🚀 Happy coding