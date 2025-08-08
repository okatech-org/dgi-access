// Gestionnaire de notifications toast
export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface Toast extends ToastOptions {
  id: string;
  timestamp: number;
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: ((toasts: Toast[]) => void)[] = [];

  // Ajouter un toast
  add(options: ToastOptions): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: Toast = {
      ...options,
      id,
      timestamp: Date.now(),
      duration: options.duration || 5000,
      position: options.position || 'top-right'
    };

    this.toasts.push(toast);
    this.notifyListeners();

    // Auto-remove after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, toast.duration);
    }

    return id;
  }

  // Supprimer un toast
  remove(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  // Supprimer tous les toasts
  clear(): void {
    this.toasts = [];
    this.notifyListeners();
  }

  // Obtenir tous les toasts
  getToasts(): Toast[] {
    return [...this.toasts];
  }

  // S'abonner aux changements
  subscribe(listener: (toasts: Toast[]) => void): () => void {
    this.listeners.push(listener);
    
    // Retourner une fonction de désabonnement
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getToasts()));
  }
}

// Instance singleton
export const toastManager = new ToastManager();

// Fonctions de convenance
export const showToast = {
  success: (message: string, options?: Partial<ToastOptions>) => 
    toastManager.add({ type: 'success', message, ...options }),
  
  error: (message: string, options?: Partial<ToastOptions>) => 
    toastManager.add({ type: 'error', message, ...options }),
  
  warning: (message: string, options?: Partial<ToastOptions>) => 
    toastManager.add({ type: 'warning', message, ...options }),
  
  info: (message: string, options?: Partial<ToastOptions>) => 
    toastManager.add({ type: 'info', message, ...options })
};

export default toastManager;