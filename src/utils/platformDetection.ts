/**
 * Utilitaire de détection de plateforme pour PWA
 */

export type Platform = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
export type Browser = 'safari' | 'chrome' | 'firefox' | 'edge' | 'samsung' | 'opera' | 'unknown';

interface DeviceInfo {
  platform: Platform;
  browser: Browser;
  isStandalone: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isPWA: boolean;
  canInstall: boolean;
  osVersion: string;
  browserVersion: string;
}

class PlatformDetector {
  private userAgent: string;
  private vendor: string;
  private platform: string;
  
  constructor() {
    this.userAgent = navigator.userAgent.toLowerCase();
    this.vendor = navigator.vendor?.toLowerCase() || '';
    this.platform = navigator.platform?.toLowerCase() || '';
  }

  /**
   * Détecte le système d'exploitation
   */
  detectOS(): Platform {
    // iOS detection
    if (/iphone|ipad|ipod/.test(this.userAgent) || 
        (this.platform === 'macintel' && navigator.maxTouchPoints > 1)) {
      return 'ios';
    }
    
    // Android detection
    if (/android/.test(this.userAgent)) {
      return 'android';
    }
    
    // Windows detection
    if (/windows|win32|win64/.test(this.userAgent)) {
      return 'windows';
    }
    
    // macOS detection
    if (/macintosh|mac os x/.test(this.userAgent) && navigator.maxTouchPoints === 0) {
      return 'macos';
    }
    
    // Linux detection
    if (/linux/.test(this.userAgent)) {
      return 'linux';
    }
    
    return 'unknown';
  }

  /**
   * Détecte le navigateur
   */
  detectBrowser(): Browser {
    // Samsung Browser
    if (/samsungbrowser/.test(this.userAgent)) {
      return 'samsung';
    }
    
    // Opera
    if (/opr\/|opera/.test(this.userAgent)) {
      return 'opera';
    }
    
    // Edge
    if (/edg/.test(this.userAgent)) {
      return 'edge';
    }
    
    // Chrome (doit être après Edge car Edge contient "chrome")
    if (/chrome|chromium|crios/.test(this.userAgent) && this.vendor === 'google inc.') {
      return 'chrome';
    }
    
    // Firefox
    if (/firefox|fxios/.test(this.userAgent)) {
      return 'firefox';
    }
    
    // Safari
    if (/safari/.test(this.userAgent) && this.vendor.includes('apple')) {
      return 'safari';
    }
    
    return 'unknown';
  }

  /**
   * Vérifie si l'application est en mode standalone
   */
  isStandalone(): boolean {
    // iOS standalone
    if ('standalone' in window.navigator && (window.navigator as any).standalone) {
      return true;
    }
    
    // Android/Desktop PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    
    // Samsung Browser app mode
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return true;
    }
    
    return false;
  }

  /**
   * Vérifie si c'est un appareil mobile
   */
  isMobile(): boolean {
    return /mobile|android|iphone|ipod/.test(this.userAgent);
  }

  /**
   * Vérifie si c'est une tablette
   */
  isTablet(): boolean {
    return /ipad|android.*tablet|tablet.*android/.test(this.userAgent) ||
           (this.platform === 'macintel' && navigator.maxTouchPoints > 1);
  }

  /**
   * Vérifie si la PWA est déjà installée
   */
  isPWAInstalled(): boolean {
    return this.isStandalone() || window.matchMedia('(display-mode: standalone)').matches;
  }

  /**
   * Vérifie si l'installation est possible
   */
  canInstallPWA(): boolean {
    const os = this.detectOS();
    const browser = this.detectBrowser();
    
    // iOS: Safari uniquement, version 11.3+
    if (os === 'ios') {
      return browser === 'safari' && !this.isPWAInstalled();
    }
    
    // Android: Chrome, Edge, Samsung Browser, Opera
    if (os === 'android') {
      return ['chrome', 'edge', 'samsung', 'opera'].includes(browser) && !this.isPWAInstalled();
    }
    
    // Desktop: Chrome, Edge
    if (['windows', 'macos', 'linux'].includes(os)) {
      return ['chrome', 'edge'].includes(browser) && !this.isPWAInstalled();
    }
    
    return false;
  }

  /**
   * Obtient la version de l'OS
   */
  getOSVersion(): string {
    const os = this.detectOS();
    
    if (os === 'ios') {
      const match = this.userAgent.match(/os (\d+)_(\d+)_?(\d+)?/);
      if (match) {
        return `${match[1]}.${match[2]}${match[3] ? `.${match[3]}` : ''}`;
      }
    }
    
    if (os === 'android') {
      const match = this.userAgent.match(/android (\d+\.?\d*)/);
      if (match) {
        return match[1];
      }
    }
    
    if (os === 'windows') {
      const match = this.userAgent.match(/windows nt (\d+\.\d+)/);
      if (match) {
        const versions: Record<string, string> = {
          '10.0': '10/11',
          '6.3': '8.1',
          '6.2': '8',
          '6.1': '7'
        };
        return versions[match[1]] || match[1];
      }
    }
    
    return 'unknown';
  }

  /**
   * Obtient la version du navigateur
   */
  getBrowserVersion(): string {
    const browser = this.detectBrowser();
    let match;
    
    switch (browser) {
      case 'chrome':
        match = this.userAgent.match(/chrome\/(\d+\.\d+)/);
        break;
      case 'firefox':
        match = this.userAgent.match(/firefox\/(\d+\.\d+)/);
        break;
      case 'safari':
        match = this.userAgent.match(/version\/(\d+\.\d+)/);
        break;
      case 'edge':
        match = this.userAgent.match(/edg\/(\d+\.\d+)/);
        break;
      case 'samsung':
        match = this.userAgent.match(/samsungbrowser\/(\d+\.\d+)/);
        break;
      case 'opera':
        match = this.userAgent.match(/opr\/(\d+\.\d+)/);
        break;
    }
    
    return match ? match[1] : 'unknown';
  }

  /**
   * Obtient toutes les informations du device
   */
  getDeviceInfo(): DeviceInfo {
    return {
      platform: this.detectOS(),
      browser: this.detectBrowser(),
      isStandalone: this.isStandalone(),
      isMobile: this.isMobile(),
      isTablet: this.isTablet(),
      isPWA: this.isPWAInstalled(),
      canInstall: this.canInstallPWA(),
      osVersion: this.getOSVersion(),
      browserVersion: this.getBrowserVersion()
    };
  }
}

// Instance singleton
const platformDetector = new PlatformDetector();

// Exports
export const detectPlatform = () => platformDetector.detectOS();
export const detectBrowser = () => platformDetector.detectBrowser();
export const isStandalone = () => platformDetector.isStandalone();
export const isMobile = () => platformDetector.isMobile();
export const isTablet = () => platformDetector.isTablet();
export const isPWAInstalled = () => platformDetector.isPWAInstalled();
export const canInstallPWA = () => platformDetector.canInstallPWA();
export const getDeviceInfo = () => platformDetector.getDeviceInfo();

// Helper pour obtenir les instructions d'installation spécifiques
export const getInstallInstructions = (): { title: string; steps: string[] } => {
  const info = getDeviceInfo();
  
  if (info.platform === 'ios') {
    return {
      title: 'Installer sur votre iPhone/iPad',
      steps: [
        'Appuyez sur le bouton Partager en bas de Safari',
        'Faites défiler et appuyez sur "Sur l\'écran d\'accueil"',
        'Appuyez sur "Ajouter" en haut à droite',
        'L\'application sera ajoutée à votre écran d\'accueil'
      ]
    };
  }
  
  if (info.platform === 'android') {
    if (info.browser === 'chrome') {
      return {
        title: 'Installer sur votre Android',
        steps: [
          'Appuyez sur le menu (3 points) en haut à droite',
          'Sélectionnez "Installer l\'application"',
          'Confirmez l\'installation',
          'L\'application sera ajoutée à votre écran d\'accueil'
        ]
      };
    }
    
    if (info.browser === 'samsung') {
      return {
        title: 'Installer sur Samsung Internet',
        steps: [
          'Appuyez sur le menu en bas',
          'Sélectionnez "Ajouter la page à"',
          'Choisissez "Écran d\'accueil"',
          'Confirmez l\'ajout'
        ]
      };
    }
  }
  
  if (['windows', 'macos', 'linux'].includes(info.platform)) {
    return {
      title: 'Installer sur votre ordinateur',
      steps: [
        'Cliquez sur l\'icône d\'installation dans la barre d\'adresse',
        'Ou utilisez le menu (3 points) > "Installer DGI Access"',
        'Confirmez l\'installation',
        'L\'application sera disponible comme une app native'
      ]
    };
  }
  
  return {
    title: 'Installation non disponible',
    steps: ['Votre navigateur ne supporte pas l\'installation PWA']
  };
};

export default platformDetector;
