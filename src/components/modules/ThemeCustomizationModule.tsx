import React, { useEffect, useMemo, useState } from 'react';

type ThemeId = 'system' | 'light' | 'dark' | 'blue' | 'teal';

interface ThemeOption {
  id: ThemeId;
  label: string;
  previewClass: string;
  vars?: Record<string, string>;
}

const THEME_STORAGE_KEY = 'impots-theme-config-v1';

export const ThemeCustomizationModule: React.FC = () => {
  const themes: ThemeOption[] = useMemo(
    () => [
      { id: 'system', label: "Système", previewClass: 'from-gray-50 to-gray-100', vars: {} },
      { id: 'light', label: "Clair", previewClass: 'from-white to-gray-50', vars: { '--primary-color': '#1d4ed8', '--accent-color': '#10b981', '--bg-color': '#ffffff', '--text-color': '#0f172a' } },
      { id: 'dark', label: "Sombre", previewClass: 'from-gray-900 to-gray-800', vars: { '--primary-color': '#60a5fa', '--accent-color': '#34d399', '--bg-color': '#0b1220', '--text-color': '#e5e7eb' } },
      { id: 'blue', label: "Bleu", previewClass: 'from-blue-50 to-indigo-50', vars: { '--primary-color': '#1e40af', '--accent-color': '#4f46e5', '--bg-color': '#f8fafc', '--text-color': '#0f172a' } },
      { id: 'teal', label: "Sarcelle", previewClass: 'from-teal-50 to-emerald-50', vars: { '--primary-color': '#0d9488', '--accent-color': '#059669', '--bg-color': '#f7fbfb', '--text-color': '#0f172a' } },
    ],
    []
  );

  const [activeThemeId, setActiveThemeId] = useState<ThemeId>('system');

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: { id: ThemeId; vars?: Record<string, string> } = JSON.parse(saved);
        setActiveThemeId(parsed.id);
        applyTheme(parsed.id, parsed.vars || themes.find(t => t.id === parsed.id)?.vars);
      } catch {
        // ignore parse error
      }
    } else {
      // appliquer système par défaut
      applyTheme('system');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTheme = (id: ThemeId, vars?: Record<string, string>) => {
    const root = document.documentElement;
    if (id === 'system') {
      root.removeAttribute('data-theme');
      root.style.removeProperty('--primary-color');
      root.style.removeProperty('--accent-color');
      root.style.removeProperty('--bg-color');
      root.style.removeProperty('--text-color');
    } else {
      root.setAttribute('data-theme', id);
      const v = vars || themes.find(t => t.id === id)?.vars || {};
      Object.entries(v).forEach(([k, v]) => root.style.setProperty(k, v));
    }
  };

  const handleSelect = (id: ThemeId) => {
    setActiveThemeId(id);
    const vars = themes.find(t => t.id === id)?.vars || {};
    applyTheme(id, vars);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ id, vars }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personnalisation du thème</h1>
          <p className="text-gray-600">Choisissez un thème pour l'interface IMPOTS Access.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleSelect(theme.id)}
            className={`relative rounded-xl border transition-all text-left overflow-hidden ${
              activeThemeId === theme.id ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`h-24 bg-gradient-to-br ${theme.previewClass}`} />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 capitalize">{theme.label}</span>
                {activeThemeId === theme.id && (
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">Actif</span>
                )}
              </div>
              {theme.vars && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="w-4 h-4 rounded" style={{ background: theme.vars['--primary-color'] }} />
                  <span className="w-4 h-4 rounded" style={{ background: theme.vars['--accent-color'] }} />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          Le thème est enregistré localement et appliqué immédiatement à l'interface.
        </p>
      </div>
    </div>
  );
};

